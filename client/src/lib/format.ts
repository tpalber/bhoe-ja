/** Trim an ISO date string to yyyy-MM-dd (mirrors the old trimDateString pipe). */
export function trimDate(dateString: string): string {
  return dateString.split('T', 1)[0];
}

/**
 * Abbreviate source names on small screens (mirrors the old Util.getLabel).
 */
export function getSourceLabel(name: string, isSmallScreen: boolean): string {
  if (!isSmallScreen) return name;
  switch (name) {
    case 'Radio Free Asia':
    case 'RFATibetan':
      return 'RFA';
    case 'Voice Of Tibet':
    case 'Voice of Tibet':
      return 'VOT';
    case 'VOA Tibetan':
      return 'VOA';
    case 'སྤྱི་ནོར་ྋགོང་ས་ྋསྐྱབས་མགོན་ཆེན་པོ་མཆོག':
      return 'ྋགོང་ས་མཆོག་';
    default:
      return name;
  }
}

export function openLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function youtubeUrl(videoID: string): string {
  return `https://www.youtube.com/watch?v=${videoID}`;
}
