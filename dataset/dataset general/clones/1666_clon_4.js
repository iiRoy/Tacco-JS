const sampleData = {
  first_key: 'value_a',
  second_key: {
    nested_key_one: 'nested_value_one',
    nested_key_two: {
      deep_key: 'success'
    }
  },
  void_key: {
    'sub_key': {
      'inner_key': 'hello'
    }
  }
};

const verify = (() => {
    let testCount = 0;
    let failCount = 0;
    let currentTestGroup = '';
    const asyncTestPromises = [];

    const executeAssertion = (condition, message = 'Assertion failed') => {
        if (!condition) {
            throw new Error(message);
        }
    };

    const deepCompare = (val1, val2, traversed = new Set()) => {
        if (Object.is(val1, val2)) return true;
        if (val1 === null || typeof val1 !== 'object' || val2 === null || typeof val2 !== 'object') return false;
        
        if (traversed.has(val1) || traversed.has(val2)) return false;
        traversed.add(val1);
        traversed.add(val2);

        if (Array.isArray(val1)) {
            if (!Array.isArray(val2) || val1.length !== val2.length) return false;
            for (let i = 0; i < val1.length; i++) {
                if (!deepCompare(val1[i], val2[i], traversed)) return false;
            }
            return true;
        }

        if (val1 instanceof Date && val2 instanceof Date) {
            return val1.getTime() === val2.getTime();
        }

        const keys1 = Object.keys(val1);
        const keys2 = Object.keys(val2);
        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!Object.prototype.hasOwnProperty.call(val2, key) || !deepCompare(val1[key], val2[key], traversed)) return false;
        }
        return true;
    };

    const assertionMethods = {
        truthy: (value, msg = 'Expected truthy') => executeAssertion(!!value, msg),
        equal: (actual, expected, msg = 'Expected values to be strictly equal') => executeAssertion(actual === expected, `${msg}: ${actual} !== ${expected}`),
        deepEqual: (actual, expected, msg = 'Expected objects to be deeply equal') => executeAssertion(deepCompare(actual, expected), `${msg}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`),
        falsy: (value, msg = 'Expected falsy') => executeAssertion(!value, msg)
    };

    return {
        group: (name, func) => {
            currentTestGroup = name;
            console.log(`\n--- Test Group: ${name} ---`);
            func();
            currentTestGroup = '';
        },
        unit: (description, func) => {
            testCount++;
            if (func.length > 0) {
                const p = new Promise(resolve => {
                    try {
                        func(() => {
                            console.log(`✅ ${description}`);
                            resolve();
                        });
                    } catch (e) {
                        failCount++;
                        console.error(`❌ ${description} (in ${currentTestGroup}) - ${e.message}`);
                        resolve();
                    }
                }).catch(e => {
                    failCount++;
                    console.error(`❌ ${description} (in ${currentTestGroup}) - Unhandled rejection: ${e.message}`);
                });
                asyncTestPromises.push(p);
            } else {
                try {
                    func();
                    console.log(`✅ ${description}`);
                } catch (e) {
                    failCount++;
                    console.error(`❌ ${description} (in ${currentTestGroup}) - ${e.message}`);
                }
            }
        },
        reportResults: async () => {
            await Promise.all(asyncTestPromises);
            console.log(`\n--- Test Summary ---`);
            console.log(`Total test units: ${testCount}`);
            console.log(`Failed test units: ${failCount}`);
            if (failCount === 0) {
                console.log(`🎉 All checks passed!`);
            } else {
                console.log(`💔 Some checks failed.`);
            }
            return failCount === 0;
        },
        ...assertionMethods
    };
})();

const utilz = {
    arrayContains: (arr, item) => arr.reduce((acc, current) => acc || Object.is(current, item), false),
    arrayCombine: (arr1, arr2) => Array.from([...arr1, ...arr2]),
    arrayFindMatch: (arr, predicate) => {
        return arr.reduce((found, item) => {
            if (found !== undefined) return found;
            return predicate(item) ? item : undefined;
        }, undefined);
    },
    arrayRemoveFirst: (arr, itemToRemove) => {
        let removed = false;
        let writeIndex = 0;
        for (let readIndex = 0; readIndex < arr.length; readIndex++) {
            if (!removed && Object.is(arr[readIndex], itemToRemove)) {
                removed = true;
            } else {
                arr[writeIndex] = arr[readIndex];
                writeIndex++;
            }
        }
        if (removed) {
            arr.length = writeIndex;
        }
        return removed;
    },

    stringReverse: (str) => Array.from(str).reduceRight((acc, char) => acc + char, ''),
    stringLeftTrim: (str, charsToTrim) => {
        if (!str.length || !charsToTrim.includes(str[0])) {
            return str;
        }
        return utilz.stringLeftTrim(str.substring(1), charsToTrim);
    },
    stringRightTrim: (str, charsToTrim) => {
        if (!str.length || !charsToTrim.includes(str[str.length - 1])) {
            return str;
        }
        return utilz.stringRightTrim(str.substring(0, str.length - 1), charsToTrim);
    },
    stringBothTrim: (str, charsToTrim) => utilz.stringRightTrim(utilz.stringLeftTrim(str, charsToTrim), charsToTrim),

    objectKeys: (obj) => Reflect.ownKeys(obj).filter(k => typeof k === 'string'),
    objectSize: (obj) => utilz.objectKeys(obj).length,
    objectAccessPath: (obj, pathInput) => {
        let pathSegments = Array.isArray(pathInput) ? pathInput : pathInput.split('/').filter(s => s !== '');
        
        const resolveSegment = (currentObj, segments) => {
            if (currentObj === null || typeof currentObj !== 'object' || segments.length === 0) {
                return currentObj;
            }
            const currentSegment = segments[0];
            const key = currentSegment === null ? 'null' : currentSegment;
            return resolveSegment(currentObj[key], segments.slice(1));
        };
        return resolveSegment(obj, pathSegments);
    },
    objectDeepCopy: (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map(item => utilz.objectDeepCopy(item));
        }
        const copy = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = utilz.objectDeepCopy(obj[key]);
            }
        }
        return copy;
    },
    objectIterate: (obj, callback) => {
        Reflect.ownKeys(obj).forEach(key => {
            if (typeof key === 'string') {
                callback(key, obj[key]);
            }
        });
    },
    objectMerge: (target, source) => {
        const combined = utilz.objectDeepCopy(target);
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                combined[key] = utilz.objectDeepCopy(source[key]);
            }
        }
        return combined;
    },
    objectDeepCompare: (obj1, obj2) => {
        if (Object.is(obj1, obj2)) return true;
        if (obj1 === null || typeof obj1 !== 'object' || obj2 === null || typeof obj2 !== 'object') return false;

        if (Array.isArray(obj1)) {
            if (!Array.isArray(obj2) || obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!utilz.objectDeepCompare(obj1[i], obj2[i])) return false;
            }
            return true;
        }
        const keys1 = utilz.objectKeys(obj1);
        const keys2 = utilz.objectKeys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) {
            if (!utilz.arrayContains(keys2, key) || !utilz.objectDeepCompare(obj1[key], obj2[key])) return false;
        }
        return true;
    },

    functionDebounce: (func, delay) => {
        let timeoutId;
        let lastArgs;
        let lastThis;
        return function(...args) {
            lastArgs = args;
            lastThis = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(lastThis, lastArgs);
            }, delay);
        };
    },
    functionRepeat: (func, initialArgsOrDelay, delayOrImmediate, immediate) => {
        let actualArgs = [];
        let actualDelay = 0;
        let actualImmediate = false;

        if (Array.isArray(initialArgsOrDelay)) {
            actualArgs = initialArgsOrDelay;
            actualDelay = delayOrImmediate;
            actualImmediate = immediate;
        } else {
            actualDelay = initialArgsOrDelay;
            actualImmediate = delayOrImmediate;
        }

        const execute = () => func.apply(null, actualArgs);
        if (actualImmediate) {
            execute();
        }
        return setInterval(execute, actualDelay);
    },

    numberToDays: (num) => num * 24 * 60 * 60 * 1000,
    numberDateAdjuster: (num) => {
        const millisecondsPerWeek = num * 7 * 24 * 60 * 60 * 1000;
        return {
            beforeDate: (baseDate) => new Date(baseDate.getTime() - millisecondsPerWeek),
            afterDate: (baseDate) => new Date(baseDate.getTime() + millisecondsPerWeek)
        };
    },
    numberRound: (num) => Math.floor(num + 0.5),
    numberCeiling: (num) => {
        const floorVal = Math.floor(num);
        return (num > floorVal) ? (floorVal + 1) : floorVal;
    },
    numberFloor: (num) => {
        if (num >= 0) {
            return num - (num % 1);
        } else {
            let truncated = num | 0;
            return (truncated === num) ? num : (truncated - 1);
        }
    },
    numberAbsolute: (num) => num < 0 ? -num : num,
    numberPower: (base, exponent) => {
        if (exponent === 0) return 1;
        if (exponent < 0) return 1 / utilz.numberPower(base, -exponent);
        let result = 1;
        for (let i = 0; i < exponent; i++) {
            result *= base;
        }
        return result;
    },

    determineKind: (value) => {
        if (value === null) return 'null';
        if (typeof value === 'undefined') return 'undefined';
        if (Number.isNaN(value)) return 'NaN';
        
        const typeString = Object.prototype.toString.call(value);
        const kindMap = {
            '[object Number]': 'Number',
            '[object String]': 'String',
            '[object Boolean]': 'Boolean',
            '[object Array]': 'Array',
            '[object Object]': 'Object',
            '[object Date]': 'Date',
            '[object Function]': 'Function'
        };
        return kindMap[typeString] || 'Unknown';
    }
};

verify.group('Array.inclusionCheck', function(){
  verify.unit('locates the item accurately', function(){
    verify.truthy(utilz.arrayContains(['alpha','beta','gamma'], 'beta') );
  });
  verify.unit('handles missing items correctly', function(){
    verify.falsy(utilz.arrayContains(['alpha','beta','gamma'], 'not_present') );
  });
});

verify.group('Array.concatenation', function(){
  verify.unit('combines arrays accurately', function(){
    verify.deepEqual(utilz.arrayCombine([1,2,3],[4,5]), [1,2,3,4,5] );
  });
});

verify.group('String.mirror', function(){
  verify.unit('mirrors strings accurately', function(){
    verify.equal(utilz.stringReverse('Hello world'), 'dlrow olleH');
  });
});

verify.group('String.trimLeft', function(){
  verify.unit('trims from the left accurately', function(){
    verify.equal(utilz.stringLeftTrim('Hello world', 'Hle'), 'o world');
  });
});

verify.group('String.trimRight', function(){
  verify.unit('trims from the right accurately', function(){
    verify.equal(utilz.stringRightTrim('Hello world', 'ldr'), 'Hello wo');
  });
});

verify.group('String.trimRight with single character', function(){
  verify.unit('trims from the left accurately with a single character', function(){
    verify.equal(utilz.stringLeftTrim('a', 'a'), '');
  });
});

verify.group('String.trimBoth', function(){
  verify.unit('trims from both sides accurately', function(){
    verify.equal(utilz.stringBothTrim('Hello world', 'Hld'), 'ello wor');
  });
});

verify.group('Object.propertyNames', function(){
  verify.unit('fetches property names accurately', function(){
    verify.deepEqual(utilz.objectKeys(sampleData), ["first_key","second_key","void_key"] );
  });
});

verify.group('Object.propertyCount', function(){
  verify.unit('counts properties accurately', function(){
    verify.equal(utilz.objectSize(sampleData), 3);
  });
});

verify.group('Array.locateItem', function(){
  verify.unit('correctly locates items that match the function', function(){
    verify.equal(utilz.arrayFindMatch(['alpha','beta','gamma'], function(item){
      return (item === 'gamma');
    }), 'gamma');
  });
});

verify.group('Array.deleteItem', function () {
  verify.unit('correctly deletes the given member', function (){
    var currentArr = [1,2,3,4,5];
    utilz.arrayRemoveFirst(currentArr, 3);
    verify.deepEqual(currentArr, [1,2,4,5]);
  });
  verify.unit('returns true if the given member was in the array', function () {
    var checkArr = [1,2,3,4,5];
    verify.equal(utilz.arrayRemoveFirst(checkArr, 3), true);
  });
  verify.unit('returns false if the given member was not in the array', function () {
    var checkArr = [1,2,3,4,5];
    verify.equal(utilz.arrayRemoveFirst(checkArr, 6), false);
  });
});

verify.group('Object.resolvePath', function(){
  verify.unit('returns undefined when a value is missing', function(){
    verify.equal(utilz.objectAccessPath(sampleData, ['first_key','pineapple']), undefined);
  });
  verify.unit('returns the value when the provided keys exist', function(){
    verify.equal(utilz.objectAccessPath(sampleData, ['second_key','nested_key_two','deep_key']), 'success');
  });
  verify.unit('returns the value when the provided keys exist, even if null is on the path', function(){
    verify.equal(utilz.objectAccessPath(sampleData, [null,'sub_key','inner_key']), 'hello');
  });
  verify.unit('works using Unix-style paths', function(){
    verify.equal(utilz.objectAccessPath(sampleData, '/second_key/nested_key_two/deep_key'), 'success');
  });
});

verify.group('Object.duplicate', function(){
  var clonedData = utilz.objectDeepCopy(sampleData);
  verify.unit('duplicates objects so that modification to the new object will not affect the original', function(){
    clonedData.second_key.nested_key_one = 'new_value';
    verify.equal(utilz.objectAccessPath(clonedData, ['second_key','nested_key_one']), 'new_value');
    verify.equal(utilz.objectAccessPath(sampleData, ['second_key','nested_key_one']), 'nested_value_one');
  });
});

verify.group('Object.iterateProperties', function(){
  var keyResults = [];
  var valueResults = [];
  utilz.objectIterate(sampleData, function(key, value){
    keyResults.push(key);
    valueResults.push(value);
  });
  verify.unit('iterates over keys properly', function(){
    verify.deepEqual(keyResults, ["first_key","second_key","void_key"]);
  });
  verify.unit('iterates over values properly', function(){
    verify.deepEqual(valueResults, [
      "value_a",
      {"nested_key_one":"nested_value_one",
        "nested_key_two":{
          "deep_key":"success"
        }
      },
      {"sub_key":
        {"inner_key":"hello"}
      }
    ]);
  });
});

verify.group('Object.combine', function(){
  var combineResult = utilz.objectMerge(utilz.objectDeepCopy(sampleData), {
    'new_property_one':{
      sub_prop:'sub_val'
    },
    'new_property_two':{
      sub_prop_b:'sub_val_b'
    }
  });

  verify.unit('creates combines the object with the new properties', function(){
    verify.deepEqual(combineResult, {
      "first_key":"value_a",
      "second_key":{
        "nested_key_one":"nested_value_one",
        "nested_key_two":{
          "deep_key":"success"}
        },
        "void_key":{
          "sub_key":{
            "inner_key":"hello"
          }
        },
      "new_property_one":{
        "sub_prop":"sub_val"
      },
      "new_property_two":{
        "sub_prop_b":"sub_val_b"
      }
    });
  });
});

verify.group('Object.structuralCompare', function(){
  verify.unit('accurately identifies similar objects', function(){
    var identicalStructure = {
      first_key: 'value_a',
      second_key: {
        nested_key_one:'nested_value_one',
        nested_key_two:{
          deep_key:'success'
        }
      },
      void_key:{
        'sub_key':{
          'inner_key':'hello'
        }
      }
    };
    verify.truthy(utilz.objectDeepCompare(sampleData, identicalStructure));
  });
  verify.unit('accurately identifies different objects', function(){
    var differentStructure = {
      first_key: 'value_a',
      second_key: {
        nested_key_one:'nested_value_one',
        nested_key_two:{
          deep_key:'success'
        }
      }
    };
    verify.falsy(utilz.objectDeepCompare(sampleData, differentStructure));
  });
});

verify.group('Function.delayExecute', function(){
  var valueShouldOnlyBeOne = 0;
  var timesFunctionHasRan = 0;
  var maxTimesToRun = 3;
  verify.unit('stops function calls overlapping', function(doneCallback){
    var intervalID = setInterval(function(){
      var delayedFunction = utilz.functionDebounce(function(){
        valueShouldOnlyBeOne++;
      }, 70);
      delayedFunction();
      timesFunctionHasRan++;
      if ( timesFunctionHasRan === maxTimesToRun ) {
        clearInterval(intervalID);
        setTimeout(() => {
            verify.equal(valueShouldOnlyBeOne, 1);
            doneCallback();
        }, 100);
      }
    }, 50);
  });
});

verify.group('Function.periodicExecute', function(){

  verify.unit('executes periodically', function(doneCallback){
    var counter = 0
    var incrementer = function(){
      counter += 1
      if ( counter === 3 ) {
        clearInterval(intervalId);
        doneCallback();
      }
    }
    const intervalId = utilz.functionRepeat.call(null, incrementer, [], 50, true);
  });
  verify.unit('executes periodically with arguments omitted', function(doneCallback){
    var counter = 0
    var incrementer = function(){
      counter += 1
      if ( counter === 3 ) {
        clearInterval(intervalId);
        doneCallback();
      }
    }
    const intervalId = utilz.functionRepeat.call(null, incrementer, 50, true);
  });
});

verify.group('Number.daysConversion', function(){
  verify.unit('correctly converts a number to days in milliseconds', function(){
    verify.equal(utilz.numberToDays(5), 432000000);
  });
});

verify.group('Number.weeks.dateAdjustment', function(){
  verify.unit('correctly converts a number to a period in weeks before a set date', function(){
    var refDate = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    verify.equal(utilz.numberDateAdjuster(3).beforeDate(refDate).toLocaleDateString("en-GB", {timeZone:'UTC'}), 'Thursday, May 16, 2013');
  });
  verify.unit('correctly converts a number to a period in weeks after a set date', function(){
    var refDate = new Date('Thu Jun 06 2013 22:44:05 GMT+0100 (UTC)');
    verify.equal(utilz.numberDateAdjuster(3).afterDate(refDate).toLocaleDateString("en-GB", {timeZone:'UTC'}), 'Thursday, June 27, 2013');
  });
});

verify.group('Number.roundValue', function () {
  var value = 4.2;
  verify.unit('correctly rounds a number', function () {
    verify.equal(utilz.numberRound(value),4);
  });
});

verify.group('Number.ceilingValue', function () {
  var value = 4.2;
  verify.unit('correctly finds a number\'s ceiling', function () {
    verify.equal(utilz.numberCeiling(value),5);
  });
});

verify.group('Number.floorValue', function () {
  var value = 4.2;
  verify.unit('correctly finds a number\'s floor', function () {
    verify.equal(utilz.numberFloor(value),4);
  });
});

verify.group('Number.absoluteValue', function () {
  var value = -4.2;
  verify.unit('correctly finds the absolute value of a number', function () {
    verify.equal(utilz.numberAbsolute(value),4.2);
  });
});

verify.group('Number.powerOf', function () {
  var baseValue = 5;
  verify.unit('correctly raises a number to the given power', function () {
    verify.equal(utilz.numberPower(baseValue, 3), 125);
  });
});

verify.group('Utility functions do not interfere with standard enumeration', function(){
  verify.unit ('ensures no prototype pollution', function(){
    for ( var pKey in sampleData ) {
      verify.falsy(utilz.arrayContains(['objectKeys','objectSize','objectAccessPath'], pKey), `Property ${pKey} should not be from utilz`);
    }
    for (var prop in Object.prototype) {
        verify.falsy(utilz.arrayContains(Object.keys(utilz), prop), `utilz property ${prop} found on Object.prototype`);
    }
  });
});

verify.group('Type Classification', function(){
  verify.unit('shows number-like things as numbers', function(){
    verify.truthy(utilz.determineKind(37) === 'Number');
    verify.truthy(utilz.determineKind(3.14) === 'Number');
    verify.truthy(utilz.determineKind(Math.LN2) === 'Number');
    verify.truthy(utilz.determineKind(Infinity) === 'Number');
    verify.truthy(utilz.determineKind(Number(1)) === 'Number');
    verify.truthy(utilz.determineKind(new Number(1)) === 'Number');
  });
  verify.unit('shows NaN as NaN', function(){
    verify.truthy(utilz.determineKind(NaN) === 'NaN');
  });
  verify.unit('Shows strings as strings', function(){
    verify.truthy(utilz.determineKind('') === 'String');
    verify.truthy(utilz.determineKind('bla') === 'String');
    verify.truthy(utilz.determineKind(String("abc")) === 'String');
    verify.truthy(utilz.determineKind(new String("abc")) === 'String');
  });
  verify.unit('shows booleans accurately', function(){
    verify.truthy(utilz.determineKind(true) === 'Boolean');
    verify.truthy(utilz.determineKind(false) === 'Boolean');
    verify.truthy(utilz.determineKind(new Boolean(true)) === 'Boolean');
  });
  verify.unit('shows arrays accurately', function(){
    verify.truthy(utilz.determineKind([1, 2, 4]) === 'Array');
    verify.truthy(utilz.determineKind(new Array(1, 2, 3)) === 'Array');
  });
  verify.unit('shows objects accurately', function(){
    verify.truthy(utilz.determineKind({a:1}) === 'Object');
    verify.truthy(utilz.determineKind(new Object()) === 'Object');
  });
  verify.unit('shows dates accurately', function(){
    verify.truthy(utilz.determineKind(new Date()) === 'Date');
  });
  verify.unit('loves Functions too', function(){
    verify.truthy(utilz.determineKind(function(){}) === 'Function');
    verify.truthy(utilz.determineKind(new Function("console.log(arguments)")) === 'Function');
    verify.truthy(utilz.determineKind(Math.sin) === 'Function');
  });
  verify.unit('shows undefined accurately', function(){
    verify.truthy(utilz.determineKind(undefined) === 'undefined');
  });
  verify.unit('shows null accurately', function(){
    verify.truthy(utilz.determineKind(null) === 'null');
  });
});

verify.group('Functions work without explicit prefixing', function(){
  verify.unit('trims from the right accurately', function(){
    verify.equal(utilz.stringRightTrim('Hello world', 'ldr'), 'Hello wo');
  });
});

verify.reportResults();