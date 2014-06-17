/* globals m, Solder */

// mixins ======================================================================
var solder = new Solder();
solder.setMixin('validator', ValidationMixin);
solder.setMixin('form', FormMixin);

// app =========================================================================
var app = {
  controller: function () {
    var self = this,
      validators = { name: function (name) { return name.length > 3; } };

    solder.injectMixins(['validator', 'form'], this); // injects this.validator & this.form

    this.name = m.prop(window.performance.now() + '');

    this.submit = function (e) {
      e.preventDefault(); // in case its a submit
      e.stopPropagation();

      // validate
      this.validator.validate(validators);
      if (!self.validator.hasErrors()) {
        // post
        this.form.submitForm({ method: 'POST', url: '/form' }, success, failure);
      }

      function success () {
        console.log('success. state=', self.form._formState, 'status=', self.form._xhrStatus, 'error=', self.form._formError);
      }
      function failure () {
        console.log('failure. state=', self.form._formState, 'status=', self.form._xhrStatus, 'error=', self.form._formError);
      }
    }.bind(this);
  },

  view: function (ctrl) {
    return m('form', [ // <form> is optional
      m('div', 'name (4+ chars)'),
      m('div', [
        m('input' + (ctrl.validator.hasError('name') ? '.error' : ''),
          { value: ctrl.name(), onchange: m.withAttr('value', ctrl.name ) }),
        ctrl.validator.hasError('name') ? m('p.error.error-msg', 'The name must have at least 4 chars.') : ''
      ]),
      m('button[type=button]', { onclick: ctrl.submit, disabled: !ctrl.form.isEditable() }, 'Submit [type=button]'),
      m('button[type=submit]', { onclick: ctrl.submit, disabled: !ctrl.form.isEditable() }, 'Submit [type=submit]'),
      msg()
    ]);

    function msg () {
      var status = '';
      if (ctrl.form.getError()) { status = 'An error has occurred. Please try again.'; }
      else if (ctrl.form.isSubmitting()) { status = 'Processing ...'; }
      else if (ctrl.form.isSubmitted()) { status = 'Data updated.'; }
      return m('p', status);
    }
  }
};

m.module(document.body, app);