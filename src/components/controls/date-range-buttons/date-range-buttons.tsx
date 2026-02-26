import { Component, h, Event, EventEmitter, Prop, State } from "@stencil/core";
import { parseISO, format, isBefore, startOfDay, endOfDay, formatISO, isSameDay, addDays, subDays, differenceInCalendarDays } from 'date-fns';

@Component({
  tag: 'date-range-buttons'
})
export class DateRangeButtons {

  @Event() valueChanged: EventEmitter;

  @Prop({ mutable: true }) startDatetime: string;
  @Prop({ mutable: true }) endDatetime: string;

  @State() sameDateSelected: boolean;

  startDtElem: HTMLIonDatetimeElement;
  startDtPopoverElem: HTMLIonPopoverElement;
  endDtElem: HTMLIonDatetimeElement;
  endDtPopoverElem: HTMLIonPopoverElement;

  async componentWillLoad() {
    if (!this.startDatetime) {
      this.startDatetime = formatISO(startOfDay(new Date()));
    }
    if (!this.endDatetime) {
      this.endDatetime = formatISO(endOfDay(new Date()));
    }
    this.sameDateSelected = isSameDay(this.startDatetime, this.endDatetime);
  }

  async hStartDatetimeChanged(event: any) {
    this.startDatetime = formatISO(startOfDay(parseISO(event.detail.value)));
    if (this.sameDateSelected) {
      this.endDatetime = formatISO(endOfDay(this.startDatetime));
    }
    else {
      if (isBefore(this.endDatetime, this.startDatetime)) {
        const numDays = differenceInCalendarDays(this.endDatetime, this.startDatetime) || 1;
        this.endDatetime = formatISO(startOfDay(addDays(this.startDatetime, numDays)));
      }
    }
    this.sameDateSelected = isSameDay(this.startDatetime, this.endDatetime);
    await this.startDtPopoverElem.dismiss();
    this.valueChanged.emit({
      start: this.startDatetime,
      end: this.endDatetime
    });
  }

  async hEndDatetimeChanged(event: any) {
    this.endDatetime = formatISO(endOfDay(parseISO(event.detail.value)));
    this.sameDateSelected = isSameDay(this.startDatetime, this.endDatetime);
    if (isBefore(this.endDatetime, this.startDatetime)) {
      const numDays = differenceInCalendarDays(this.startDatetime, this.endDatetime) || 1;
      this.startDatetime = this.sameDateSelected
        ? formatISO(startOfDay(this.endDatetime))
        : formatISO(startOfDay(addDays(this.startDatetime, numDays - 1)));
    }
    await this.endDtPopoverElem.dismiss();
    this.valueChanged.emit({
      start: this.startDatetime,
      end: this.endDatetime
    });
  }

  async hPreviousClicked() {
    const numDays = differenceInCalendarDays(this.startDatetime, this.endDatetime) || 1;
    this.endDatetime = formatISO(endOfDay(subDays(this.startDatetime, 1)));
    this.startDatetime = this.sameDateSelected
      ? formatISO(startOfDay(subDays(this.startDatetime, numDays)))
      : formatISO(startOfDay(addDays(this.startDatetime, numDays - 1)));
    this.valueChanged.emit({
      start: this.startDatetime,
      end: this.endDatetime
    });
  }

  async hNextClicked() {
    const numDays = differenceInCalendarDays(this.endDatetime, this.startDatetime) || 1;
    this.startDatetime = this.sameDateSelected
      ? formatISO(startOfDay(addDays(this.startDatetime, 1)))
      : formatISO(startOfDay(addDays(this.endDatetime, 1)));
    this.endDatetime = this.sameDateSelected
      ? formatISO(endOfDay(this.startDatetime))
      : formatISO(endOfDay(addDays(this.startDatetime, numDays)));
    this.valueChanged.emit({
      start: this.startDatetime,
      end: this.endDatetime
    });
  }

  async hSelectRangeClicked() {
    this.startDatetime = formatISO(subDays(this.startDatetime, 1));
    this.sameDateSelected = false;
  }

  render() {
    return [
      <div class='flex row items-center'>
        <ion-button color='medium' fill='clear' onClick={() => this.hPreviousClicked()}>
          <ion-icon slot='icon-only' name='caret-back' />
        </ion-button>
        <ion-datetime-button
          datetime="startDatetime"
          color='medium'
        />
        <ion-popover ref={(el) => this.startDtPopoverElem = el}>
          <ion-datetime
            id="startDatetime"
            ref={(el) => this.startDtElem = el}
            presentation="date" preferWheel={false} showAdjacentDays
            highlightedDates={[{ date: format(this.endDatetime, "yyyy-MM-dd"), backgroundColor: 'var(--ion-color-medium)' }]}
            formatOptions={{ date: { day: '2-digit', month: '2-digit', year: '2-digit' } }}
            value={this.startDatetime}
            onIonChange={(e) => this.hStartDatetimeChanged(e)}
          >
            {this.sameDateSelected &&
              <ion-buttons slot='buttons' style={{ width: '300px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <ion-button color='primary' onClick={() => this.hSelectRangeClicked()} >Select Range</ion-button>
                <ion-button color='primary' onClick={() => this.startDtElem.confirm()} >OK</ion-button>
              </ion-buttons>
            }
          </ion-datetime>
        </ion-popover>
        {!this.sameDateSelected && [
          <ion-datetime-button
            datetime="endDatetime"
            color='medium'
          />,
          <ion-popover ref={(el) => this.endDtPopoverElem = el}>
            <ion-datetime
              id="endDatetime"
              ref={(el) => this.endDtElem = el}
              presentation="date" preferWheel={false} showAdjacentDays
              highlightedDates={[{ date: format(this.startDatetime, "yyyy-MM-dd"), backgroundColor: 'var(--ion-color-medium)' }]}
              formatOptions={{ date: { day: '2-digit', month: '2-digit', year: '2-digit' } }}
              value={this.endDatetime}
              onIonChange={(e) => this.hEndDatetimeChanged(e)}
            />
          </ion-popover>
        ]}
        <ion-button color='medium' fill='clear' onClick={() => this.hNextClicked()}>
          <ion-icon slot='icon-only' name='caret-forward' />
        </ion-button>
      </div>
    ]
  }
}