import * as app from "tns-core-modules/application";

declare var com: any;
const Calendar = java.util.Calendar;

export class MaterialDatetimepicker {
    constructor() {}

    public pickDate() {
        return new Promise((resolve, reject) => {
          let now = Calendar.getInstance();
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
              }), now.get(Calendar.YEAR),
                  now.get(Calendar.MONTH),
                  now.get(Calendar.DAY_OF_MONTH));
            datePicker.show();
          } catch (err) {
            reject(err);
          }
        });
      }

      public pickTime(is24HourView?) {
        is24HourView = is24HourView || false;
        return new Promise((resolve, reject) => {
          let now = Calendar.getInstance();
          try {
            let timePicker = new android.app.TimePickerDialog(app.android.foregroundActivity,
              new android.app.TimePickerDialog.OnTimeSetListener({
                  onTimeSet: function(view, hourOfDay, minute) {
                      const time = {
                        "hour": hourOfDay,
                        "minute": minute
                      };
                      resolve(time);
                  }
              }), now.get(Calendar.HOUR_OF_DAY),
                  now.get(Calendar.MINUTE), is24HourView);
            timePicker.show();
          } catch (err) {
            reject(err);
          }
        });
      }

}
