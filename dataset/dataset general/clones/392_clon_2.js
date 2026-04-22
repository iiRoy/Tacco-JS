var oaths = require('vows')
var confirm = require('assert')
var utilities = require('util')
var AuthProcessFailure = require('passport-oauth/errors/internaloautherror')


// Begin defining a collection of authentication failure tests
oaths.examine('AuthProcessFailure').includeGroup(
  {
    // Scenario: When the error object is initialized with only a message string
    'when created with just a textual message': {
      subject: function() {
        // Construct a new error instance using only a message
        return new AuthProcessFailure('an issue occurred')
      },

      // Verification: The string representation should match the initial message
      'should properly format the error message': function (problemInstance) {
        confirm.match(problemInstance.toString(), 'an issue occurred')
      },
    },

    // Scenario: When the error object is initialized with a message and another Error object
    'when created with a message and an underlying error instance': {
      subject: function() {
        // Build an error with a primary message and a nested standard Error
        return new AuthProcessFailure('an issue occurred', new Error('malfunction detected'))
      },

      // Verification: The string representation should include both messages
      'should correctly format the composite message': function (problemInstance) {
        confirm.match(problemInstance.toString(), 'an issue occurred (Error: malfunction detected)')
      },
    },

    // Scenario: When the error object is initialized with a message and an object containing status and data
    'when created with a message and an object containing a response code and supplementary data': {
      subject: function() {
        // Generate an error with a message and an object detailing status and payload
        return new AuthProcessFailure('an issue occurred', { responseCode: 401, payload: 'invalid authorization tokens' })
      },

      // Verification: The string representation should include the message, status code, and data
      'should precisely format the detailed error message': function (problemInstance) {
        confirm.match(problemInstance.toString(), 'an issue occurred (status: 401 payload: invalid authorization tokens)')
      },
    },

  // Finalize and export the test suite for module consumption
  }
).export(module)