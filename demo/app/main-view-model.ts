import { Observable } from 'tns-core-modules/data/observable';
import { ModalDatetimepicker } from 'nativescript-modal-datetimepicker';

export class HelloWorldModel extends Observable {
  public message: string;
  private modalDatetimepicker: ModalDatetimepicker;

  constructor() {
    super();

    this.modalDatetimepicker = new ModalDatetimepicker();
    this.message = this.modalDatetimepicker.message;
  }
}
