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




	// Collection of form controls
	var formControls = {
		input: function (ctrl, config, formConfig) {
			config = config || {};
			
			// ensures there is an id to associate the label to the field
			var id = uid(config.id);
			
			// merges attributes from config, except for those listed
			var	attrs = mergeAttrs({
				// if type is not password or any of the new HTML5 input types, it just uses text.
				type: config.type || 'text',
				id: id
			}, config, ['id', 'value', 'label', 'help']);
			
			
			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = formConfig.model,
				name = config.name;
			if (model && name) {
				attrs.value = model[name];
				attrs.onchange = function (e) {
					var target = e.target;
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

			// Assemble the elements
			var els = [	m((config.rows ? 'textarea' : 'input') + '.form-control', attrs)	];

			// Add a help block if configured
			if (config.help) els.push(m('span.help-block', config.help));

			// return the assembled elements enclosed in a div.
			return m('div.form-group', [
				m(
					'label.control-label',
					addClass({'for': id}, formConfig.layout == 'horizontal' && formConfig.labelGridSize),
					config.label
				),
				m(
					'div',
					addClass({}, formConfig.layout == 'horizontal' && formConfig.inputGridSize),
					els
				)
			]);
		},
		
		checkbox: function (ctrl, config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrs({
					type: 'checkbox'
				}, config, ['type', 'class', 'inline', 'value', 'checked', 'label']);
			var dAttrs = mergeAttrs({}, config, ['value', 'inline', 'checked', 'label','name','type']);

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = formConfig.model,
				name = config.name;
			if (model && name) {
				if (model[name]) iAttrs.checked = 'checked';
				iAttrs.onclick = function (e) {
					model[name] = e.target.checked;
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					if (ctrl[config.value]()) iAttrs.checked = 'checked';
					iAttrs.onclick = m.withAttr('checked', ctrl[config.value]);
				} else {
					// Else, just set the value
					if (config.value) iAttrs.checked = 'checked';
				}
			}
			
			if (formConfig.layout == 'horizontal') {
				if (formConfig.labelGridSize) addClass(dAttrs, formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g,'col-$1-offset-$2'));
				if (formConfig.inputGridSize) addClass(dAttrs, formConfig.inputGridSize);		
			}
			
			//if (config.inline) addClass(dAttrs,'checkbox-inline');
			
			return m('div.form-group', dAttrs, [
				m('label.control-label',  [
					m('input', iAttrs),
					config.label
				]),
				(config.help ?m('span.help-block', config.help):'')
			]);
		},
		radio: function (ctrl, config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrs({
					type: 'radio'
				}, config, ['class', 'inline', 'value', 'checked', 'label', 'options']),
				dAttrs = mergeAttrs({}, config, ['type', 'value', 'inline', 'checked', 'label', 'options', 'name']);


			iAttrs.name = uid(iAttrs.name);

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = formConfig.model,
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
				if (formConfig.labelGridSize) addClass(dAttrs, formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g,'col-$1-offset-$2'));
				if (formConfig.inputGridSize) addClass(dAttrs, formConfig.inputGridSize);		
			}
			
			return m('div.form-group', [
				config.options.map(function (opt) {
					if (value == opt.value) iAttrs.checked = 'checked';
					else delete iAttrs.checked;
					iAttrs.value = opt.value;
					return m('div.radio', dAttrs,
						m(
							'label.control-label', (config.inline ? {
								class: 'radio-inline'
							} : {}), [
								m('input', iAttrs),
								opt.label
							]
						)
					);
				}),
				(config.help ?m('span.help-block', config.help):'')
			]);
		},

		static: function (ctrl, config, formConfig) {
			config = config || {};
			var attrs = (config.class ? {
				class: config.class
			} : {});

			var model = formConfig.model,
				name = config.name;

			return m('div.form-group', attrs, [
				m('label.control-label', config.label),
				m('p.form-control-static', (model && name ? model[name] : config.value))
			]);
		},
		
		fieldset: function (ctrl, config, formConfig, contents) {
			config = config || {};
			return m('fieldset.form-group',[
				m('legend',config.label),
				processContents(ctrl, formConfig, config.contents),
				(config.help ?m('span.help-block', config.help):'')
			]);
		}
	};

	var processContents = function (ctrl, formConfig, contents) {
		var children = [];
		contents.forEach(function (content) {
			switch (typeof content) {
			case 'function':
				content = content(ctrl, formConfig);
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
					children.push(formControls[type](ctrl, content, formConfig || {}));
				}
				break;
			default:
				if (content) children.push(content);
				break;
			}
		});
		return children;
	};
	return {
		form: function (ctrl, formConfig, contents) {
			if (Array.isArray(formConfig) || typeof formConfig == 'function') {
				contents = formConfig;
				formConfig = {};
			}
			var attrs = {};
			mergeAttrs(attrs, formConfig, ['layout', 'model', 'labelGridSize', 'inputGridSize']);
			if (formConfig.layout) addClass(attrs, ' form-' + formConfig.layout);

			return m('form', attrs, processContents(ctrl, formConfig, contents));
		},
		input: function (ctrl, config) {
			return formControls.input(ctrl, config, {});
		},
		checkbox: function (ctrl, config) {
			return formControls.checkbox(ctrl, config, {});
		},
		static: function (config) {
			var formConfig = {};
			if (config.model) {
				formConfig.model = config.model;
				delete config.model;
			}
			return formControls.static(undefined, config, formConfig);
		},
		fieldset: function (label, contents) {
			return formControls.fieldset(
				undefined, 
				(
					typeof label == 'object' ? 
					label : 
					{
						label:label,
						contents: contents
					}, 
					{}
				)
			);
		}
	};
})();