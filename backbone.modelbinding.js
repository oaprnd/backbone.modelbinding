/* global Backbone, _, $ */

/*!
 * Backbone.Modelbinding v0.5.1
 *
 * This plugin provides a simple, convention based mechanism to create bi-directional binding between your Backbone models and your HTML elements, including form inputs, divs, spans, and so on.
 *
 * Documentation availabe at:
 * https://github.com/oaprnd/backbone.modelbinding
 *
 * Distributed Under MIT License:
 * https://raw.github.com/oaprnd/backbone.modelbinding/master/LICENSE.txt
 *
 * ----------------------------
 * Backbone.ModelBinding
 * ----------------------------
 */

(function (root, Backbone, _, $) {

	var ModelBinding = {

		version: "0.5.1",

		bind: function (view, options) {
			view.modelBinder = new ModelBinder(view, options);
			view.modelBinder.bind();
		},

		unbind: function (view) {
			if (view.modelBinder) {
				view.modelBinder.unbind();
			}
		}
	};

	var modelbinding = (function (Backbone, _, $) {

		var modelBinding = {

			version: "0.5.1",

			bind: function (view, options) {
				view.modelBinder = new ModelBinder(view, options);
				view.modelBinder.bind();
			},

			unbind: function (view) {
				if (view.modelBinder) {
					view.modelBinder.unbind();
				}
			}
		};

		var ModelBinder = function (view, options) {

			this.config = new modelBinding.Configuration(options);
			this.modelBindings = [];
			this.elementBindings = [];

			this.bind = function () {
				var conventions = modelBinding.Conventions;
				for (var conventionName in conventions) {
					if (conventions.hasOwnProperty(conventionName)) {
						var convention = conventions[conventionName];
						var handler = convention.handler;
						var selector = convention.selector;
						handler.bind.call(this, selector, view, view.model, this.config);
					}
				}
			};

			this.unbind = function () {
				// unbind the html element bindings
				_.each(this.elementBindings, function (binding) {
					binding.element.unbind(binding.eventName, binding.callback);
				});

				// unbind the model bindings
				_.each(this.modelBindings, function (binding) {
					binding.model.unbind(binding.eventName, binding.callback);
				});
			};

			this.registerModelBinding = function (model, attrName, callback) {
				// bind the model changes to the form elements
				var eventName = "change:" + attrName;
				model.bind(eventName, callback);
				this.modelBindings.push({
					model: model,
					eventName: eventName,
					callback: callback
				});
			};

			this.registerDataBinding = function (model, eventName, callback) {
				// bind the model changes to the elements
				model.bind(eventName, callback);
				this.modelBindings.push({
					model: model,
					eventName: eventName,
					callback: callback
				});
			};

			this.registerElementBinding = function (element, callback) {
				// bind the form changes to the model
				element.bind("change", callback);
				this.elementBindings.push({
					element: element,
					eventName: "change",
					callback: callback
				});
			};
		};

		// ----------------------------
		// Model Binding Configuration
		// ----------------------------
		modelBinding.Configuration = function (options) {
			this.bindingAttrConfig = {};

			_.extend(this.bindingAttrConfig, modelBinding.Configuration.bindindAttrConfig, options);

			if (this.bindingAttrConfig.all) {
				var attr = this.bindingAttrConfig.all;
				delete this.bindingAttrConfig.all;
				for (var inputType in this.bindingAttrConfig) {
					if (this.bindingAttrConfig.hasOwnProperty(inputType)) {
						this.bindingAttrConfig[inputType] = attr;
					}
				}
			}

			this.getBindingAttr = function (type) {
				return this.bindingAttrConfig[type];
			};

			this.getBindingValue = function (element, type) {
				var bindingAttr = this.getBindingAttr(type);
				return element.attr(bindingAttr);
			};

		};

		/**
		 * Default attributes to be used to bind model attribute with HTML element. For example
		 * when your model is:
		 *
		 * var model = Backbone.Model.extend({
		 *   something : 'some text'
		 * });
		 *
		 * Then to create bi-directional binding you should use such HTML element:
		 *
		 * <input type="text" id="something" />
		 *
		 * Note that model attribute and HTML element ID are the same!
		 */
		modelBinding.Configuration.bindindAttrConfig = {

			// HTML4 inputs
			text : "id",
			hidden : "id",
			textarea : "id",
			password : "id",
			radio : "name",
			checkbox : "id",
			select : "id",

			// HTML5 inputs
			number : "id",
			range : "id",
			tel : "id",
			search : "id",
			url : "id",
			email : "id",
			date : "id",
			datetime : "id",
			datetime_local : "id",
			month : "id",
			time : "id",
			week : "id"
		};

		modelBinding.Configuration.store = function () {
			modelBinding.Configuration.originalConfig = _.clone(modelBinding.Configuration.bindindAttrConfig);
		};

		modelBinding.Configuration.restore = function () {
			modelBinding.Configuration.bindindAttrConfig = modelBinding.Configuration.originalConfig;
		};

		modelBinding.Configuration.configureBindingAttributes = function (options) {
			if (options.all) {
				this.configureAllBindingAttributes(options.all);
				delete options.all;
			}
			_.extend(modelBinding.Configuration.bindindAttrConfig, options);
		};

		modelBinding.Configuration.configureAllBindingAttributes = function (attribute) {
			var config = modelBinding.Configuration.bindindAttrConfig;
			config.text = attribute;
			config.hidden = attribute;
			config.textarea = attribute;
			config.password = attribute;
			config.radio = attribute;
			config.checkbox = attribute;
			config.select = attribute;
			config.number = attribute;
			config.range = attribute;
			config.tel = attribute;
			config.search = attribute;
			config.url = attribute;
			config.email = attribute;
		};

		/**
		 * Get element type.
		 *
		 * @return string
		 */
		modelBinding._getElementType = function($element) {
			var type = $element[0].tagName.toLowerCase();
			if (type == "input") {
				type = $element.attr("type");
				if (type == undefined || type == '') {
					type = 'text';
				}
			}
			return type;
		};

		/**
		 * Can we bind data to specific element. Attribute data-skip tell us that
		 * this specific element should not be bind with model data.
		 *
		 * @param $element - element to check binding capabilities
		 */
		modelBinding.isBindAllowed = function($element, config) {
			var type = modelBinding._getElementType($element);
			var binding_attr = config.bindingAttrConfig[type];

			// do not bind configured elements without binding attribute specified
			if (typeof(binding_attr) !== 'undefined') {
				if (typeof($element.attr(binding_attr)) === 'undefined') {
					return false;
				}
			}

			return typeof($element.attr('data-skip')) === 'undefined';
		};

		/**
		 * Text, Textarea, and Password Bi-Directional Binding Methods
		 */
		var StandardBinding = (function (Backbone) {
			var methods = {};

			methods.bind = function (selector, view, model, config) {

				var modelBinder = this;

				view.$(selector).each(function (index) {

					var element = view.$(this);

					// return if binding is not allowed for this element - binding is allowed
					// if element does not contain data-skip attribute
					if (!modelBinding.isBindAllowed(element, config)) {
						return;
					}

					var elementType = modelBinding._getElementType(element);
					var attribute_name = config.getBindingValue(element, elementType);

					var modelChange = function (changed_model, val) {
						element.val(val);
					};

					var setModelValue = function (attr_name, value) {
						var data = {};
						data[attr_name] = value;
						model.set(data);
					};

					var elementChange = function (ev) {
						setModelValue(attribute_name, view.$(ev.target).val());
					};

					modelBinder.registerModelBinding(model, attribute_name, modelChange);
					modelBinder.registerElementBinding(element, elementChange);

					// set the default value on the form, from the model
					var attr_value = model.get(attribute_name);
					if (typeof attr_value !== "undefined" && attr_value !== null) {
						element.val(attr_value);
					} else {
						var elVal = element.val();
						if (elVal) {
							setModelValue(attribute_name, elVal);
						}
					}
				});
			};

			return methods;
		})(Backbone);

		// ----------------------------
		// Select Box Bi-Directional Binding Methods
		// ----------------------------
		var SelectBoxBinding = (function (Backbone) {
			var methods = {};

			methods.bind = function (selector, view, model, config) {
				var modelBinder = this;

				view.$(selector).each(function (index) {

					var element = view.$(this);

					// return if binding is not allowed for this element - binding is allowed
					// if element does not contain data-skip attribute
					if (!modelBinding.isBindAllowed(element, config)) {
						return;
					}

					var attribute_name = config.getBindingValue(element, 'select');

					var modelChange = function (changed_model, val) {
						element.val(val);
					};

					var setModelValue = function (attr, val, text) {
						var data = {};
						data[attr] = val;
						data[attr + "_text"] = text;
						model.set(data);
					};

					var elementChange = function (ev) {
						var targetEl = view.$(ev.target);
						var value = targetEl.val();
						var text = targetEl.find(":selected").text();
						setModelValue(attribute_name, value, text);
					};

					modelBinder.registerModelBinding(model, attribute_name, modelChange);
					modelBinder.registerElementBinding(element, elementChange);

					// set the default value on the form, from the model
					var attr_value = model.get(attribute_name);
					if (typeof attr_value !== "undefined" && attr_value !== null) {
						element.val(attr_value);
					}

					// set the model to the form's value if there is no model value
					if (element.val() != attr_value) {
						var value = element.val();
						var text = element.find(":selected").text();
						setModelValue(attribute_name, value, text);
					}
				});
			};

			return methods;
		})(Backbone);

		// ----------------------------
		// Radio Button Group Bi-Directional Binding Methods
		// ----------------------------
		var RadioGroupBinding = (function (Backbone) {
			var methods = {};

			methods.bind = function (selector, view, model, config) {
				var modelBinder = this;

				var foundElements = [];
				view.$(selector).each(function (index) {

					var element = view.$(this);

					// return if binding is not allowed for this element - binding is allowed
					// if element does not contain data-skip attribute
					if (!modelBinding.isBindAllowed(element, config)) {
						return;
					}

					var group_name = config.getBindingValue(element, 'radio');
					if (!foundElements[group_name]) {
						foundElements[group_name] = true;
						var bindingAttr = config.getBindingAttr('radio');

						var modelChange = function (model, val) {
							var value_selector = "input[type=radio][" + bindingAttr + "='" + group_name + "'][value='" + val + "']";
							view.$(value_selector).attr("checked", "checked");
						};
						modelBinder.registerModelBinding(model, group_name, modelChange);

						var setModelValue = function (attr, val) {
							var data = {};
							data[attr] = val;
							model.set(data);
						};

						// bind the form changes to the model
						var elementChange = function (ev) {
							var element = view.$(ev.currentTarget);
							if (element.is(":checked")) {
								setModelValue(group_name, element.val());
							}
						};

						var group_selector = "input[type=radio][" + bindingAttr + "='" + group_name + "']";
						view.$(group_selector).each(function () {
							var groupEl = $(this);
							modelBinder.registerElementBinding(groupEl, elementChange);
						});

						var attr_value = model.get(group_name);
						if (typeof attr_value !== "undefined" && attr_value !== null) {
							// set the default value on the form, from the model
							var value_selector = "input[type=radio][" + bindingAttr + "='" + group_name + "'][value='" + attr_value + "']";
							view.$(value_selector).attr("checked", "checked");
						} else {
							// set the model to the currently selected radio button
							var value_selector = "input[type=radio][" + bindingAttr + "='" + group_name + "']:checked";
							var value = view.$(value_selector).val();
							setModelValue(group_name, value);
						}
					}
				});
			};

			return methods;
		})(Backbone);

		// ----------------------------
		// Checkbox Bi-Directional Binding Methods
		// ----------------------------
		var CheckboxBinding = (function (Backbone) {
			var methods = {};

			methods.bind = function (selector, view, model, config) {
				var modelBinder = this;

				view.$(selector).each(function (index) {

					var element = view.$(this);

					// return if binding is not allowed for this element - binding is allowed
					// if element does not contain data-skip attribute
					if (!modelBinding.isBindAllowed(element, config)) {
						return;
					}

					var bindingAttr = config.getBindingAttr('checkbox');

					// The name of the element in the DOM (ie 'foo[]')
					var element_name = config.getBindingValue(element, 'checkbox');

					// Does this attribute refer to an array? ('foo[]' => true, 'bar' => false)
					var arrayAttr = element_name.substr(-2) === '[]';

					// The name of the attribute on the model (ie 'foo')
					var attribute_name = arrayAttr ? element_name.slice(0, -2) : element_name;

					// Update DOM
					var modelChange = function (model, val) {
						var test = false;
						if (arrayAttr && val) {
							test = val.indexOf(element.val()) > -1;
						} else {
							test = val;
						}

						if (test) {
							element.attr('checked', 'checked');
						} else {
							element.removeAttr('checked');
						}
					};

					// Update model
					var setModelValue = function (attr_name, value) {
						var data = {};
						data[attr_name] = value;
						model.set(data);
					};

					// Get new value
					var elementChange = function (ev) {
						var changedElement = view.$(ev.target || ev);
						if (arrayAttr) {
							var values = $.map(
							view.$("input:checkbox[" + bindingAttr + "=" + attribute_name + "\\[\\]]:checked"), function (elem) {
								return $(elem).val();
							});
							setModelValue(attribute_name, values);
						} else {
							var checked = changedElement.is(":checked") ? true : false;
							setModelValue(attribute_name, checked);
						}
					};

					// Bind model changes to DOM
					modelBinder.registerModelBinding(model, attribute_name, modelChange);
					// Bind DOM changes to element
					modelBinder.registerElementBinding(element, elementChange);

					var attr_exists = model.attributes.hasOwnProperty(attribute_name);
					if (attr_exists) {
						// set the default value on the form, from the model
						var attr_value = model.get(attribute_name);
						if (typeof attr_value !== "undefined" && attr_value !== null) modelChange(model, attr_value);
					} else {
						// bind the form's value to the model
						elementChange(element);
					}
				});
			};

			return methods;
		})(Backbone);

		// ----------------------------
		// Data-Bind Binding Methods
		// ----------------------------
		var DataBindBinding = (function (Backbone, _, $) {

			var dataBindSubstConfig = {
				"default": ""
			};

			modelBinding.Configuration.dataBindSubst = function (config) {
				this.storeDataBindSubstConfig();
				_.extend(dataBindSubstConfig, config);
			};

			modelBinding.Configuration.storeDataBindSubstConfig = function () {
				modelBinding.Configuration._dataBindSubstConfig = _.clone(dataBindSubstConfig);
			};

			modelBinding.Configuration.restoreDataBindSubstConfig = function () {
				if (modelBinding.Configuration._dataBindSubstConfig) {
					dataBindSubstConfig = modelBinding.Configuration._dataBindSubstConfig;
					delete modelBinding.Configuration._dataBindSubstConfig;
				}
			};

			modelBinding.Configuration.getDataBindSubst = function (elementType, value) {
				var returnValue = value;
				if (value === undefined) {
					if (dataBindSubstConfig.hasOwnProperty(elementType)) {
						returnValue = dataBindSubstConfig[elementType];
					} else {
						returnValue = dataBindSubstConfig["default"];
					}
				}
				return returnValue;
			};

			var setOnElement = function (element, attr, val) {
				val = modelBinding.Configuration.getDataBindSubst(attr, val);
				switch (attr) {
				case "html":
					element.html(val);
					break;
				case "text":
					element.text(val);
					break;
				case "enabled":
					element.attr('disabled', !val);
					break;
				case "disabled":
					element.attr('disabled', !!val);
					break;
				case "displayed":
					element.css('display', val ? 'block' : 'none');
					break;
				case "hidden":
					element.css('display', val ? 'none' : 'block');
					break;
				default:
					if (element[0].type != "checkbox" && element[0].type != "radio") {
						element.attr(attr, val);
					}
				}
			};

			var splitBindingAttr = function (element) {
				var dataBindConfigList = [];
				var dataBindAttributeName = modelBinding.Conventions.databind.selector.replace(/^(.*\[)([^\]]*)(].*)/g, '$2');
				var databindList = element.attr(dataBindAttributeName).split(";");
				_.each(databindList, function (attrbind) {
					var databind = $.trim(attrbind).split(" ");

					// make the default special case "text" if none specified
					if (databind.length == 1) databind.unshift("text");

					dataBindConfigList.push({
						elementAttr: databind[0],
						modelAttr: databind[1]
					});
				});
				return dataBindConfigList;
			};

			var getEventConfiguration = function (element, databind) {
				var config = {};
				var eventName = databind.modelAttr;
				var index = eventName.indexOf("event:");

				if (index == 0) {
					// "event:foo" binding
					config.name = eventName.substr(6);
					config.callback = function (val) {
						setOnElement(element, databind.elementAttr, val);
					};
				} else {
					// standard model attribute binding
					config.name = "change:" + eventName;
					config.callback = function (model, val) {
						setOnElement(element, databind.elementAttr, val);
					};
				}

				return config;
			};

			var methods = { };

			methods.bind = function (selector, view, model, config) {
				var modelBinder = this;

				view.$(selector).each(function (index) {

					var element = view.$(this);

					// return if binding is not allowed for this element - binding is allowed
					// if element does not contain data-skip attribute
					if (!modelBinding.isBindAllowed(element, config)) {
						return;
					}

					var databindList = splitBindingAttr(element);

					_.each(databindList, function (databind) {
						var eventConfig = getEventConfiguration(element, databind);
						modelBinder.registerDataBinding(model, eventConfig.name, eventConfig.callback);
						// set default on data-bind element
						setOnElement(element, databind.elementAttr, model.get(databind.modelAttr));
					});

				});
			};

			return methods;
		})(Backbone, _, $);


		// ----------------------------
		// Binding Conventions
		// ----------------------------
		modelBinding.Conventions = {
			text : {
				selector: "input:text",
				handler: StandardBinding
			},
			hidden : {
				selector : "input[type='hidden']",
				handler : StandardBinding
			},
			textarea : {
				selector: "textarea",
				handler: StandardBinding
			},
			password : {
				selector: "input:password",
				handler: StandardBinding
			},
			radio : {
				selector: "input:radio",
				handler: RadioGroupBinding
			},
			checkbox: {
				selector: "input:checkbox",
				handler: CheckboxBinding
			},
			select: {
				selector: "select",
				handler: SelectBoxBinding
			},
			databind: {
				selector: "*[data-bind]",
				handler: DataBindBinding
			},

			// HTML5 inputs (after http://www.w3schools.com/html5/html5_form_input_types.asp)
			date : {
				selector: "input[type=date]",
				handler: StandardBinding
			},
			datetime : {
				selector: "input[type=datetime]",
				handler: StandardBinding
			},
			datetime_local : {
				selector: "input[type=datetime-local]",
				handler: StandardBinding
			},
			email : {
				selector: "input[type=email]",
				handler: StandardBinding
			},
			month : {
				selector: "input[type=month]",
				handler: StandardBinding
			},
			number : {
				selector : "input[type=number]",
				handler : StandardBinding
			},
			range : {
				selector : "input[type=range]",
				handler : StandardBinding
			},
			search : {
				selector : "input[type=search]",
				handler : StandardBinding
			},
			tel : {
				selector : "input[type=tel]",
				handler : StandardBinding
			},
			time : {
				selector : "input[type=time]",
				handler : StandardBinding
			},
			url : {
				selector : "input[type=url]",
				handler : StandardBinding
			},
			week : {
				selector : "input[type=week]",
				handler : StandardBinding
			}
		};

		return modelBinding;
	});

	// Backbone.Modelbinding AMD wrapper with namespace fallback
	if (typeof(define) === 'function' && define.amd) {
		// AMD support
		define([
			'backbone', // use Backbone 0.5.3-optamd3 branch (https://github.com/jrburke/backbone/tree/optamd3)
			'underscore', // AMD supported
			'jquery' // AMD supported
		], function (Backbone, _, jQuery) {
			return modelbinding(Backbone, _, jQuery);
		});
	} else {
		// No AMD, use Backbone namespace
		root.Backbone = Backbone || { };
		root.Backbone.ModelBinding = modelbinding(Backbone, _, jQuery);
	}

})(this, Backbone, _, jQuery);
