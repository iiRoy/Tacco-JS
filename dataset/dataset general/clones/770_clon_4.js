var secureRandomEngine = require('crypto');

function checkEquality(firstOperand, secondOperand, detailMessage) {
  if (firstOperand !== secondOperand) {
    throw new Error(`Verification Failed: ${detailMessage || ''} Expected: ${secondOperand}, Actual: ${firstOperand}`);
  }
}

function checkExclusion(sourceString, forbiddenChar, detailMessage) {
  if (sourceString.includes(forbiddenChar)) {
    throw new Error(`Verification Failed: ${detailMessage || ''} String contains forbidden character: '${forbiddenChar}'`);
  }
}

function checkCondition(booleanExpression, detailMessage) {
  if (!booleanExpression) {
    throw new Error(`Verification Failed: ${detailMessage || ''} Condition was false.`);
  }
}

var testHarness = (function() {
  var suiteHooks = {
    beforeEachSuite: [],
    afterEachSuite: []
  };

  async function performTestAssertion(testDescription, testFunction) {
    let testSuccess = false;
    let failureDetail = null;
    try {
      // Handle async tests (promises or callbacks with 'completion')
      let completionResolver;
      const completionPromise = new Promise(resolve => { completionResolver = resolve; });
      let hasCompletionBeenInvoked = false;
      const completion = (errorParam) => {
        if (hasCompletionBeenInvoked) {
          console.warn(`    WARNING: 'completion()' invoked multiple times for "${testDescription}"`);
          return;
        }
        hasCompletionBeenInvoked = true;
        if (errorParam) {
          failureDetail = errorParam;
          completionResolver();
        } else {
          completionResolver();
        }
      };

      const operationResult = testFunction(completion);

      if (operationResult && typeof operationResult.then === 'function') { // Test returns a Promise
        await operationResult;
      } else if (testFunction.length > 0) { // Test takes 'completion' argument, so wait for it
        await completionPromise;
        if (failureDetail) throw failureDetail; // Propagate error from completion()
      }
      // If testFunction takes no args and doesn't return promise, it's sync and already done.
      testSuccess = true;
      console.log(`    ✓ ${testDescription}`);
    } catch (error) {
      failureDetail = error;
      console.error(`    ✗ ${testDescription}`);
      console.error(error);
      testSuccess = false;
    }
    return testSuccess;
  }

  return {
    establishTestSuite: async function(suiteHeading, suiteDefinitionFunction) {
      console.log(`\n  ${suiteHeading}`);
      
      // Store parent hooks to restore after this suite's execution
      const parentHooks = {
        beforeEachSuite: [...suiteHooks.beforeEachSuite],
        afterEachSuite: [...suiteHooks.afterEachSuite]
      };
      // Reset hooks for the current suite context
      suiteHooks = { beforeEachSuite: [], afterEachSuite: [] };

      // Execute suite-level 'before' hooks
      for (const hook of parentHooks.beforeEachSuite) {
        try {
          await hook();
        } catch (e) {
          console.error(`  Suite setup failure for "${suiteHeading}":`);
          console.error(e);
          process.exit(1);
        }
      }

      // Execute the function that defines test cases and potentially nested suites
      await suiteDefinitionFunction();

      // Execute suite-level 'after' hooks
      for (const hook of parentHooks.afterEachSuite) {
        try {
          await hook();
        } catch (e) {
          console.error(`  Suite teardown failure for "${suiteHeading}":`);
          console.error(e);
          process.exit(1);
        }
      }

      // Restore parent hooks
      suiteHooks = parentHooks;
    },
    defineTestCase: async function(caseHeading, caseFunction) {
      await performTestAssertion(caseHeading, caseFunction);
    },
    beforeEachSuite: function(hookFunction) {
      suiteHooks.beforeEachSuite.push(hookFunction);
    },
    afterEachSuite: function(hookFunction) {
      suiteHooks.afterEachSuite.push(hookFunction);
    }
  };
})();


var entropySource = {
  isOperational: true,
  obtain: function(quantity, completionHandler) {
    if (entropySource.isOperational === false) {
      var problem = new Error('FATAL:23072072:security library:RNG_GET_BYTES:entropy source not ready');
      if (completionHandler) {
        completionHandler(problem);
        return;
      } else {
        throw problem;
      }
    }

    if (completionHandler) {
      secureRandomEngine.randomBytes(quantity, completionHandler);
    } else {
      return secureRandomEngine.randomBytes(quantity);
    }
  }
};

function constructIdentifierGenerator(entropyDependency) {

  function transformToWebFormat(bytePayload) {
    let standardEncoding = bytePayload.toString('base64');
    standardEncoding = standardEncoding.replace(/\+/g, '-');
    standardEncoding = standardEncoding.replace(/\//g, '_');
    standardEncoding = standardEncoding.replace(/=/g, '');
    return standardEncoding;
  }

  function generateAsync(dataAmount, resultRecipient) {
    if (typeof resultRecipient === 'function') {
      entropyDependency.obtain(dataAmount, function(issue, rawData) {
        if (issue) return resultRecipient(issue);
        resultRecipient(null, transformToWebFormat(rawData));
      });
    } else {
      return new Promise((resolve, reject) => {
        entropyDependency.obtain(dataAmount, function(issue, rawData) {
          if (issue) return reject(issue);
          resolve(transformToWebFormat(rawData));
        });
      });
    }
  }

  generateAsync.synchronous = function(dataAmount) {
    const rawData = entropyDependency.obtain(dataAmount);
    return transformToWebFormat(rawData);
  };

  return generateAsync;
}

var idProducer = constructIdentifierGenerator(entropySource);

(async () => { // Wrap in an async IIFE to allow awaiting test suites
  await testHarness.establishTestSuite('Unique Identifier Creation', async function () {
    await testHarness.establishTestSuite('asynchronous creation', async function () {
      await testHarness.defineTestCase('should yield an identifier of appropriate character count', function () {
        return idProducer(18).then(function (resultValue) {
          checkEquality(24, Buffer.byteLength(resultValue));
        });
      });

      await testHarness.defineTestCase('should not incorporate forbidden characters like "+", "/", or "="', function () {
        return idProducer(100000).then(function (resultValue) {
          checkExclusion(resultValue, '+');
          checkExclusion(resultValue, '/');
          checkExclusion(resultValue, '=');
        });
      });

      await testHarness.defineTestCase('should accommodate callback functions', function (completion) {
        idProducer(1000000, function (problem, resultValue) {
          if (problem) return completion(problem);
          checkExclusion(resultValue, '+');
          checkExclusion(resultValue, '/');
          checkExclusion(resultValue, '=');
          completion();
        });
      });

      await testHarness.establishTestSuite('when entropy source is not ready', async function () {
        testHarness.beforeEachSuite(function () {
          entropySource.isOperational = false;
        });

        testHarness.afterEachSuite(function () {
          entropySource.isOperational = true;
        });

        await testHarness.defineTestCase('should still attempt to generate identifier', function (completion) {
          idProducer(18, function (problem, resultValue) {
            if (problem) {
              checkCondition(problem instanceof Error, "Expected an error object");
              completion();
              return;
            }
            completion(new Error("Expected an error but received a value"));
          });
        });
      });
    });

    await testHarness.establishTestSuite('synchronous creation', async function () {
      await testHarness.defineTestCase('should yield an identifier of appropriate character count', function () {
        var resultValue = idProducer.synchronous(18);
        checkEquality(24, Buffer.byteLength(resultValue));
      });

      await testHarness.defineTestCase('should not incorporate forbidden characters like "+", "/", or "="', function () {
        var resultValue = idProducer.synchronous(100000);
        checkExclusion(resultValue, '+');
        checkExclusion(resultValue, '/');
        checkExclusion(resultValue, '=');
      });

      await testHarness.establishTestSuite('when entropy source is not ready', async function () {
        testHarness.beforeEachSuite(function () {
          entropySource.isOperational = false;
        });

        testHarness.afterEachSuite(function () {
          entropySource.isOperational = true;
        });

        await testHarness.defineTestCase('should still attempt to generate identifier', function () {
          let caughtError = null;
          try {
            idProducer.synchronous(18);
          } catch (e) {
            caughtError = e;
          }
          checkCondition(caughtError instanceof Error, "Expected an error to be thrown synchronously");
        });
      });
    });
  });
})();