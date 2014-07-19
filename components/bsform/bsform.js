/*global m:false , window:false, document:false */
var mc = mc || {};

mc.BootstrapForm = (function () {
	// provides unique identifiers
	var idCounter = 0,
		uid = function (given) {
			return given || ('BootstrapForm_id_' + idCounter++);
		},
		styleSet = false;

	// Appends or creates to the class attribute of attrs the given class
	// returns the attributes to allow for chaining
	var addClass = function (attrs, value) {
		attrs.class = ((attrs.class || '') + ' ' + (value || '')).trim();
		return attrs;
	};
	
	
	// copies all the properties from config into attrs except for those in skip
	// returns the attributes for further chaining
	// Beware!!, it modifies the initial attrs
	var mergeExcept = function (attrs, config, skip) {
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
	
	var containerAttrs = function (config, extraClass, attrs) {
		return addClass(
			addClass(attrs || {}, config.class), 
			extraClass
		);
	};
			
		

	// copies only the given attributes
	// Beware!!, it modifies the initial attrs
	var mergeSome = function (attrs, config, which) {
		which.forEach(function (name) {
			if (name in config) {
				if (name == 'class') {
					addClass(attrs, config[name]);
				} else attrs[name] = config[name];
			}
		});
		return attrs;
	};


//	var cloneConfig = function (config, defaults) {
//		var k, c = {};
//		if (defaults) {
//			for (k in defaults) {
//				c[k] = defaults[k];
//			}
//		}
//		if (config) {
//			for (k in config) {
//				c[k] = config[k];
//			}
//		}
//		return c;
//	};
	
	var setStyle = function () {
			styleSet = true;
			var style = document.createElement('style');
			style.innerHTML = ".error-block {display:none} .has-error .error-block {display:block}";
			document.head.appendChild(style);
		};



	// Collection of form controls
	var formControls = {
		fieldset: function (ctrl, config, children) {
			config = config || {};
			return m('fieldset', mergeExcept(containerAttrs(config), config, []), [
				m('legend', config.label),
				(config.help && m('span.help-block', config.help)),
				ctrl._formCtrl.processChildren(config, children)
			]);
		},
		input: function (ctrl, config) {
			config = config || {};

			// ensures there is an id to associate the label to the field
			var id = ctrl._uid || (ctrl._uid = uid(config.id));
			var container;

			// merges attributes from config, except for those listed
			var attrs = mergeExcept({
				// if type is not password or any of the new HTML5 input types, it just uses text.
				type: config.type || 'text',
				id: id
			}, config, ['id']);


			var valueChange = function (setter) {

				return function (el, isInitialized, context) {
					if (isInitialized) return;
					var timer, value = el.value, originalValue = value, newValue;

						
					el.addEventListener('focus', function (ev) {
						timer = window.setInterval(function () {
							newValue = ev.target.value;
							if (newValue != value) {
								value = newValue;
								container.className = container.className.replace('has-error','');
								ctrl.setField(newValue, config, setter);
								if (!ctrl.validateField(newValue, config)) {
									container.className = container.className.trim() + ' has-error';
									ctrl._value = newValue;
									m.render(container, contents(ctrl));
								}
							}
						}, 500);
					});
					el.addEventListener('blur', function (ev) {
						if (timer) window.clearInterval(timer);
						newValue = ev.target.value;
						if (newValue !== originalValue) {
							ctrl.setField(newValue, config, setter);
							if (ctrl.validateField(newValue, config)) {
								m.startComputation();
								m.endComputation();
							}
						}
						
					});
				};

			};
			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = ctrl.model,
				name = config.name,
				valueSrc = config.value,
				value;
			if (model && name) {
				value = model[name];
				attrs.config = valueChange(function (value) {
					model[name] = value;
				});
			} else if (valueSrc !== undefined) {
				// If the value is given and it is a property getter/setter, do a two way binding
				if (typeof valueSrc == 'function') {
					value = valueSrc();
					attrs.config = valueChange(function (value) {
						valueSrc(value);
					});
				} else {
					// If it is a simple value just show it
					attrs.value = valueSrc;
				}
			}

			if (config.formatter) value = config.formatter(value);
			if (config.validate) ctrl.validateField(value, config);
			ctrl._value = value;
			var contents = function (ctrl) {
				attrs.value = ctrl._value;
				return [
					m(
						'label.control-label',
						addClass({
							'for': id						
						}, config.layout == 'horizontal' && config.labelGridSize),
						config.label
					),
					m(
						'div',
						addClass({}, config.layout == 'horizontal' && config.inputGridSize), [
							m((config.rows ? 'textarea' : 'input') + '.form-control', attrs),
							(config.help && m('span.help-block', config.help)),
							m('div.help-block.error-block', (ctrl._errors.map(function (error) {
								return m('p', error);
							})))
						]
					)
				];
			};
			// return the assembled elements enclosed in a div.
			return m(
				'div.form-group', 
				containerAttrs(config, !ctrl.isValid() && 'has-error', {config: function (el, isInitialized, context) {
					if (isInitialized) return;
					container = el;
					m.module(el, {
						controller: function () {
							return ctrl;
						},
						view: contents
					});
				}})
			);
				
		},

		checkbox: function (ctrl, config) {
			config = config || {};
			var iAttrs = mergeExcept({
				type: 'checkbox'
			}, config, ['type', 'inline', 'checked']);
			var dClasses = '';

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || ctrl.model,
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

			if (config.layout == 'horizontal') {
				if (config.labelGridSize) dClasses += config.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2');
				if (config.inputGridSize) dClasses += ' ' + config.inputGridSize;
			}

			//if (config.inline) addClass(dAttrs,'checkbox-inline');

			return m('div.form-group', m('div.checkbox', addClass(containerAttrs(config), dClasses), [
				
				m('label.control-label', [
					m('input', iAttrs),
					' ' + config.label
				]),
				(config.help && m('span.help-block', addClass({}, dClasses),  config.help))
			]));
		},
		radio: function (ctrl, config) {
			config = config || {};
			var iAttrs = mergeExcept({
				type: 'radio'
			}, config, ['inline', 'checked', 'options', 'type']);
			var dClasses = '';


			iAttrs.name = ctrl._uid || (ctrl._uid = uid(config.name));

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || ctrl.model,
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

			if (config.layout == 'horizontal') {
				if (config.labelGridSize) dClasses += config.labelGridSize.replace(/col\-(..)\-(\d+)/g, 'col-$1-offset-$2');
				if (config.inputGridSize) dClasses += ' ' + config.inputGridSize;
			}

			return m('div.form-group',  [
				m(
					'label.control-label',
					addClass({}, config.layout == 'horizontal' && config.labelGridSize),
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
		select: function (ctrl, config) {
			config = config || {};
			var id = ctrl._uid || (ctrl._uid = uid(config.id));
			var attrs = mergeExcept({
				id: id
			}, config, ['rows', 'id', 'checked', 'options', 'type']);


			if (config.rows) attrs.size = config.rows;

			// If there is a model associated to the form and the control has a name
			// do a two way binding to it
			var model = config.model || ctrl.model,
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
					}, config.layout == 'horizontal' && config.labelGridSize),
					config.label
				),
				m(
					'div',
					addClass({}, config.layout == 'horizontal' && config.inputGridSize), [
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
		static: function (ctrl, config) {
			config = config || {};

			var model = config.model || ctrl.model,
				name = config.name;

			return m('div.form-group', containerAttrs(config), [
				m(
					'label.control-label', 
					addClass({}, config.layout == 'horizontal' && config.labelGridSize), 
					config.label
				),
				m(
					'p.form-control-static',
					mergeExcept(addClass({}, config.layout == 'horizontal' && config.inputGridSize), config, []), 
					(model && name ? model[name] : config.value)
				),
				(config.help && m('span.help-block', config.help))
			]);
		},


		button: function (ctrl, config) {
			config = config || {};
			var formConfig = ctrl.formConfig;
			var attrs = mergeExcept({}, config, ['style', 'size', 'block', 'active', 'submit','autoEnable']);
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

			if (config.autoEnable && ctrl._formCtrl) {
				attrs.config = function (el, isInitialized, context) {
					if (isInitialized) return;
					ctrl._formCtrl._buttons.push(el);
				};
				attrs.disabled = !ctrl.isValid();
			}
							
			return [
				m((config.href ? 'a' : 'button') + '.btn', attrs, config.label),
				' '
			];
		}
	};


	var bsf = function (ctrl, config) {
		var type = config.type;
		if (!formControls[type]) type = 'input';
		if (type == 'textarea') {
			type = 'input';
			if (!config.rows) config.rows = 5;
		}
		return formControls[type](ctrl, config, {});
	};
	bsf.fieldController = function (config, _formCtrl) {
		this.model = config.model;
		
		this._formCtrl = _formCtrl;
		
		// this._config = cloneConfig(config);
		this._hasChanged = false;
		this._errors = [];
		if (!styleSet) setStyle();
		this.isValid  = function () {
			return !this._errors.length;
		};
		this.getErrorMsgs = function () {
			return this._errors;
		};
		this.hasChanged = function () {
			return this._hasChanged;
		};
		this.validateField = function (value, config) {
			
			var validations = [].concat(config.validate),
				name = config.name,
				errors = [],
				f, valid = true;
			
			if (!name || !validations.length ) return;

			validations.forEach(function (validate) {
				if (validate && validate.fn) {
					var args = [].concat(value, validate.args);
					if (!validate.fn.apply(this, args)) {
						errors.push(validate.msg);
					}
				}
			});
			this._errors = errors;
			if (_formCtrl) _formCtrl.fieldValidated(this);
			return !errors.length;
			
		};
		
		this.setField = function (value, config, setter) {
			setter(config.parser ? config.parser(value) : value);
			this._hasChanged = true;
			if (_formCtrl) _formCtrl.fieldChanged(this);
		};
		
	};
		
	bsf.formController = function (config) {
		config = config || {};
		this.model =  config.model;
		this._hasChanged = false;
		this._isValid = true;
		this._fields = {};
		this._buttons = [];
		
		if (!styleSet) setStyle();
		this.isValid = function () {
			return this._isValid;
		};
		this.hasChanged = function () {
			return this._hasChanged;
		};
		this.getErrors = function () {
			var err = {}, e;
			for (var f in this._fields) {
				e = this._fields[f].errors;
				if (e) err[f] = e;
			}
			return err;
		};
		
		this.fieldValidated = function (fieldCtrl) {
			var valid = fieldCtrl.isValid();
			if (valid) {
				for (var name in this._fields) {
					valid = valid && this._fields[name].isValid();
				}
			}
			this._isValid = valid;
			this._buttons.forEach(function (el) {
				el.disabled = !(valid && this._hasChanged);
			}, this);
		};
		
		this.fieldChanged = function (fieldCtrl) {
			var hasChanged = fieldCtrl.hasChanged();
			if (!hasChanged) {
				for (var name in this._fields) {
					hasChanged = hasChanged || this._fields[name].hasChanged();
				}
			}
			this._hasChanged = hasChanged;
			this._buttons.forEach(function (el) {
				el.disabled = !(hasChanged && this._isValid);
			}, this);
		};
		
		
		this.processChildren = function (config, children) {
			var _children = [], 
				fields = this._fields;
			(children || config.children).forEach(function (content) {
				switch (typeof content) {
				case 'function':
					content = content.call(this, config, this);
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
						var name = content.name,
							fieldCtrl = fields[name];
						if (!fieldCtrl) {
							fields[name] = fieldCtrl = new bsf.fieldController({model: this.model}, this);
						}
						var childConfig = {};
						for (var k in content) {
							childConfig[k] = content[k];
						}
						mergeSome(childConfig, config, ['layout', 'labelGridSize', 'inputGridSize']);
						
						_children.push(formControls[type](fieldCtrl, childConfig));
					}
					break;
				default:
					if (content) _children.push(content);
					break;
				}
			}, this);
			return _children;
		};

		
	};
	bsf.form = function (ctrl, formConfig, children) {
		if (Array.isArray(formConfig) || typeof formConfig == 'function') {
			children = formConfig;
			formConfig = {};
		}
		var attrs = {};
		mergeExcept(attrs, formConfig, ['layout', 'labelGridSize', 'inputGridSize']);
		if (formConfig.layout) addClass(attrs, ' form-' + formConfig.layout);
		return m('form', attrs, ctrl.processChildren(formConfig, children));
	};
	bsf.fieldset = function (ctrl, label, children) {
		return formControls.fieldset(
			ctrl,
			(typeof label == 'string' ? {
				label: label
			} : label),
			children
		);
	};
	bsf.input = function (ctrl, config) {
		return formControls.input(ctrl, config, {});
	};
	bsf.checkbox = function (ctrl, config) {
		return formControls.checkbox(ctrl, config, {});
	};
	bsf.radio = function (ctrl, config) {
		return formControls.radio(ctrl, config, {});
	};
	bsf.select = function (ctrl, config) {
		return formControls.select(ctrl, config, {});
	};
	bsf.static = function (ctrl, label, value) {
		return formControls.static(ctrl, (value !== undefined ? {
			label: label,
			value: value
		} : label));
	};
	bsf.button = function (ctrl, config) {
		return formControls.button(ctrl, config, {});
	};
	return bsf;
})();