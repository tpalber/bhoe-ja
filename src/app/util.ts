export class Util {
  public static getLabel(name: string, isSmallScreen: boolean): string {
    if (isSmallScreen) {
      switch (name) {
        case 'Radio Free Asia':
        case 'RFATibetan':
          return 'RFA';
        case 'Tibet Times':
          return 'Times';
        case 'Voice Of Tibet':
        case 'Voice of Tibet':
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
