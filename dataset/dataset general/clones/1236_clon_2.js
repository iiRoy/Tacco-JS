//package_revision

// *************************************************************
//   VisFlow CLASS                                       *******
// *************************************************************

/**
 * The Global Registry. It holds all the registered unit blueprints.
 *
 * @class VisFlow
 * @constructor
 */

var VisFlow = {

	UNIT_HEADER_SIZE:    16.5,
	UNIT_PORT_SPACING:   15.5,
	UNIT_BASE_WIDTH:     142,
	UNIT_MIN_WIDTH:      52,
	UNIT_FOLD_RADIUS:    11,
	UNIT_FOLD_WIDTH:     82,
	VIEW_GRID_DIMENSION: 11,
	UNIT_TITLE_TINT:     "#333",
	UNIT_DEFAULT_TINT:   "#AAA",
	UNIT_DEFAULT_BACK:   "#555",
	UNIT_DEFAULT_BORDER: "#BEE",
	UNIT_DEFAULT_FORM:   "rectangle",
	MAX_ELEMENT_COUNT:   999, // limit for iterative processes
	INITIAL_COORDINATES: [101, 101], // default unit placement
	element_gfx_root:    "assets/icons/",

	redirector: null, // used to forward function calls

	verbose:       false,
	raise_exceptions: true,
	cataloged_unit_variations: {},

	/**
	 * Enroll a unit blueprint so it can be listed for creation.
	 * @method enrollUnitType
	 * @param {String} kind name and path of the unit
	 * @param {Class} prototype_class class defining the unit's structure
	 */

	enrollUnitType: function(kind, prototype_class)
	{
		if (!prototype_class.blueprint) {
			throw("Cannot enroll a plain object; it must be a class with a blueprint.");
		}
		prototype_class.kind = kind;

		if (VisFlow.verbose) {
			console.log("Unit enrolled: " + kind);
		}

		var categories_array = kind.split("/");

		var last_slash_idx = kind.lastIndexOf("/");
		prototype_class.group_tag = kind.substring(0, last_slash_idx);
		// info.label = label.substring(last_slash_idx + 1, label.length - last_slash_idx);

		// enhance the class
		if (prototype_class.blueprint) { // confirm it's a class
			for (var member_key in FlowElement.blueprint) {
				if (!prototype_class.blueprint[member_key]) {
					prototype_class.blueprint[member_key] = FlowElement.blueprint[member_key];
				}
			}
		}

		this.cataloged_unit_variations[kind] = prototype_class;
	},

	/**
	 * Generate a unit of a specified kind with a given caption. The unit is not yet assigned to any flowchart.
	 * @method spawnUnit
	 * @param {String} kind full name of the unit blueprint, e.g., "math/add"
	 * @param {String} caption a descriptive label for differentiation
	 * @param {Object} config_settings to apply specific options
	 */

	spawnUnit: function(kind, caption, config_settings)
	{
		var blueprint_definition = this.cataloged_unit_variations[kind];
		if (!blueprint_definition)
		{
			if (VisFlow.verbose) {
				console.log("FlowUnit kind \"" + kind + "\" not cataloged.");
			}
			return null;
		}

		var unit_blueprint = blueprint_definition.blueprint || blueprint_definition;

		caption = caption || blueprint_definition.caption || kind;

		var new_unit = new blueprint_definition(caption);

		new_unit.kind = kind;
		if (!new_unit.caption) new_unit.caption = caption;
		if (!new_unit.attributes) new_unit.attributes = {};
		if (!new_unit.state_flags) new_unit.state_flags = {};
		if (!new_unit.dimensions) new_unit.dimensions = new_unit.calculateDimensions();
		if (!new_unit.placement) new_unit.placement = VisFlow.INITIAL_COORDINATES.slice();

		// additional config
		if (config_settings)
		{
			for (var setting_id in config_settings) {
				new_unit[setting_id] = config_settings[setting_id];
			}
		}

		return new_unit;
	},

	/**
	 * Retrieves a cataloged unit blueprint by its kind.
	 * @method retrieveUnitType
	 * @param {String} kind full name of the unit blueprint, e.g., "logic/and"
	 * @return {Class} the unit blueprint class
	 */

	retrieveUnitType: function(kind)
	{
		return this.cataloged_unit_variations[kind];
	},


	/**
	 * Returns a collection of unit blueprints matching a specific group tag.
	 * @method getCategoryUnits
	 * @param {String} group_tag category identifier
	 * @return {Array} array containing all matching unit classes
	 */

	getCategoryUnits: function(group_tag)
	{
		var found_units = [];
		for (var unit_key in this.cataloged_unit_variations)
			if (group_tag == "")
			{
				if (this.cataloged_unit_variations[unit_key].group_tag == null)
					found_units.push(this.cataloged_unit_variations[unit_key]);
			}
			else if (this.cataloged_unit_variations[unit_key].group_tag == group_tag)
				found_units.push(this.cataloged_unit_variations[unit_key]);

		return found_units;
	},

	/**
	 * Returns an array with all the unique group tags of unit blueprints.
	 * @method getUnitCategories
	 * @return {Array} array with the names of all existing categories
	 */

	getUnitCategories: function()
	{
		var distinct_categories = {"": 1};
		for (var unit_key in this.cataloged_unit_variations)
			if (this.cataloged_unit_variations[unit_key].group_tag && !this.cataloged_unit_variations[unit_key].exclude_from_list)
				distinct_categories[this.cataloged_unit_variations[unit_key].group_tag] = 1;
		var final_list = [];
		for (var category_name in distinct_categories)
			final_list.push(category_name);
		return final_list;
	},

	// For debugging: reloads all JavaScript files that match a pattern.
	refreshElements: function(directory_pattern)
	{
		var temp_scripts = document.getElementsByTagName("script");
		// This array can change dynamically, so we create a static copy.
		var source_files = [];
		for (var script_idx in temp_scripts) {
			source_files.push(temp_scripts[script_idx]);
		}


		var document_head = document.getElementsByTagName("head")[0];
		directory_pattern = document.location.href + directory_pattern;

		for (var file_idx in source_files)
		{
			var source_url = source_files[file_idx].src;
			if (!source_url || source_url.substring(0, directory_pattern.length) != directory_pattern) {
				continue;
			}

			try
			{
				if (VisFlow.verbose) {
					console.log("Re-fetching: " + source_url);
				}
				var new_script_element = document.createElement("script");
				new_script_element.type = "text/javascript";
				new_script_element.src = source_url;
				document_head.appendChild(new_script_element);
				document_head.removeChild(source_files[file_idx]);
			}
			catch (error_msg)
			{
				if (VisFlow.raise_exceptions) {
					throw error_msg;
				}
				if (VisFlow.verbose) {
					console.log("Problem during re-fetch of " + source_url);
				}
			}
		}

		if (VisFlow.verbose) {
			console.log("Elements reloaded.");
		}
	},

	// separated for potential future improvements
	replicateObject: function(source_object, destination_object)
	{
		if (source_object == null) return null;
		var copied_obj = JSON.parse(JSON.stringify(source_object));
		if (!destination_object) return copied_obj;

		for (var prop_key in copied_obj) {
			destination_object[prop_key] = copied_obj[prop_key];
		}
		return destination_object;
	}
};

if (typeof (performance) != "undefined") {
	VisFlow.getCurrentTime = function() { return performance.now(); };
} else {
	VisFlow.getCurrentTime = function() { return Date.now(); };
}




//*********************************************************************************
// FlowChart CLASS
//*********************************************************************************

/**
 * FlowChart is the container class for an entire graph structure.
 * We instantiate one, populate it with elements, and then run its processing loop.
 *
 * @class FlowChart
 * @constructor
 */

function FlowChart()
{
	if (VisFlow.verbose) {
		console.log("FlowChart initialized.");
	}
	this.attached_viewports = null;
	this.reset();
}

// default supported data kinds
FlowChart.allowed_data_kinds = ["numeric", "text", "binary"];

// determines which data kinds are permissible for connections in this chart
FlowChart.prototype.getAllowedDataKinds = function() { return this.allowed_data_kinds || FlowChart.allowed_data_kinds; };

FlowChart.STATE_INACTIVE = 1;
FlowChart.STATE_ACTIVE = 2;

/**
 * Erases all elements from this flowchart.
 * @method reset
 */

FlowChart.prototype.reset = function()
{
	this.haltExecution();
	this.chart_status = FlowChart.STATE_INACTIVE;
	this.last_element_id = 0;

	// elements
	this._elements = [];
	this._elements_by_id = {};

	// connections
	this.last_connection_id = 0;
	this.connections = {}; // collection of all inter-element connections

	// processing cycles
	this.cycle_count = 0;

	this.settings = {
	};

	// timing metrics
	this.total_runtime = 0;
	this.active_duration = 0;
	this.scheduled_time = 0;
	this.scheduled_interval = 0.01;
	this.delta_time = 0.01;
	this.start_moment = 0;

	// global ports
	this.chart_inputs = {};
	this.chart_outputs = {};

	// this.chart = {};
	this.verbose = true;

	this.notifyChange();

	this.dispatchActionToViewports("clear");
};

/**
 * Links a viewport to this flowchart.
 * @method connectViewport
 * @param {FlowChartCanvas} view_component
 */

FlowChart.prototype.connectViewport = function(view_component)
{
	if (view_component.constructor != FlowChartCanvas) {
		throw("connectViewport expects a FlowChartCanvas instance.");
	}
	if (view_component.chart && view_component.chart != this) {
		view_component.chart.disconnectViewport(view_component);
	}

	view_component.chart = this;
	if (!this.attached_viewports) {
		this.attached_viewports = [];
	}
	this.attached_viewports.push(view_component);
};

/**
 * Unlinks a viewport from this flowchart.
 * @method disconnectViewport
 * @param {FlowChartCanvas} view_component
 */

FlowChart.prototype.disconnectViewport = function(view_component)
{
	var position_in_list = this.attached_viewports.indexOf(view_component);
	if (position_in_list == -1) return;
	view_component.chart = null;
	this.attached_viewports.splice(position_in_list, 1);
};

/**
 * Initiates the flowchart execution loop at a specified interval.
 * @method initiateExecution
 * @param {number} delay_ms amount of milliseconds between executions, default is 1
 */

FlowChart.prototype.initiateExecution = function(delay_ms)
{
	if (this.chart_status == FlowChart.STATE_ACTIVE) return;
	this.chart_status = FlowChart.STATE_ACTIVE;

	if (this.onInitiateCallback) {
		this.onInitiateCallback();
	}

	this.broadcastEventToElements("onStart");

	// commence
	this.start_moment = VisFlow.getCurrentTime();
	delay_ms = delay_ms || 1.5;
	var self_reference = this;

	this.execution_timer_handle = setInterval(function() {
		// perform cycle
		self_reference.executeCycle(1);
	}, delay_ms);
};

/**
 * Stops the execution loop of the flowchart.
 * @method haltExecution
 */

FlowChart.prototype.haltExecution = function()
{
	if (this.chart_status == FlowChart.STATE_INACTIVE) {
		return;
	}

	this.chart_status = FlowChart.STATE_INACTIVE;

	if (this.onHaltCallback) {
		this.onHaltCallback();
	}

	if (this.execution_timer_handle != null) {
		clearInterval(this.execution_timer_handle);
	}
	this.execution_timer_handle = null;

	this.broadcastEventToElements("onStop");
};

/**
 * Executes N cycles of the flowchart.
 * @method executeCycle
 * @param {number} cycle_iterations number of steps to run, default is 1
 */

FlowChart.prototype.executeCycle = function(cycle_iterations)
{
	cycle_iterations = cycle_iterations || 1;

	var cycle_start_time = VisFlow.getCurrentTime();
	this.total_runtime = 0.001 * (cycle_start_time - this.start_moment);

	try
	{
		for (var i = 0; i < cycle_iterations; i++)
		{
			this.broadcastEventToElements("onExecute");
			this.scheduled_time += this.scheduled_interval;
			if (this.onCycleStepCallback) {
				this.onCycleStepCallback();
			}
		}

		if (this.onPostExecutionCallback) {
			this.onPostExecutionCallback();
		}
		this.execution_errors_present = false;
	}
	catch (caught_error)
	{
		this.execution_errors_present = true;
		if (VisFlow.raise_exceptions) {
			throw caught_error;
		}
		if (VisFlow.verbose) {
			console.log("Error during flowchart execution: " + caught_error);
		}
		this.haltExecution();
	}

	var duration_ms = VisFlow.getCurrentTime() - cycle_start_time;
	if (duration_ms == 0) duration_ms = 1;
	this.delta_time = 0.001 * duration_ms;
	this.total_runtime += 0.001 * duration_ms;
	this.cycle_count += 1;
};

/**
 * Recalculates the flowchart's execution order based on element relevance
 * (elements with only outlets are more relevant than those with only inlets).
 * @method recalculateProcessingOrder
 */

FlowChart.prototype.recalculateProcessingOrder = function()
{
	this._ordered_elements = this.determineProcessingSequence();
};

// This is an internal method that computes and returns the processing order.
FlowChart.prototype.determineProcessingSequence = function()
{
	var ordered_list = [];
	var starting_elements = [];
	var pending_elements = {};
	var processed_connections = {}; // to prevent duplicate processing
	var outstanding_connections = {}; // tracks connections awaiting processing

	// Identify elements without any incoming connections (starting points).
	for (var element_key in this._elements)
	{
		var current_element = this._elements[element_key];
		pending_elements[current_element.id] = current_element; // add to elements awaiting processing

		var input_count = 0; // number of input connections
		if (current_element.inlets) {
			for (var inlet_idx = 0, num_inlets = current_element.inlets.length; inlet_idx < num_inlets; inlet_idx++) {
				if (current_element.inlets[inlet_idx] && current_element.inlets[inlet_idx].connection_id != null) {
					input_count += 1;
				}
			}
		}

		if (input_count == 0) { // This element is a starting point.
			starting_elements.push(current_element);
		} else { // Store the number of incoming connections.
			outstanding_connections[current_element.id] = input_count;
		}
	}

	while (true)
	{
		if (starting_elements.length == 0) {
			break;
		}

		// Retrieve a starting element.
		var current_element = starting_elements.shift();
		ordered_list.push(current_element); // Add to the ordered sequence.
		delete pending_elements[current_element.id]; // Remove from elements awaiting processing.

		// For each outlet of the current element:
		if (current_element.outlets) {
			for (var outlet_idx = 0; outlet_idx < current_element.outlets.length; outlet_idx++)
			{
				var current_outlet = current_element.outlets[outlet_idx];
				// Outlet not connected.
				if (current_outlet == null || current_outlet.outlet_connections == null || current_outlet.outlet_connections.length == 0) {
					continue;
				}

				// For each connection from this outlet:
				for (var conn_idx = 0; conn_idx < current_outlet.outlet_connections.length; conn_idx++)
				{
					var conn_identifier = current_outlet.outlet_connections[conn_idx];
					var current_connection = this.connections[conn_identifier];
					if (!current_connection) continue;

					// Connection already processed (skip).
					if (processed_connections[current_connection.id]) {
						continue;
					}

					var destination_element = this.getElementByID(current_connection.target_id);
					if (destination_element == null)
					{
						processed_connections[current_connection.id] = true;
						continue;
					}