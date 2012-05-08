describe("hidden convention bindings", function(){
  beforeEach(function(){
    this.model = new AModel({
      hidden_input: "Ashelia Bailey", 
      noType: 'there is no type'
    });
    this.view = new AView({model: this.model});
  });

  describe("hidden element binding", function(){
    beforeEach(function(){
      this.view.render();
      this.el = this.view.$("#hidden_input");
    });

    it("bind view changes to the model's field, by convention of id", function(){
      this.el.val("Derick Bailey");
      this.el.trigger('change');

      expect(this.model.get('hidden_input')).toEqual("Derick Bailey");
    });

    it("bind model field changes to the form input, by convention of id", function(){
      this.model.set({hidden_input: "Ian Bailey"});
      expect(this.el.val()).toEqual("Ian Bailey");
    });

    it("binds the model's value to the form field on render", function(){
      expect(this.el.val()).toEqual("Ashelia Bailey");
    });
  });

  describe("when the form field has a value but the model does not", function(){
    beforeEach(function(){
      this.view.render();
      var el = this.view.$("#prefilled_hidden_input");
    });

    it("binds the form field's value to the model, on render", function(){
      expect(this.model.get("prefilled_hidden_input")).toBe("this is a hidden input");
    });
  });
});
