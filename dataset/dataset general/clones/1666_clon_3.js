const expect = require('assert').strict; // Modern assertion library with strict checks
const coreExtensions = require('./../utility-bundle.js'); // Our custom utility library

// This module contains a comprehensive suite of tests for the coreExtensions library.
// It leverages the Mocha testing framework and Node.js built-in assertion module.
// The tests are structured using 'describe' for test suites and 'it' for individual test cases.

/* eslint-disable no-unused-vars */ // Disabling specific linter rules for this test file
/* eslint-disable no-new-wrappers */ // Allows testing constructor-wrapped primitives
/* eslint-disable no-console */ // Allows console logs for debugging if needed

// Initialize the core utility library with a custom prefix 'cx'
coreExtensions.enablePrefix('cx');

/**
 * A complex data structure used for various object manipulation tests.
 * This dataset includes nested objects, a key with a hyphen, and a boolean property
 * to ensure robust utility functionality.
 */
const testDataSet = {
  alpha: 'bravo',
  charlie: {
    delta: 'echo',
    foxtrot: {
      golf: 'hotel'
    }
  },
  india: null, // A direct null value
  'juliett-kilo': {
    'lima': {
      'mike': 'november'
    }
  },
  oscar: true, // A boolean property
  papa: 123
};

// --- Array Extension Tests ---

describe('Array.cxincludes', () => {
  it('should accurately detect the presence of an element', () => {
    expect(['apple', 'banana', 'cherry'].cxincludes('banana')).to.be.true;
  });

  it('should correctly indicate when an element is absent', () => {
    expect(['apple', 'banana', 'cherry'].cxincludes('grape')).to.be.false;
  });

  it('should handle empty arrays correctly', () => {
    expect([].cxincludes('anything')).to.be.false;
  });
});

describe('Array.cxextend', () => {
  it('should correctly append new items to an existing array', () => {
    const initialArray = [10, 20, 30];
    const itemsToAdd = [40, 50];
    const extendedArray = initialArray.cxextend(itemsToAdd);
    expect(extendedArray).deepStrictEqual([10, 20, 30, 40, 50]);
  });

  it('should return a new array instance without modifying the original', () => {
    const original = [1, 2];
    const added = [3, 4];
    const result = original.cxextend(added);
    expect(result).not.to.equal(original);
    expect(original).deepStrictEqual([1, 2]); // Original array remains unchanged
  });
});

describe('Array.cxfindItem', () => {
  it('should successfully locate an item matching the provided predicate function', () => {
    const dataCollection = ['first', 'second', 'third'];
    const foundItem = dataCollection.cxfindItem(element => element === 'third');
    expect(foundItem).strictEqual('third');
  });

  it('should return undefined if no item matches the predicate', () => {
    const dataCollection = ['first', 'second', 'third'];
    const foundItem = dataCollection.cxfindItem(element => element === 'fourth');
    expect(foundItem).strictEqual(undefined);
  });
});

describe('Array.cxremove', () => {
  it('should correctly remove the specified member from the array', () => {
    let testArray = [1, 2, 3, 4, 5];
    testArray.cxremove(3);
    expect(testArray).deepStrictEqual([1, 2, 4, 5]);
  });

  // This was an 'if' statement in the original, now corrected to an 'it' block.
  it('should return true if the member was successfully removed', () => {
    let testArray = [1, 2, 3, 4, 5];
    const wasRemoved = testArray.cxremove(3);
    expect(wasRemoved).to.be.true;
  });

  // This was an 'if' statement in the original, now corrected to an 'it' block.
  it('should return false if the member was not found in the array', () => {
    let testArray = [1, 2, 3, 4, 5];
    const wasRemoved = testArray.cxremove(6);
    expect(wasRemoved).to.be.false;
  });

  it('should handle removing the first element', () => {
    let testArray = ['a', 'b', 'c'];
    testArray.cxremove('a');
    expect(testArray).deepStrictEqual(['b', 'c']);
  });
});

// --- String Extension Tests ---

describe('String.cxreverse', () => {
  it('should correctly reverse the characters of a string', () => {
    expect('Hello Universe'.cxreverse()).strictEqual('esrevinU olleH');
  });

  it('should handle empty strings', () => {
    expect(''.cxreverse()).strictEqual('');
  });
});

describe('String.cxleftStrip', () => {
  it('should strip specified characters from the beginning of a string', () => {
    expect('Alphabet Soup'.cxleftStrip('Alp')).strictEqual('habet Soup');
  });

  it('should handle stripping a single character', () => {
    expect('a'.cxleftStrip('a')).strictEqual('');
  });

  it('should not strip if characters are not at the beginning', () => {
    expect('Banana'.cxleftStrip('an')).strictEqual('Banana');
  });
});

describe('String.cxrightStrip', () => {
  it('should strip specified characters from the end of a string', () => {
    expect('Data World'.cxrightStrip('rld')).strictEqual('Data Wo');
  });

  it('should not strip if characters are not at the end', () => {
    expect('Data World'.cxrightStrip('Dat')).strictEqual('Data World');
  });

  it('should handle empty strip characters', () => {
    expect('TestString'.cxrightStrip('')).strictEqual('TestString');
  });
});

describe('String.cxstrip', () => {
  it('should strip specified characters from both ends of a string', () => {
    expect('  Trim Me  '.cxstrip(' ')).strictEqual('Trim Me');
    expect('##Hello##'.cxstrip('#')).strictEqual('Hello');
  });

  it('should handle mixed characters for stripping', () => {
    expect('ABCXYZCBA'.cxstrip('ABC')).strictEqual('XYZ');
  });

  it('should not strip characters that are only in the middle', () => {
    expect('X_Y_Z'.cxstrip('XZ')).strictEqual('_Y_');
  });
});

// --- Object Extension Tests ---

describe('Object.cxgetKeys', () => {
  it('should accurately retrieve all top-level keys of an object', () => {
    // The testDataSet now includes 'papa'
    expect(testDataSet.cxgetKeys()).deepStrictEqual(["alpha", "charlie", "india", "juliett-kilo", "oscar", "papa"]);
  });

  it('should return an empty array for an empty object', () => {
    expect({}.cxgetKeys()).deepStrictEqual([]);
  });
});

describe('Object.cxgetSize', () => {
  it('should correctly count the number of top-level properties in an object', () => {
    // The testDataSet now has 6 properties
    expect(testDataSet.cxgetSize()).strictEqual(6);
  });

  it('should return 0 for an empty object', () => {
    expect({}.cxgetSize()).strictEqual(0);
  });
});

describe('Object.cxgetPath', () => {
  it('should return undefined when a deep path value is missing', () => {
    expect(testDataSet.cxgetPath(['alpha', 'zulu'])).strictEqual(undefined);
  });

  it('should successfully return the value when all keys in the path exist', () => {
    expect(testDataSet.cxgetPath(['charlie', 'foxtrot', 'golf'])).strictEqual('hotel');
  });

  it('should return the value even if an intermediate path segment is null (string key)', () => {
    expect(testDataSet.cxgetPath(['juliett-kilo', 'lima', 'mike'])).strictEqual('november');
  });

  it('should support Unix-style path strings for retrieval', () => {
    expect(testDataSet.cxgetPath('/charlie/foxtrot/golf')).strictEqual('hotel');
  });

  it('should return the direct value for a single key path', () => {
    expect(testDataSet.cxgetPath('alpha')).strictEqual('bravo');
    expect(testDataSet.cxgetPath(['alpha'])).strictEqual('bravo');
  });

  it('should return undefined for an empty path', () => {
    expect(testDataSet.cxgetPath([])).strictEqual(undefined);
    expect(testDataSet.cxgetPath('')).strictEqual(undefined);
  });
});

describe('Object.cxclone', () => {
  const duplicatedObject = testDataSet.cxclone();

  it('should create a deep copy where modifications to the clone do not affect the original', () => {
    // First, verify they are deeply equal initially
    expect(duplicatedObject).deepStrictEqual(testDataSet);

    // Modify the cloned object
    duplicatedObject.charlie.delta = 'new_value';
    duplicatedObject['juliett-kilo'].lima.mike = 'new_mike';
    duplicatedObject.oscar = false;

    // Assert that the cloned object reflects the changes
    expect(duplicatedObject.cxgetPath(['charlie', 'delta'])).strictEqual('new_value');
    expect(duplicatedObject.cxgetPath(['juliett-kilo', 'lima', 'mike'])).strictEqual('new_mike');
    expect(duplicatedObject.oscar).to.be.false;

    // Assert that the original object remains unchanged
    expect(testDataSet.cxgetPath(['charlie', 'delta'])).strictEqual('echo');
    expect(testDataSet.cxgetPath(['juliett-kilo', 'lima', 'mike'])).strictEqual('november');
    expect(testDataSet.oscar).to.be.true;
  });

  it('should ensure the cloned object is a new instance', () => {
    expect(duplicatedObject).not.to.equal(testDataSet);
    expect(duplicatedObject.charlie).not.to.equal(testDataSet.charlie);
  });
});

describe('Object.cxforEach', () => {
  const extractedKeys = [];
  const extractedValues = [];

  // Execute the forEach loop once for all tests in this suite
  testDataSet.cxforEach((propKey, propValue) => {
    extractedKeys.push(propKey);
    extractedValues.push(propValue);
  });

  it('should iterate over keys correctly and collect them', () => {
    expect(extractedKeys).deepStrictEqual(["alpha", "charlie", "india", "juliett-kilo", "oscar", "papa"]);
    expect(extractedKeys.length).strictEqual(6); // Added assertion for length
  });

  it('should iterate over values correctly and collect them', () => {
    expect(extractedValues).deepStrictEqual([
      "bravo",
      {
        "delta": "echo",
        "foxtrot": {
          "golf": "hotel"
        }
      },
      null,
      {
        "lima": {
          "mike": "november"
        }
      },
      true,
      123
    ]);
    expect(extractedValues.length).strictEqual(6); // Added assertion for length
  });
});

describe('Object.cxextend', () => {
  const newProperties = {
    'quebec': {
      romeo: 'sierra'
    },
    'tango': {
      uniform: 'victor'
    },
    'alpha': 'modified_bravo' // Overwrite an existing property
  };

  const mergedProperties = testDataSet.cxclone().cxextend(newProperties); // Clone first to keep original untouched

  it('should merge new properties into the object, creating an extended version', () => {
    expect(mergedProperties).deepStrictEqual({
      "alpha": "modified_bravo", // This value is overwritten
      "charlie": {
        "delta": "echo",
        "foxtrot": {
          "golf": "hotel"
        }
      },
      "india": null,
      "juliett-kilo": {
        "lima": {
          "mike": "november"
        }
      },
      "oscar": true,
      "papa": 123,
      "quebec": {
        "romeo": "sierra"
      },
      "tango": {
        "uniform": "victor"
      }
    });
  });

  it('should ensure the original object remains unchanged', () => {
    expect(testDataSet.alpha).strictEqual('bravo');
    expect(testDataSet.cxgetKeys().length).strictEqual(6);
  });
});

describe('Object.cxcompare', () => {
  it('should accurately identify two objects with identical structure and values as equal', () => {
    const equivalentStructure = {
      alpha: 'bravo',
      charlie: {
        delta: 'echo',
        foxtrot: {
          golf: 'hotel'
        }
      },
      india: null,
      'juliett-kilo': {
        'lima': {
          'mike': 'november'
        }
      },
      oscar: true,
      papa: 123
    };
    expect(testDataSet.cxcompare(equivalentStructure)).to.be.true;
  });

  it('should accurately identify objects with different structures or values as unequal', () => {
    const dissimilarStructure = {
      alpha: 'bravo',
      charlie: { // Missing 'foxtrot'
        delta: 'echo'
      },
      india: null,
      oscar: true
    };
    expect(testDataSet.cxcompare(dissimilarStructure)).to.be.false;

    const valueDifference = {
      alpha: 'bravo',
      charlie: {
        delta: 'echo',
        foxtrot: {
          golf: 'different_hotel' // Value changed
        }
      },
      india: null,
      'juliett-kilo': {
        'lima': {
          'mike': 'november'
        }
      },
      oscar: true,
      papa: 123
    };
    expect(testDataSet.cxcompare(valueDifference)).to.be.false;
  });

  it('should return false if one object has more properties than the other', () => {
    const smallerObject = {
      alpha: 'bravo'
    };
    expect(testDataSet.cxcompare(smallerObject)).to.be.false;
    expect(smallerObject.cxcompare(testDataSet)).to.be.false;
  });
});

// --- Function Extension Tests ---

describe('Function.cxthrottle', () => {
  let processedCount = 0; // Tracks how many times the actual function is executed
  let loopIterations = 0; // Tracks how many times the loop runs
  const maxLoopCycles = 3; // Total iterations for the test loop
  const throttleDelay = 70; // Milliseconds for throttling

  it('should limit function execution to once within the throttle period', (done) => {
    const throttledAction = (() => {
      processedCount++;
    }).cxthrottle(throttleDelay);

    const loopIntervalId = setInterval(() => {
      // The throttledAction is called multiple times, but should only increment processedCount once per delay period.
      // In this scenario, the interval (50ms) is less than the throttle delay (70ms),
      // so processedCount should only increment once.
      throttledAction();
      loopIterations++;

      if (loopIterations === maxLoopCycles) {
        clearInterval(loopIntervalId);
        // Wait slightly longer than the throttle delay to ensure the last call (if any) has time to execute
        setTimeout(() => {
          expect(processedCount).strictEqual(1); // Should only run once
          done();
        }, throttleDelay + 10); // A small buffer
      }
    }, 50);
  });
});

describe('Function.scheduleRepeat', () => {
  // Set a global timeout for this suite because repeat functions can take time.
  // This is an added structural change (before hook).
  before(() => {
    this.timeout(15 * 1000); // 15 seconds
  });

  it('should repeat a function a specified number of times with arguments and delay', (done) => {
    let operationCounter = 0;
    const performIncrement = () => {
      operationCounter += 1;
      if (operationCounter === 3) {
        done();
      }
    };
    // Original: increment.repeat([], 50, true)
    performIncrement.scheduleRepeat([], 50, true);
    // Added a non-essential console log for demonstration
    console.log('Scheduled repeating increment operation...');
  });

  it('should repeat with arguments omitted (using default delay)', (done) => {
    let operationCounter = 0;
    const performIncrement = () => {
      operationCounter += 1;
      if (operationCounter === 3) {
        done();
      }
    };
    // Original: increment.repeat(50, true)
    performIncrement.scheduleRepeat(50, true);
  });

  it('should stop repeating if the function explicitly returns false', (done) => {
    let stopCounter = 0;
    const stopFunction = () => {
      stopCounter++;
      if (stopCounter === 2) {
        return false; // Stop repeating
      }
    };
    stopFunction.scheduleRepeat([], 20, true);
    setTimeout(() => {
      expect(stopCounter).strictEqual(2);
      done();
    }, 100); // Give it enough time to potentially run more if not stopped
  });
});

// --- Number Extension Tests ---

describe('Number.cxdays', () => {
  it('should correctly convert a number of days into milliseconds', () => {
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 432,000,000
    const expectedValue = 432000000; // Helper variable for clarity
    expect((5).cxdays()).strictEqual(expectedValue);
  });
});

describe('Number.cxweeks.cxbefore and .cxafter', () => {
  it('should correctly calculate a date N weeks before a reference date', () => {
    const baseDateTime = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    const expectedDateString = 'Thursday, May 16, 2013'; // Expected format for en-GB UTC
    const resultDate = (3).cxweeks().cxbefore(baseDateTime);
    expect(resultDate.toLocaleDateString("en-GB", {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })).strictEqual(expectedDateString);
  });

  it('should correctly calculate a date N weeks after a reference date', () => {
    const baseDateTime = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    const expectedDateString = 'Thursday, June 27, 2013'; // Expected format for en-GB UTC
    const resultDate = (3).cxweeks().cxafter(baseDateTime);
    expect(resultDate.toLocaleDateString("en-GB", {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })).strictEqual(expectedDateString);
  });
});

describe('Number.cxround', () => {
  it('should correctly round a floating-point number to the nearest integer', () => {
    const sampleNumber = 4.2;
    expect(sampleNumber.cxround()).strictEqual(4);
    expect((4.7).cxround()).strictEqual(5);
  });
});

describe('Number.cxceil', () => {
  it('should correctly find the ceiling of a number', () => {
    const sampleNumber = 4.2;
    expect(sampleNumber.cxceil()).strictEqual(5);
    expect((4.0).cxceil()).strictEqual(4);
  });
});

describe('Number.cxfloor', () => {
  it('should correctly find the floor of a number', () => {
    const sampleNumber = 4.8;
    expect(sampleNumber.cxfloor()).strictEqual(4);
    expect((5.0).cxfloor()).strictEqual(5);
  });
});

describe('Number.cxabs', () => {
  it('should correctly find the absolute value of a number', () => {
    const sampleNumber = -4.2;
    expect(sampleNumber.cxabs()).strictEqual(4.2);
    expect((10).cxabs()).strictEqual(10);
  });
});

describe('Number.cxpow', () => {
  it('should correctly raise a number to the given power', () => {
    const baseNumber = 5;
    expect(baseNumber.cxpow(3)).strictEqual(125);
    expect((2).cxpow(4)).strictEqual(16);
  });
});

// --- Library Integrity Tests ---

describe('Core extensions should not pollute for-in loops', () => {
  it('should ensure no extension methods appear as enumerable properties', () => {
    for (const propKey in testDataSet) {
      // Check that none of our 'cx' prefixed methods show up
      expect(['cxgetKeys', 'cxgetSize', 'cxgetPath', 'cxforEach', 'cxclone', 'cxextend', 'cxcompare'].cxincludes(propKey)).to.be.false;
    }
  });

  it('should verify that standard library methods are not affected', () => {
    const arr = [1, 2, 3];
    let count = 0;
    for (const index in arr) {
      count++;
    }
    expect(count).strictEqual(3); // Ensures array iteration still works as expected
  });
});

// --- Type Checking Utility Tests ---

describe('cxkind utility function', () => {
  it('should correctly identify number-like primitive values and objects as "Number"', () => {
    expect(coreExtensions.cxkind(37)).strictEqual('Number');
    expect(coreExtensions.cxkind(3.14)).strictEqual('Number');
    expect(coreExtensions.cxkind(Math.LN2)).strictEqual('Number');
    expect(coreExtensions.cxkind(Infinity)).strictEqual('Number');
    expect(coreExtensions.cxkind(Number(1))).strictEqual('Number');
    expect(coreExtensions.cxkind(new Number(1))).strictEqual('Number');
  });

  it('should specifically identify NaN as "NaN"', () => {
    expect(coreExtensions.cxkind(NaN)).strictEqual('NaN');
  });

  it('should identify string primitives and objects as "String"', () => {
    expect(coreExtensions.cxkind('')).strictEqual('String');
    expect(coreExtensions.cxkind('hello world')).strictEqual('String');
    expect(coreExtensions.cxkind(String("abc"))).strictEqual('String');
    expect(coreExtensions.cxkind(new String("abc"))).strictEqual('String');
  });

  it('should identify boolean primitives and objects as "Boolean"', () => {
    expect(coreExtensions.cxkind(true)).strictEqual('Boolean');
    expect(coreExtensions.cxkind(false)).strictEqual('Boolean');
    expect(coreExtensions.cxkind(new Boolean(true))).strictEqual('Boolean');
  });

  it('should identify arrays as "Array"', () => {
    expect(coreExtensions.cxkind([1, 2, 4])).strictEqual('Array');
    expect(coreExtensions.cxkind(new Array(1, 2, 3))).strictEqual('Array');
  });

  it('should identify plain objects as "Object"', () => {
    expect(coreExtensions.cxkind({
      a: 1
    })).strictEqual('Object');
    expect(coreExtensions.cxkind(new Object())).strictEqual('Object');
  });

  it('should identify Date objects as "Date"', () => {
    expect(coreExtensions.cxkind(new Date())).strictEqual('Date');
  });

  it('should identify Function objects as "Function"', () => {
    expect(coreExtensions.cxkind(() => {})).strictEqual('Function');
    expect(coreExtensions.cxkind(new Function("console.log(arguments)"))).strictEqual('Function');
    expect(coreExtensions.cxkind(Math.sin)).strictEqual('Function');
  });

  it('should identify undefined values as "undefined"', () => {
    let someVar;
    expect(coreExtensions.cxkind(someVar)).strictEqual('undefined');
  });

  it('should identify null values as "null"', () => {
    expect(coreExtensions.cxkind(null)).strictEqual('null');
  });

  it('should identify Symbol values as "Symbol" (if supported)', () => {
    if (typeof Symbol !== 'undefined') {
      expect(coreExtensions.cxkind(Symbol('test'))).strictEqual('Symbol');
    } else {
      console.warn('Symbol type not supported in this environment, skipping test.');
    }
  });
});

// --- Dynamic Prefixing Tests ---

describe('Utility functions without a prefix when globally enabled', () => {
  // Activate the library without a specific prefix for these tests
  before(() => {
    coreExtensions.enablePrefix();
  });

  it('should allow using rightStrip directly on strings', () => {
    expect('Hello world'.rightStrip('ldr')).strictEqual('Hello wo');
  });

  it('should allow using includes directly on arrays', () => {
    expect([1, 2, 3].includes(2)).to.be.true;
  });

  // Re-enable the 'cx' prefix for subsequent tests that might run after this suite
  after(() => {
    coreExtensions.enablePrefix('cx');
  });
});