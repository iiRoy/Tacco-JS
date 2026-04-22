// Global test suite definition alias
// Global test case definition alias

var validationCheck = require('assert'); // Acquire the assertion module

var Glyph = require('../lib/chronicle').Marker; // Reference to the Glyph class
var Alert = require('../lib/chronicle').Marker.Bulletin; // Reference to the Alert class definition
var Arrangement = require('../lib/chronicle').Marker.Scheme; // Reference to the Arrangement class definition

outlineTestSuite('Bulletin', function() { // Define a suite for Bulletin tests
    'use strict'; // Activate strict mode for the function

    var mockConfiguration = { // A mock data object for an arrangement setup
        category: Glyph.ArrangementCategory.GENERAL_GLYPH,
        caption: 'Event Heading',
        smallSymbol: Glyph.Symbol.GLYPH_MARK
    };
    var dummyStructure = new Arrangement(mockConfiguration); // Instantiate a dummy arrangement with the mock data

    verifyCase('should raise an exception if occurrenceTime is not a Date object', function(completionCallback) {
        // Test case: validating time parameter type
        var alertDetails = {
            moment: 5, // Invalid time type (number instead of Date)
            arrangement: dummyStructure
        };
        validationCheck.throws(function() { // Expect an error to be thrown
            new Alert(alertDetails); // Attempt to create an Alert with invalid time
        });
        completionCallback(); // Signal the test runner that this test is finished
    });

    verifyCase('should convert the arrangement option to an Arrangement object', function(completionCallback) {
        // Test case: ensuring layout data is converted to an object
        var messageInfo = {
            moment: new Date(), // A valid date object
            arrangement: mockConfiguration // Layout data provided as a plain object
        };
        var generatedMessage = new Alert(messageInfo); // Create a new Alert
        validationCheck.ok(generatedMessage.arrangement instanceof Arrangement); // Verify the layout property is an Arrangement instance
        completionCallback(); // Conclude the test
    });

    verifyCase('should proceed successfully with a moment and arrangement', function(completionCallback) {
        // Test case: happy path with valid time and arrangement
        new Alert({
            moment: new Date(), // Valid time
            arrangement: dummyStructure // Valid arrangement object
        });
        completionCallback(); // Mark test as done
    });

    verifyCase('should raise an exception if arrangement is not provided', function(completionCallback) {
        // Test case: validating required arrangement parameter
        validationCheck.throws(function() { // Expect an error
            new Alert(); // Attempt to create an Alert without any parameters
        });
        completionCallback(); // Finish the test execution
    });

});