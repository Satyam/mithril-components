A form builder using Twitter Bootstrap
======================================

Simplifies building of stylish forms using Twitter's [Bootstrap CSS](http://getbootstrap.com/css/).

<a name="usage"/>
Usage
-----

	var app = {


		controller: function () {
			this.data = {
				firstName: 'John',
				lastName: 'Doe',
				active: false,
				lorenIpsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
				size: 'M'
			};
		},

		view: function (ctrl) {
			return m('div.container-fluid', m('div.row', [
				m('div.col-md-6.col-md-offset-3',
					mc.BootstrapForm.form({
						style: 'border: thin solid gray;padding:1em',
						model: ctrl.data,
						layout: 'horizontal',
						labelGridSize: 'col-sm-3',
						inputGridSize: 'col-sm-9'
					}, 
					[
						{
							type:'fieldset',
							label: 'person',
							children: [

								{
									type: 'input',
									label: 'First Name',
									name: 'firstName'
								},
								{
									type: 'input',
									label: 'Last Name',
									name: 'lastName',
									help: 'some little help'
								}
							]
						},
						{
							type: 'checkbox',
							label: 'Active',
							name: 'active',
							help: 'help for a checkbox?'
						},
						{
							type: 'input',
							label: 'Something really long',
							name: 'lorenIpsum',
							// This will actually end up being a TEXTAREA
							rows: 5
						},

						{
							type: 'radio',
							label: 'T-shirt size',
							name: 'size',
							options: [
								{label: 'Extra-small', value:'XS'},
								{label: 'Small', value:'S'},
								{label: 'Medium', value:'M'},
								{label: 'Large', value:'L'},
								{label: 'Extra-large', value:'XL'}
							]
						}
					])
				)
			]));
		}
	};

	m.module(document.body, app);

Description
-----------

The component is a collection of view functions as Mithirl would normally produce via the `m()` method.  It does not contain any controller.  It simplifies the somewhat complex structure of the HTML and classNames required to apply the styles provided by the Bootstrap CSS.

It's only dependency beyond Mithril itself is a link to the Bootstrap CSS file.  It does not use the components supported by the Bootstrap JS files.

Components
----------

The following componets are available

* form
* fieldset
* input (includes textarea)
* checkbox
* radio
* static (no input, just for display purposes)

It will accept other values for `type` (such as `password` or the new HTML5 input types) but it makes no special provisions for them, it will simply create an `<input>` box with its `type` property set to whatever was given.

All components can be created as children of a form, as in the first [example](#usage) or standalone:

	mc.BootstrapForm({
		type: 'input',
		label: 'Name',
		value: ctrl.value
	});


They can all be called through the generic `mc.BootstrapForm` function or via its specific name.  The following is equivalent to the example above:

	mc.BootstrapForm.input({
		label: 'Name',
		value: ctrl.value
	});

Sometimes the specific function is easier to use, compare these two:

	mc.BoostrapForm.fieldset('This is the legend', [ /* here goes the contents */ ]);
	
	mc.BootstrapForm({
		type: 'fieldset',
		label: 'This is the legend',
		children: [ /* here goes the contents */ ]
	});
	
<a name="config"/>
###Configuration###

All components take a configuration object as its first and often only argument.  

The configuration object always accept a `type` property.  This may be redundant if the specific function (for example, `mc.BootstrapForm.radio`) but might be useful to override the default type (for example, for inputs of type `password`).  It is, however, required if the components are created using the generic method (`mc.BootstrapForm()`) or when components are nested and only the configuration object for the children are given like in the first [example](#usage).

The developer may add configuration attributes to those listed.  After processing the arguments it knows about (and documented below), it applies whatever attributes might be left to the core DOM element of the component, for example, the `<INPUT>` element not the `<LABEL>`.   Such is the case of the `style` attribute in the form in the [top example](#usage).  Thus, the `action`or `method` attributes could be added to the form or the `disabled` to almost any control.

<a name="classname"/>
The `class` configuration attribute, if present, will always be added to the outermost element of the component, usually a `<DIV>` after those mandated by Bootstrap.  The designer needs to add the appropriate qualifier to affect the individual elements within, i.e.: the `<LABEL>` or `<INPUT>`.

<a name="binding"/>
###Binding to data###

Most components try to bind to data automatically.  This can be done in several ways.

The `value` property can be set to a simple value, like a number or a string.  In such a case, that value will be shown in the component.  Retrieval of the value of the component is then up to the developer.

If the `value` property is a function, usually a property getter/setter produced by `m.prop()`, the component will do a two-way binding to that property.   It will set the value after the `onchange` event for `input` (which includes textarea) or `onclick` on others.

If the `model` and `name` properties are set, it expects `model` to be an object.  The component will do a two-way binding to a property by the given name within that object.  The `name` attribute of the DOM element will also be set, as would be expected.

If the component is enclosed within a `form` component and that form has the `model` property set, then the contained components will inherit that property.  Such is the case in the [example at the top](#usage).  

The `model` is expected to be an object, not a property getter/setter.  

If two-way data binding is active, the `onchange` attribute on an input component or the `onclick` on the others will be ignored.

###Formatting and parsing###

All data controls may have `formatter` and `parser`.  If they exist they will be used to format the internal value to a form suitable to be shown to the user and to parse the user input prior to store it via two-way binding.   

The `formatter` function should accept a raw value and return a formatted value suitable for display, for example `formatter: function (date) { return date.toLocaleDateString();}`.

The `parser` function should accept the value as read from the input control and return the internal representation for it, for example `parser: Date.parse`.

<a name="validation"/>
###Validation###

Validation is supported via the `validate` property.   Each field that requires validation must add `validate` and `valid` properties to is configuration object.  Validate fields also need to have their `name` property set. The `validate` property can be a validation object or an array of validation objects.  By allowing an array of validations, several individual validation functions can be applied to the same field, each with its own error message. 

Each validation object has the following properties:

* `fn` {Function} The validation function, it should accept the value to be validated and return *truish* if valid.  The function will receive the raw value as read from the DOM element, without parsing.
* `msg` {String} A message to be shown below the input field if the value does not validate. If no message is included, the field will be [highlighted](http://getbootstrap.com/css/#forms-control-validation) with the `.has-error` className but no other information will be available to the user.
* `args` {Any} Extra arguments that the validator function might require besides the value to validate.  It can be a simple value or an array of values.

The validation status of an individual field or of a form can be tracked via the `valid` property which should reference a property setter/getter.  Either a global `valid` property is set for the whole form or each field that has validations has to have a `valid` property set.  The `valid` property at the form level will be true when all the validated fields pass the validation.  All unvalidated fields are assume valid.

Buttons with the `autoEnable` configuration property set will be be disabled when validation of any validated field fails or when there has been no change in any field.

###Containers###

Two containers are provided, a `form` and a `fieldset`.  Both may take two arguments, a configuration object and an array of `children`.  In both cases, the second argument can be ommited and a `children` property can be set in the configuration object.

<a name="children"/>
The `children` can be any of the following:

* An object, corresponding to the configuration object of further components.
* A call to `m()`.  It is possible to mix BootstrapForm components with regular Mithril elements, for example an `m('hr')`.
* A value such as could be accepted as children in the `m(tag, attrs, children)` method.
* A function that should return a valid children in the `m(tag, attrs, children)` method.

For whatever it might be usefull (doubtful), the function will receive the configuration object of the container and that of the outer form, if any.

####Form####

The `mc.BootstrapForm.form(config, children)` component expects the following arguments:

1. `config` {Object} (optional), configuration object, containing:
	* `model` {Object} Object that holds the data for this form.  It will be propagated to the children, as described [above](#binding).
	* `children` {Various} The contents of this form as described [above](#children). 
	* `layout` {String} Either `inline` or `horizontal` produces a form with its elements placed in [one line](http://getbootstrap.com/css/#forms-inline) or with the labels in the [same line as the fields](http://getbootstrap.com/css/#forms-horizontal).
	* `labelGridSize` {String} [Grid system spec](http://getbootstrap.com/css/#grid-example-basic) to determine the width of the label, used only and recommended for [horizontal layout](http://getbootstrap.com/css/#forms-horizontal).
	* `inputGridSize` {String} [Grid system spec](http://getbootstrap.com/css/#grid-example-basic) to determine the width of the input, used only and recommended for [horizontal layout](http://getbootstrap.com/css/#forms-horizontal).
	* `valid` {Property getter/setter}  If set and any field within the form has validation enabled, the property will return true when all the validated fields pass validation.
	* `changed` {Property getter/setter} If set, the property will be set when any field has been changed.
2. `children` {Various} The contents of this form as described [above](#children). This can be ommitted if the `children` configuration property is set.

####Fieldset####

The `mc.BootstrapForm.fieldset(label, children)` component expects the following arguments:

1. `label`{String} The text for the `<LEGEND>` element.
2. `children` {Various} The contents of this fieldset as described [above](#children). This can be ommitted if the `children` configuration property is set.

Alternatively, it can be called using `mc.BootstrapForm.fieldset(config, children)` where:

1. `config` {Object} configuration object containing:
	* `label` {String} the text for the `<LEGEND>` element
	* `children` {Various} The contents of this fieldset as described [above](#children).
2. `children` {Various} The contents of this fieldset as described [above](#children). This can be ommitted if the `children` configuration property is set.

###Simple Controls###

####Input####

The `mc.BootstrapForm.input(config)` creates a regular `<INPUT>` element.  If the `rows` property is set, it will create a `TEXTAREA` instead. It expects the following  argument:

1. `config` {Object} Configuration object containing:
	* `id` {String} If an id for the element is not provided, one will be generated so as to associate the `<LABEL>` element with the input control via the `for` attribute.
	* `type` {String} type of input control to be used.  It defaults to `text`.  Any of the ones listed [here](http://getbootstrap.com/css/#forms-controls) can be used (except for `password` the rest depend on HTML5 support on the browser).  It will be ignored if the `rows` property is set (see below).
	* `label` {String} The contents of the `<LABEL>` element associated to this control.
	* `value`, `model` and/or `name` as described [above](#binding)
	* `help` {String} Help text to be shown below the input control ([see](http://getbootstrap.com/css/#forms-help-text))
	* `rows` {Integer} If present a `<TEXTAREA>` of the given height will be used instead of a plain `<INPUT>`. The `type` property will be ignored.
	
The `disable`, `placeholder` and `readonly` attributes, mentioned in the [Bootstrap documentation](http://getbootstrap.com/css/#forms-control-disabled) are simply passed through and will produce the expected behavior.
	
####Checkbox####

The `mc.BootstrapForm.checkbox(config)` creates a checkbox.  It expects the following  argument:

1. `config` {Object} Configuration object containing:
	* `label` {String} The contents of the `LABEL` element associated to this control.
	* `value`, `model` and/or `name` as described [above](#binding)
	* `help` {String} Help text to be shown below the input control ([see](http://getbootstrap.com/css/#forms-help-text))
	* `inline` **TODO** {Boolean} Distributes the checkboxes horizontally in a single line.
	
####Radio####

The `mc.BootstrapForm.radio(config)` creates a set of radio buttons.  It expects the following  argument:

1. `config` {Object} Configuration object containing:
	* `label` {String} The contents of the `LABEL` element common for the set of radio buttons.
	* `value`, `model` and/or `name` as described [above](#binding)
	* `name` {String} Besides the usage described in the previous item, if a name for the collection is not provided, one will be generated so as to make the radio buttons exclusive of one another.
	* `help`  {String} Help text to be shown below the input control ([see](http://getbootstrap.com/css/#forms-help-text))
	* `inline` **TODO** {Boolean} Distributes the checkboxes horizontally in a single line.
	* `options` {Array}, one entry per radio button, in the order expected to be shown. It may be a list of values or objects or a mix of the two.  If it is a simple value, it is assumed that the label and the value match, otherwise, they can be specified separately by using an object which should contain:
		* `label` {String} Text to be shown along the radio button.
		* `value` {String} Value that this radio button represents.  If the value obtained from the source of data (as described [above](#binding)) matches this `value`, the radio button will be active.  When the button corresponding to this option is clicked, this is the value that will be saved. 
		

####Select####

The `mc.BootstrapForm.select(config)` creates a dropdown select element.  It expects the following  argument:

1. `config` {Object} Configuration object containing:
	* `label` {String} The contents of the `LABEL` element associated to this control.
	* `value`, `model` and/or `name` as described [above](#binding)
	* `name` {String} Besides the usage described in the previous item, if a name for the collection is not provided, one will be generated so as to make the radio buttons exclusive of one another.
	* `help`  {String} Help text to be shown below the input control ([see](http://getbootstrap.com/css/#forms-help-text))
	* `multiple` {Boolean} Allows for multiple item selection. If the `multi` selection is set, the result will be an array of the values of the items selected.
	* `rows` {Integer} If present and greater than 1, a scrollable list, instead of a dropdown, will be produced.
	* `options` {Array}, one entry per radio button, in the order expected to be shown. It may be a list of values or objects or a mix of the two.  If it is a simple value, it is assumed that the label and the value match, otherwise, they can be specified separately by using an object which should contain:
		* `label` {String} Text to be shown along the radio button.
		* `value` {String} Value that this radio button represents.  If the value obtained from the source of data (as described [above](#binding)) matches this `value`, the radio button will be active.  When the button corresponding to this option is clicked, this is the value that will be saved. 

####Static####

The `mc.BootstrapForm.static(label, value)` component simply shows a fixed text instead of an actual input control  [see](http://getbootstrap.com/css/#forms-controls-static). It expects the following arguments:

1. `label` {String} The contents of the `<LABEL>` element associated to this group of radio buttons.
2. `value` {String} The value to be shown. 
	
Alternatively, it can be called as `mc.BootstrapForm.static(config)` where the argument is

1. `config` {Object} Configuration object containing:
	* `label` {String} The contents of the `LABEL` element associated to this control.
	* `value`, `model` and/or `name` as described [above](#binding)
	* `help` {String} Help text to be shown below the input control ([see](http://getbootstrap.com/css/#forms-help-text))

####Button####

The `mc.BootstrapForm.button(config)` component provides an assortment of buttons.

1. `config` {Object} Configuration object containing the following properties:
	* `label` {String} Label to be shown in the button.
	* `style` {String} Any of `default`, `primary`, `success`, `info`, `warning`, `danger` or `link`.  Defauts to (obviously) `default` [see](http://getbootstrap.com/css/#buttons-options)
	* `size` {String} Any of `lg`, `sm` or `xs` [see](http://getbootstrap.com/css/#buttons-sizes)
	* `block` {Boolean} Makes the button take the full available width [see](http://getbootstrap.com/css/#buttons-sizes)
	* `active` {Boolean} Makes the button look pressed down [see](http://getbootstrap.com/css/#buttons-active)
	* `submit` {Boolean} The button will be of type `submit`
	* `href` {String} The button will actually be created as an anchor `<A>` element with its `href` attribute set to this value.
	
As with any other unknown attribute, properties not listed above will be passed untouched.  Of particular interest to a button are the `onclick` and `disabled` properties as well as the special `config` Mithril pseudo-property, often set to `m.route` for routing purposes.


####Validation####

**todo**