import * as application from "tns-core-modules/application";
import * as frame from "tns-core-modules/ui/frame";
import { Label } from "tns-core-modules/ui/label/";

declare var UIBlurEffectStyleDark, UIBlurEffectStyleLight;
declare var UIViewAutoresizingFlexibleWidth;
declare var UIViewAutoresizingFlexibleHeight;
declare var UIViewAutoresizingFlexibleTopMargin;



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
        "close": { returns: interop.types.void, params: [interop.types.id, interop.types.id] },
        "chooseDate": { returns: interop.types.void, params: [interop.types.id, interop.types.id] },
        "chooseTime": { returns: interop.types.void, params: [interop.types.id, interop.types.id] }
    };
}
const buttonHandler = ButtonHandler.new();
let myResolve;


export interface PickerOptions {
    type?: string,
    title?: string,
    theme?: string,
    maxDate?: Date,
    minDate?: Date,
    startingDate?: Date
}

export interface PickerResponse {
    day?: number,
    month?: number,
    year?: number,
    hour?: number,
    minute?: number
}

let window: UIWindow;
let effectView: UIVisualEffectView; // this view blurs the background
let pickerHolderView: UIView; // this is the view that holds the picker
let bottomContentContainer: UIView; // this view holds the picker and the action buttons.
let topContentContainer: UIView; // this is the view the holds the title.
let datePickerView: UIDatePicker;

export class ModalDatetimepicker {
    constructor() {}

    public pickDate(options?: PickerOptions) {
        if (!options) options = {};
        options.type = 'date';
        return this.show(options);
    }
    public pickTime(options?: PickerOptions) {
        if (!options) options = {};
        options.type = 'time';
        return this.show(options);
    }

    private show(options: PickerOptions) {
        return new Promise((resolve, reject) => {
            myResolve = resolve;
            if (!options.type) options.type = 'date';
            if (!options.theme) options.theme = 'dark';
            if (!options.title) {
                if (options.type == 'date') {
                    options.title = 'Choose A Date';
                } else {
                    options.title = 'Choose A Time';
                }
            }

            if (options.startingDate && typeof options.startingDate.getMonth != 'function') {
                reject('startingDate must be a Date.');
            }
            if (options.minDate && typeof options.minDate.getMonth != 'function') {
                reject('startingDate must be a Date.');
            }
            if (options.maxDate && typeof options.maxDate.getMonth != 'function') {
                reject('startingDate must be a Date.');
            }
            window = UIApplication.sharedApplication.keyWindow;
            let containerBounds = window.bounds;
    
            // blur the background of the application.
            effectView = UIVisualEffectView.alloc().init();
            effectView.frame = CGRectMake(containerBounds.origin.x, containerBounds.origin.y, containerBounds.size.width, containerBounds.size.height + 20);
            effectView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
            window.addSubview(effectView);
            window.bringSubviewToFront(effectView);
            UIView.animateWithDurationAnimations(0.4, () => {
                effectView.effect = UIBlurEffect.effectWithStyle(options.theme == 'light' ? UIBlurEffectStyleLight : UIBlurEffectStyleDark);
            })
    
            bottomContentContainer = UIView.alloc().init();
            bottomContentContainer.frame = CGRectMake(10, containerBounds.size.height - 320, containerBounds.size.width - 20, 310);
            bottomContentContainer.autoresizingMask = UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleWidth;
            bottomContentContainer.transform = CGAffineTransformMakeTranslation(0, 320);
    
            pickerHolderView = UIView.alloc().init();
            pickerHolderView.backgroundColor = UIColor.whiteColor;
            pickerHolderView.frame = CGRectMake(0, 0, containerBounds.size.width - 20, 270);
            pickerHolderView.layer.cornerRadius = 10;
            pickerHolderView.layer.masksToBounds = true;
            pickerHolderView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
            pickerHolderView.layer.masksToBounds = false;
            pickerHolderView.layer.shadowColor = UIColor.blackColor.CGColor;
            pickerHolderView.layer.shadowOffset = CGSizeMake(2.0, 2.0);
            pickerHolderView.layer.shadowOpacity = 0.5;
            pickerHolderView.layer.shadowRadius = 8;
            pickerHolderView.layer.shadowPath = UIBezierPath.bezierPathWithRect(pickerHolderView.bounds).CGPath;
    
            let cancelButton: UIButton = UIButton.buttonWithType(UIButtonType.System);
            cancelButton.setTitleForState('Cancel', UIControlState.Normal);
            cancelButton.addTargetActionForControlEvents(buttonHandler, "close", UIControlEvents.TouchUpInside);
            cancelButton.frame = CGRectMake(0, 270, ((containerBounds.size.width - 20)/2), 40);
            cancelButton.setTitleColorForState(UIColor.whiteColor, UIControlState.Normal);
            cancelButton.titleLabel.font = UIFont.systemFontOfSize(18);
            bottomContentContainer.addSubview(cancelButton);
            bottomContentContainer.bringSubviewToFront(cancelButton);
            
            let doneButton: UIButton = UIButton.buttonWithType(UIButtonType.System);
            doneButton.setTitleForState('Done', UIControlState.Normal);
            if (options.type == 'date') {
                doneButton.addTargetActionForControlEvents(buttonHandler, "chooseDate", UIControlEvents.TouchUpInside);
            } else {
                doneButton.addTargetActionForControlEvents(buttonHandler, "chooseTime", UIControlEvents.TouchUpInside);
            }
            
            doneButton.frame = CGRectMake(((containerBounds.size.width - 20)/2), 270, ((containerBounds.size.width - 20)/2), 40);
            doneButton.setTitleColorForState(UIColor.colorWithRedGreenBlueAlpha(0, 153, 255, 1), UIControlState.Normal);
            doneButton.titleLabel.font = UIFont.boldSystemFontOfSize(18);
            bottomContentContainer.addSubview(doneButton);
            bottomContentContainer.bringSubviewToFront(doneButton);
    
            
            datePickerView = UIDatePicker.alloc().initWithFrame(CGRectMake(0, 0, containerBounds.size.width - 20, 270));
            datePickerView.datePickerMode = (options.type == 'date' ? UIDatePickerMode.Date : UIDatePickerMode.Time);
            datePickerView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
            if (options.startingDate) datePickerView.date = options.startingDate;
            if (options.minDate) datePickerView.minimumDate = options.minDate;
            if (options.maxDate) datePickerView.maximumDate = options.maxDate;
            pickerHolderView.addSubview(datePickerView);
            pickerHolderView.bringSubviewToFront(datePickerView);
            
            bottomContentContainer.addSubview(pickerHolderView);
            bottomContentContainer.bringSubviewToFront(pickerHolderView);
    
            topContentContainer = UIView.alloc().init();
            topContentContainer.frame = CGRectMake(10, 50, containerBounds.size.width - 20, 200);

            let titleLabel = this.labelFactory(options.title, UIColor.whiteColor, true, 30)
            titleLabel.lineBreakMode = NSLineBreakMode.ByWordWrapping;
            titleLabel.numberOfLines = 5;
            titleLabel.textAlignment = NSTextAlignment.Center;
            titleLabel.frame = CGRectMake(0, 0, containerBounds.size.width - 20, 200);

            topContentContainer.addSubview(titleLabel);
            topContentContainer.bringSubviewToFront(titleLabel);

            if (options.minDate) {
                let minDateText = 'Minimum date: ' + (options.minDate.getMonth() + 1) + '/' + options.minDate.getDate() + '/' + options.minDate.getFullYear();
                let minDateLabel = this.labelFactory(minDateText, UIColor.whiteColor, false, 14)
                minDateLabel.frame = CGRectMake(10, 230, containerBounds.size.width - 20, 40);
                topContentContainer.addSubview(minDateLabel);
                topContentContainer.bringSubviewToFront(minDateLabel);
            }
            if (options.maxDate) {
                let maxDateText = 'Maximum date: ' + (options.maxDate.getMonth() + 1) + '/' + options.maxDate.getDate() + '/' + options.maxDate.getFullYear();
                let maxDateLabel = this.labelFactory(maxDateText, UIColor.whiteColor, false, 14)
                maxDateLabel.frame = CGRectMake(10, 250, containerBounds.size.width - 20, 40);
                topContentContainer.addSubview(maxDateLabel);
                topContentContainer.bringSubviewToFront(maxDateLabel);
            }
    
            topContentContainer.autoresizingMask = UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleWidth;
            
            topContentContainer.transform = CGAffineTransformMakeScale(.8, .8)
            topContentContainer.alpha = 0;
            window.addSubview(topContentContainer);
            window.bringSubviewToFront(topContentContainer);
    
            window.addSubview(bottomContentContainer);
            window.bringSubviewToFront(bottomContentContainer);
            let animationOptions: UIViewAnimationOptions;
            UIView.animateWithDurationDelayOptionsAnimationsCompletion(0.4, 0, UIViewAnimationOptions.CurveEaseOut, () => {
                bottomContentContainer.transform = CGAffineTransformMakeTranslation(0, 0);
                topContentContainer.transform = CGAffineTransformMakeScale(1, 1)
                topContentContainer.alpha = 1;
            }, () => {
                console.dir('animation completed');
            })
        })
    }

    private labelFactory(text, color, shadow, size) {
        window = UIApplication.sharedApplication.keyWindow;
        let containerBounds = window.bounds;
        let label = UILabel.alloc().init();
        label.text = text;
        label.font = UIFont.boldSystemFontOfSize(size);
        label.textColor = color;
        if (shadow) {
            label.shadowColor = UIColor.colorWithRedGreenBlueAlpha(0,0,0,0.4);
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
        }
        this.close(response)
    }

    public chooseTime() {
        let pickedDate = new Date(datePickerView.date);
        let response: PickerResponse = {
            hour: pickedDate.getHours(),
            minute: pickedDate.getMinutes()
        }
        this.close(response)
    }

    public close(response?) {
        if (!response) response = false;
        UIView.animateWithDurationAnimationsCompletion(0.3, () => {
            effectView.effect = null;
            bottomContentContainer.transform = CGAffineTransformMakeTranslation(0, 320);
            topContentContainer.transform = CGAffineTransformMakeScale(.8, .8)
            topContentContainer.alpha = 0;
        }, () => {
            effectView.removeFromSuperview();
            bottomContentContainer.removeFromSuperview();
            topContentContainer.removeFromSuperview();
            myResolve(response);
        })
    }

}

let picker = new ModalDatetimepicker();