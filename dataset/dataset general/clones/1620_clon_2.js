//  Test runner setup
//  Produced on Monday, 2023-10-27 10:00:00 UTC


//  Root directory for resolving assets and ignoring certain items
rootDir = '';


//  Collection of scripts and patterns to include for execution
assetList = [
    SPEC_FRAMEWORK,
    SPEC_ADAPTER,
    'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
    'http://code.angularjs.org/1.1.5/angular.min.js',
    'http://code.angularjs.org/1.1.5/angular-mocks.js',
    'src/**/*.js',
    'test/**/*Spec.js'
];


//  Items that should not be included
ignoreList = [];


//  Format for displaying verification outcomes
//  Acceptable options: 'points', 'status', 'xml_report'
outputFormats = ['status'];


//  Network listener port for the host
serverPort = 9876;


//  Command-line interface execution port
execPort = 9100;


//  Activate / deactivate colored text in console output (reports and messages)
useColors = true;


//  Verbosity level for system messages
//  Valid settings: LEVEL_OFF || LEVEL_CRITICAL || LEVEL_WARNING || LEVEL_NORMAL || LEVEL_VERBOSE
reportingLevel = LEVEL_NORMAL;


//  Toggle automatic file monitoring and re-running checks on modifications
monitorChanges = true;


//  Initiate these web agents, presently supported:
//  - Chromium
//  - ChromiumDev
//  - FirefoxQuantum
//  - OperaBrowser
//  - AppleSafari (macOS only)
//  - HeadlessBrowser
//  - InternetExplorer (Windows only)
targetBrowsers = ['HeadlessBrowser'];


//  Should a web agent fail to connect within the specified duration [milliseconds], terminate it
captureWaitTime = 60000;


//  Automated build system configuration
//  When enabled, it will launch web agents, execute verifications, and then terminate
continuousIntegrationMode = false;