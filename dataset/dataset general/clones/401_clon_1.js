var request = require('request')
  , url     = require('url') // Core Node.js URL module
  , rdv     = require('rendezvous')
  , tocsv   = require('./tocsv') // Local utility to convert to CSV format
  ;

// This function requests metrics from the Cube service.
// It takes an expression, options, and a callback.
// The Cube API endpoint is typically:
// GET /1.0/metric/get?expression={expression}
//                   &start={options.start}
//                   &stop={options.stop}
//                   &limit={options.limit}
//                   &step={options.step}
//
// The callback `cb` will be invoked with the processed result.
//
// @param  {String}        expression        - The Cube metric expression string.
// @param  {Object}        options           - Configuration options for the request.
//         {String}        options.host      - The host-name of the Cube evaluator.
//         {String|Date}   options.[start]   - Start date for metrics. Can be a `rendezvous` expression.
//         {String|Date}   options.[stop]    - Stop date for metrics. Can be a `rendezvous` expression.
//         {String}        options.[over]    - A `rendezvous.duration` expression. Defines the time window.
//                                             If `start` or `stop` is missing, it will be deduced from `over`.
//         {String|Number} options.[limit]   - Maximum number of metrics to fetch. Can be a `rendezvous.duration`
//                                             expression; the numeric value is derived based on `step`.
//         {String}        options.step      - Metric resolution (e.g., '10s', '1m', '5m', '1h', '1d').
//         {String}        options.[format]  - Desired output format: 'json' or 'csv'. Defaults to JSON.
//         {Boolean}       options.[inverse] - For CSV output, if true, inverse date format (mm/dd/yy to dd/mm/yy).
//
// @param  {Function}      cb                - Callback function (err, data) to be called upon request completion.

module.exports = function(expression, options, cb) {

  // First, build the query string based on the expression and options.
  var query = buildQuery(expression, options);

  // Perform the HTTP GET request to the Cube API.
  request.get(query, function(err, res, body) {
    // Handle potential network or request errors.
    if(err) {
      cb(err); // Pass the error to the callback.
    }
    // Handle HTTP status codes other than 200 (OK).
    else if(res.statusCode !== 200) {
      cb(new Error(body)); // Create an error with the response body.
    }
    // If successful, process the response body.
    else {
      var parsed; // Variable to hold the parsed data.

      // Determine how to process the body based on the requested format.
      switch(options.format) {

        case 'json':
          // If format is 'json', just pass the raw body (assuming it's already JSON).
          cb(body);
          break;

        case 'csv':
          // If format is 'csv', parse the JSON, convert time, then convert to CSV.
          parsed = JSON.parse(body).map(function(val){
            // Convert time string to Date object for CSV conversion.
            val.time = new Date(val.time);
            return val;
          });
          cb(tocsv(parsed, options.inverse)); // Convert to CSV and call back.
          break;

        default :
          // Default case (or if format is not specified), parse as JSON and convert time.
          parsed = JSON.parse(body).map(function(val){
            val.time = new Date(val.time); // Convert time string to Date object.
            return val;
          });
          cb(parsed); // Call back with the parsed data.
          break;
      }
    }
  });
};

// Utility function to construct the query URL for fetching metrics.
//
// @param  {String} expression - The Cube metric expression.
// @param  {Object} options    - Options for the metric request (see module.exports options).
// @return {String} The fully formed URL string for the Cube API.

var buildQuery = function(expression, options) {

  var step = (typeof options.step === 'string')
             ? rdv.duration(options.step) // Parse rendezvous duration if step is a string.
             : options.step;              // Otherwise, use the step directly.

  if(step === false) {
    throw new Error(options.step + ': invalid rendezvous duration expression');
  }

  // Validate supported Cube resolutions.
  if([1e4, 6e4, 3e5, 36e5, 864e5].indexOf(step) === -1) {
    throw new Error(options.step+' is not a supported resolution');
  }


  var start; // Variable to store the start date.
  if(options.start) {
    start = (options.start instanceof Date)
            ? options.start            // Use directly if already a Date object.
            : rdv(options.start);      // Parse rendezvous expression if string.
    if(start === false) {
      throw new Error(options.start + ': invalid rendezvous expression');
    }
  }


  var stop; // Variable to store the stop date.
  if(options.stop) {
    stop = (options.stop instanceof Date)
           ? options.stop             // Use directly if already a Date object.
           : rdv(options.stop);       // Parse rendezvous expression if string.
    if(stop === false) {
      throw new Error(options.stop + ': invalid rendezvous expression');
    }
  }


  // If an 'over' duration is provided, deduce start/stop if one is missing.
  if(options.over) {
    var over = rdv.duration(options.over);
    if(over === false) {
      throw new Error(options.over + ': invalid rendezvous duration expression');
    }

    if(!start && stop ) {
      start = new Date( stop.valueOf() - over); // Calculate start if only stop is present.
    }
    if(!stop  && start) {
      stop  = new Date(start.valueOf() + over); // Calculate stop if only start is present.
    }
  }


  var limit; // Variable to store the limit.
  if(options.limit) {
    if(typeof options.limit === 'string') {
      var duration = rdv.duration(options.limit); // Parse rendezvous duration.
      if(duration === false) {
        throw new Error(options.limit + ': invalid rendezvous duration expression');
      }

      limit = Math.floor(duration/step); // Calculate limit based on duration and step.
    }
    else {
      limit = options.limit; // Use directly if it's a number.
    }
  }

  // Construct the query object for the URL.
  var query = {};
  query.expression = expression;
  query.step = step;
  if(start) {
    query.start = start.toISOString(); // Convert Date to ISO string if present.
  }
  if(stop)  {
    query.stop  = stop.toISOString();  // Convert Date to ISO string if present.
  }
  if(limit) {
    query.limit = limit;               // Add limit if present.
  }

  // Format the complete URL using Node.js 'url' module.
  return url.format({
    protocol : 'http',
    host : options.host,
    pathname : '1.0/metric/get',
    query : query
  });
};

// Expose buildQuery for testing or external use.
module.exports.buildQuery = buildQuery;