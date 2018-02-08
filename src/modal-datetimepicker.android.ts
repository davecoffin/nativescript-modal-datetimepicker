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
  startingHour?: number;
  startingMinute?: number;
  is24HourView: boolean;
  maxTime?: {
    hour: number;
    minute: number;
  };
  minTime?: {
    hour: number;
    minute: number;
  };
}

export interface PickerResponse {
  day?: number;
  month?: number;
  year?: number;
  hour?: number;
  minute?: number;
}

export class ModalDatetimepicker {
  constructor() {}

  public pickDate(options?: PickerOptions) {
    return new Promise((resolve, reject) => {
      if (
        options.startingDate &&
        typeof options.startingDate.getMonth !== "function"
      ) {
        reject("startingDate must be a Date.");
      }
      if (options.minDate && typeof options.minDate.getMonth !== "function") {
        reject("minDate must be a Date.");
      }
      if (options.maxDate && typeof options.maxDate.getMonth !== "function") {
        reject("maxDate must be a Date.");
      }
      // let now = Calendar.getInstance();
      let startDate = new Date();
      if (options.startingDate) startDate = options.startingDate;
      try {
        let themeId = android.app.AlertDialog.THEME_DEVICE_DEFAULT_LIGHT;
        if (options.theme && options.theme === "dark") {
          themeId = android.app.AlertDialog.THEME_DEVICE_DEFAULT_DARK;
        }
        let datePicker = new android.app.DatePickerDialog(
          app.android.foregroundActivity,
          themeId,
          new android.app.DatePickerDialog.OnDateSetListener({
            onDateSet: function(view, year, monthOfYear, dayOfMonth) {
              const date = {
                day: dayOfMonth,
                month: ++monthOfYear,
                year: year
              };
              resolve(date);
            }
          }),
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        if (options.maxDate || options.minDate) {
          let datePickerInstance = datePicker.getDatePicker();
          if (options.maxDate)
            datePickerInstance.setMaxDate(options.maxDate.getTime());
          if (options.minDate)
            datePickerInstance.setMinDate(options.minDate.getTime());
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
        let timePicker = new android.app.TimePickerDialog(
          app.android.foregroundActivity,
          new android.app.TimePickerDialog.OnTimeSetListener({
            onTimeSet: function(view, hourOfDay, minute) {
              const time = {
                hour: hourOfDay,
                minute: minute
              };
              resolve(time);
            }
          }),
          now.get(Calendar.HOUR_OF_DAY),
          now.get(Calendar.MINUTE),
          options.is24HourView
        );

        timePicker.show();

        if (options.minTime) {
          if (
            options.minTime.hour < 24 &&
            options.minTime.hour >= 0 &&
            options.minTime.minute < 60 &&
            options.minTime.minute >= 0
          ) {
            timePicker.updateTime(options.minTime.hour, options.minTime.minute);
            android.widget.Toast.makeText(
              app.android.foregroundActivity,
              "Minimum Time: " +
                options.minTime.hour +
                ":" +
                options.minTime.minute,
              android.widget.Toast.LENGTH_SHORT
            ).show();
          } else {
            reject("Invalid minTime");
          }
        }

        if (options.maxTime) {
          if (
            options.maxTime.hour < 24 &&
            options.maxTime.hour >= 0 &&
            options.maxTime.minute < 60 &&
            options.maxTime.minute >= 0
          ) {
            timePicker.updateTime(options.maxTime.hour, options.maxTime.minute);
            android.widget.Toast.makeText(
              app.android.foregroundActivity,
              "Maximum Time: " +
                options.maxTime.hour +
                ":" +
                options.maxTime.minute,
              android.widget.Toast.LENGTH_SHORT
            ).show();
          } else {
            reject("Invalid maxTime");
          }
        }

        timePicker.updateTime(Calendar.HOUR_OF_DAY, Calendar.MINUTE);
      } catch (err) {
        reject(err);
      }
    });
  }
}
