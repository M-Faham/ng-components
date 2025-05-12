import {
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;
  private readonly pastValue: any;

  constructor(
    private readonly translate: TranslateService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  transform(value: Date | string | number | undefined): string {
    if (!value || this.pastValue === value) return '';

    const past = new Date(value).getTime();
    if (isNaN(past)) {
      throw new Error('Invalid date');
    }

    // Ensure the interval is running
    this.startTimer();

    return this.getTimeAgo(past);
  }

  private startTimer(): void {
    if (this.timer) return;

    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.cdRef.markForCheck());
      }, 20000);
    });
  }

  private getTimeAgo(value: Date | string | number): string {
    const now = new Date().getTime();
    const past = new Date(value).getTime();
    const diff = now - past;

    if (diff < 60000) {
      return this.translate.instant('common.time_ago.just_now');
    }

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      const key =
        minutes === 1 ? 'common.time_ago.minute' : 'common.time_ago.minutes';
      return this.translate.instant(key, { count: minutes });
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const key =
        hours === 1 ? 'common.time_ago.hour' : 'common.time_ago.hours';
      return this.translate.instant(key, { count: hours });
    }

    const days = Math.floor(hours / 24);
    const key = days === 1 ? 'common.time_ago.day' : 'common.time_ago.days';
    return this.translate.instant(key, { count: days });
  }
}
