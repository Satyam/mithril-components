/* jshint browser:true */
/* global m:false,mc:false */

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
		return m('input',{type:'checkbox', checked: false});
		
		return m('div.container-fluid', m('div.row', [
			m('div.col-md-5',
				mc.BootstrapForm.form({
					style: 'border: thin solid gray;padding:1em',
					model: ctrl.data,
					//layout: 'horizontal',
					labelGridSize: 'col-sm-3',
					inputGridSize: 'col-sm-9'
				}, [
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
						rows: 5
					},
					
 					{
						type: 'radio',
 						label: 'T-shirt size',
 						name: 'size',
 						options: [
							'Other',
 							{label: 'Extra-small', value:'XS'},
 							{label: 'Small', value:'S'},
 							{label: 'Medium', value:'M'},
 							{label: 'Large', value:'L'},
 							{label: 'Extra-large', value:'XL'}
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
				})
			])
		]));
	}
};

m.module(document.body, app);