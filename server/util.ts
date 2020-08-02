export class Util {
  static getCurrentDate(): Date {
    const date: Date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static getDate(diff: number): Date {
    const date: Date = this.getCurrentDate();
    date.setDate(date.getDate() + diff);
    return date;
  }
}
