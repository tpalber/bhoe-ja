import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Article, Bookmark, Video } from '../types';
import { trimDate } from '../lib/format';

const BOOKMARK_KEY = 'BhoejaBookmarks';
const DARK_MODE_KEY = 'BhoejaDarkMode';

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.bookmarks)) {
      return (parsed.bookmarks as Bookmark[]).sort((a, b) =>
        a.date > b.date ? -1 : 1
      );
    }
  } catch (e) {
    console.error(`Error restoring bookmarks: ${e}`);
  }
  return [];
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify({ bookmarks }));
}

function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.darkMode === 'boolean') {
      return parsed.darkMode;
    }
  } catch (e) {
    console.error(`Error restoring dark mode: ${e}`);
  }
  return false;
}

interface AppStore {
  bookmarks: Bookmark[];
  bookmarkCount: number;
  isBookmarked: (id: string, isVideo: boolean) => boolean;
  toggleArticleBookmark: (article: Article) => void;
  toggleVideoBookmark: (video: Video) => void;
  removeBookmark: (id: string, isVideo: boolean) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [darkMode, setDarkModeState] = useState<boolean>(loadDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify({ darkMode }));
  }, [darkMode]);

  const updateBookmarks = useCallback((next: Bookmark[]) => {
    const sorted = [...next].sort((a, b) => (a.date > b.date ? -1 : 1));
    setBookmarks(sorted);
    saveBookmarks(sorted);
  }, []);

  const isBookmarked = useCallback(
    (id: string, isVideo: boolean) =>
      bookmarks.some((b) => b._id === id && b.isVideo === isVideo),
    [bookmarks]
  );

  const toggleArticleBookmark = useCallback(
    (article: Article) => {
      if (isBookmarked(article._id, false)) {
        updateBookmarks(
          bookmarks.filter((b) => !(b._id === article._id && !b.isVideo))
        );
      } else {
        const bookmark: Bookmark = {
          _id: article._id,
          title: article.title,
          source: article.source,
          link: article.link,
          date: trimDate(article.date),
          description: article.description,
          isVideo: false,
        };
        updateBookmarks([...bookmarks, bookmark]);
      }
    },
    [bookmarks, isBookmarked, updateBookmarks]
  );

  const toggleVideoBookmark = useCallback(
    (video: Video) => {
      if (isBookmarked(video._id, true)) {
        updateBookmarks(
          bookmarks.filter((b) => !(b._id === video._id && b.isVideo))
        );
      } else {
        const bookmark: Bookmark = {
          _id: video._id,
          title: video.title,
          source: video.source,
          link: `https://www.youtube.com/watch?v=${video.videoID}`,
          date: trimDate(video.date),
          isVideo: true,
          description: video.description,
          thumbnailBig: video.thumbnailBig,
        };
        updateBookmarks([...bookmarks, bookmark]);
      }
    },
    [bookmarks, isBookmarked, updateBookmarks]
  );

  const removeBookmark = useCallback(
    (id: string, isVideo: boolean) => {
      updateBookmarks(
        bookmarks.filter((b) => !(b._id === id && b.isVideo === isVideo))
      );
    },
    [bookmarks, updateBookmarks]
  );

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      bookmarks,
      bookmarkCount: bookmarks.length,
      isBookmarked,
      toggleArticleBookmark,
      toggleVideoBookmark,
      removeBookmark,
      darkMode,
      setDarkMode,
    }),
    [
      bookmarks,
      isBookmarked,
      toggleArticleBookmark,
      toggleVideoBookmark,
      removeBookmark,
      darkMode,
      setDarkMode,
    ]
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('useAppStore must be used within AppStoreProvider');
  return store;
}
