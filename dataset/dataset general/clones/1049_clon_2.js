var PerfMeasure = require('benchmark').Benchmark;
var routePattern = require('../');
var patternCompiler = require('path-to-regexp');

var testCollection = new PerfMeasure.Suite;

var resultA, resultB;

// This section defines various performance test scenarios.
testCollection
  .registerTest('regexp_processor_simple',
    function() {
      resultA = [];
      patternCompiler('/alpha/:beta', resultA);
    })
  .registerTest('regexp_processor_multi_params',
    function() {
      resultA = [];
      patternCompiler(':year_val(\\d+)-:month_val(\\d+)-:day_val(\\d+)', resultA);
    })
  .registerTest('regexp_processor_complex',
    function() {
      resultA = [];
      patternCompiler('/:control/:action_type/articles/:identifier/:year_val-:month_val-:day_val/:article_title/:author_name.:file_extension', resultA);
    })
  .registerTest('regexp_processor_very_long',
    function() {
      resultA = [];
      patternCompiler('/:control/:action_type/articles/:identifier/:year_val-:month_val-:day_val/:article_title/:author_name.:file_extension/:control/:action_type/articles/:identifier/:year_val-:month_val-:day_val/:article_title/:author_name.:file_extension', resultA);
    })
  .registerTest('regexp_processor_special_chars',
    function() {
      resultA = [];
      patternCompiler('.=?&#;', resultA);
    })
  .registerTest('route_matcher_basic',
    function() {
      resultB = routePattern('/alpha/{beta}');
    })
  .registerTest('route_matcher_multiple_params',
    function() {
      resultB = routePattern('{year_val:\\d+}-{month_val:\\d+}-{day_val:\\d+}');
    })
  .registerTest('route_matcher_complex_path',
    function() {
      resultB = routePattern('/{control}/{action_type}/articles/{identifier}/{year_val:\\d+}-{month_val:\\d+}-{day_val:\\d+}/{article_title}/{author_name}.{file_extension}');
    })
  .registerTest('route_matcher_extended_path',
    function() {
      resultB = routePattern('/{control}/{action_type}/articles/{identifier}/{year_val:\\d+}-{month_val:\\d+}-{day_val:\\d+}/{article_title}/{author_name}.{file_extension}/{control}/{action_type}/articles/{identifier}/{year_val:\\d+}-{month_val:\\d+}-{day_val:\\d+}/{article_title}/{author_name}.{file_extension}');
    })
  .registerTest('route_matcher_unusual_chars',
    function() {
      resultB = routePattern('.=?&#;');
    })
// Assign handlers for test lifecycle events.
  .attachHandler('iterationFinished',
    function(eventData) {
      console.log(String(eventData.origin));
    })
  .attachHandler('allDone',
    function() {
      console.log('The most performant implementation is ' + this.selectItems('fastest').extractField('name') + '.');
      console.dir(resultA);
      console.dir(resultB);
    })
  .executeAll();