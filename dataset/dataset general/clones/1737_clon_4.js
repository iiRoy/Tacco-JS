import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { expect as assertionEngine } from 'chai';
import { stub as mockingAgentStub } from 'sinon';
import httpAgent from 'supertest';
import serverControl from '../'; // The module under test
import * as utilityLogger from 'gulp-util'; // Renamed gutil

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

// Custom logger to capture calls to utilityLogger.log
const customLogCatcher = {
  capturedMessages: [],
  recordEntry: function(...args) {
    this.capturedMessages.push(args);
  },
  clearRecords: function() {
    this.capturedMessages = [];
  },
  retrieveLastRecord: function() {
    return this.capturedMessages[this.capturedMessages.length - 1];
  },
  getRecordCount: function() {
    return this.capturedMessages.length;
  }
};

// Replace utilityLogger.log with our custom mock
let logInterceptor = null;
const activateLogInterceptor = () => {
  logInterceptor = mockingAgentStub(utilityLogger, 'log', customLogCatcher.recordEntry);
};
const deactivateLogInterceptor = () => {
  if (logInterceptor) {
    logInterceptor.restore();
    logInterceptor = null;
  }
};

const serverEndpoint = 'http://localhost:1337';

// Custom Test Suite Orchestrator Class
class TestSuiteOrchestrator {
  constructor(suiteLabel) {
    this.suiteLabel = suiteLabel;
    this.testFunctions = [];
    this.globalSetup = null;
    this.perTestTeardown = null;
  }

  setGlobalSetup(func) {
    this.globalSetup = func;
  }

  setPerTestTeardown(func) {
    this.perTestTeardown = func;
  }

  registerTest(description, testImplementation) {
    this.testFunctions.push({ description, testImplementation });
  }

  async commenceExecution() {
    console.log(`\nInitiating Test Suite: ${this.suiteLabel}`);
    if (this.globalSetup) {
      await this.globalSetup();
    }

    for (const currentTest of this.testFunctions) {
      console.log(`  Executing: ${currentTest.description}`);
      try {
        await currentTest.testImplementation();
        console.log(`    ☑ Passed`);
      } catch (failureReport) {
        console.error(`    ☒ Failed: ${failureReport.message}`);
        console.error(failureReport.stack);
        process.exit(1); // Terminate on first test failure
      } finally {
        if (this.perTestTeardown) {
          await this.perTestTeardown();
        }
      }
    }
    console.log(`Completed Test Suite: ${this.suiteLabel}\n`);
  }
}

const testOrchestrator = new TestSuiteOrchestrator('Server Runtime Verification');

testOrchestrator.setGlobalSetup(async () => {
  activateLogInterceptor();
});

testOrchestrator.setPerTestTeardown(async () => {
  // Wrap serverControl.reset in a Promise to use async/await
  await new Promise(resolve => serverControl.reset(resolve));
  customLogCatcher.clearRecords();
});

// Helper to register an asynchronous test that uses a done-style callback internally
const declareAsyncTest = (description, testLogic) => {
  testOrchestrator.registerTest(description, async () => {
    return new Promise((resolve, reject) => {
      testLogic(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// --- Test Implementations ---

declareAsyncTest('should bring up the server', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-no-message'
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.child.connected).to.be.true;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server listening/);
    httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
  });
});


declareAsyncTest('should bring up server with message verification', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.child.connected).to.be.true;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server listening/);
    httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
  });
});


declareAsyncTest('should bring up server by message verification only', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
    delay: 0
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.child.connected).to.be.true;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server listening/);
    httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
  });
});


declareAsyncTest('should bring up the express server', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-express',
    delay: 1200
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.child.connected).to.be.true;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server listening/);
    httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
  });
});


declareAsyncTest('should apply harmony flags', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
    execArgv: ['--harmony']
  };

  serverControl.listen(launchOptions, () => {
    assertionEngine(serverControl.options.execArgv).to.eql(launchOptions.execArgv);
    signalCompletion();
  });
});


declareAsyncTest('should apply debug flags', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-no-message',
    execArgv: ['--debug']
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.child.connected).to.be.true;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server listening/);
    httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
  });
});


declareAsyncTest('should apply custom arguments', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-args-check',
    args: ['param-1', 'param-2']
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.not.exist;
    assertionEngine(serverControl.options.args).to.eql(launchOptions.args);
    signalCompletion();
  });
});


declareAsyncTest('should apply custom environment variables', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
    env: { NODE_ENV: 'production', PORT: 1338 }
  };

  serverControl.listen(launchOptions, () => {
    assertionEngine(serverControl.options.env.NODE_ENV).to.eql(launchOptions.env.NODE_ENV);
    assertionEngine(serverControl.options.env.PORT).to.eql(launchOptions.env.PORT);
    signalCompletion();
  });
});


declareAsyncTest('should include default environment variables', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };
  const combinedEnvironment = { NODE_ENV: 'development', ...process.env };

  serverControl.listen(launchOptions, () => {
    assertionEngine(serverControl.options.env).to.eql(combinedEnvironment);
    signalCompletion();
  });
});


declareAsyncTest('should bring up server with specified delay', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-no-message',
    delay: 50
  };
  const initialTimestamp = Date.now();

  serverControl.listen(launchOptions, () => {
    const elapsedDuration = Date.now() - initialTimestamp;

    assertionEngine(elapsedDuration).to.be.within(50, 80);
    assertionEngine(serverControl.options.delay).to.eql(launchOptions.delay);
    signalCompletion();
  });
});


testOrchestrator.registerTest('should throw an exception when path option is missing', async () => {
  let exceptionCaught = false;
  try {
    serverControl.listen({});
  } catch (failureReport) {
    exceptionCaught = true;
    assertionEngine(failureReport).to.exist;
  }
  assertionEngine(exceptionCaught).to.be.true;
});


declareAsyncTest('should report an error if the server process is faulty', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app-broken'
  };

  serverControl.listen(launchOptions, (failureReport) => {
    assertionEngine(failureReport).to.exist;
    assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server has error/);
    signalCompletion();
  });
});


declareAsyncTest('should gracefully re-launch the server', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    const originalProcessId = serverControl.child.pid;

    serverControl.restart((failureReport) => {
      assertionEngine(failureReport).to.not.exist;
      assertionEngine(serverControl.child.connected).to.be.true;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(4);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was restarted/);
      assertionEngine(serverControl.child.pid).to.not.eql(originalProcessId);
      httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
    });
  });
});


declareAsyncTest('should re-launch the server via a simulated data stream', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
  };
  const mockFile = new utilityLogger.File({
    base: currentDirectory + '/test/apps/',
    cwd: currentDirectory,
    path: currentDirectory + '/test/apps/app.js'
  });
  const processingStream = serverControl(); // Assuming serverControl() returns a stream

  serverControl.listen(launchOptions, () => {
    const originalProcessId = serverControl.child.pid;

    const streamProcessingPromise = new Promise(resolve => {
      processingStream.once('data', () => {
        resolve();
      });
      processingStream.write(mockFile);
    });

    streamProcessingPromise.then(() => {
      assertionEngine(serverControl.child.connected).to.be.true;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(4);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was restarted/);
      assertionEngine(serverControl.child.pid).to.not.eql(originalProcessId);
      httpAgent(serverEndpoint).get('/').expect(200).end(signalCompletion);
    });
  });
});


declareAsyncTest('should handle multiple restart requests gracefully', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    const originalProcessId = serverControl.child.pid;

    const firstRestart = new Promise(resolve => {
      serverControl.restart(() => {
        assertionEngine(serverControl.child.connected).to.be.true;
        assertionEngine(serverControl.child.pid).to.not.eql(originalProcessId);
        resolve();
      });
    });

    const secondRestart = new Promise(resolve => {
      serverControl.restart((failureReport) => {
        assertionEngine(failureReport).to.match(/already received restart requests/);
        resolve();
      });
    });

    Promise.all([firstRestart, secondRestart]).then(() => signalCompletion());
  });
});


declareAsyncTest('should report an error if listen is invoked multiple times', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    const originalProcessId = serverControl.child.pid;

    serverControl.listen(launchOptions, (failureReport) => {
      assertionEngine(serverControl.child.connected).to.be.true;
      assertionEngine(serverControl.child.pid).to.eql(originalProcessId);
      assertionEngine(failureReport).to.match(/already started/);
      signalCompletion();
    });
  });
});


declareAsyncTest('should report an error if kill is invoked multiple times', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    serverControl.kill(() => {
      serverControl.kill((failureReport) => {
        assertionEngine(serverControl.child).to.be.null;
        assertionEngine(failureReport).to.match(/already stopped/);
        signalCompletion();
      });
    });
  });
});


testOrchestrator.registerTest('should throw an exception when restart is called before listen', async () => {
  let exceptionCaught = false;
  try {
    serverControl.restart();
  } catch (failureReport) {
    exceptionCaught = true;
    assertionEngine(failureReport).to.exist;
  }
  assertionEngine(exceptionCaught).to.be.true;
});


declareAsyncTest('should terminate the running server', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    serverControl.kill((failureReport) => {
      assertionEngine(failureReport).to.not.exist;
      assertionEngine(serverControl.child).to.be.null;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(2);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was stopped/);
      signalCompletion();
    });
  });
});


declareAsyncTest('should terminate server using explicit SIGTERM signal', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app'
  };

  serverControl.listen(launchOptions, () => {
    serverControl.kill('SIGTERM', (failureReport) => {
      assertionEngine(failureReport).to.not.exist;
      assertionEngine(serverControl.child).to.be.null;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(2);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was stopped/);
      signalCompletion();
    });
  });
});


declareAsyncTest('should terminate server using configured killSignal: SIGTERM', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
    killSignal: 'SIGTERM'
  };

  serverControl.listen(launchOptions, () => {
    assertionEngine(serverControl.options.killSignal).to.eql(launchOptions.killSignal);

    serverControl.kill((failureReport) => {
      assertionEngine(failureReport).to.not.exist;
      assertionEngine(serverControl.child).to.be.null;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(2);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was stopped/);
      signalCompletion();
    });
  });
});


declareAsyncTest('should reset the server configuration and state', async (signalCompletion) => {
  const launchOptions = {
    path: 'test/apps/app',
    temporaryKey: true
  };

  serverControl.listen(launchOptions, () => {
    assertionEngine(launchOptions).to.have.property('temporaryKey');

    serverControl.reset((failureReport) => {
      assertionEngine(failureReport).to.not.exist;
      assertionEngine(serverControl.options).to.not.have.property('temporaryKey');
      assertionEngine(serverControl.child).to.be.null;
      assertionEngine(customLogCatcher.getRecordCount()).to.eql(2);
      assertionEngine(customLogCatcher.retrieveLastRecord()[0]).to.match(/server was stopped/);
      signalCompletion();
    });
  });
});

// Execute all registered tests
testOrchestrator.commenceExecution();