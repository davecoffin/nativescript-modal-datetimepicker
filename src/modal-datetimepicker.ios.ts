import * as application from "tns-core-modules/application";
import * as frame from "tns-core-modules/ui/frame";
import { Label } from "tns-core-modules/ui/label/";
import { Page } from "tns-core-modules/ui/page";

class ButtonHandler extends NSObject {
    public close(nativeButton: UIButton, nativeEvent: _UIEvent) {
        picker.close();
    }

    public chooseDate(nativeButton: UIButton, nativeEvent: _UIEvent) {
        picker.chooseDate();
    }
    public chooseTime(nativeButton: UIButton, nativeEvent: _UIEvent) {
        picker.chooseTime();
    }

    public static ObjCExposedMethods = {
        close: {
            returns: interop.types.void,
            params: [interop.types.id, interop.types.id]
        },
        chooseDate: {
            returns: interop.types.void,
            params: [interop.types.id, interop.types.id]
        },
        chooseTime: {
            returns: interop.types.void,
            params: [interop.types.id, interop.types.id]
        }
    };
}
const buttonHandler = ButtonHandler.new();
let myResolve;

export interface PickerOptions {
    type?: string;
    title?: string;
    theme?: string;
    maxDate?: Date;
    minDate?: Date;
    startingDate?: Date;
    startingHour?: number;
    startingMinute?: number;
}

export interface PickerResponse {
    day?: number;
    month?: number;
    year?: number;
    hour?: number;
    minute?: number;
}

let window: UIWindow;
let effectView: UIVisualEffectView; // this view blurs the background
let pickerHolderView: UIView; // this is the view that holds the picker
let bottomContentContainer: UIView; // this view holds the picker and the action buttons.
let topContentContainer: UIView; // this is the view the holds the title.
let titleLabel: UILabel;
let minMaxLabel: UILabel;
let datePickerView: UIDatePicker;

export class ModalDatetimepicker {
    constructor() {}

    public pickDate(options?: PickerOptions) {
        if (!options) options = {};
        options.type = "date";
        return this.show(options);
    }
    public pickTime(options?: PickerOptions) {
        if (!options) options = {};
        options.type = "time";
        return this.show(options);
    }

    private show(options: PickerOptions) {
        return new Promise((resolve, reject) => {
            myResolve = resolve;
            if (!options.type) options.type = "date";
            if (!options.theme) options.theme = "dark";
            if (!options.title) {
                if (options.type === "date") {
                    options.title = "Choose A Date";
                } else {
                    options.title = "Choose A Time";
                }
            }

            let startingDate = new Date();
            if (options.type === "date") {
                if (
                    options.startingDate &&
                    typeof options.startingDate.getMonth !== "function"
                ) {
                    reject("startingDate must be a Date.");
                }
                else if (options.startingDate) {
                  startingDate = options.startingDate;
                }
            } else {
                if (options.startingHour) {
                    startingDate.setHours(options.startingHour);
                }
                if (options.startingMinute) {
                    startingDate.setMinutes(options.startingMinute);
                }
            }
            if (
                options.minDate &&
                typeof options.minDate.getMonth !== "function"
            ) {
                reject("minDate must be a Date.");
            }
            if (
                options.maxDate &&
                typeof options.maxDate.getMonth !== "function"
            ) {
                reject("maxDate must be a Date.");
            }
            window = UIApplication.sharedApplication.keyWindow;
            let containerBounds = window.bounds;

            // blur the background of the application.
            effectView = UIVisualEffectView.alloc().init();
            effectView.frame = CGRectMake(
                containerBounds.origin.x,
                containerBounds.origin.y,
                containerBounds.size.width,
                containerBounds.size.height + 20
            );
            effectView.autoresizingMask =
                UIViewAutoresizing.FlexibleWidth |
                UIViewAutoresizing.FlexibleHeight;
            window.addSubview(effectView);
            window.bringSubviewToFront(effectView);
            UIView.animateWithDurationAnimations(0.4, () => {
                effectView.effect = UIBlurEffect.effectWithStyle(
                    options.theme === "light"
                        ? UIBlurEffectStyle.Light
                        : UIBlurEffectStyle.Dark
                );
            });

            bottomContentContainer = UIView.alloc().init();
            bottomContentContainer.frame = CGRectMake(
                10,
                containerBounds.size.height - 320,
                containerBounds.size.width - 20,
                310
            );
            bottomContentContainer.autoresizingMask =
                UIViewAutoresizing.FlexibleTopMargin |
                UIViewAutoresizing.FlexibleWidth;
            bottomContentContainer.autoresizesSubviews = true;
            bottomContentContainer.transform = CGAffineTransformMakeTranslation(
                0,
                320
            );

            pickerHolderView = UIView.alloc().init();
            pickerHolderView.backgroundColor = UIColor.whiteColor;
            pickerHolderView.frame = CGRectMake(
                0,
                0,
                containerBounds.size.width - 20,
                270
            );
            pickerHolderView.layer.cornerRadius = 10;
            pickerHolderView.layer.masksToBounds = true;
            pickerHolderView.autoresizingMask =
                UIViewAutoresizing.FlexibleWidth |
                UIViewAutoresizing.FlexibleHeight;
            pickerHolderView.layer.masksToBounds = false;
            pickerHolderView.layer.shadowColor = UIColor.blackColor.CGColor;
            pickerHolderView.layer.shadowOffset = CGSizeMake(2.0, 2.0);
            pickerHolderView.layer.shadowOpacity = 0.5;
            pickerHolderView.layer.shadowRadius = 8;
            pickerHolderView.layer.shadowPath = UIBezierPath.bezierPathWithRect(
                pickerHolderView.bounds
            ).CGPath;

            let buttonContainer: UIView = UIView.alloc().initWithFrame(
                CGRectMake(0, 270, containerBounds.size.width - 20, 40)
            );
            buttonContainer.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
            buttonContainer.autoresizesSubviews = true;

            let cancelButton: UIButton = UIButton.buttonWithType(
                UIButtonType.System
            );
            cancelButton.setTitleForState(options.cancelLabel || "Cancel", UIControlState.Normal);
            cancelButton.addTargetActionForControlEvents(
                buttonHandler,
                "close",
                UIControlEvents.TouchUpInside
            );
            cancelButton.frame = CGRectMake(
                0,
                0,
                buttonContainer.bounds.size.width / 2,
                40
            );
            cancelButton.setTitleColorForState(
                UIColor.whiteColor,
                UIControlState.Normal
            );
            cancelButton.titleLabel.font = UIFont.systemFontOfSize(18);
            cancelButton.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
            buttonContainer.addSubview(cancelButton);
            buttonContainer.bringSubviewToFront(cancelButton);

            let doneButton: UIButton = UIButton.buttonWithType(
                UIButtonType.System
            );
            doneButton.setTitleForState(options.doneLabel || "Done", UIControlState.Normal);
            if (options.type === "date") {
                doneButton.addTargetActionForControlEvents(
                    buttonHandler,
                    "chooseDate",
                    UIControlEvents.TouchUpInside
                );
            } else {
                doneButton.addTargetActionForControlEvents(
                    buttonHandler,
                    "chooseTime",
                    UIControlEvents.TouchUpInside
                );
            }

            doneButton.frame = CGRectMake(
                buttonContainer.bounds.size.width / 2,
                0,
                buttonContainer.bounds.size.width / 2,
                40
            );
            doneButton.setTitleColorForState(
                UIColor.colorWithRedGreenBlueAlpha(0, 153, 255, 1),
                UIControlState.Normal
            );
            doneButton.titleLabel.font = UIFont.boldSystemFontOfSize(18);
            doneButton.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
            buttonContainer.addSubview(doneButton);
            buttonContainer.bringSubviewToFront(doneButton);

            bottomContentContainer.addSubview(buttonContainer);
            bottomContentContainer.bringSubviewToFront(buttonContainer);

            datePickerView = UIDatePicker.alloc().initWithFrame(
                CGRectMake(0, 0, containerBounds.size.width - 20, 250)
            );
            datePickerView.datePickerMode =
                options.type === "date"
                    ? UIDatePickerMode.Date
                    : UIDatePickerMode.Time;
            datePickerView.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
            datePickerView.date = startingDate;
            if (options.minDate) datePickerView.minimumDate = options.minDate;
            if (options.maxDate) datePickerView.maximumDate = options.maxDate;
            pickerHolderView.addSubview(datePickerView);
            pickerHolderView.bringSubviewToFront(datePickerView);

            bottomContentContainer.addSubview(pickerHolderView);
            bottomContentContainer.bringSubviewToFront(pickerHolderView);

            titleLabel = this.labelFactory(
                options.title,
                UIColor.whiteColor,
                true,
                25
            );
            titleLabel.textAlignment = NSTextAlignment.Center;
            titleLabel.frame = CGRectMake(
                0,
                20,
                containerBounds.size.width,
                containerBounds.size.height - 360
            );

            titleLabel.transform = CGAffineTransformMakeScale(0.8, 0.8);
            titleLabel.adjustsFontForContentSizeCategory = true;
            titleLabel.adjustsFontSizeToFitWidth = true;
            titleLabel.layer.masksToBounds = false;
            titleLabel.alpha = 0;
            titleLabel.autoresizingMask =
                UIViewAutoresizing.FlexibleHeight |
                UIViewAutoresizing.FlexibleTopMargin |
                UIViewAutoresizing.FlexibleWidth;

            window.addSubview(titleLabel);
            window.bringSubviewToFront(titleLabel);

            window.addSubview(bottomContentContainer);
            window.bringSubviewToFront(bottomContentContainer);
            let animationOptions: UIViewAnimationOptions;
            UIView.animateWithDurationDelayOptionsAnimationsCompletion(
                0.4,
                0,
                UIViewAnimationOptions.CurveEaseOut,
                () => {
                    bottomContentContainer.transform = CGAffineTransformMakeTranslation(
                        0,
                        0
                    );
                    titleLabel.transform = CGAffineTransformMakeScale(1, 1);
                    titleLabel.alpha = 1;
                },
                () => {
                    //   console.dir("animation completed");
                }
            );
        });
    }

    private labelFactory(text, color, shadow, size) {
        window = UIApplication.sharedApplication.keyWindow;
        let containerBounds = window.bounds;
        let label = UILabel.alloc().init();
        label.text = text;
        label.font = UIFont.boldSystemFontOfSize(size);
        label.textColor = color;
        if (shadow) {
            label.shadowColor = UIColor.colorWithRedGreenBlueAlpha(
                0,
                0,
                0,
                0.4
            );
            label.shadowOffset = CGSizeMake(2.0, 2.0);
            label.layer.shadowRadius = 8.0;
            label.layer.shadowOpacity = 0.5;
            label.layer.masksToBounds = false;
            label.layer.shouldRasterize = true;
        }
        return label;
    }

    public chooseDate() {
        let pickedDate = new Date(datePickerView.date);
        let response: PickerResponse = {
            day: pickedDate.getDate(),
            month: pickedDate.getMonth() + 1,
            year: pickedDate.getFullYear()
        };
        this.close(response);
    }

    public chooseTime() {
        let pickedDate = new Date(datePickerView.date);
        let response: PickerResponse = {
            hour: pickedDate.getHours(),
            minute: pickedDate.getMinutes()
        };
        this.close(response);
    }

    public close(response?) {
        if (!response) response = false;
        UIView.animateWithDurationAnimationsCompletion(
            0.3,
            () => {
                effectView.effect = null;
                bottomContentContainer.transform = CGAffineTransformMakeTranslation(
                    0,
                    320
                );
                titleLabel.transform = CGAffineTransformMakeScale(0.8, 0.8);
                titleLabel.alpha = 0;
            },
            () => {
                effectView.removeFromSuperview();
                bottomContentContainer.removeFromSuperview();
                titleLabel.removeFromSuperview();
                myResolve(response);
            }
        );
    }
}

let picker = new ModalDatetimepicker();
