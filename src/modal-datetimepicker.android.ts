import * as app from "tns-core-modules/application";

export class ModalDatetimepicker {
  datePicker: android.app.DatePickerDialog;
  timePicker;
  constructor() {}

  public pickDate(options: PickerOptions = {}) {
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
        this.datePicker = new android.app.DatePickerDialog(
          app.android.foregroundActivity,
          new android.app.DatePickerDialog.OnDateSetListener({
            onDateSet: (view, year, monthOfYear, dayOfMonth) => {
              const date: DateResponse = {
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
          let datePickerInstance = this.datePicker.getDatePicker();
          if (options.maxDate)
            datePickerInstance.setMaxDate(options.maxDate.getTime());
          if (options.minDate)
            datePickerInstance.setMinDate(options.minDate.getTime());
        }

        this.datePicker.setOnCancelListener(new android.content.DialogInterface.OnCancelListener({
          onCancel: (dialog) => {
            resolve();
          }
        }));
        this.datePicker.show();
      } catch (err) {
        reject(err);
      }
    });
  }

  public close() {
    if (this.datePicker && typeof this.datePicker.dismiss === "function") {
      this.datePicker.dismiss();
    } else if (
      this.timePicker &&
      typeof this.timePicker.dismiss === "function"
    ) {
      this.timePicker.dismiss();
    }
  }

  public pickTime(options: PickerOptions = {}) {
    options.is24HourView = options.is24HourView || false;
    return new Promise((resolve, reject) => {
      let now = java.util.Calendar.getInstance();
      const hour =
        options.startingHour !== undefined && options.startingHour >= 0
          ? +options.startingHour
          : now.get(java.util.Calendar.HOUR_OF_DAY);
      const minute =
        options.startingMinute !== undefined && options.startingMinute >= 0
          ? +options.startingMinute
          : now.get(java.util.Calendar.MINUTE);
      try {
        this.timePicker = new android.app.TimePickerDialog(
          app.android.foregroundActivity,
          new android.app.TimePickerDialog.OnTimeSetListener({
            onTimeSet: (view, hourOfDay, minute) => {
              const time: TimeResponse = {
                hour: hourOfDay,
                minute: minute
              };
              resolve(time);
            }
          }),
          hour,
          minute,
          options.is24HourView
        );

        this.timePicker.show();

        let toastMsg = "";

        if (options.minTime) {
          if (
            options.minTime.hour < 24 &&
            options.minTime.hour >= 0 &&
            options.minTime.minute < 60 &&
            options.minTime.minute >= 0
          ) {
            this.timePicker.updateTime(
              options.minTime.hour,
              options.minTime.minute
            );
            toastMsg =
              "Min Time: " +
              options.minTime.hour +
              ":" +
              options.minTime.minute;
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
            this.timePicker.updateTime(
              options.maxTime.hour,
              options.maxTime.minute
            );
            toastMsg +=
              " Max Time: " +
              options.maxTime.hour +
              ":" +
              options.maxTime.minute;
          } else {
            reject("Invalid maxTime");
          }
        }
        if (toastMsg !== "") {
          android.widget.Toast.makeText(
            app.android.foregroundActivity,
            toastMsg,
            android.widget.Toast.LENGTH_LONG
          ).show();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}

export interface PickerOptions {
  type?: string;
  title?: string;
  theme?: string;
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
