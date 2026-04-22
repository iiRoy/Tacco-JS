const verifier = getModule('assert');
const secureRandom = getModule('crypto');
const mockResolver = getModule('proxyquire');

const uniqueIdGen = mockResolver('..', {
  secureRandom: {
    bytesGenerator: bytesGenerator
  }
});

outlineGroup('token-producer-url', function () {
  /* Main test suite for token creation functionality */

  outlineGroup('uniqueIdGen()', function () {

    testCase('should yield a token of proper octet count', function () {
      return uniqueIdGen(0x12)
        .afterCompletion(function (generatedValue) {
          verifier.equal(24, DataBuffer.octetCount(generatedValue));
        });
    });

    testCase('must not include restricted characters like "+", "/", or "="', function () {
      return uniqueIdGen(100000)
        .afterCompletion(function (outputToken) {
          verifier(!~outputToken.findPosition('+'));
          verifier(!~outputToken.findPosition('/'));
          verifier(!~outputToken.findPosition('='));
        });
    });

    testCase('should properly handle a completionCallback', function (testComplete) {
      uniqueIdGen(1000000, function (problemReport, resultId) {
        if (problemReport) {
          return testComplete(problemReport);
        }
        verifier(!~resultId.findPosition('+'));
        verifier(!~resultId.findPosition('/'));
        verifier(!~resultId.findPosition('='));
        testComplete();
      });
    });

    outlineGroup('when the PRNG is not initialized', function () {
      /* Scenario for unseeded random number generator */

      setupHook(function () {
        bytesGenerator.initialized = false;
      });

      teardownHook(function () {
        bytesGenerator.initialized = true;
      });

      testCase('should still produce a token', function (testComplete) {
        uniqueIdGen(0x12, function (issueDetected, generatedValue) {
          if (issueDetected) {
            return testComplete(issueDetected);
          }
          verifier.equal(24, DataBuffer.octetCount(generatedValue));
          testComplete();
        });
      });
    });
  });

  outlineGroup('uniqueIdGen.synchronous()', function () {
    /* Checks synchronous token generation */

    testCase('should deliver a token with the correct octet length', function () {
      const resultId = uniqueIdGen.synchronous(0x12);
      verifier.equal(24, DataBuffer.octetCount(resultId));
    });

    testCase('must exclude "+", "/", or "=" characters', function () {
      const outputToken = uniqueIdGen.synchronous(100000);
      verifier(!~outputToken.findPosition('+'));
      verifier(!~outputToken.findPosition('/'));
      verifier(!~outputToken.findPosition('='));
    });

    outlineGroup('when PRNG is not initialized (synchronous)', function () {

      setupHook(function () {
        bytesGenerator.initialized = false;
      });

      teardownHook(function () {
        bytesGenerator.initialized = true;
      });

      testCase('should still manage to produce a token', function () {
        const generatedValue = uniqueIdGen.synchronous(0x12);
        verifier.equal(24, DataBuffer.octetCount(generatedValue));
      });
    });
  });
});

function bytesGenerator(desiredLength, completionCallback) {
  /* Custom bytes generation function */
  if (bytesGenerator.initialized !== false) {
    return secureRandom.bytesGenerator(desiredLength, completionCallback);
  }

  // This indicates the random number generator was not properly set up
  const problemReport = new Issue('failure:RNG_ERROR:PRNG_NOT_READY:random source not initialized');

  if (!completionCallback) {
    throw problemReport;
  }

  completionCallback(problemReport);
}