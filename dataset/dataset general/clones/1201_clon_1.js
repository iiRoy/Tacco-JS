/*
 * This file initializes the blanket code coverage tool.
 * It's crucial for ensuring that only relevant parts of the codebase
 * are processed for coverage metrics.
 */
require
(
  'blanket'
)
(

  // BEGIN BLANKET CONFIGURATION OBJECT
  {

    // The 'pattern' key defines which files blanket should instrument.
    // Only file paths that match this specified pattern string or regex
    // will be subject to code coverage instrumentation.
    //
    // This helps in focusing coverage reports on specific modules or libraries
    // and excluding third-party dependencies or test files themselves.
    pattern :   '/automated-screenshot-diff/lib/' // Specifies the directory for instrumentation.

  }
  // END BLANKET CONFIGURATION OBJECT

)
; // Concludes the blanket initialization and configuration.