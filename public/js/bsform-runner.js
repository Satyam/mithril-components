/* jshint browser:true */
/* global m:false,mc:false, alert:false */

var app = {


	controller: function () {
		this.data = {
			firstName: 'John',
			lastName: 'Doe',
			active: false,
			lorenIpsum: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			size: 'M',
			sport: ['Rugby', 'Soccer']
		};
		
		this.valid = m.prop('?');
	},

	view: function (ctrl) {
		return m('div.container-fluid', m('div.row', [
			m('div.col-md-5',
				mc.BootstrapForm.form({
					style: 'border: thin solid gray;padding:1em',
					model: ctrl.data,
					layout: 'horizontal',
					labelGridSize: 'col-sm-3',
					inputGridSize: 'col-sm-9',
					valid: ctrl.valid
				}, [
					{
						type:'static',
						label: 'valid',
						value: ctrl.valid()
					},
					{
						type: 'fieldset',
						label: 'Person',
						children: [

							{
								type: 'input',
								label: 'First Name',
								name: 'firstName',
								validate: {
									fn: function (value, min, max) {
										var l = value.length;
										return l >= min && l<=max;
									},
									args: [6,8],
									msg: 'should be at 6 and less than 9'
								}
							},
							{
								type: 'input',
								label: 'Last Name',
								name: 'lastName',
								help: 'some little help',
								validate: {
									fn: function (value, min, max) {
										var l = value.length;
										return l >= min && l<=max;
									},
									args: [4,10],
									msg: 'should be at 4 and less than 10'
								}
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
						rows: 5
					},

					{
						type: 'radio',
						name: 'size',
						label: 'T-shirt size',
						options: [
							'Other',
							{
								label: 'Extra-small',
								value: 'XS'
							},
							{
								label: 'Small',
								value: 'S'
							},
							{
								label: 'Medium',
								value: 'M'
							},
							{
								label: 'Large',
								value: 'L'
							},
							{
								label: 'Extra-large',
								value: 'XL'
							}
						]
			
					},

					{
						type: 'select',
						label: 'Prefers',
						name: 'sport',
						multiple: true,
						// rows: 20,
						options: [
							{
								label: '--none--',
								value: ''
							},
							'Soccer',
							'Baseball',
							'Rugby',
							'Basketball',
							'Polo'

						]
					}
				])
			),
			m('div.col-md-2'),
			m('div.col-md-5', [
				mc.BootstrapForm({
					type: 'static',
					model: ctrl.data,
					label: 'First Name',
					name: 'firstName'

				}),
				mc.BootstrapForm.static({
					model: ctrl.data,
					label: 'Last Name',
					name: 'lastName'
				}),
				mc.BootstrapForm.static({
					model: ctrl.data,
					label: 'Active',
					name: 'active'
				}),
				mc.BootstrapForm.static({
					model: ctrl.data,
					label: 'Something really long',
					name: 'lorenIpsum'
				}),
				mc.BootstrapForm.static({
					model: ctrl.data,
					label: 'T-shirt size',
					name: 'size'
				}),
				mc.BootstrapForm.static({
					model: ctrl.data,
					label: 'Preferred sport',
					name: 'sport'

				}),
				mc.BootstrapForm.fieldset('buttons', [
					{
						type: 'button',
						style: 'primary',
						label: 'primary',
						onclick: function (e) {
							alert('clicked on: ' + e.target.innerHTML);
						}
					},
					{
						type: 'button',
						style: 'primary',
						label: 'primary (anchor)',
						href: '#',
						onclick: function (e) {
							alert('clicked on: ' + e.target.innerHTML);
						}
					},
					{
						type: 'button',
						style: 'warning',
						size: 'lg',
						active: true,
						label: 'warning, large, active',
						onclick: function (e) {
							alert('clicked on: ' + e.target.innerHTML);
						}
					},
					{
						type: 'button',
						style: 'danger',
						submit: true,
						label: 'submit, danger'
						//,		config: m.route
					},
					{
						type: 'button',
						style: 'link',
						label: 'link',
						onclick: function (e) {
							alert('clicked on: ' + e.target.innerHTML);
						}
					}

				])

			])
		]));
	}
};

m.module(document.body, app);