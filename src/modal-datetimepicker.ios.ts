import { Application, Color, Device } from "@nativescript/core";

@NativeClass()
class ButtonHandlerImpl extends NSObject {
  private _owner: WeakRef<ModalDatetimepicker>;

  public static initWithOwner(owner: WeakRef<ModalDatetimepicker>) {
    const handler = ButtonHandlerImpl.new() as ButtonHandlerImpl;
    handler._owner = owner;
    return handler;
  }

  public close(nativeButton: UIButton) {
    if (this._owner) {
      const owner = this._owner.get();
      if (owner) {
          owner.close();
      }
    }
  }

  public chooseDate(nativeButton: UIButton) {
    if (this._owner) {
      const owner = this._owner.get();
      if (owner) {
          owner.chooseDate();
      }
    }
  }

  public chooseTime(nativeButton: UIButton) {
    if (this._owner) {
      const owner = this._owner.get();
      if (owner) {
          owner.chooseTime();
      }
    }
  }

  public static ObjCExposedMethods = {
    close: {
      returns: interop.types.void,
      params: [interop.types.id],
    },
    chooseDate: {
      returns: interop.types.void,
      params: [interop.types.id],
    },
    chooseTime: {
      returns: interop.types.void,
      params: [interop.types.id],
    },
  };
}

const SUPPORT_DATE_PICKER_STYLE = parseFloat(Device.osVersion) >= 14.0;
const SUPPORT_TEXT_COLOR = parseFloat(Device.osVersion) < 14.0;
const DEFAULT_DATE_PICKER_STYLE = 1;

export class ModalDatetimepicker {
  private myResolve: (value: any) => void;
  private window: UIWindow;
  private effectView: UIVisualEffectView; // this view potentially blurs the background
  private overlayView: UIView; // this view potentially overlays the background
  // private pickerHolderView: UIView; // this is the view that holds the picker
  private bottomContentContainer: UIView; // this view holds the picker and the action buttons.
  // private topContentContainer: UIView; // this is the view the holds the title.
  private titleLabel: UILabel;
  // private minMaxLabel: UILabel;
  private datePickerView: UIDatePicker;

  private _buttonHandler: ButtonHandlerImpl;

  constructor() {}

  public pickDate(options: PickerOptions = {}) {
    if (!options) options = {};
    options.type = "date";
    return this.show(options) as Promise<DateResponse>;
  }
  public pickTime(options: PickerOptions = {}) {
    if (!options) options = {};
    options.type = "time";
    return this.show(options) as Promise<TimeResponse>;
  }

  private show(options: PickerOptions = {}) {
    const buttonHandler = ButtonHandlerImpl.initWithOwner(new WeakRef(this));

    this._buttonHandler = buttonHandler;

    return new Promise((resolve, reject) => {
      this.myResolve = resolve;
      if (!options.type) options.type = "date";
      if (!options.theme) options.theme = "dark";
      if (!options.overlayAlpha) options.overlayAlpha = 0.7;

      let startingDate = new Date();
      if (options.type === "date") {
        if (
          options.startingDate &&
          typeof options.startingDate.getMonth !== "function"
        ) {
          reject("startingDate must be a Date.");
        } else if (options.startingDate) {
          startingDate = options.startingDate;
        }
      } else {
        if (options.startingHour !== undefined && options.startingHour >= 0) {
          startingDate.setHours(options.startingHour);
        }
        if (
          options.startingMinute !== undefined &&
          options.startingMinute >= 0
        ) {
          startingDate.setMinutes(options.startingMinute);
        }
      }
      if (options.minDate && typeof options.minDate.getMonth !== "function") {
        reject("minDate must be a Date.");
      }
      if (options.maxDate && typeof options.maxDate.getMonth !== "function") {
        reject("maxDate must be a Date.");
      }
      this.window = UIApplication.sharedApplication.keyWindow;
      const containerBounds = this.window.bounds;

      if (options.theme === "overlay") {
        // overlay the background of the application.
        this.overlayView = UIView.alloc().init();
        this.overlayView.frame = CGRectMake(
          containerBounds.origin.x,
          containerBounds.origin.y,
          containerBounds.size.width,
          containerBounds.size.height + 20
        );
        this.overlayView.autoresizingMask =
          UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
        this.window.addSubview(this.overlayView);
        this.window.bringSubviewToFront(this.overlayView);

        UIView.animateWithDurationAnimations(0.4, () => {
          this.overlayView.backgroundColor = UIColor.blackColor.colorWithAlphaComponent(
            options.overlayAlpha
          );
        });
      } else {
        // blur the background of the application.
        this.effectView = UIVisualEffectView.alloc().init();
        this.effectView.frame = CGRectMake(
          containerBounds.origin.x,
          containerBounds.origin.y,
          containerBounds.size.width,
          containerBounds.size.height + 20
        );
        this.effectView.autoresizingMask =
          UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
        this.window.addSubview(this.effectView);
        this.window.bringSubviewToFront(this.effectView);
        UIView.animateWithDurationAnimations(0.4, () => {
          let theme = UIBlurEffectStyle.Light;
          switch (options.theme) {
            case "extralight":
              theme = UIBlurEffectStyle.ExtraLight;
              break;
            case "light":
              theme = UIBlurEffectStyle.Light;
              break;
            case "regular":
              theme = UIBlurEffectStyle.Regular;
              break;
            case "dark":
              theme = UIBlurEffectStyle.Dark;
              break;
            case "extradark":
              theme = UIBlurEffectStyle.ExtraDark;
              break;
            case "prominent":
              theme = UIBlurEffectStyle.Prominent;
              break;
            default:
              break;
          }

          // dont display if theme is none
          if (options.theme !== "none") {
            this.effectView.effect = UIBlurEffect.effectWithStyle(theme);
          } else {
            this.effectView.effect = null;
          }
        });
      }

      this.bottomContentContainer = UIView.alloc().init();
      this.bottomContentContainer.frame = CGRectMake(
        10,
        containerBounds.size.height - 320,
        containerBounds.size.width - 20,
        310
      );
      this.bottomContentContainer.autoresizingMask =
        UIViewAutoresizing.FlexibleTopMargin | UIViewAutoresizing.FlexibleWidth;
      this.bottomContentContainer.autoresizesSubviews = true;
      this.bottomContentContainer.transform = CGAffineTransformMakeTranslation(
        0,
        320
      );

      const pickerHolderView = UIView.alloc().init();
      const appearance = Application.systemAppearance();
      if (appearance) {
        pickerHolderView.backgroundColor =
          appearance === "dark" ? UIColor.blackColor : UIColor.whiteColor;
      } else {
        pickerHolderView.backgroundColor = UIColor.whiteColor;
      }

      pickerHolderView.frame = CGRectMake(
        0,
        0,
        containerBounds.size.width - 20,
        270
      );
      pickerHolderView.layer.cornerRadius = 10;
      pickerHolderView.layer.masksToBounds = true;
      pickerHolderView.autoresizingMask =
        UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
      pickerHolderView.layer.masksToBounds = false;
      pickerHolderView.layer.shadowColor = UIColor.blackColor.CGColor;
      pickerHolderView.layer.shadowOffset = CGSizeMake(2.0, 2.0);
      pickerHolderView.layer.shadowOpacity = 0.5;
      pickerHolderView.layer.shadowRadius = 8;
      pickerHolderView.layer.shadowPath = UIBezierPath.bezierPathWithRect(
        pickerHolderView.bounds
      ).CGPath;

      const buttonContainer: UIView = UIView.alloc().initWithFrame(
        CGRectMake(0, 270, containerBounds.size.width - 20, 40)
      );
      buttonContainer.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
      buttonContainer.autoresizesSubviews = true;

      const cancelButton: UIButton = UIButton.buttonWithType(
        UIButtonType.System
      );
      cancelButton.setTitleForState(
        options.cancelLabel || "Cancel",
        UIControlState.Normal
      );
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
        (options.cancelLabelColor && options.cancelLabelColor.ios) ||
          UIColor.whiteColor,
        UIControlState.Normal
      );
      cancelButton.titleLabel.font = UIFont.systemFontOfSize(18);
      cancelButton.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
      buttonContainer.addSubview(cancelButton);
      buttonContainer.bringSubviewToFront(cancelButton);

      const doneButton: UIButton = UIButton.buttonWithType(UIButtonType.System);
      doneButton.setTitleForState(
        options.doneLabel || "Done",
        UIControlState.Normal
      );
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
        (options.doneLabelColor && options.doneLabelColor.ios) ||
          UIColor.colorWithRedGreenBlueAlpha(0, 0.6, 1, 1),
        UIControlState.Normal
      );
      doneButton.titleLabel.font = UIFont.boldSystemFontOfSize(18);
      doneButton.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
      buttonContainer.addSubview(doneButton);
      buttonContainer.bringSubviewToFront(doneButton);

      this.bottomContentContainer.addSubview(buttonContainer);
      this.bottomContentContainer.bringSubviewToFront(buttonContainer);

      this.datePickerView = UIDatePicker.alloc().initWithFrame(
        CGRectMake(0, 0, containerBounds.size.width - 20, 250)
      );
      this.datePickerView.datePickerMode =
        options.type === "date" ? UIDatePickerMode.Date : UIDatePickerMode.Time;
      if (SUPPORT_DATE_PICKER_STYLE) {
        (this.datePickerView as any).preferredDatePickerStyle = DEFAULT_DATE_PICKER_STYLE;
      }
      this.datePickerView.autoresizingMask = UIViewAutoresizing.FlexibleWidth;
      this.datePickerView.date = startingDate;
      if (options.minDate) this.datePickerView.minimumDate = options.minDate;
      if (options.maxDate) this.datePickerView.maximumDate = options.maxDate;
      pickerHolderView.addSubview(this.datePickerView);
      this.datePickerView.center = pickerHolderView.center;
      pickerHolderView.bringSubviewToFront(this.datePickerView);

      this.bottomContentContainer.addSubview(pickerHolderView);
      this.bottomContentContainer.bringSubviewToFront(pickerHolderView);

      // Only if title is set
      if (options.title) {
        this.titleLabel = this.labelFactory(
          options.title,
          UIColor.whiteColor,
          true,
          25
        );
        this.titleLabel.textAlignment = NSTextAlignment.Center;
        this.titleLabel.frame = CGRectMake(
          0,
          20,
          containerBounds.size.width,
          containerBounds.size.height - 360
        );

        this.titleLabel.transform = CGAffineTransformMakeScale(0.8, 0.8);
        this.titleLabel.respondsToSelector("adjustsFontForContentSizeCategory")
          ? (this.titleLabel.adjustsFontForContentSizeCategory = true)
          : null;
        this.titleLabel.adjustsFontSizeToFitWidth = true;
        this.titleLabel.layer.masksToBounds = false;
        this.titleLabel.alpha = 0;
        this.titleLabel.autoresizingMask =
          UIViewAutoresizing.FlexibleHeight |
          UIViewAutoresizing.FlexibleTopMargin |
          UIViewAutoresizing.FlexibleWidth;
        this.window.addSubview(this.titleLabel);
        this.window.bringSubviewToFront(this.titleLabel);
      }

      this.window.addSubview(this.bottomContentContainer);
      this.window.bringSubviewToFront(this.bottomContentContainer);
      UIView.animateWithDurationDelayOptionsAnimationsCompletion(
        0.4,
        0,
        UIViewAnimationOptions.CurveEaseOut,
        () => {
          this.bottomContentContainer.transform = CGAffineTransformMakeTranslation(
            0,
            0
          );

          // Only if title is set
          if (options.title) {
            this.titleLabel.transform = CGAffineTransformMakeScale(1, 1);
            this.titleLabel.alpha = 1;
          }
        },
        () => {}
      );
    });
  }

  private labelFactory(
    text: string,
    color: UIColor,
    shadow: boolean,
    size: number
  ) {
    this.window = UIApplication.sharedApplication.keyWindow;
    const label = UILabel.alloc().init();
    label.text = text;
    label.font = UIFont.boldSystemFontOfSize(size);
    label.textColor = color;
    if (shadow) {
      label.shadowColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.4);
      label.shadowOffset = CGSizeMake(2.0, 2.0);
      label.layer.shadowRadius = 8.0;
      label.layer.shadowOpacity = 0.5;
      label.layer.masksToBounds = false;
      label.layer.shouldRasterize = true;
    }
    return label;
  }

  public chooseDate() {
    const pickedDate = new Date(this.datePickerView.date);
    const response: DateResponse = {
      day: pickedDate.getDate(),
      month: pickedDate.getMonth() + 1,
      year: pickedDate.getFullYear(),
    };
    this.close(response);
  }

  public chooseTime() {
    const pickedDate = new Date(this.datePickerView.date);
    const response: TimeResponse = {
      hour: pickedDate.getHours(),
      minute: pickedDate.getMinutes(),
    };
    this.close(response);
  }

  public close(response?: any) {
    if (!response) response = false;
    UIView.animateWithDurationAnimationsCompletion(
      0.3,
      () => {
        if (this.effectView) {
          this.effectView.effect = null;
        }
        if (this.overlayView) {
          this.overlayView.backgroundColor = UIColor.clearColor;
        }
        this.bottomContentContainer.transform = CGAffineTransformMakeTranslation(
          0,
          320
        );
        if (this.titleLabel) {
          this.titleLabel.transform = CGAffineTransformMakeScale(0.8, 0.8);
          this.titleLabel.alpha = 0;
        }
      },
      () => {
        if (this.effectView) {
          this.effectView.removeFromSuperview();
        }
        if (this.overlayView) {
          this.overlayView.removeFromSuperview();
        }
        this.bottomContentContainer.removeFromSuperview();
        if (this.titleLabel) {
          this.titleLabel.removeFromSuperview();
        }

        this.myResolve(response);
        // Release native objects for gc
        this._buttonHandler = null;
        this.titleLabel = null;
        this.overlayView = null;
        this.effectView = null;
        this.bottomContentContainer = null;
        this.window = null;
        this.datePickerView = null;
      }
    );
  }
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
  cancelLabel?: string;
  doneLabel?: string;
  cancelLabelColor?: Color;
  doneLabelColor?: Color;
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
