import { Observable } from 'tns-core-modules/data/observable';
import { ModalDatetimepicker, PickerOptions } from 'nativescript-modal-datetimepicker';

export class HelloWorldModel extends Observable {
    public date: string;
    public time: string;
    private modalDatetimepicker: ModalDatetimepicker;

    constructor() {
        super();
        this.modalDatetimepicker = new ModalDatetimepicker();
    }

    closeProgramatically() {
        this.modalDatetimepicker.pickDate(<PickerOptions>{
            title: "Configurable Title",
            theme: "light",
            startingDate: new Date('2018-11-17'),
            maxDate: new Date(),
            minDate: new Date('2018-09-19')
        }).then((result:any) => {
            if (result) {
                this.set("date", "Date is: " + result.day + "-" + result.month + "-" + result.year);
            } else {
                this.set("date", false);
            }
        })
        .catch((error) => {
            console.log("Error: " + error);
        });

        setTimeout(() => {
            this.modalDatetimepicker.close();
        }, 1000);
    }

    selectDate() {
        this.modalDatetimepicker.pickDate(<PickerOptions>{
            title: "Configurable Title",
            theme: "light",
            startingDate: new Date('2018-11-17'),
            maxDate: new Date(),
            minDate: new Date('2018-09-19')
        }).then((result:any) => {
            if (result) {
                this.set("date", "Date is: " + result.day + "-" + result.month + "-" + result.year);
            } else {
                this.set("date", false);
            }
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
    }

    selectDateSpinner() {
        this.modalDatetimepicker.pickDate(<PickerOptions>{
            title: "Configurable Title",
            theme: "light",
            startingDate: new Date('2018-11-17'),
            datePickerMode: "spinner"
        }).then((result:any) => {
            if (result) {
                this.set("date", "Date is: " + result.day + "-" + result.month + "-" + result.year);
            } else {
                this.set("date", false);
            }
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
    }

    selectDateOverlay() {
        this.modalDatetimepicker.pickDate(<PickerOptions>{
            title: "Configurable Title",
            theme: "overlay",
            startingDate: new Date('2018-11-17'),
            maxDate: new Date(),
            minDate: new Date('2018-09-19')
        }).then((result:any) => {
            if (result) {
                this.set("date", "Date is: " + result.day + "-" + result.month + "-" + result.year);
            } else {
                this.set("date", false);
            }
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
    }

    selectTime() {
        this.modalDatetimepicker.pickTime(<PickerOptions>{
            theme: "light",
            minTime: {
                hour: 7,
                minute: 0
            },
            maxTime: {
                hour: 15,
                minute: 30
            }
        }).then((result: any) => {
            if (result) {
                this.set("time", "Time is: " + result.hour + ":" + result.minute);
            } else {
                this.set("time", false);
            }
        })
        .catch((error) => {
            console.log("Error: " + error);
        });
    }
}
