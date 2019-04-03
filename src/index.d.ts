import { Color } from "tns-core-modules/color";

export declare class ModalDatetimepicker {
  constructor();
  pickDate(options?: PickerOptions): Promise<DateResponse>;
  pickTime(options?: PickerOptions): Promise<TimeResponse>;
  private show(options);
  chooseDate(): void;
  chooseTime(): void;
  close(response?: any): void;
}

export interface PickerOptions {
  type?: string;
  title?: string;
  theme?: string;
  overlayAlpha?: number;
  maxDate?: Date;
  minDate?: Date;
  startingDate?: Date;
  startingHour?: number;
  startingMinute?: number;
  is24HourView?: boolean;
  maxTime?: {
    hour: number;
    minute: number;
  };
  minTime?: {
    hour: number;
    minute: number;
  };
  cancelLabel?: string;
  doneLabel?: string;
  cancelLabelColor?: Color;
  doneLabelColor?: Color;
  datePickerMode?: string;
}

export interface TimeResponse {
  hour: number;
  minute: number;
}

export interface DateResponse {
  day: number;
  month: number;
  year: number;
}
