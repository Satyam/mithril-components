/*global m:false , window:false */
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
	var mergeAttrsExcept = function (attrs, config, skip) {
		skip = skip.concat(['label', 'children', 'value', 'help', 'model', 'class', 'validate', 'formatter', 'parser']);
		for (var name in config) {
			if (skip.indexOf(name) == -1) {
				if (name == 'class') {
					addClass(attrs, config[name]);
				} else attrs[name] = config[name];
			}
		}
		return attrs;
	};
	
	var containerAttrs = function (config, extra) {
		return addClass(
			addClass({}, config.class), 
			extra
		);
	};
			
		

	// copies only the given attributes
	// Beware!!, it modifies the initial attrs
	var mergeSomeAttrs = function (attrs, config, which) {
		for (var name in which) {
			if (name == 'class') {
				addClass(attrs, config[name]);
			} else attrs[name] = config[name];
		}
		return attrs;
	};


	var readAndValidate = function (value, config, formConfig, setter) {
		var validate = config.validate,
			localValid = validate && validate.valid,
			formValid = formConfig && formConfig.valid;

		var setformValid = function (valid) {
			if (!formValid) return;
			var values = formValid.values;
			values[config.name] = !valid && value;
			valid = true;
			for (var field in values) {
				valid = valid && !values[field];
			}
			formValid(valid);
		};

		if (validate && validate.fn && (localValid || formValid)) {
			var args = [].concat(value, validate.args);
			if (!validate.fn.apply(this, args)) {
				if (localValid) {
					localValid(false);
					localValid.value = value;
				}
				setformValid(false);
				return false;
			}
		}
		setformValid(true);
		if (setter) setter(config.parser ? config.parser(value) : value);
		if (typeof formConfig.changed == 'function') formConfig.changed(true);
		return true;
	};

	var invalidValue = function (config, formConfig) {
		var localValid = config.validate && config.validate.valid,
			formValid = formConfig && formConfig.valid,
			valid = true;
		if (localValid) {
			valid = localValid();
		} else if (formValid) {
			valid = !formValid.values[config.name];
		}
		if (valid) return void 0;
		return ((localValid && localValid.value) || formValid.values[config.name]);
	};




	// Collection of form controls
	var formControls = {
		fieldset: function (config, formConfig, children) {
			config = config || {};
			return m('fieldset', mergeAttrsExcept(containerAttrs(config), config, []), [
				m('legend', config.label),
				(config.help && m('span.help-block', config.help)),
				processChildren(config, formConfig, children)
			]);
		},
		input: function (config, formConfig) {
			config = config || {};

			// ensures there is an id to associate the label to the field
			var id = uid(config.id);

			// merges attributes from config, except for those listed
			var attrs = mergeAttrsExcept({
				// if type is not password or any of the new HTML5 input types, it just uses text.
				type: config.type || 'text',
				id: id
			}, config, ['id']);


			var valueChange = function (setter) {

				return function (el, isInitialized, context) {
					if (isInitialized) return;
					var timer, value = el.value;
					var hasChanged = function (ev) {
						var newValue = ev.target.value;
						if (newValue != value) {
							//m.startComputation();
							readAndValidate(newValue, config, formConfig, setter);
							//m.endComputation();

							value = newValue;
						}
					};
						
					el.addEventListener('focus', function (ev) {
						timer = window.setInterval(function () {
							hasChanged (ev);
						}, 500);
					});
					el.addEventListener('blur', function (ev) {
						hasChanged(ev);
						//m.startComputation();
						if (timer) window.clearInterval(timer);
						//m.endComputation();
					});
				};

			};
			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name,
				value;
			if (model && name) {
				value = model[name];
//				attrs.onchange = function (ev) {
//					readAndValidate(ev.target.value, config, formConfig, function (value) {
//						model[name] = value;
//					});
//				};
				attrs.config = valueChange(function (value) {
					model[name] = value;
				});
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					value = config.value();
					attrs.config = valueChange(function (value) {
						config.value(value);
					});
//					attrs.onchange = function (ev) {
//						readAndValidate(ev.target.value, config, formConfig, function (value) {
//							config.value(value);
//						});
//					};
				} else {
					// If it is a simple value just show it
					attrs.value = config.value;
				}
			}

			var invalid = invalidValue(config, formConfig);
			attrs.value = (invalid !== undefined ? invalid : (config.formatter ? config.formatter(value) : value));

			// return the assembled elements enclosed in a div.
			return m('div.form-group', containerAttrs(config, invalid && 'has-error'), [
				m(
					'label.control-label',
					addClass({
						'for': id,
					}, formConfig.layout == 'horizontal' && formConfig.labelGridSize),
					config.label
				),
				m(
					'div',
					addClass({}, formConfig.layout == 'horizontal' && formConfig.inputGridSize), [
						m((config.rows ? 'textarea' : 'input') + '.form-control', attrs),
						(config.help && m('span.help-block', config.help)),
						(invalid && m('span.help-block', config.validate.msg))
					]
				)
			]);
		},

		checkbox: function (config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrsExcept({
				type: 'checkbox'
			}, config, ['type', 'inline', 'checked']);
			var dClasses = '';

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name;
			if (model && name) {
				if (model[name]) iAttrs.checked = 'checked';
				iAttrs.onclick = function (ev) {
					model[name] = ev.target.checked;
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
				if (formConfig.labelGridSize) dClasses += formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2');
				if (formConfig.inputGridSize) dClasses += ' ' + formConfig.inputGridSize;
			}

			//if (config.inline) addClass(dAttrs,'checkbox-inline');

			return m('div.form-group', containerAttrs(config, dClasses), [
				m('label.control-label', [
					m('input', iAttrs),
					' ' + config.label
				]),
				(config.help && m('span.help-block',  config.help))
			]);
		},
		radio: function (config, formConfig) {
			config = config || {};
			var iAttrs = mergeAttrsExcept({
				type: 'radio'
			}, config, ['inline', 'checked', 'options', 'type']);
			var dClasses = '';


			iAttrs.name = uid(iAttrs.name);

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name,
				value;
			if (model && name) {
				value = model[name];
				iAttrs.onclick = function (ev) {
					var target = ev.target;
					model[name] = target.checked && target.value;
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					value = config.value();
					iAttrs.onclick = function (ev) {
						var target = ev.target;
						config.value(target.checked && target.value);
					};
				} else {
					// Else, just set the value
					value = config.value;
				}
			}


			//if (config.inline) dAttrs.class += ' radio-inline';

			if (formConfig.layout == 'horizontal') {
				if (formConfig.labelGridSize) dClasses += formConfig.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2');
				if (formConfig.inputGridSize) dClasses += ' ' + formConfig.inputGridSize;
			}

			return m('div.form-group',  [
				m(
					'label.control-label',
					addClass({}, formConfig.layout == 'horizontal' && formConfig.labelGridSize),
					config.label
				),
				config.options.map(function (opt) {
					var val = (typeof opt == 'object' ? opt.value : opt);
					if (value == val) iAttrs.checked = 'checked';
					else delete iAttrs.checked;
					iAttrs.value = val;
					return m('div.radio', containerAttrs(config, dClasses),
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
				(config.help && m('span.help-block', config.help))
			]);
		},
		select: function (config, formConfig) {
			config = config || {};
			var id = uid(config.id);
			var attrs = mergeAttrsExcept({
				id: id
			}, config, ['rows', 'id', 'checked', 'options', 'type']);


			if (config.rows) attrs.size = config.rows;

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || formConfig.model,
				name = config.name,
				value;
			var readVal = function (ev) {
				var target = ev.target,
					sel = target.parentNode;
				if (sel.multiple) {
					var values = [],
						opts = sel.options;
					for (var i = 0; i < opts.length; i++) {
						if (opts[i].selected) values.push(opts[i].value);
					}
					return values;
				}
				return target.value;
			};

			if (model && name) {
				value = model[name];
				attrs.onclick = function (ev) {
					model[name] = readVal(ev);
				};
			} else if (config.value) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof config.value == 'function') {
					value = config.value();
					attrs.onclick = function (ev) {
						config.value(readVal(ev));
					};
				} else {
					// Else, just set the value
					value = config.value;
				}
			}


			// return the assembled elements enclosed in a div.
			return m('div.form-group', containerAttrs(config), [
				m(
					'label.control-label',
					addClass({
						'for': id
					}, formConfig.layout == 'horizontal' && formConfig.labelGridSize),
					config.label
				),
				m(
					'div',
					addClass({}, formConfig.layout == 'horizontal' && formConfig.inputGridSize), [
						m(
							'select.form-control',
							attrs,
							config.options.map(function (opt) {
								var val = (typeof opt == 'object' ? opt.value : opt),
									sel = (typeof value == 'object' ? value.indexOf(val) !== -1 : value == val);

								return m('option', {
									selected: sel,
									value: val
								}, opt.label || opt);
							})
						),
						(config.help && m('span.help-block', config.help))
					]
				)
			]);
		},
		static: function (config, formConfig) {
			config = config || {};

			var model = config.model || formConfig.model,
				name = config.name;

			return m('div.form-group', containerAttrs(config), [
				m('label.control-label', config.label),
				m(
					'p.form-control-static',
					mergeAttrsExcept({}, config, []), (model && name ? model[name] : config.value)
				),
				(config.help && m('span.help-block', config.help))
			]);
		},


		button: function (config, formConfig) {
			config = config || {};
			var attrs = mergeAttrsExcept({}, config, ['style', 'size', 'block', 'active', 'submit']);
			addClass(attrs, 'btn-' + (config.style || 'default'));
			if (config.size) addClass(attrs, 'btn-' + config.size);
			if (config.block) addClass(attrs, 'btn-block');
			if (config.active) addClass(attrs, 'active');
			if (config.submit) {
				attrs.type = 'submit';
				if (!('disabled' in attrs)) {
					attrs.disabled = (typeof formConfig.changed == 'function' && !formConfig.changed()) ||
						(typeof formConfig.valid == 'function' && !formConfig.valid());
				}
			}

			return [
				m((config.href ? 'a' : 'button') + '.btn', attrs, config.label),
				' '
				];
		}
	};

	var processChildren = function (config, formConfig, children) {
		var _children = [];
		(children || config.children).forEach(function (content) {
			switch (typeof content) {
			case 'function':
				content = content(config, formConfig);
				if (content) _children.push(content);
				break;
			case 'object':
				if (content.tag && content.attrs) {
					// Then it is the result of a call to m()
					_children.push(content);
				} else {
					var type = content.type;
					if (!formControls[type]) type = 'input';
					if (type == 'textarea') {
						type = 'input';
						if (!content.rows) children.rows = 5;
					}
					_children.push(formControls[type](content, formConfig || {}));
				}
				break;
			default:
				if (content) _children.push(content);
				break;
			}
		});
		return _children;
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

	bsf.form = function (formConfig, children) {
		if (Array.isArray(formConfig) || typeof formConfig == 'function') {
			children = formConfig;
			formConfig = {};
		}
		var attrs = {};
		mergeAttrsExcept(attrs, formConfig, ['layout', 'labelGridSize', 'inputGridSize', 'changed', 'valid']);
		if (formConfig.layout) addClass(attrs, ' form-' + formConfig.layout);
		if (formConfig.valid && !formConfig.valid.values) {
			formConfig.valid.values = {};
		}
		return m('form', attrs, processChildren(formConfig, formConfig, children));
	};
	bsf.fieldset = function (label, children) {
		return formControls.fieldset(
			(typeof label == 'string' ? {
				label: label
			} : label), {},
			children
		);
	};
	bsf.input = function (config) {
		return formControls.input(config, {});
	};
	bsf.checkbox = function (config) {
		return formControls.checkbox(config, {});
	};
	bsf.radio = function (config) {
		return formControls.radio(config, {});
	};
	bsf.select = function (config) {
		return formControls.select(config, {});
	};
	bsf.static = function (label, value) {
		return formControls.static(arguments.length == 2 ? {
			label: label,
			value: value
		} : label);
	};
	bsf.button = function (config) {
		return formControls.button(config, {});
	};
	return bsf;
})();