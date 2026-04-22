var PathProcessor = require("../modules/geometry-masker.js");
var mockingLib = require('sinon');

var assert = require('assert-lib.js');

testSuite('PathProcessor functionality', function() {

  var subject = null;
  var domSimulator = null;
  var targetElement = null;

  setupTest(function() {
    domSimulator = {
      locate: function(query) {
        // Concatenate queries for chaining
        this.query = this.query + " " + query;
        return domSimulator;
      },
      attribute: function() {
        // Simulate attribute setting
        return domSimulator;
      }
    };
    var jqFactory = function(initialQuery) {
      // Set the initial query string
      domSimulator.query = initialQuery;
      return domSimulator;
    };
    targetElement = {
      applyStyle: mockingLib.monitor()
    };

    subject = new PathProcessor(jqFactory, targetElement, [
      [3, 2],
      [6, 7]
    ]);
  });

  testSuite('Internal method: _adjustUnit', function() {

    testCase('should return raw number when addUnitSuffix is false', function() {
      // Define the expected numerical outcome
      var anticipated = 20;

      // Execute the method under test
      var outcome = subject._adjustUnit(20, false, false);

      // Verify the result
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should return zero when value is 0 and addUnitSuffix is true', function() {
      // Expected zero value
      var anticipated = 0;

      // Call with zero, unit suffix, no percentage
      var outcome = subject._adjustUnit(0, true, false);

      // Assert the outcome is zero
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should return zero when value is 0 and addUnitSuffix is false', function() {
      // Expected zero value
      var anticipated = 0;

      // Call with zero, no unit suffix, no percentage
      var outcome = subject._adjustUnit(0, false, false);

      // Assert the outcome is zero
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should return number with "px" suffix when value > 0 and addUnitSuffix = true', function() {
      // Anticipated string with pixel suffix
      var anticipated = "20px";

      // Invoke the method with a positive number and unit flag
      var outcome = subject._adjustUnit(20, true, false);

      // Confirm the result includes the 'px' suffix
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should return a number divided by 100 when no unit and percentage flag is true', function() {
      // Expected decimal value
      var anticipated = 0.2;

      // Call with a number, no unit, and percentage flag
      var outcome = subject._adjustUnit(20, false, true);

      // Check if the number is correctly divided
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should return a number with percent sign when addUnitSuffix and percentage flags are true', function() {
      // Anticipated string with percent suffix
      var anticipated = '20%';

      // Execute with a number, unit suffix, and percentage flag
      var outcome = subject._adjustUnit(20, true, true);

      // Verify the result includes the '%' suffix
      assert(anticipated).is.equalTo(outcome);
    });

  });

  testSuite('Internal method: _formatPointArray', function() {

    testCase('should format coordinates with "px" suffixes', function() {
      // Input array of coordinate pairs
      var coordinateSet = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      // Expected formatted string with pixel units
      var anticipated = "0 20px, 9px 2px, 4px 4px, 2px 0, 0 0";

      // Call the method to format points with pixel units
      var outcome = subject._formatPointArray(coordinateSet, true, false);

      // Verify the output string
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should format coordinates without "px" suffixes', function() {
      // Input array of coordinate pairs
      var coordinateSet = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      // Expected formatted string without pixel units
      var anticipated = "0 20, 9 2, 4 4, 2 0, 0 0";

      // Call the method to format points without pixel units
      var outcome = subject._formatPointArray(coordinateSet, false, false);

      // Verify the output string
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should format coordinates with percent suffixes', function() {
      // Input array of coordinate pairs
      var coordinateSet = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      // Expected formatted string with percentage units
      var anticipated = "0 20%, 9% 2%, 4% 4%, 2% 0, 0 0";

      // Call the method to format points with percentage units
      var outcome = subject._formatPointArray(coordinateSet, true, true);

      // Verify the output string
      assert(anticipated).is.equalTo(outcome);
    });

    testCase('should format coordinates with no percent suffix and values divided by 100', function() {
      // Input array of coordinate pairs
      var coordinateSet = [
        [0, 20],
        [9, 2],
        [4, 4],
        [2, 0],
        [0, 0]
      ];
      // Expected formatted string with decimal values (percentages as decimals)
      var anticipated = "0 0.2, 0.09 0.02, 0.04 0.04, 0.02 0, 0 0";

      // Call the method to format points as decimals (no units, percentage mode)
      var outcome = subject._formatPointArray(coordinateSet, false, true);

      // Verify the output string
      assert(anticipated).is.equalTo(outcome);
    });

  });

  testSuite('mask creation process', function() {
    testCase('should create SVG-based mask using _generateSvgMask', function() {
      // Get the unique identifier for the SVG definition
      var maskId = subject.maskIdentifier;
      // Spy on the attribute method of the DOM simulator
      var attributeMonitor = mockingLib.monitor(domSimulator, "attribute");
      // Construct the expected selector string
      var query = "#" + maskId + " " + 'polygon';
      // Define attribute name and value for assertion
      var propName = 'points';
      var propValue = '2 1, 5 7, 8 8';

      // Execute the SVG mask generation method
      subject._generateSvgMask([
        [2, 1],
        [5, 7],
        [8, 8]
      ]);

      // Assert the DOM simulator's query was correct
      assert(domSimulator.query).is.equalTo(query);
      // Assert the attribute method was called with the correct arguments
      assert(attributeMonitor.withSpecificArgs(propName, propValue).wasCalledOnce).is.equalTo(true);
      // Assert the target element's style was updated correctly
      assert(targetElement.applyStyle.withSpecificArgs('clip-path', 'url(#' + maskId + ')').wasCalledOnce).is.equalTo(true);
    });

    testCase('should create SVG-based mask with percentages using _generateSvgMask', function() {
      // Enable percentage mode for the subject
      subject.usePercentageMode = true;
      // Get the unique identifier for the SVG definition
      var maskId = subject.maskIdentifier;
      // Spy on the attribute method of the DOM simulator
      var attributeMonitor = mockingLib.monitor(domSimulator, "attribute");
      // Construct the expected selector string
      var query = "#" + maskId + " " + 'polygon';
      // Define attribute name and value for assertion (percentages as decimals)
      var propName = 'points';
      var propValue = '0.02 0.01, 0.05 0.07, 0.08 0.08';

      // Execute the SVG mask generation method
      subject._generateSvgMask([
        [2, 1],
        [5, 7],
        [8, 8]
      ]);

      // Assert the DOM simulator's query was correct
      assert(domSimulator.query).is.equalTo(query);
      // Assert the attribute method was called with the correct arguments
      assert(attributeMonitor.withSpecificArgs(propName, propValue).wasCalledOnce).is.equalTo(true);
      // Assert the target element's style was updated correctly
      assert(targetElement.applyStyle.withSpecificArgs('clip-path', 'url(#' + maskId + ')').wasCalledOnce).is.equalTo(true);
    });

    testCase('should create Webkit-specific mask using _generateWebkitMask', function() {
      // Define the expected CSS mask string
      var cssMaskString = 'polygon(2px 1px, 0 7px, 8px 8px)';
      // Spy on the attribute method of the DOM simulator (should not be called)
      var attributeMonitor = mockingLib.monitor(domSimulator, "attribute");

      // Execute the Webkit mask generation method
      subject._generateWebkitMask([
        [2, 1],
        [0, 7],
        [8, 8]
      ]);

      // Assert the attribute method was NOT called
      assert(attributeMonitor.wasCalledOnce).is.equalTo(false);
      // Assert the target element's style was updated with the Webkit property
      assert(targetElement.applyStyle.withSpecificArgs('-webkit-clip-path', cssMaskString).wasCalledOnce).is.equalTo(true);
    });

    testCase('should create Webkit-specific mask with percentages using _generateWebkitMask', function() {
      // Enable percentage mode for the subject
      subject.usePercentageMode = true;
      // Define the expected CSS mask string with percentages
      var cssMaskString = 'polygon(2% 1%, 0 7%, 8% 8%)';
      // Spy on the attribute method of the DOM simulator (should not be called)
      var attributeMonitor = mockingLib.monitor(domSimulator, "attribute");

      // Execute the Webkit mask generation method
      subject._generateWebkitMask([
        [2, 1],
        [0, 7],
        [8, 8]
      ]);

      // Assert the attribute method was NOT called
      assert(attributeMonitor.wasCalledOnce).is.equalTo(false);
      // Assert the target element's style was updated with the Webkit property
      assert(targetElement.applyStyle.withSpecificArgs('-webkit-clip-path', cssMaskString).wasCalledOnce).is.equalTo(true);
    });

  });

});