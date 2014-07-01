/*global m:false */
var mc = mc || {};

mc.BootstrapForm = (function () {
	// provides unique identifiers
	var idCounter = 0,
		uid = function (given) {
			return given || ('BootstrapForm_id_' + idCounter++);
		};

	// Appends or creates to the class attribute of attrs the given class
	// returns the attributes to allow for chaining
	var addClass = function (attrs, value) {
		if (value) {
			if (attrs.class) attrs.class += ' ' + value;
			else attrs.class = value;
		}
		return attrs;
	};
	// copies all the properties from config into attrs except for those in skip
	// returns the attributes for further chaining
	// Beware!!, it modifies the initial attrs
	var mergeAttrs = function (attrs, config, skip) {
		for (var name in config) {
			if ((name == 'class' || name == 'className') && skip.indexOf('class') == -1) {
				addClass(attrs, config[name]);
			}
			if (skip.indexOf(name) == -1) attrs[name] = config[name];
		}
		return attrs;
	};

	var addHelp = function (children, help) {
		if (help) {
			var h = m('span.help-block', help);
			if (children) {
				if (children.push) {
					children.push(h);
				} else {
					children = [children, h];
				}
			} else children = h;
		}
		return children;
	};


	// Collection of form controls
	var formControls = {
		input: function (config, formConfig) {
			config = config || {};

			// ensures there is an id to associate the label to the field
			var id = uid(config.id);

			// merges attributes from config, except for those listed
			var attrs = mergeAttrs({
				// if type is not password or any of the new HTML5 input types, it just uses text.
				type: config.type || 'text',
				id: id
			}, config, ['id', 'value', 'label', 'help', 'model']);


			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name;
			if (model && name) {
				attrs.value = model[name];
				attrs.onchange = function (e) {
					model[name] = e.target.value;
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					attrs.value = config.value();
					attrs.onchange = m.withAttr('value', config.value);
				} else {
					// If it is a simple value just show it
					attrs.value = config.value;
				}
			}

			// return the assembled elements enclosed in a div.
			return m('div.form-group', [
				m(
					'label.control-label',
					addClass({
						'for': id
					}, formConfig.layout == 'horizontal' && formConfig.labelGridSize),
					config.label
				),
				m(
					'div',
					addClass({}, formConfig.layout == 'horizontal' && formConfig.inputGridSize),
					addHelp(m((config.rows ? 'textarea' : 'input') + '.form-control', attrs), config.help)
				)
			]);
		},

		checkbox: function (config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrs({
				type: 'checkbox'
			}, config, ['type', 'class', 'inline', 'value', 'checked', 'label', 'model']);
			var dAttrs = mergeAttrs({}, config, ['value', 'inline', 'checked', 'label', 'name', 'type', 'model']);

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name;
			if (model && name) {
				if (model[name]) iAttrs.checked = 'checked';
				iAttrs.onclick = function (e) {
					model[name] = e.target.checked;
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					if (config.value()) iAttrs.checked = 'checked';
					iAttrs.onclick = m.withAttr('checked', config.value);
				} else {
					// Else, just set the value
					if (config.value) iAttrs.checked = 'checked';
				}
			}

			if (formConfig.layout == 'horizontal') {
				if (formConfig.labelGridSize) addClass(dAttrs, formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2'));
				if (formConfig.inputGridSize) addClass(dAttrs, formConfig.inputGridSize);
			}

			//if (config.inline) addClass(dAttrs,'checkbox-inline');

			return m('div.form-group', dAttrs, addHelp(
				m('label.control-label', [
					m('input', iAttrs),
					config.label
				]),
				config.help
			));
		},
		radio: function (config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrs({
				type: 'radio'
			}, config, ['class', 'inline', 'value', 'checked', 'label', 'options', 'model']),
				dAttrs = mergeAttrs({}, config, ['type', 'value', 'inline', 'checked', 'label', 'options', 'name', 'model']);


			iAttrs.name = uid(iAttrs.name);

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name,
				value;
			if (model && name) {
				value = model[name];
				iAttrs.onclick = function (e) {
					var target = e.target;
					model[name] = target.checked && target.value;
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					value = config.value();
					iAttrs.onclick = function (e) {
						var target = e.target;
						config.value(target.checked && target.value);
					};
				} else {
					// Else, just set the value
					value = config.value;
				}
			}


			if (config.inline) dAttrs.class += ' checkbox-inline';

			if (formConfig.layout == 'horizontal') {
				if (formConfig.labelGridSize) addClass(dAttrs, formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2'));
				if (formConfig.inputGridSize) addClass(dAttrs, formConfig.inputGridSize);
			}

			return m('div.form-group', addHelp(
				config.options.map(function (opt) {
					if (value == opt.value || opt) iAttrs.checked = 'checked';
					else delete iAttrs.checked;
					iAttrs.value = opt.value ||opt;
					return m('div.radio', dAttrs,
						m(
							'label.control-label', (config.inline ? {
								class: 'radio-inline'
							} : {}), [
								m('input', iAttrs),
								opt.label || opt
							]
						)
					);
				}),
				config.help
			));
		},

		static: function (config, formConfig) {
			config = config || {};
			var attrs = (config.class ? {
				class: config.class
			} : {});

			var model = config.model || formConfig.model,
				name = config.name;

			return m('div.form-group', attrs, addHelp([
				m('label.control-label', config.label),
				m('p.form-control-static', (model && name ? model[name] : config.value))
			]));
		},

		fieldset: function (config, formConfig, contents) {
			config = config || {};
			return m('fieldset.form-group', [
				m('legend', config.label),
				processContents(config, formConfig, contents),
				addHelp(null, config.help)
			]);
		}
	};

	var processContents = function (config, formConfig, contents) {
		var children = [];
		(contents || config.contents).forEach(function (content) {
			switch (typeof content) {
			case 'function':
				content = content(config, formConfig);
				if (content) children.push(content);
				break;
			case 'object':
				if (content.tag && content.attrs) {
					// Then it is the result of a call to m()
					children.push(content);
				} else {
					var type = content.type;
					if (!formControls[type]) type = 'input';
					if (type == 'textarea') {
						type = 'input';
						if (!content.rows) contents.rows = 5;
					}
					children.push(formControls[type](content, formConfig || {}));
				}
				break;
			default:
				if (content) children.push(content);
				break;
			}
		});
		return children;
	};

	var bsf = function (config) {
		var type = config.type;
		if (!formControls[type]) type = 'input';
		if (type == 'textarea') {
			type = 'input';
			if (!config.rows) config.rows = 5;
		}
		return formControls[type](config, {});
	};

	bsf.form = function (formConfig, contents) {
		if (Array.isArray(formConfig) || typeof formConfig == 'function') {
			contents = formConfig;
			formConfig = {};
		}
		var attrs = {};
		mergeAttrs(attrs, formConfig, ['layout', 'model', 'labelGridSize', 'inputGridSize', 'contents']);
		if (formConfig.layout) addClass(attrs, ' form-' + formConfig.layout);

		return m('form', attrs, processContents(formConfig, formConfig, contents));
	};
	bsf.input = function (config) {
		return formControls.input(config, {});
	};
	bsf.checkbox = function (config) {
		return formControls.checkbox(config, {});
	};
	bsf.static = function (label, value) {
		return formControls.static(arguments.length==2 ? {label: label, value: value}: label);
	};
	bsf.fieldset = function (label, contents) {
		return formControls.fieldset(
			(typeof label == 'string' ? {label: label}: label),
			{},
			contents
		);
	};
	return bsf;
})();