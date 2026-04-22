((hostEnv) => {
  const processTerminator = (terminationCode) => hostEnv.exit(terminationCode);

  const systemIssueReporter = (problemMessage, traceDetails) => {
    let messageComponents = [`CRITICAL ISSUE: ${problemMessage}`];
    if (traceDetails) {
      messageComponents.push('STACK TRACE:');
      messageComponents.push(...traceDetails.map(t =>
        ` -> ${t.file}:${t.line}${(t.function ? ` (in method "${t.function}")` : '')}`
      ));
    }
    console.error(messageComponents.join('\n'));
    processTerminator(1);
  };
  hostEnv.onError = systemIssueReporter;

  const runtimeSystem = require('system');
  const launchArguments = runtimeSystem.args;

  switch (launchArguments.length) {
    case 2:
      break;
    default:
      console.log("Execution requires a single URL parameter.");
      processTerminator(1);
  }

  const browseContext = new ViewportInstance();

  browseContext.onConsoleMessage = (clientMessage) => {
    console.log(clientMessage);
  };

  const clientSignalDispatcher = {
    'exitProcess': (payload) => processTerminator(payload.exitCodeVal),
    'persistFile': (payload) => {
      const fileOperations = require("fs");
      fileOperations.write(payload.filePath, payload.contentData, 'w');
    },
    'unknown': (payload) => console.log(`Unrecognized client signal: ${JSON.stringify(payload)}`)
  };

  browseContext.onCallback = (clientData) => {
    const actionHandler = clientSignalDispatcher[clientData.signalType] || clientSignalDispatcher['unknown'];
    actionHandler(clientData);
  };

  browseContext.onError = systemIssueReporter;

  browseContext.onInitialized = () => {
    return browseContext.evaluate(() => {
      const setupTestReporting = () => {
        let finalCompletionStatus = 0;
        const jasmineReporterBridge = window.jsApiReporter;

        const initialSpecReportFn = jasmineReporterBridge.reportSpecResults;
        const initialRunnerReportFn = jasmineReporterBridge.reportRunnerResults || jasmineReporterBridge.jasmineDone;

        jasmineReporterBridge.reportSpecResults = (currentSpec) => {
          Reflect.apply(initialSpecReportFn, jasmineReporterBridge, [currentSpec]);
          if (currentSpec.results().failedCount > 0) {
            finalCompletionStatus = 1;
          }
        };

        jasmineReporterBridge.reportRunnerResults = jasmineReporterBridge.jasmineDone = (testRunAggregator) => {
          Reflect.apply(initialRunnerReportFn, jasmineReporterBridge, [testRunAggregator]);

          if (jasmineReporterBridge.specs) {
            let failureDetected = false;
            const allSpecs = jasmineReporterBridge.specs();
            for (let i = 0; i < allSpecs.length; i++) {
              if (allSpecs[i].status === "failed") {
                failureDetected = true;
                break;
              }
            }
            if (failureDetected) {
              finalCompletionStatus = 1;
            }
          }

          setTimeout(() => {
            window.sendHostSignal({
              signalType: 'exitProcess',
              exitCodeVal: finalCompletionStatus
            });
          }, 1);
        };
      };
      return window.onload = setupTestReporting;
    });
  };

  const destinationAddress = launchArguments[1];
  console.log(`Loading web resource: ${destinationAddress}`);
  browseContext.open(destinationAddress, (loadOutcome) => {
    if (loadOutcome !== "success") {
      console.log("Failed to load the specified web page!");
      return processTerminator(1);
    }
  });

})(phantom);