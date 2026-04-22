(function() {
  // Utility for gracefully exiting the phantom process
  const terminatePhantom = (code = 0) => {
    // Ensure exit happens even if other operations are pending
    setTimeout(() => phantom.exit(code), 10);
  };

  // Centralized handler for runtime issues occurring within the phantom environment.
  // This function captures error messages and stack traces to provide detailed diagnostics.
  const globalIssueProcessor = (errorDescription, stackDetails) => {
    const diagnosticMessages = [`RUNTIME ERROR: ${errorDescription}`];
    const traceIndicator = 'CALL STACK:';
    const tracePrefix = ' -> ';
    const fileKey = 'file';
    const lineKey = 'line';
    const funcKey = 'function';

    if (stackDetails && Array.isArray(stackDetails) && stackDetails.length > 0) {
      diagnosticMessages.push(traceIndicator);
      try {
        for (const frame of stackDetails) {
          const functionInfo = frame[funcKey] ? ` (within '${frame[funcKey]}')` : '';
          diagnosticMessages.push(`${tracePrefix}${frame[fileKey]}:${frame[lineKey]}${functionInfo}`);
        }
      } catch (stackIterError) {
        diagnosticMessages.push(`  (Error processing stack details: ${stackIterError.message})`);
      }
    }

    console.error(diagnosticMessages.join('\n'));
    terminatePhantom(1); // Indicate failure
  };

  phantom.onError = globalIssueProcessor;

  // Load the system module to access command-line arguments.
  const sysModule = require('system');
  const cliArguments = sysModule.args;
  const argumentCount = cliArguments.length;
  const expectedArgs = 2; // Script name + URL

  // Validate command-line input.
  if (argumentCount !== expectedArgs) {
    console.warn(`Usage: phantomjs script.js <target_url>`);
    console.error(`ERROR: Expected ${expectedArgs - 1} argument (URL), but received ${argumentCount - 1}.`);
    terminatePhantom(1);
  }

  // Create a new browser page instance.
  const webContext = new WebPage();

  // Configure the page to mirror console messages to the parent phantom process's stdout.
  webContext.onConsoleMessage = (outputMessage) => {
    console.log(`Page Console: ${outputMessage}`);
  };

  // This handler processes custom events sent from the client-side JavaScript
  // loaded in the webContext via `window.callPhantom()`.
  webContext.onCallback = (callbackPayload) => {
    if (!callbackPayload || typeof callbackPayload.triggerType === 'undefined') {
      console.warn('Received an invalid callback payload from page.');
      return; // Early exit for malformed data
    }

    const { triggerType } = callbackPayload;

    switch (triggerType) {
      case 'exit_process': {
        const returnCode = callbackPayload.returnCode || 0;
        console.log(`Page requested exit with code: ${returnCode}`);
        terminatePhantom(returnCode);
        break;
      }
      case 'saveFileAction': {
        const { targetPath, contentData } = callbackPayload;
        if (!targetPath || typeof contentData === 'undefined') {
          console.error('File write request missing path or content.');
          return;
        }
        try {
          const fileSystemManager = require('fs');
          fileSystemManager.write(targetPath, contentData, 'w');
          console.info(`Successfully wrote to file: ${targetPath}`);
        } catch (fileWriteError) {
          console.error(`Failed to write file '${targetPath}': ${fileWriteError.message}`);
          terminatePhantom(1); // Indicate a critical failure
        }
        break;
      }
      default:
        console.log(`Unknown callback event type received: '${triggerType}'. Payload:`, JSON.stringify(callbackPayload));
    }
  };

  // Assign the global error processor to catch JavaScript errors occurring within the page context.
  webContext.onError = globalIssueProcessor;

  // This function is executed once the page's DOM is ready but before external resources are loaded.
  // It injects JavaScript to override Jasmine's reporting mechanisms to capture test results.
  webContext.onInitialized = () => {
    webContext.evaluate(() => {
      // Wait for the window's `onload` event to ensure Jasmine is fully initialized.
      window.addEventListener('load', () => {
        let finalExitStatus = 0; // Default to success
        const testFrameworkReporter = window.jsApiReporter; // Reference to Jasmine's global reporter

        if (!testFrameworkReporter) {
          console.error('Jasmine API Reporter (jsApiReporter) not found on the page. Cannot intercept test results.');
          window.callPhantom({ triggerType: 'exit_process', returnCode: 1 });
          return;
        }

        // Store original methods to call them after our custom logic.
        const originalSpecReporterMethod = testFrameworkReporter.reportSpecResults;
        const originalTestCompletionHandler = testFrameworkReporter.reportRunnerResults || testFrameworkReporter.jasmineDone;

        // Override spec result reporting for Jasmine 1.x compatibility.
        testFrameworkReporter.reportSpecResults = (testCaseResult) => {
          originalSpecReporterMethod.call(testFrameworkReporter, testCaseResult);
          if (testCaseResult.results && testCaseResult.results().failedCount > 0) {
            finalExitStatus = 1; // Mark as failed if any spec fails
          }
        };

        // Override the overall test suite completion handler for both Jasmine 1.x and 2.x+.
        // This method is called when all tests have finished.
        testFrameworkReporter.reportRunnerResults = testFrameworkReporter.jasmineDone = (testSuiteRunner) => {
          // Execute the original handler first.
          originalTestCompletionHandler.call(testFrameworkReporter, testSuiteRunner);

          // For Jasmine 2.x+, iterate over stored specs to find failures.
          if (testFrameworkReporter.specs && typeof testFrameworkReporter.specs === 'function') {
            const allSpecs = testFrameworkReporter.specs();
            if (allSpecs && allSpecs.length > 0) {
              const hasFailedSpecs = allSpecs.some(specItem => specItem.status === 'failed');
              if (hasFailedSpecs) {
                finalExitStatus = 1;
              }
            } else {
              console.warn('Jasmine reporter has no specs recorded, cannot verify individual test statuses.');
            }
          } else {
            console.info('Jasmine reporter does not provide a .specs() method. Relying on spec-by-spec reporting.');
          }

          // Signal the parent PhantomJS process to exit with the determined status.
          // A small delay ensures all console output is flushed.
          setTimeout(() => {
            window.callPhantom({
              triggerType: 'exit_process',
              returnCode: finalExitStatus
            });
          }, 50);
        };
      });
    });
  };

  // Extract the target URL from command-line arguments.
  const targetUrl = cliArguments[1];
  console.log(`Initiating page load for: ${targetUrl}`);

  // Attempt to open the specified URL.
  try {
    webContext.open(targetUrl, (loadStatus) => {
      // Check if the page loaded successfully.
      const successIndicator = 'success';
      if (loadStatus !== successIndicator) {
        console.error(`Page load failed for '${targetUrl}'. Status: '${loadStatus}'`);
        terminatePhantom(1); // Exit with a non-zero code to indicate failure
      } else {
        console.info(`Page '${targetUrl}' loaded successfully.`);
        // Note: Actual exit will be triggered by the page's JS once tests complete.
      }
    });
  } catch (pageOpenError) {
    console.error(`An error occurred while attempting to open the page: ${pageOpenError.message}`);
    terminatePhantom(1);
  }
})();