export class Util {
  public static getLabel(name: string, isSmallScreen: boolean): string {
    if (isSmallScreen) {
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
    } else {
      return name;
    }
  }
}
