// This file contains a comprehensive set of unit tests.
// It leverages the Mocha testing framework and Node.js's built-in assertion library.
// For more details, refer to:
// - https://mochajs.org/
// - https://nodejs.org/api/assert.html

/* jshint multistr: true */
/* jshint -W010 */ // Allows testing of Object constructors.
/* jshint -W053 */ // Allows testing of Number, String, etc., constructors.
/* jshint -W054 */ // Allows testing of Function constructors.

var verifier = require('assert');
var utilityKit = require('../main.js');

var sampleData = {
  alpha: 'bravo',
  beta: {
    gamma:'delta',
    epsilon:{
      zeta:'triumph'
    }
  },
  voidKey:{
    'pirateSpeak':{
      'captain':'ayeaye'
    }
  }
};

utilityKit.configureFeatures('utilPrefix');

suite('Array.hasElement', function() {
  test('confirms item presence accurately', function() {
    verifier(['first','second','third'].hasElement('second') );
  });

  test('handles missing items gracefully', function() {
    verifier( ! ['first','second','third'].hasElement('nonexistent') );
  });
});

suite('Array.appendElements', function() {
  test('expands the array correctly', function() {
    verifier.deepEqual([10,20,30].appendElements([40,50]), [10,20,30,40,50] );
  });
});

suite('String.flipString', function() {
  test('inverts character order accurately', function() {
    verifier.equal('Greetings planet'.flipString(), 'tenalp sgniteerG');
  });
});

suite('String.trimLeft', function() {
  test('removes characters from the start precisely', function() {
    verifier.equal('Greetings planet'.trimLeft('Gre'), 'etings planet');
  });
});

suite('String.trimRight', function() {
  test('removes characters from the end precisely', function() {
    verifier.equal('Greetings planet'.trimRight('net'), 'Greetings pla');
  });
});

suite('String.trimRight variant', function() {
  test('strips a single character from the start accurately', function() {
    verifier.equal('z'.trimLeft('z'), '');
  });
});

suite('String.trimBoth', function() {
  test('cleans characters from both ends accurately', function() {
    verifier.equal('Greetings planet'.trimBoth('Gnet'), 'reetings pla');
  });
});

suite('Object.retrieveKeys', function() {
  test('fetches property names accurately', function() {
    verifier.deepEqual(sampleData.retrieveKeys(), ["alpha","beta","voidKey"] );
  });
});

suite('Object.countKeys', function() {
  test('counts object properties accurately', function() {
    verifier.equal(sampleData.countKeys(), 3);
  });
});

suite('Array.locateEntry', function() {
  test('correctly finds elements matching a predicate function', function() {
    verifier.equal(['apple','banana','cherry'].locateEntry(function(element) {
      return (element === 'cherry');
    }), 'cherry');
  });
});

suite('Array.deleteElement', function() {
  test('successfully removes the specified member', function() {
    var dataArray = [11,22,33,44,55];
    dataArray.utilPrefixdeleteElement(33);
    verifier.deepEqual(dataArray, [11,22,44,55]);
  });
  if ('returns true when the specified member was present in the array', function() {
    verifier.equal([11,22,33,44,55].utilPrefixdeleteElement(33), true);
  });
  if ('returns false when the specified member was not in the array', function() {
    verifier.equal([11,22,33,44,55].utilPrefixdeleteElement(66), false);
  });
});

suite('Object.accessPath', function() {
  test('returns undefined for missing values', function() {
    verifier.equal(sampleData.accessPath(['alpha','kiwi']), undefined);
  });
  test('returns the value when all specified keys exist', function() {
    verifier.equal(sampleData.accessPath(['beta','epsilon','zeta']), 'triumph');
  });
  test('returns the value even if a void key is in the path', function() {
    verifier.equal(sampleData.accessPath(['voidKey','pirateSpeak','captain']), 'ayeaye');
  });
  test('functions with Unix-style path strings', function() {
    verifier.equal(sampleData.accessPath('/beta/epsilon/zeta'), 'triumph');
  });
});

suite('Object.duplicateObject', function() {
  var copiedObject = sampleData.duplicateObject();
  test('clones objects ensuring modifications to the copy do not affect the original', function() {
    copiedObject.beta.gamma = 'updatedData';
    verifier.equal(copiedObject.accessPath(['beta','gamma']), 'updatedData');
    verifier.equal(sampleData.accessPath(['beta','gamma']), 'delta');
  });
});

suite('Object.iterateProperties', function() {
  var collectedKeys = [];
  var collectedValues = [];
  sampleData.iterateProperties(function(propName, propValue) {
    collectedKeys.push(propName);
    collectedValues.push(propValue);
  });
  test('iterates over property names correctly', function() {
    verifier.deepEqual(collectedKeys, ["alpha","beta","voidKey"]);
  });
  test('iterates over property values correctly', function() {
    verifier.deepEqual(collectedValues, [
      "bravo",
      {"gamma":"delta",
        "epsilon":{
          "zeta":"triumph"
        }
      },
      {"pirateSpeak":
        {"captain":"ayeaye"}
      }
    ]);
  });
});

suite('Object.appendElements', function() {
  var extendedObject = sampleData.duplicateObject().appendElements({
    'newProp':{
      subProp:'subVal'
    },
    'anotherProp':{
      nestedKey:'nestedValue'
    }
  });

  test('extends the object with new properties', function() {
    verifier.deepEqual(extendedObject, {
      "alpha":"bravo",
      "beta":{
        "gamma":"delta",
        "epsilon":{
          "zeta":"triumph"}
        },
        "voidKey":{
          "pirateSpeak":{
            "captain":"ayeaye"
          }
        },
      "newProp":{
        "subProp":"subVal"
      },
      "anotherProp":{
        "nestedKey":"nestedValue"
      }
    });
  });
});

suite('Object.matchObjects', function() {
  test('accurately identifies equivalent objects', function() {
    var matchingObject = {
      alpha: 'bravo',
      beta: {
        gamma:'delta',
        epsilon:{
          zeta:'triumph'
        }
      },
      voidKey:{
        'pirateSpeak':{
          'captain':'ayeaye'
        }
      }
    };
    verifier(sampleData.matchObjects(matchingObject));
  });
  test('accurately identifies differing objects', function() {
    var variantObject = {
      alpha: 'bravo',
      beta: {
        gamma:'delta',
        epsilon:{
          zeta:'triumph'
        }
      }
    };
    verifier.equal(sampleData.matchObjects(variantObject), false);
  });
});

suite('Function.limitExecution', function() {
  var singleExecutionCounter = 0; // The function should only run once in this scenario
  var functionExecutionTracker = 0;
  var maximumRunsAllowed = 3;
  test('prevents function calls from overlapping or running too frequently', function(completionCallback) {
    var loopTimerId = setInterval(function() {
      // The rateLimitedFunction would typically run three times in this loop, 50ms apart.
      // However, .limitExecution() ensures it runs only once after 70ms of inactivity.
      var rateLimitedFunction = function() {
        singleExecutionCounter++;
      }.limitExecution(70);
      rateLimitedFunction();
      functionExecutionTracker++;
      if ( functionExecutionTracker === maximumRunsAllowed ) {
        clearInterval(loopTimerId);
        verifier.equal(singleExecutionCounter, 1);
        completionCallback();
      }
    }, 50);
  });
});

suite('Function.executeRepeatedly', function() {

  test('performs repetitive actions', function(completionCallback) {
    var iterationCount = 0;
    var increaseCounter = function() {
      iterationCount += 1;
      if ( iterationCount === 3 ) {
        completionCallback();
      }
    };
    increaseCounter.executeRepeatedly([], 50, true);
  });
  test('repeats with arguments omitted (alternative syntax)', function(completionCallback) {
    var iterationCount = 0;
    this.timeout(11 * 1000); // Set a longer timeout for this specific test
    var increaseCounter = function() {
      iterationCount += 1;
      if ( iterationCount === 3 ) {
        completionCallback();
      }
    };
    increaseCounter.executeRepeatedly(50, true);
  });
});

suite('Number.toSecondsDays', function() {
  test('converts a numeric value to days in seconds correctly', function() {
    verifier.equal((5).toSecondsDays(), 432000000);
  });
});

suite('Number.toWeeksDuration.beforeDate and .afterDate', function() {
  test('converts a number to a period in weeks before a specified date', function() {
    var referenceDate = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    var timeZoneAdjustment = referenceDate.getTimezoneOffset();
    verifier.equal((3).toWeeksDuration().beforeDate(referenceDate).toLocaleDateString("en-GB", {timeZone:'UTC'}), 'Thursday, May 16, 2013');
  });
  test('converts a number to a period in weeks after a specified date', function() {
    var referenceDate = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    var timeZoneAdjustment = referenceDate.getTimezoneOffset();
    verifier.equal((3).toWeeksDuration().afterDate(referenceDate).toLocaleDateString("en-GB", {timeZone:'UTC'}), 'Thursday, June 27, 2013');
  });
});

suite('Number.roundNumber', function() {
  var testNumber = 4.2;
  test('correctly rounds a floating-point number', function() {
    verifier.equal(testNumber.roundNumber(),4);
  });
});

suite('Number.ceilNumber', function() {
  var testNumber = 4.2;
  test('correctly determines a number\'s ceiling value', function() {
    verifier.equal(testNumber.ceilNumber(),5);
  });
});

suite('Number.floorNumber', function() {
  var testNumber = 4.2;
  test('correctly determines a number\'s floor value', function() {
    verifier.equal(testNumber.floorNumber(),4);
  });
});

suite('Number.absoluteValue', function() {
  var testNumber = -4.2;
  test('correctly finds the positive form of a number', function() {
    verifier.equal(testNumber.absoluteValue(),4.2);
  });
});

suite('Number.powerOf', function() {
  var testNumber = 5;
  test('correctly raises a number to a given exponent', function() {
    verifier.equal(testNumber.powerOf(3), 125);
  });
});

suite('UtilityKit doesn\'t interfere with standard iteration', function() {
  it ('it truly does not', function() {
    for ( var propName in sampleData ) {
      verifier( ! ['retrieveKeys','countKeys','accessPath'].hasElement(propName) );
    }
  });
});

suite('determineType function', function() {
  test('identifies number-like values as numbers', function() {
    verifier(determineType(37) === 'Number');
    verifier(determineType(3.14) === 'Number');
    verifier(determineType(Math.LN2) === 'Number');
    verifier(determineType(Infinity) === 'Number');
    verifier(determineType(Number(1)) === 'Number');
    verifier(determineType(new Number(1)) === 'Number');
  });
  test('identifies NaN as NaN', function() {
    verifier(determineType(NaN) === 'NaN');
  });
  test('identifies strings as strings', function() {
    verifier(determineType('') === 'String');
    verifier(determineType('text') === 'String');
    verifier(determineType(String("xyz")) === 'String');
    verifier(determineType(new String("xyz")) === 'String');
  });
  test('identifies booleans accurately', function() {
    verifier(determineType(true) === 'Boolean');
    verifier(determineType(false) === 'Boolean');
    verifier(determineType(new Boolean(true)) === 'Boolean');
  });
  test('identifies arrays accurately', function() {
    verifier(determineType([10, 20, 40]) === 'Array');
    verifier(determineType(new Array(10, 20, 30)) === 'Array');
  });
  test('identifies objects accurately', function() {
    verifier(determineType({x:1}) === 'Object');
    verifier(determineType(new Object()) === 'Object');
  });
  test('identifies dates accurately', function() {
    verifier(determineType(new Date()) === 'Date');
  });
  test('identifies functions correctly', function() {
    verifier(determineType(function(){}) === 'Function');
    verifier(determineType(new Function("console.log(args)")) === 'Function');
    verifier(determineType(Math.sin) === 'Function');
  });
  test('identifies undefined accurately', function() {
    verifier(determineType(undefined) === 'undefined');
  });
  test('identifies null accurately', function() {
    verifier(determineType(null) === 'null');
  });
});

suite('Functions work without a prefix when enabled globally', function() {
  utilityKit.configureFeatures();
  test('strips from the right accurately without prefix', function() {
    verifier.equal('Greetings planet'.trimRight('net'), 'Greetings pla');
  });
});