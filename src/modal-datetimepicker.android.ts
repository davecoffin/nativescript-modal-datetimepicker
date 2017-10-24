import * as app from "tns-core-modules/application";

declare var com: any;
const Calendar = java.util.Calendar;

export interface PickerOptions {
    type?: string;
    title?: string;
    theme?: string;
    maxDate?: Date;
    minDate?: Date;
    startingDate?: Date;
    is24HourView: boolean;
    maxTime?: {
        hour: number,
        minute: number
    },
    minTime?: {
        hour: number,
        minute: number
    }
}

export interface PickerResponse {
    day?: number,
    month?: number,
    year?: number,
    hour?: number,
    minute?: number
}

class RangeTimePickerDialog extends android.app.TimePickerDialog {
  private mMinHour = -1;
  private mMinMinute = -1;
  private mMaxHour = 100;
  private mMaxMinute = 100;
  private mCurrentHour;
  private mCurrentMinute;

  constructor(context, callBack, hourOfDay, 
   minute, is24HourView) {
    super(context, callBack, hourOfDay, minute, is24HourView);

    this.mCurrentHour = hourOfDay;
    this.mCurrentMinute = minute;

    console.log("in the constructor");

    // Somehow the onTimeChangedListener is not set by TimePickerDialog
    // in some Android Versions, so, Adding the listener using
    // reflections
    try {
      console.log("start of try block");
      let superclass = this.getClass().getSuperclass();
      let mTimePickerField: java.lang.reflect.Field = superclass.getDeclaredField("mTimePicker");
      mTimePickerField.setAccessible(true);
      let mTimePicker: android.widget.TimePicker = <android.widget.TimePicker> mTimePickerField.get(this);
      mTimePicker.setOnTimeChangedListener(this);
      console.log("end of try block");
    } catch (e) {
    }
  }

  public setMin(hour, minute) {
    console.log("set the min time");
    this.mMinHour = hour;
    this.mMinMinute = minute;
  }

  public setMax(hour, minute) {
    console.log("set the max time");
    this.mMaxHour = hour;
    this.mMaxMinute = minute;
  }

  public onTimeChanged(view, hourOfDay, minute) {
      super.onTimeChanged(view, hourOfDay, minute);
      console.log("Time change triggered");
      let validTime;
      if (((hourOfDay < this.mMinHour ) || (hourOfDay == this.mMinHour && minute < this.mMinMinute)) 
              || ((hourOfDay > this.mMaxHour) || (hourOfDay == this.mMaxHour && minute > this.mMaxMinute))) {
          validTime = false;
      } else {
          validTime = true;
      }
      if (validTime) {
          this.mCurrentHour = hourOfDay;
          this.mCurrentMinute = minute;
      } else {
          this.updateTime(this.mCurrentHour, this.mCurrentMinute);
      }
  }
}

export class ModalDatetimepicker {
    constructor() {}

    public pickDate(options?: PickerOptions) {
        return new Promise((resolve, reject) => {
          if (options.startingDate && typeof options.startingDate.getMonth != 'function') {
            reject('startingDate must be a Date.');
          }
          if (options.minDate && typeof options.minDate.getMonth != 'function') {
            reject('minDate must be a Date.');
          }
          if (options.maxDate && typeof options.maxDate.getMonth != 'function') {
            reject('maxDate must be a Date.');
          }
          //let now = Calendar.getInstance();
          let startDate = new Date();
          if (options.startingDate) startDate = options.startingDate;
          try {
            let datePicker = new android.app.DatePickerDialog(app.android.foregroundActivity,
              new android.app.DatePickerDialog.OnDateSetListener({
                  onDateSet: function(view, year, monthOfYear, dayOfMonth) {
                      const date = {
                        "day": dayOfMonth,
                        "month": (++monthOfYear),
                        "year": year
                      };
                      resolve(date);
                  }
              }), startDate.getFullYear(),
                  startDate.getMonth(),
                  startDate.getDate());

            if (options.maxDate || options.minDate) {
                let datePickerInstance = datePicker.getDatePicker();
                if (options.maxDate) datePickerInstance.setMaxDate(options.maxDate.getTime());
                if (options.minDate) datePickerInstance.setMinDate(options.minDate.getTime());
            }

            datePicker.show();
          } catch (err) {
            reject(err);
          }
        });
      }

      public pickTime(options?: PickerOptions) {
        options.is24HourView = options.is24HourView || false;
        return new Promise((resolve, reject) => {
          let now = Calendar.getInstance();
          try {
            let timePicker = new RangeTimePickerDialog(app.android.foregroundActivity,
              new RangeTimePickerDialog.OnTimeSetListener({
                  onTimeSet: function(view, hourOfDay, minute) {
                      const time = {
                        "hour": hourOfDay,
                        "minute": minute
                      };
                      resolve(time);
                  }
              }), now.get(Calendar.HOUR_OF_DAY),
                  now.get(Calendar.MINUTE), options.is24HourView);

            if (options.maxTime || options.minTime) {
              if (options.maxTime) timePicker.setMax(options.maxTime.hour, options.maxTime.minute);
              if (options.minTime) timePicker.setMin(options.maxTime.hour, options.maxTime.minute);
            }

            timePicker.show();
          } catch (err) {
            reject(err);
          }
        });
      }

}
