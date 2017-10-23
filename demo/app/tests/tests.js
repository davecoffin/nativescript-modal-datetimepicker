var ModalDatetimepicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;
var modalDatetimepicker = new ModalDatetimepicker();

describe("greet function", function() {
    it("exists", function() {
        expect(modalDatetimepicker.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(modalDatetimepicker.greet()).toEqual("Hello, NS");
    });
});