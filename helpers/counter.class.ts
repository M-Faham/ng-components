export class Counter {
  private countdownTimer!: any;

  private _countdownTime = '';
  private readonly _seconds: number;
  private _done = false;
  get countdownTime(): string {
    return this._countdownTime;
  }

  get done(): boolean {
    return this._done;
  }

  constructor(public seconds = 120) {
    this._seconds = seconds;
  }

  public stop() {
    clearInterval(this.countdownTimer);
    this._countdownTime = '';
  }

  public start() {
    this._done = false;

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    let timeLeft = this._seconds;
    this.updateCountdownTime(timeLeft);

    this.countdownTimer = setInterval(() => {
      timeLeft--;

      if (timeLeft < 0) {
        this.handleCountdownComplete();
        return;
      }

      this.updateCountdownTime(timeLeft);
    }, 1000);
  }

  private updateCountdownTime(timeLeft: number) {
    const minutes: string = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds: string = String(timeLeft % 60).padStart(2, '0');
    this._countdownTime = `${minutes}:${seconds}`;
  }

  private handleCountdownComplete() {
    this._done = true;
    clearInterval(this.countdownTimer);
    this._countdownTime = '00:00';
  }
}
