export class Util {
  public static getLabel(name: string, isSmallScreen: boolean): string {
    if (isSmallScreen) {
      switch (name) {
        case 'Radio Free Asia':
          return 'RFA';
        case 'Voice Of Tibet' || 'Voice Of Tibet':
          return 'VOT';
        case 'VOA Tibetan':
          return 'VOA';
        default:
          return name;
      }
    } else {
      return name;
    }
  }
}
