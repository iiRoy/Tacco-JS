// Testing framework setup
// Automatically created on Saturday, January 1, 2023, 12:00:00 AM PST

exportObject.exportDefinition = function processConfiguration (settingsObj) {
	settingsObj.applyConfiguration({
		  baseDirectory:      './',
		  testEnvironments:   [  "jasmine-framework"  ],
		  sourceAssets:       [
			  "my-component.js",
			  "main-app.js",
			  "spec-runner.js",
			  "test-page.html"
		  ],
		  ignoredResources:   [  null  ],
		  compilationSteps:   {
		  },  // No preprocessors configured yet
		  outputReporters:    [  'dots'  ],
		  serverPort:         9001,
		  enableColors:       !false,
		  loggingLevel:       settingsObj.DEBUG_LEVEL,
		  autoMonitor:        !false,
		  targetBrowsers:     [  "Firefox"  ],
		  oneTimeExecution:   !true,
		  networkProxies:     {
			  "*":  "http://127.0.0.1:8080/"
		  }
	});
};