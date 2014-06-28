/* jshint browser:true */
/* global m:false,mc:false */

var app = {


	controller: function () {
		this.firstName = m.prop('John');
		this.lastName = m.prop('Doe');
		this.active = m.prop();
		this.lorenIpsum = m.prop('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
		this.size = m.prop('M');
	},

	view: function (ctrl) {
		var bsf = mc.BootstrapForm;
		return m('div.container-fluid', m('div.row', [
			m('div.col-md-5',
				bsf.form({
					style: 'border: thin solid gray;padding:1em'
				}, [
					bsf.input(ctrl, {
						label: 'First Name',
						value: 'firstName'
					}),
					bsf.input(ctrl, {
						label: 'Last Name',
						value: 'lastName'
					}),
					bsf.checkbox(ctrl, {
						label: 'Active',
						value: 'active'
					}),
					bsf.input(ctrl, {
						label: 'Something really long',
						value: 'lorenIpsum',
						rows: 5
					}),
					bsf.radio(ctrl, {
						label: 'T-shirt size',
						value: 'size',
						options: [
							{label: 'Extra-small', value:'XS'},
							{label: 'Small', value:'S'},
							{label: 'Medium', value:'M'},
							{label: 'Large', value:'L'},
							{label: 'Extra-large', value:'XL'}
						]
					})
				])
			),
			m('div.col-md-2'),
			m('div.col-md-5', [
				bsf.static( {
					label: 'First Name',
					value: ctrl.firstName()
				}),
				bsf.static( {
					label: 'Last Name',
					value: ctrl.lastName()
				}),
				bsf.static( {
					label: 'Active',
					value: ctrl.active()
				}),
				bsf.static( {
					label: 'Something really long',
					value: ctrl.lorenIpsum()
				}),
				bsf.static( {
					label: 'T-shirt size',
					value: ctrl.size()
				})

			])
		]));
	}
};

m.module(document.body, app);