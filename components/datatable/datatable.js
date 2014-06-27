/*global m:false */
var mc = mc || {};
/**
A simple Datatable control
==========================

Allows the display of tabular information as a simple table.

Features
--------

* Table description separate from data
* Data source can be local array or remote webservice
* Columns definition array allows to
	* Select data to display
	* enable column sorting
	* set column width
	* add CSS classNames
* Table configuration allows to
	* set caption
	* set table width
	* set function to respond to click events on data cells
	
@example

	var app = {

		controller: function () {

			this.datatable = new mc.Datatable.controller(
				// Columns definition:
				[
					{key:"Empty"},
					{key:"Numbers", children:[
						{key:"SKU", label:"SKU", sortable:true},
						{key:"Quantity", sortable:true, class:'right-aligned'}
					]},
					{key:"Text", children:[
						{key:"Item", sortable:true},
						{key:"Description", sortable:true, width:200}
					]}
				],
				// Other configuration:
				{
					// Address of the webserver supplying the data
					url:'data/stock.json',

					// Handler of click event on data cell
					// It receives the relevant information already resolved
					onCellClick: function (content, row, col) {
						console.log(content, row, col);
					}
				}
			);
		},

		view: function (ctrl) {
			return mc.Datatable.view(ctrl.datatable,  {
				caption:'this is the caption'
			});
		}
	};
	
@module Datatable
@author Daniel Barreiro (Satyam)

MIT License
*/
mc.Datatable = {
	/**
	Component controller
	@class controller
	@constructor
	@param cols {Object} Columns definition object.  An array of objects that may have one or more of the following properties:
	@param cols.key {String} (mandatory): a unique key used to refer to the column.
	@param cols.label {String} the text to show at the column header.  Defaults to the `key`.
	@param cols.children {Array}  array of further columns definitions nested under this table header.
	@param cols.field {String} name of the property in the data containing the text to be shown.
	@param cols.width {Integer | CSS with spec} width of the column.  If a plain number, it will assumed to be in pixels.
	@param cols.class {String}  additional CSS class names to be added to each cell. This applies to the header cells as well as to the data cells.  Be sure to use the tagName along the className (`td.myClassName` or `th.myClassName`) in the CSS style sheet when defining the styles for each.
	@param cols.sortable {Boolean} the contents of the column can be sorted.
	@param cols.formatter {Function} function to format the value to be shown. It should return the value formatted for display. It will be called in the context (`this`) of the Datatable instance and will receive the following arguments:
	@param cols.formatter.value {Any} value from the data store.
	@param cols.formatter.row {Object} row to which the cell belongs.
	@param cols.formatter.col {Object} column definition.
	@param cols.formatter.attrs {Object} empty object later to be used to set the attributes on the cell.	
	
	@param config {Object} Additional configuration properties
	@param config.url {String} address of the webservice providing the data to be displayed.  It is passed verbatim to `m.request` to perform a `GET` request.
	@param config.data {Array} data to be displayed.  If both `url` and `data` are provided, the second prevails.  At least one must be given
	@param config.onCellClick {function} listener for a click on a data cell.  The function is called in the context (`this`) of the Datatable instance and will receive:
	@param config.onCellClick.content {Any} the content of the cell read from the data store, formatting, if any (not implemented yet) will not affect it.
	@param config.onCellClick.row {Object} row within the data store corresponding to the cell.
	@param config.onCellClick.col {Object} column definition for the column.
	@param config.recordId {String} If present, it should be the name of the field within the record that serves as a primary id for the record.  Each TR element in the data section of the table will have a `data-record-id` attribute set to the value of this key, otherwise, the rows will simply be numbered.
	*/
	
	
	controller: function (cols, config) {
		/**
		Internal copy of the columns definitions
		
		@property cols {Object}
		@private
		*/
		this.cols = cols;
		
		/**
		Internal copy of the configuration options
		
		@property config {Object}
		@private
		*/
		this.config = config = config || {};


		if (config.url) {
			this.data = m.request({
				url: config.url,
				method: 'GET'
			});
		}
		if (config.data) {
			this.data = (typeof config.data == 'function' ? config.data : m.prop(config.data));
		}

		/**
		Sorts the data in response to a click in the corresponding icon in the header
		
		@method sort
		@param target {DOM node} DOM element corresponding to the sorting icon
		@private
		*/
		this.sort = function (target) {
			var key = target.parentNode.getAttribute('data-colkey'),
				col = this.activeCols[key];
			if (this.lastSorted && this.lastSorted != key) {
				this.activeCols[this.lastSorted]._sorted = 'none';
			}
			var reverse = (col._sorted == 'asc' ? -1 : 1);
			this.data(this.data().sort(function (a, b) {
				a = a[key];
				b = b[key];
				return (a == b ? 0 : (a < b ? -1 : 1) * reverse);
			}));
			col._sorted = (reverse > 0 ? 'asc' : 'desc');
			this.lastSorted = key;
			m.render(this._tableEl, mc.Datatable.contentsView(this));
		};

		/**
		Responds to clicks on data cells and resolves the arguments to pass to the listener.
		
		@method onCellClick
		@param target {DOM node} DOM node that was clicked.
		@private
		*/
		this.onCellClick = function (target) {
			while (target.nodeName != 'TD' && target.nodeName != 'TABLE') target = target.parentNode;
			if (target.nodeName == 'TABLE') return;
			
			var colIndex = target.cellIndex,
				col = this.dataRow[colIndex],
				rowIndex = target.parentNode.sectionRowIndex,
				row = this.data()[rowIndex];
			
			m.startComputation();
			var ret = this.config.onCellClick.call(this, row[col.key], row, col);
			m.endComputation();
			return ret;
		};
		
		/**
		Event listener for the click event on the TABLE element
		
		@method onclick
		@param e {DOM Event} Event object for the click event.
		@private
		*/

		this.onclick = function (e) {
			var target = e.target;
			if (target.nodeName == 'I' && /\bfa\-sort/.test(target.className)) return this.sort(target);
			if (typeof this.config.onCellClick == 'function') {
				return this.onCellClick(target);
			}
		}.bind(this);

		/**
		Utility method to set the `width` attribute on a DOM Node if a valid width is found.
		
		@method setWidth
		@param attrs {Object} Object to add the `width` property to, if any found
		@param width {Any} Either a number, which is assumed in pixels or a CSS width specification
		@private
		*/
		this.setWidth = function (attrs, width) {
			if (!width) return;
			if (/^\d+$/.test(width)) width += 'px';
			if (!attrs.style) attrs.style = '';
			if (width) attrs.style += 'width:' + width + ';';
		};
	},
	/**
	Main view for the component. Produces the TABLE element.
	
	@method view
	@param ctrl {Controller} Instance of the controller that will handle this view
	@param [options] {Object} Display options, including:
	@param options.caption {String} caption to be shown in along the datatable.
	@param options.width {Integer | CSS width spec} sets the width of the table.  If a number, it will be assumed to be in pixels. 
	@param options.classNames {Object} overrides for various CSS class names:
	@param options.classNames.table='datatable' {String} class name for the table element.
	@param options.classNames.even='even' {String} class name for the TR element of even-numbered rows.
	@param options.classNames.odd='odd' {String} class name for the TR element of odd-numbered rows.
	@param options.classNames.sorted='sorted' {String} class name for the TH and TD elements of the currently sorted column.
	@return {Object} Mithirl view description.
	*/
	view: function (ctrl, options) {
		var cols = ctrl.cols;
		ctrl.viewOptions = options;

		if (!ctrl.data()) {
			return m('div', 'Sorry, no data to display');
		}
		options = options || {};
		options.classNames = options.classNames || {};

		var attrs = {
			class: options.classNames.table || 'datatable',
			config: function (el, isOld) {
				if (isOld) return;
				el.addEventListener('click', ctrl.onclick);
				ctrl._tableEl = el;
				m.render(el,  mc.Datatable.contentsView(ctrl));
			}

		};

		ctrl.setWidth(attrs, options.width);

		return m(
			'table',
			attrs
		);
	
		 
	},
	
	/**
	Provides the contents of the table.
	@method contentsView
	@param ctrl {Controller} Controller instance
	@return {Object} Mithirl view description.
	@private
	*/
	contentsView: function (ctrl) {
		var cols = ctrl.cols,
			options = ctrl.viewOptions;
		return [
			this.headView(ctrl, cols, options),
			this.bodyView(ctrl, cols, options, ctrl.data()),
			this.captionView(ctrl, options)
		];
	},
		
	/**
	Provides the THEAD element of the table.
	@method headView
	@param ctrl {Controller} Controller instance
	@param cols {Object} Columns definition
	@param options {Object} Configuration options from the view
	@return {Object} Mithirl view description.
	@private
	*/
	headView: function (ctrl, cols, options) {
		var matrix = [],
			rowNum = 0,
			dataRow = [];
		var calcDepth = function (maxDepth, col) {
			var depth = 0;
			if (!matrix[rowNum]) {
				matrix[rowNum] = [];
			}
			matrix[rowNum].push(col);
			if (col.children) {
				col._colspan = col.children.length;
				rowNum++;
				depth = col.children.reduce(calcDepth, 0) + 1;
				rowNum--;
				depth = Math.max(maxDepth, depth);
			} else {
				dataRow.push(col);
			}
			col._depth = depth;
			return depth;
		};



		var maxDepth = cols.reduce(calcDepth, 0);
		ctrl.dataRow = dataRow;
		var activeCols = {};
		dataRow.forEach(function (col) {
			activeCols[col.key] = col;
		});
		ctrl.activeCols = activeCols;

		var buildHeaderRow = function (row, rowNum) {
			var buildHeaderCell = function (col) {
				var attrs = {};
				if (col._colspan && col._colspan > 1) attrs.colspan = col._colspan;
				if (col.class) attrs.class = col.class; 
				if (!col._depth) {
					attrs['data-colKey'] = col.key;
					ctrl.setWidth(attrs, col.width);
					if (rowNum < maxDepth) attrs.rowspan = maxDepth - rowNum + 1;
					if (col._sorted && col._sorted != 'none') attrs.class = options.classNames.sorted || 'sorted';
				}

				return m(
					'th',
					attrs, [
						(!col._depth && col.sortable ? m(
							'i.fa', {
								class: {
									asc: 'fa-sort-asc',
									desc: 'fa-sort-desc',
									none: 'fa-sort'
								}[col._sorted || 'none']
							}
						) : ''),
						m.trust(' '),
						col.label || col.key
					]
				);
			};

			return m(
				'tr',
				row.map(buildHeaderCell)
			);
		};
		return m('thead', matrix.map(buildHeaderRow));
	},


	/**
	Provides the TBODY element of the table.
	@method bodyView
	@param ctrl {Controller} Controller instance
	@param cols {Object} Columns definition
	@param options {Object} Configuration options from the view
	@param data {Array of Objects} Data to be rendered.
	@return {Object} Mithirl view description.
	@private
	*/
	bodyView: function (ctrl, cols, options, data) {

		var buildDataRow = function (row, rowIndex) {
			var buildDataCell = function (col) {
				var value = row[col.field || col.key],
					attrs = {};

				if (typeof col.formatter == 'function') {
					value = col.formatter.call(ctrl, value, row, col, attrs);
				}
				if (!attrs.class) attrs.class = '';
				if (col._sorted && col._sorted != 'none') attrs.class += ' ' + (options.classNames.sorted || 'sorted');
				if (col.class) attrs.class += ' ' + col.class;

				if (!attrs.class) delete attrs.class;
				return m(
					'td',
					attrs,
					value
				);
			};
			var recordId = ctrl.config.recordId;
			return m(
				'tr', {
					'data-record-id': (recordId ? row[recordId] : rowIndex),
					class: (rowIndex & 1 ? options.classNames.odd || 'odd' : options.classNames.even || 'even')
				},
				ctrl.dataRow.map(buildDataCell)
			);
		};
		return m('tbody', data.map(buildDataRow));
	},
	/**
	Provides the CAPTION element of the table.
	@method captionView
	@param ctrl {Controller} Controller instance
	@param options {Object} Configuration options from the view
	@return {Object} Mithirl view description.
	@private
	*/		
	captionView: function (ctrl, options) {
		if (options.caption) return m('caption', options.caption);
	},
};