rootDirectory = '../../../..//'; /* Base path for project assets */

scriptAssets =
[
  SPEC_ENGINE_MAIN,
  SPEC_ENGINE_ADAPTER,
  './source/web/js/angular.js',
  './source/web/js/angular-resource.js',
  './source/web/js/application.js', // Main application script
  './test/js/library/**/*.js',
  './test/js/unit_tests/**/*.js'
];

targetBrowsers = [ 'Google Chrome' ]; // Browsers for test execution

outputHandlers =
[
  'verbose',
  'notification' // Output reporting mechanisms
];

monitorChanges = true; // Enable automatic file watching

oneTimeExecution = false; /* Disable single-run mode */