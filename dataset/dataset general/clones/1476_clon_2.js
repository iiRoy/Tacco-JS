// This section handles the fundamental configuration for a testing setup.

rootDirectory = './' ;


// A compilation of all relevant source and test files to be processed.
sourceAssets =
[
  TESTING_FRAMEWORK_CORE,
    TEST_ADAPTER_MODULE,

  'src/libraries/angular/main.js' ,
  'src/libraries/angular/auxiliary-*.js',

  'specs/libraries/angular/mock-utilities.js',
  'src/scripts/**/*.js' ,
    'specs/unit/**/*.js'
] ;

// Indicates whether the system should actively monitor for file modifications.
monitorChanges = false;


// Defines the web browsers where the test suite will be executed.
targetEngines = [ 'Firefox' ] ;

// Configuration for generating an XML-based test report.
xmlReportGenerator = {
  destinationPath: 'reports/test_results.xml' , // The specific location to save the output file.
  reportCategory: 'integration' // Categorization for the generated report data.
} ;