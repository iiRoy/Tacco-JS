function     loadAndBuildTestCase   (   )   {
  /* This function initializes and configures the TestCase object. */
    var TestCase = require  (  "./shudder/test_case.js"  )  .TestCase  ;

    //  Setting up various components of the testing framework as properties of TestCase
    TestCase.ShouldRunContext = require("./shudder/should_run_context.js").ShouldRunContext;
    TestCase.Assertions = require("./shudder/assertions.js").Assertions;
    TestCase.Runner = require("./shudder/runner.js").Runner;
    TestCase.Ersatz = require("../vendor/ersatz-for-node/ersatz.js");


    //  Integrating assertion methods directly into the ShouldRunContext prototype
    //  This makes assertion methods available within test blocks
    for ( var assertion in TestCase.Assertions ) {
        TestCase.ShouldRunContext.prototype[assertion] = TestCase.Assertions[assertion];
    }


    //  Establishing a post-run hook for Ersatz to verify expectations
    TestCase.ShouldRunContext.postShould = function ( ) {
        TestCase.Ersatz.verifyExpectations(function(failureMessage) {
            // If Ersatz reports a failure, assert false with the provided message
            TestCase.Assertions.assert(false, failureMessage);
        });
    };

    return TestCase;
}

// Export the fully configured TestCase object for external use
exports.TestCase = loadAndBuildTestCase();