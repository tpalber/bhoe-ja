import { Moon } from 'lucide-react';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Switch } from './ui/switch';
import { SourceType, sourceListing } from '../lib/sources';
import { useAppStore } from '../store/app-store';

const articleSources = sourceListing.filter(
  (s) => s.type === SourceType.Article
);
const videoSources = sourceListing.filter((s) => s.type === SourceType.Video);

interface AboutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutSheet({ open, onOpenChange }: AboutSheetProps) {
  const { darkMode, setDarkMode } = useAppStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:mx-auto sm:max-w-2xl">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="text-xl">About BHOE JA</SheetTitle>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                aria-label="Dark mode"
              />
            </div>
          </div>
          <SheetDescription>
            <span className="italic">
              Explore all the latest Tibetan news while you sip your bhoe ja.
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed">
          <p>
            Bhoe Ja aims to make it easier to stay informed on the latest
            Tibetan news from many different sources across the web. We hope to
            empower journalists by making their content more accessible to a
            wider audience than just their single news source.
          </p>
          <p>
            Bhoe Ja uses{' '}
            <a
              href="https://en.wikipedia.org/wiki/Web_scraping"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-4"
            >
              web scraping
            </a>{' '}
            to extract articles from different Tibetan news sources every hour
            and retrieves videos using{' '}
            <a
              href="https://developers.google.com/youtube/v3"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Youtube Data API
            </a>{' '}
            every two hours to create a unique user experience for consuming
            Tibetan news.
          </p>

          <Separator />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold">News Sources</h4>
              <ul className="flex flex-col gap-1.5">
                {articleSources.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Youtube Channels</h4>
              <ul className="flex flex-col gap-1.5">
                {videoSources.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 font-semibold">Contact</h4>
            <p>
              Bhoe Ja is an open source project. Please contact{' '}
              <a
                href="mailto:tpalber7@gmail.com"
                className="text-primary underline underline-offset-4"
              >
                tpalber7@gmail.com
              </a>{' '}
              for any contributions or questions.{' '}
              <a
                href="https://github.com/tpalber/bhoe-ja"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
