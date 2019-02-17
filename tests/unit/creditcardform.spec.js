import Vue from "vue";
import { mount } from "@vue/test-utils";
import { expect } from "chai";
import CreditCardForm from "../../src/components/CreditCardForm.vue";
import VeeValidate from "vee-validate";
import VueMask from "v-mask";
import sinon from "sinon";
import flushPromises from "flush-promises";
Vue.use(VeeValidate);
Vue.use(VueMask);

describe("Component CreditCardForm", () => {
  const options = {
    attachToDocument: true, // Required for the handleSubmit test. Where sinon is used
    provide: {
      $validator() {
        return new VeeValidate.Validator();
      }
    }
  };
  const wrapper = mount(CreditCardForm, options);

  // Test Card Number
  it("Doesnt allow non-numerical values on credit card number", () => {
    const cardNumber = wrapper.find("#cardNumber");
    cardNumber.element.value = "ABC"; //this is an invalid credit card number
    cardNumber.trigger("input");
    expect(wrapper.vm.$el.querySelector("#cardNumber").value).to.equal("");
  });

  it("Doesnt allow more than 16 numbers on credit card number", () => {
    const cardNumber = wrapper.find("#cardNumber");
    cardNumber.element.value = "12345678987654321111111111"; //this is an invalid credit card number
    cardNumber.trigger("input");
    expect(wrapper.vm.$el.querySelector("#cardNumber").value).to.equal("1234-5678-9876-5432");
  });

  // Test Card Number - error generation on field
  it("Displays an error if validation fails with incorrect credit card number", async () => {
    const cardNumber = wrapper.find("#cardNumber");
    cardNumber.element.value = "1234-5678-9876-5432"; //this is an invalid credit card number
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardNumber")).to.equal(true);
  });

  it("Doesnt display an error if validation passes, when number starts from 4", async () => {
    const cardNumber = wrapper.find("#cardNumber");
    cardNumber.element.value = "4111-1111-1111-1111"; //this is a valid credit card number
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardNumber")).to.equal(false);
  });

  // Test Card Holder - error generation on field
  it("Displays an error if validation fails - name is empty", async () => {
    const cardHolder = wrapper.find("#cardHolder");
    cardHolder.element.value =  " "; //this is an invalid credit card holder name
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardHolder")).to.equal(true);
  });

  it("Doesnt display an error if validation passes - alphabet only", async () => {
    const cardHolder = wrapper.find("#cardHolder");
    cardHolder.element.value = "Jane Smith"; //this is a valid credit card holder name
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardHolder")).to.equal(false);
  });

  it("Displays an error if validation fails with numbers", async () => {
    const cardHolder = wrapper.find("#cardHolder");
    cardHolder.element.value = "Jane 123"; //this is an invalid credit card holder name
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardHolder")).to.equal(true);
  });

  it("Displays an error if validation fails with special symbols &", async () => {
    const cardHolder = wrapper.find("#cardHolder");
    cardHolder.element.value = "Jane & Smith"; //this is an invalid credit card holder name
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardHolder")).to.equal(true);
  });

  // Test Day, Month
  it("Doesnt allow more than 4 numbers on day and month", () => {
    const cardMonth = wrapper.find("#cardMonth");
    cardMonth.element.value = "011215487"; //this is an invalid credit card cvv
    cardMonth.trigger("input");
    expect(wrapper.vm.$el.querySelector("#cardMonth").value).to.equal("01/12");
  });

  it("Doesnt allow non-numerical values on credit card day and month", async () => {
    const cardMonth = wrapper.find("#cardMonth");
    cardMonth.element.value = "qq/qq"; //this is an invalid expiration date and month
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardMonth")).to.equal(true);
  });

  it("Displays an error if day and month wrong", async () => {
    const cardMonth = wrapper.find("#cardMonth");
    cardMonth.element.value = "32/13"; //this is an invalid expiration date and month
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardMonth")).to.equal(true);
  });

  it("Doesnt display an error if day and month correct", async () => {
    const currentYear = new Date();
    const cardMonth = wrapper.find("#cardMonth");
    cardMonth.element.value = "05/12";
    const cardYear = wrapper.find("#cardYear");
    cardYear.element.value = currentYear.getFullYear()+1; //this is a valid date and month
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardMonth")).to.equal(false);
  });

  //Test Year
  it("Doesnt allow more than 4 numbers on Year", () => {
    const cardYear = wrapper.find("#cardYear");
    cardYear.element.value = "202456893"; //this is an invalid credit card year
    cardYear.trigger("input");
    expect(wrapper.vm.$el.querySelector("#cardYear").value).to.equal("2024");
  });

  it("Displays an error if year is expired", async () => {
    const cardYear = wrapper.find("#cardYear");
    cardYear.element.value = "2018"; //this is an invalid year
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardYear")).to.equal(true);
  });

  it("Doesnt display an error if year is up to date", async () => {
    const cardYear = wrapper.find("#cardYear");
    cardYear.element.value = "2022"; //this is a valid year
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardYear")).to.equal(false);
  });

  //Test CVV input
  it("Doesnt allow more than 3 numbers on credit card CVV", () => {
    const cardCVV = wrapper.find("#cardCVV");
    cardCVV.element.value = "1234567"; //this is an invalid credit card cvv
    cardCVV.trigger("input");
    expect(wrapper.vm.$el.querySelector("#cardCVV").value).to.equal("123");
  });

  it("Displays an error if cardCVV is a string", async () => {
    const cardCVV = wrapper.find("#cardCVV");
    cardCVV.element.value = "qqq"; //this is an invalid expiration date and month
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    await flushPromises();
    expect(wrapper.vm.errors.has("cardCVV")).to.equal(true);
  });

  // Test Submit button
   it("Calls handleSubmit when submit button is clicked", () => {
    const clickMethodStub = sinon.stub();
    wrapper.setMethods({ handleSubmit: clickMethodStub });
    const btnSubmit = wrapper.find(".btn-submit");
    btnSubmit.trigger("click");
    expect(clickMethodStub.called).to.equal(true);
  });

});