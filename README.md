# nativescript-modal-datetimepicker [![Build Status](https://travis-ci.org/shiv19/nativescript-material-datetimepicker.svg?branch=master)](https://travis-ci.org/davecoffin/nativescript-modal-datetimepicker) [![npm](https://img.shields.io/npm/dt/express.svg)](https://www.npmjs.com/package/nativescript-modal-datetimepicker) [![npm](https://img.shields.io/npm/v/nativescript-material-datetimepicker.svg)](https://www.npmjs.com/package/nativescript-modal-datetimepicker)

[![Twitter URL](https://img.shields.io/badge/twitter-%40MultiShiv19-blue.svg)](https://twitter.com/MultiShiv19)


[![NPM](https://nodei.co/npm/nativescript-modal-datetimepicker.png)](https://nodei.co/npm/nativescript-modal-datetimepicker/)

This plugin is a wrapper around `android.app.DatePickerDialog` for Android, and `UIDatePicker` for iOS.

## Android Screenshots

### Date Picker
<img src="https://github.com/davecoffin/nativescript-modal-datetimepicker/blob/master/assets/datepicker.jpeg?raw=true" height="320" > 

### Time Picker
<img src="https://github.com/davecoffin/nativescript-modal-datetimepicker/blob/master/assets/timepicker.jpeg?raw=true" height="320" > 

## iOS
<img src="https://github.com/davecoffin/nativescript-modal-datetimepicker/blob/master/assets/iosdatepicker.gif?raw=true" height="320" > 

## Installation

```javascript
tns plugin add nativescript-modal-datetimepicker
```

## Usage 

NativeScript Core

```js

const ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;

const picker = new ModalPicker();

// Pick Date
exports.selectDate = function() {
    picker.pickDate({
        title: "Select Your Birthday",
        theme: "light",
        maxDate: new Date()
    }).then((result) => {
        console.log("Date is: " + result.day + "-" + result.month + "-" + result.year);
    }).catch((error) => {
        console.log("Error: " + error);
    });
};

// Pick Time
exports.selectTime = function() {
    picker.pickTime()
        .then((result) => {
            console.log("Time is: " + result.hour + ":" + result.minute);
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
};

```

## API

`pickDate(options): Promise<{}>;`

Returns a promise that resolves to date object
```js
date: {
    day: number,
    month: number,
    year: number
}
```

`pickTime(options): Promise<{}>;`

Returns a promise that resolves to time object
```js
time: {
    hour: number,
    minute: number
}
```

options conform to the following interface: 
```
export interface PickerOptions {
    title?: string, // iOS ONLY: The title to display above the picker, defaults to "Choose A Time" or "Choose A Date"
    theme?: string, // iOS ONLY: light for a light blurry effect, dark for a dark blurry effect - defaults to dark
    maxDate?: Date,
    minDate?: Date,
    startingDate?: Date
}
```

    
## License

Apache License Version 2.0, January 2004
