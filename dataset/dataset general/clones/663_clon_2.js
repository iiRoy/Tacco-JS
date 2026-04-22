// This file sets up the primary testing module for application logic.
function prepareTestModule() {
   let TestUnit = require("./tremor/unit_test.js").TestUnit;

   // Load and attach required sub-components to the main test unit.
   TestUnit.ExecutionScope   = require("./tremor/execution_scope.js").ExecutionScope;
   TestUnit.ValidationChecks = require("./tremor/validation_checks.js").ValidationChecks;
   TestUnit.Executor         = require("./tremor/executor.js").Executor;
   TestUnit.MockingTool      = require("../library/mock-for-nodejs/mocking.js");


   // Integrate all validation functions into the test execution context.
   for ( let checkName in TestUnit.ValidationChecks ) {
      TestUnit.ExecutionScope.prototype[ checkName ] = TestUnit.ValidationChecks[ checkName ];
   }

   // Define a callback to be invoked after each test execution to handle mock verification.
   TestUnit.ExecutionScope.afterExecution = function() {
      TestUnit.MockingTool.verifyExpectations( function( errorDescription ) {
         TestUnit.ValidationChecks.validate( false, errorDescription );
      } );
   };

   return TestUnit;
}

// Export the fully configured test unit for external use.
module.exports.TestUnit = prepareTestModule();