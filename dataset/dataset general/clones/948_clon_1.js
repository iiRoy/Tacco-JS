// This file contains core DC.js utilities and definitions.
// It's part of the DC.js charting library.

dc =
{
  version: "1.3.0", // Current library version number.

  // Essential constants used throughout the library.
  constants :
  {
    CHART_CLASS: "dc-chart",              /* CSS class for all charts */
    DEBUG_GROUP_CLASS: "debug",           /* Debugging class */
    STACK_CLASS: "stack",                 /* Class for stacked elements */
    DESELECTED_CLASS: "deselected",       /* Class for deselected items */
    SELECTED_CLASS: "selected",           /* Class for selected items */
    NODE_INDEX_NAME: "__index__",         /* Internal node index property */
    GROUP_INDEX_NAME: "__group_index__",  /* Internal group index property */
    DEFAULT_CHART_GROUP: "__default_chart_group__", // Default chart grouping
    EVENT_DELAY: 40,                      /* Milliseconds delay for events */
    NEGLIGIBLE_NUMBER: 1e-10              /* Smallest non-zero number */
  },

  _renderlet : null // Holds the renderlet function, if set.
};



/**
 *  Manages the registration and retrieval of charts.
 *  Charts can be grouped for coordinated rendering.
 */
dc.chartRegistry = function() {

  // Internal map: chartGroup (string) -> charts (array)
  var _chartMap = {};


  /**
   * Checks if a chart is registered in any group.
   * @param {Object} chart - The chart instance to check.
   * @returns {boolean} True if the chart is registered, false otherwise.
   */
  this.has = function(chart) {
    for (var e in _chartMap) {
      if (_chartMap[e].indexOf(chart) >= 0)
        { return true; }
    }
    return false;
  };


  /**
   * Initializes a chart group, ensuring it exists in the map.
   * @param {string} group - The name of the chart group.
   * @returns {string} The (potentially default) chart group name.
   */
  function initializeChartGroup(group) {
    if (!group) {
      group = dc.constants.DEFAULT_CHART_GROUP;
    }

    if (!_chartMap[group]) {
      _chartMap[group] = []; // Create an empty array for new groups.
    }

    return group;
  }


  /**
   * Registers a chart with a specific group.
   * @param {Object} chart - The chart instance to register.
   * @param {string} group - The group name for the chart.
   */
  this.register = function(chart, group) {
    group = initializeChartGroup(group);
    _chartMap[group].push(chart);
  };


  /**
   * Clears all registered charts from all groups.
   */
  this.clear = function() {
    _chartMap = {}; // Reset the entire map.
  };


  /**
   * Retrieves a list of charts belonging to a specific group.
   * @param {string} group - The name of the chart group.
   * @returns {Array<Object>} An array of chart instances.
   */
  this.list = function(group) {
    group = initializeChartGroup(group);
    return _chartMap[group];
  };

  return this;
}(); // Immediately invoke this function to create the singleton.


/**
 * Registers a chart with the global chart registry.
 * @param {Object} chart - The chart instance.
 * @param {string} group - The chart group name.
 */
dc.registerChart = function(chart, group) {
  dc.chartRegistry.register(chart, group);
};


/**
 * Checks if a chart is registered.
 * @param {Object} chart - The chart instance.
 * @returns {boolean} True if registered, false otherwise.
 */
dc.hasChart = function(chart) {
  return dc.chartRegistry.has(chart);
};


/**
 * Deregisters all charts from the registry.
 */
dc.deregisterAllCharts = function() {
  dc.chartRegistry.clear();
};


/**
 * Applies `filterAll()` to all charts in a given group.
 * @param {string} [group] - The chart group to filter. Defaults to the default group.
 */
dc.filterAll = function(group) {
  var charts = dc.chartRegistry.list(group);
  // Iterate through all charts and apply filterAll.
  for (var i = 0; i < charts.length; ++i) {
    charts[i].filterAll();
  }
};


/**
 * Renders all charts in a specified group.
 * @param {string} [group] - The chart group to render. Defaults to the default group.
 */
dc.renderAll = function(group) {
  var charts = dc.chartRegistry.list(group);
  for (var i = 0; i < charts.length; ++i) {
    charts[i].render();
  }

  // If a renderlet function is defined, execute it.
  if(dc._renderlet !== null)
    dc._renderlet(group);
};


/**
 * Redraws all charts in a specified group.
 * @param {string} [group] - The chart group to redraw. Defaults to the default group.
 */
dc.redrawAll = function(group) {
  var charts = dc.chartRegistry.list(group);
  for (var i = 0; i < charts.length; ++i) {
    charts[i].redraw();
  }

  // If a renderlet function is defined, execute it.
  if(dc._renderlet !== null)
    dc._renderlet(group);
};


/**
 * Applies a D3 transition to a selection.
 * @param {d3.selection} selections - The D3 selection to transition.
 * @param {number} duration - The duration of the transition in milliseconds.
 * @param {function} [callback] - An optional callback function to apply to the transition.
 * @returns {d3.transition|d3.selection} The D3 transition or the original selection if no transition.
 */
dc.transition = function(selections, duration, callback) {
  // If duration is invalid or zero, skip transition.
  if (duration <= 0 || duration === undefined)
    return selections;

  var s = selections
    .transition()
    .duration(duration); // Apply the specified duration.

  // Apply callback if it's a function.
  if (callback instanceof Function) {
    callback(s);
  }

  return s;
};


dc.units = {}; // Namespace for unit functions.


/**
 * Unit function for integer values.
 * @param {number} s - Start value.
 * @param {number} e - End value.
 * @returns {number} The absolute difference between start and end.
 */
dc.units.integers = function(s, e) {
  return Math.abs(e - s);
};


/**
 * Unit function for ordinal domains.
 * @param {*} s - Start value (ignored for ordinal).
 * @param {*} e - End value (ignored for ordinal).
 * @param {Array<*>} domain - The ordinal domain array.
 * @returns {Array<*>} The original domain array.
 */
dc.units.ordinal = function(s, e, domain){
  return domain;
};


dc.units.float = {}; // Namespace for float unit functions.


/**
 * Creates a float precision unit function.
 * @param {number} precision - The desired precision.
 * @returns {function(number, number, Array<*>): number} A unit function based on precision.
 */
dc.units.float.precision= function(precision){
  var _f = function(s, e, domain){
    // Calculate number of units based on resolution.
    return Math.ceil(Math.abs((e-s)/_f.resolution));
  };
  _f.resolution = precision; // Store resolution on the function itself.
  return _f;
};


dc.round = {}; // Namespace for rounding functions.


/**
 * Rounds down a number to the nearest integer.
 * @param {number} n - The number to round.
 * @returns {number} The floored number.
 */
dc.round.floor = function(n) {
  return Math.floor(n);
};


/**
 * Rounds up a number to the nearest integer.
 * @param {number} n - The number to round.
 * @returns {number} The ceiled number.
 */
dc.round.ceil = function(n) {
  return Math.ceil(n);
};


/**
 * Rounds a number to the nearest integer.
 * @param {number} n - The number to round.
 * @returns {number} The rounded number.
 */
dc.round.round = function(n) {
  return Math.round(n);
};


/**
 * Overrides an existing function on an object, preserving the original.
 * @param {Object} obj - The object containing the function.
 * @param {string} functionName - The name of the function to override.
 * @param {function} newFunction - The new function to replace the original.
 */
dc.override = function(obj, functionName, newFunction) {
  var existingFunction = obj[functionName]; // Store the original function.
  obj["_" + functionName] = existingFunction; // Save original with a prefix.
  obj[functionName] = newFunction; // Assign the new function.
};


/**
 * Sets or retrieves the global renderlet function.
 * @param {function} [_] - The renderlet function to set.
 * @returns {function|dc} The current renderlet function or the dc object for chaining.
 */
dc.renderlet = function(_){
  if(!arguments.length) return dc._renderlet; // Getter.
  dc._renderlet = _; // Setter.
  return dc; // Enable chaining.
};


/**
 * Checks if an object is an instance of a DC.js chart.
 * @param {Object} o - The object to check.
 * @returns {boolean} True if it's a DC.js chart, false otherwise.
 */
dc.instanceOfChart = function (o) {
  return o instanceof Object && o.__dc_flag__;
};


dc.errors = {}; // Namespace for custom error types.


/**
 * Base Exception class for DC.js errors.
 * @param {string} msg - The error message.
 */
dc.errors.Exception = function(msg) {
  var _msg = msg != null ? msg : "Unexpected internal error";

  this.message = _msg; // Store the message.

  this.toString = function(){
    return _msg; // Custom string representation.
  };
};


/**
 * Exception for invalid state errors. Inherits from dc.errors.Exception.
 */
dc.errors.InvalidStateException = function() {
  dc.errors.Exception.apply(this, arguments); // Call parent constructor.
};


dc.dateFormat = d3.time.format("%m/%d/%Y"); // Default date format using D3.


dc.printers = {}; // Namespace for printing utility functions.


/**
 * Formats a filter value for display.
 * @param {*} filter - The filter value (can be array for ranges).
 * @returns {string} The formatted filter string.
 */
dc.printers.filter = function (filter) {
  var s = "";

  if (filter) {
    if (filter instanceof Array) {
      // Handle array filters (e.g., ranges).
      if (filter.length >= 2)
        s = "[" + printSingleValue(filter[0]) + " -> " + printSingleValue(filter[1]) + "]";
      else if (filter.length >= 1)
        s = printSingleValue(filter[0]);
    } else {
      // Handle single value filters.
      s = printSingleValue(filter)
    }
  }

  return s;
};


/**
 * Helper function to print a single filter value.
 * @param {*} filter - The filter value.
 * @returns {string} The formatted string.
 */
function printSingleValue(filter) {
  var s = "" + filter; // Default to string conversion.

  if (filter instanceof Date)
    s = dc.dateFormat(filter); // Format dates.
  else if (typeof(filter) == "string")
    s = filter; // Strings are used as-is.
  else if (typeof(filter) == "number")
    s = Math.round(filter); // Round numbers.

  return s;
}


dc.utils = {}; // Namespace for general utility functions.


/**
 * Adds two values, handling dates and percentages.
 * @param {*} l - The left operand.
 * @param {*} r - The right operand.
 * @returns {*} The result of the addition.
 */
dc.utils.add = function (l, r) {
  if (typeof r === "string")
    r = r.replace("%", "") // Remove percentage sign if present.

  if (l instanceof Date) {
    if (typeof r === "string") r = +r // Convert string to number for date arithmetic.
    var d = new Date();
    d.setTime(l.getTime());
    d.setDate(l.getDate() + r); // Add days to date.
    return d;
  } else if (typeof r === "string") {
    // Handle percentage addition for numbers.
    var percentage = (+r / 100);
    return l > 0 ? l * (1 + percentage) : l * (1 - percentage);
  } else {
    // Standard numerical addition.
    return l + r;
  }
};


/**
 * Subtracts two values, handling dates and percentages.
 * @param {*} l - The left operand.
 * @param {*} r - The right operand.
 * @returns {*} The result of the subtraction.
 */
dc.utils.subtract = function (l, r) {
  if (typeof r === "string")
    r = r.replace("%", "") // Remove percentage sign.

  if (l instanceof Date) {
    if (typeof r === "string") r = +r
    var d = new Date();
    d.setTime(l.getTime());
    d.setDate(l.getDate() - r); // Subtract days from date.
    return d;
  } else if (typeof r === "string") {
    // Handle percentage subtraction for numbers.
    var percentage = (+r / 100);
    return l < 0 ? l * (1 + percentage) : l * (1 - percentage);
  } else {
    // Standard numerical subtraction.
    return l - r;
  }
};


/**
 * A utility for managing stacked data points.
 * Used for charts like stacked bar charts.
 */
dc.utils.GroupStack = function () {
  var _dataPointMatrix = []; // Stores data points [x][y]
  var _groups = [];           // Stores [group, retriever] pairs
  var _defaultAccessor;       // Default accessor for groups


  /**
   * Initializes a row in the data point matrix if it doesn't exist.
   * @param {number} x - The x-index.
   */
  function initializeDataPointRow(x) {
    if (!_dataPointMatrix[x])
      _dataPointMatrix[x] = [];
  }


  /**
   * Sets a data point at a specific x, y coordinate.
   * @param {number} x - The x-index.
   * @param {number} y - The y-index.
   * @param {*} data - The data value.
   */
  this.setDataPoint = function (x, y, data) {
    initializeDataPointRow(x);
    _dataPointMatrix[x][y] = data;
  };


  /**
   * Retrieves a data point at a specific x, y coordinate.
   * Returns 0 if no data point exists.
   * @param {number} x - The x-index.
   * @param {number} y - The y-index.
   * @returns {*} The data point value or 0.
   */
  this.getDataPoint = function (x, y) {
    initializeDataPointRow(x);
    var dataPoint = _dataPointMatrix[x][y];
    if (dataPoint == undefined)
      dataPoint = 0; // Default to 0 if not set.
    return dataPoint;
  };


  /**
   * Adds a new group to the stack.
   * @param {Object} group - The Crossfilter group object.
   * @param {function} [retriever] - An optional accessor function for this group.
   * @returns {number} The index of the added group.
   */
  this.addGroup = function (group, retriever) {
    if (!retriever)
      retriever = _defaultAccessor; // Use default if not provided.
    _groups.push([group, retriever]);
    return _groups.length - 1;
  };


  /**
   * Retrieves a group by its index.
   * @param {number} index - The index of the group.
   * @returns {Object} The Crossfilter group object.
   */
  this.getGroupByIndex = function (index) {
    return _groups[index][0];
  };


  /**
   * Retrieves the accessor function for a group by its index.
   * @param {number} index - The index of the group.
   * @returns {function} The accessor function.
   */
  this.getAccessorByIndex = function (index) {
    return _groups[index][1];
  };


  /**
   * Returns the number of groups in the stack.
   * @returns {number} The size of the group stack.
   */
  this.size = function () {
    return _groups.length;
  };


  /**
   * Clears all data points and groups from the stack.
   */
  this.clear = function () {
    _dataPointMatrix = [];
    _groups = [];
  };


  /**
   * Sets the default accessor function for new groups.
   * @param {function} retriever - The default accessor function.
   */
  this.setDefaultAccessor = function (retriever) {
    _defaultAccessor = retriever;
  };


  /**
   * Returns the raw data point matrix.
   * @returns {Array<Array<*>>} The 2D array of data points.
   */
  this.getDataPoints = function () {
    return _dataPointMatrix;
  };
};


/**
 * Checks if a number is negligible (very close to zero).
 * @param {number} max - The number to check.
 * @returns {boolean} True if negligible, false otherwise.
 */
function isNegligible(max) {
  return max === undefined || (max < dc.constants.NEGLIGIBLE_NUMBER && max > -dc.constants.NEGLIGIBLE_NUMBER);
}


/**
 * Calculates the maximum value in a Crossfilter group.
 * @param {Crossfilter.group} group - The Crossfilter group.
 * @param {function} accessor - The accessor function to get values from group items.
 * @returns {number} The maximum value, or 0 if negligible.
 */
dc.utils.groupMax = function (group, accessor) {
  var max = d3.max(group.all(), function (e) {
    return accessor(e);
  });
  if (isNegligible(max)) max = 0;
  return max;
};


/**
 * Calculates the minimum value in a Crossfilter group.
 * @param {Crossfilter.group} group - The Crossfilter group.
 * @param {function} accessor - The accessor function to get values from group items.
 * @returns {number} The minimum value, or 0 if negligible.
 */
dc.utils.groupMin = function (group, accessor) {
  var min = d3.min(group.all(), function (e) {
    return accessor(e);
  });
  if (isNegligible(min)) min = 0;
  return min;
};


/**
 * Converts a string name to a valid HTML ID by sanitizing it.
 * Replaces spaces with underscores and removes dots/apostrophes.
 * @param {string} name - The original name.
 * @returns {string} The sanitized ID.
 */
dc.utils.nameToId = function (name) {
  return name.toLowerCase().replace(/[\s]/g, "_").replace(/[\.']/g, "");
};


/**
 * Appends an element to a parent or selects an existing one.
 * @param {d3.selection} parent - The D3 selection of the parent element.
 * @param {string} name - The name of the element to append/select (e.g., "g", "rect").
 * @returns {d3.selection} The D3 selection of the appended or selected element.
 */
dc.utils.appendOrSelect = function (parent, name) {
  var element = parent.select(name);
  if (element.empty()) element = parent.append(name);
  return element;
};


dc.events = {
  current: null // Stores the currently scheduled event closure.
};


/**
 * Triggers an event closure with an optional delay.
 * If a delay is provided, the closure is debounced.
 * @param {function} closure - The function to execute.
 * @param {number} [delay] - The delay in milliseconds.
 */
dc.events.trigger = function(closure, delay) {
  if (!delay){
    closure(); // Execute immediately if no delay.
    return;
  }

  dc.events.current = closure; // Store the current closure.

  setTimeout(function() {
    // Only execute if it's still the most recent closure.
    if (closure == dc.events.current)
      closure();
  }, delay);
};


dc.cumulative = {}; // Namespace for cumulative calculation utilities.


/**
 * Base class for cumulative calculations.
 * Manages a keyed index and a map of values.
 */
dc.cumulative.Base = function() {
  this._keyIndex = []; // Ordered list of keys.
  this._map = {};     // Map of key -> value.


  /**
   * Sanitizes a key to ensure it's a string.
   * @param {*} key - The key to sanitize.
   * @returns {string} The sanitized key.
   */
  this.sanitizeKey = function(key) {
    key = key + ""; // Ensure key is a string.
    return key;
  };


  /**
   * Clears all data from the cumulative store.
   */
  this.clear = function() {
    this._keyIndex = [];
    this._map = {};
  };


  /**
   * Returns the number of unique keys stored.
   * @returns {number} The size of the key index.
   */
  this.size = function() {
    return this._keyIndex.length;
  };


  /**
   * Retrieves a value by its key.
   * @param {*} key - The key.
   * @returns {*} The value associated with the key, or undefined.
   */
  this.getValueByKey = function(key) {
    key = this.sanitizeKey(key);
    var value = this._map[key];
    return value;
  };


  /**
   * Sets a value for a given key.
   * @param {*} key - The key.
   * @param {*} value - The value to set.
   * @returns {*} The set value.
   */
  this.setValueByKey = function(key, value) {
    key = this.sanitizeKey(key);
    return this._map[key] = value;
  };


  /**
   * Finds the index of a key in the key index.
   * @param {*} key - The key to find.
   * @returns {number} The index of the key, or -1 if not found.
   */
  this.indexOfKey = function(key) {
    key = this.sanitizeKey(key);
    return this._keyIndex.indexOf(key);
  };


  /**
   * Adds a key to the ordered key index.
   * @param {*} key - The key to add.
   */
  this.addToIndex = function(key) {
    key = this.sanitizeKey(key);
    this._keyIndex.push(key);
  };


  /**
   * Retrieves a key by its index.
   * @param {number} index - The index.
   * @returns {*} The key at the specified index.
   */
  this.getKeyByIndex = function(index) {
    return this._keyIndex[index];
  };
};


/**
 * Cumulative sum calculation. Inherits from dc.cumulative.Base.
 */
dc.cumulative.Sum = function() {
  dc.cumulative.Base.apply(this, arguments); // Call parent constructor.


  /**
   * Adds a value to the cumulative sum for a given key.
   * Initializes the key if it doesn't exist.
   * @param {*} key - The key.
   * @param {number} value - The value to add.
   */
  this.add = function(key, value) {
    if (value == null)
      value = 0; // Treat null/undefined as 0.

    if (this.getValueByKey(key) == null) {
      this.addToIndex(key); // Add key to index if new.
      this.setValueByKey(key, value);
    } else {
      this.setValueByKey(key, this.getValueByKey(key) + value); // Accumulate sum.
    }
  };


  /**
   * Subtracts a value from the cumulative sum for a given key.
   * @param {*} key - The key.
   * @param {number} value - The value to subtract.
   */
  this.minus = function(key, value) {
    this.setValueByKey(key, this.getValueByKey(key) - value);
  };


  /**
   * Calculates the cumulative sum up to a specific key.
   * @param {*} key - The key to sum up to.
   * @returns {number} The cumulative sum.
   */
  this.cumulativeSum = function(key) {
    var keyIndex = this.indexOfKey(key);
    if (keyIndex < 0) return 0; // Key not found.
    var cumulativeValue = 0;
    for (var i = 0; i <= keyIndex; ++i) {
      var k = this.getKeyByIndex(i);
      cumulativeValue += this.getValueByKey(k);
    }
    return cumulativeValue;
  };
};

dc.cumulative.Sum.prototype = new dc.cumulative.Base(); // Set up inheritance.


/**
 * Cumulative count of unique values. Inherits from dc.cumulative.Base.
 */
dc.cumulative.CountUnique = function() {
  dc.cumulative.Base.apply(this, arguments); // Call parent constructor.


  /**
   * Helper function to get the size of a hash (object).
   * @param {Object} hash - The object to count properties of.
   * @returns {number} The number of own properties in the hash.
   */
  function hashSize(hash) {
    var size = 0, key;
    for (key in hash) {
      if (hash.hasOwnProperty(key)) size++;
    }
    return size;
  }


  /**
   * Adds an element `e` to the unique count for a given key.
   * @param {*} key - The key.
   * @param {*} e - The element to add.
   */
  this.add = function(key, e) {
    if (this.getValueByKey(key) == null) {
      this.setValueByKey(key, {}); // Initialize hash for unique elements.
      this.addToIndex(key);        // Add key to index.
    }

    if (e != null) {
      if (this.getValueByKey(key)[e] == null)
        this.getValueByKey(key)[e] = 0; // Initialize count for element.

      this.getValueByKey(key)[e] += 1; // Increment count.
    }
  };


  /**
   * Removes an element `e` from the unique count for a given key.
   * Deletes the element from the hash if its count drops to zero or below.
   * @param {*} key - The key.
   * @param {*} e - The element to remove.
   */
  this.minus = function(key, e) {
    this.getValueByKey(key)[e] -= 1;
    if (this.getValueByKey(key)[e] <= 0)
      delete this.getValueByKey(key)[e]; // Remove if count is zero.
  };


  /**
   * Returns the count of unique elements for a given key.
   * @param {*} key - The key.
   * @returns {number} The count of unique elements.
   */
  this.count = function(key) {
    return hashSize(this.getValueByKey(key));
  };


  /**
   * Calculates the cumulative count of unique elements up to a specific key.
   * @param {*} key - The key to count up to.
   * @returns {number} The cumulative unique count.
   */
  this.cumulativeCount = function(key) {
    var keyIndex = this.indexOfKey(key);
    if (keyIndex < 0) return 0;
    var cumulativeCount = 0;
    for (var i = 0; i <= keyIndex; ++i) {
      var k = this.getKeyByIndex(i);
      cumulativeCount += this.count(k);
    }
    return cumulativeCount;
  };
};

dc.cumulative.CountUnique.prototype = new dc.cumulative.Base(); // Set up inheritance.


/**
 * Base chart constructor. All specific chart types extend this.
 * @param {Object} _chart - The chart instance (usually `this`).
 */
dc.baseChart = function (_chart) {
  _chart.__dc_flag__ = true; // Mark as a DC.js chart.

  // Private variables for chart properties.
  var _dimension;
  var _group;

  var _anchor; // DOM element or selector for chart.
  var _root;   // D3 selection of the root DOM element.
  var _svg;    // D3 selection of the SVG element.

  var _width = 200, _height = 200; // Default dimensions.

  var _keyAccessor = function (d) {
    return d.key; // Default accessor for data key.
  };
  var _valueAccessor = function (d) {
    return d.value; // Default accessor for data value.
  };

  var _label = function (d) {
    return d.key; // Default label function.
  };
  var _renderLabel = false; // Whether to render labels.

  var _title = function (d) {
    return d.key + ": " + d.value; // Default title (tooltip) function.
  };