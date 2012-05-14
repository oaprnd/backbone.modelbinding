### Documentation, license, packages, etc, everything can be found here:

#### [http://oaprnd.github.com/backbone.modelbinding](http://oaprnd.github.com/backbone.modelbinding/)

---

### Build Status

[![Build Status](https://secure.travis-ci.org/oaprnd/backbone.modelbinding.png?branch=master)](http://travis-ci.org/oaprnd/backbone.modelbinding)

### About Backbone.ModelBinding

Convention-based, awesome model binding for [Backbone.js](http://documentcloud.github.com/backbone),
inspired by [Brad Phelan](http://xtargets.com/2011/06/11/binding-model-attributes-to-form-elements-with-backbone-js/),
[Knockout.js](http://knockoutjs.com/) data-binding capabilities, 
and [Brandon Satrom](http://userinexperience.com/?p=633)'s work with Knockout.

This plugin provides a simple, convention based mechanism to create bi-directional
binding between your Backbone models and your HTML elements, including form inputs, 
divs, spans, and so on. Instead of writing the same boiler plate code to read from 
your form inputs and populate the model attributes, for every input on your form, 
you can make a single call to `Backbone.ModelBinding.bind(myView)` and have all of 
your inputs automatically wired up. Any change you make to a form input will 
populate a corresponding model attribute for you. The binding is bi-directional, 
as well. This means that changes to your underlying model will be propagated to 
your form inputs without having to manually bind to your model's `change` events.

If you're looking for Knockout.js-style `data-bind` attributes, for Backbone,
then this is the plugin for you. Backbone.ModelBinding provides some very basic
support for `data-bind` attributes, allowing your Backbone model `change` events
to modify nearly any HTML element on your page. Whether it's updating the text
of a `<div>`, or changing the css class of an `<img>` tag, the `data-bind` 
support provides a very powerful and flexible means of creating a very rich
user experience.

The [upstream project](https://github.com/derickbailey/backbone.modelbinding) by
[Derick Bailey](https://github.com/derickbailey) was abandoned on 4/22/12. This 
project is a continuation
