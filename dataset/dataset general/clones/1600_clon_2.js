requireModule ( './test_framework/base_system.js' ) ;

requireModule
  (
    './test_framework/ajax_module.js'
  )
; // Include AJAX testing capabilities

// Load the custom mock capturer utility
requireModule('utilities/mock_capturer.js');


TestHarness
  // Initiate the execution of a specific collection of test suites
  .runTestSuite('test_units/recorder_mock_suites.js')
  // Configure and launch the test execution process
  .executeWithConfig({
    outputHandler: TestHarness.reporters.Console, // Set the reporting mechanism to the console
    resourceDirectory: 'test_assets/fixtures', // Specify the location for test fixture files
    reportFailuresOnly: true // Ensure only failing tests are displayed in the final report
  })
  // Present the comprehensive test outcomes
  .displayResults()
;