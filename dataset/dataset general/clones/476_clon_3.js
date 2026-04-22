const assertionUtility = (typeof window !== 'undefined' && window.chai)
    ? window.chai.expect
    : require('chai').expect;

/**
 * Comprehensive test suite verifying the functionality of the 'typeChecker' utility.
 * This collection of tests covers various data type validation methods provided by the library.
 * Extensive checks are performed for basic types, collections, and special values.
 */
context("Data Validation Routines", () => {

    context("typeChecker.isArgumentsObject", () => {
        test("should yield true when the input is an actual arguments object", () => {
            const obtainFunctionParameters = function() {
                return arguments;
            };
            const functionParams = obtainFunctionParameters('alpha', 123);
            // Ensure the utility correctly identifies native arguments objects.
            assertionUtility(typeChecker.isArgumentsObject(functionParams)).to.be.true;
        });

        test("should yield false if the provided input is not an arguments object", () => {
            const nonArgumentsCollection = ['beta', 456];
            assertionUtility(typeChecker.isArgumentsObject(nonArgumentsCollection)).to.be.false;
        });
    });

    context("typeChecker.not.isArgumentsObject", () => {
        test("should yield false if the supplied value is an arguments object", () => {
            const retrieveCallArguments = function() {
                return arguments;
            };
            const callArgs = retrieveCallArguments('gamma');
            assertionUtility(typeChecker.not.isArgumentsObject(callArgs)).to.be.false;
        });

        test("should yield true when the supplied value is not an arguments object", () => {
            const nonArgsArray = ['delta'];
            assertionUtility(typeChecker.not.isArgumentsObject(nonArgsArray)).to.be.true;
        });
    });

    context("typeChecker.all.isArgumentsObject", () => {
        test("should indicate true if all given parameters are arguments objects", () => {
            const createArgumentsInstance = function() {
                return arguments;
            };
            let argsOne = createArgumentsInstance('epsilon');
            let argsTwo = createArgumentsInstance('zeta');
            // Testing with an array of parameters. Removed redundant spread form.
            const argumentCollection = [argsOne, argsTwo];
            assertionUtility(typeChecker.all.isArgumentsObject(argumentCollection)).to.be.true;
        });

        test("should indicate false if any provided parameter is not an arguments object", () => {
            const nonArgsValue = ['eta'];
            const getMoreArguments = function() {
                return arguments;
            };
            let validArgs = getMoreArguments('theta');
            // Testing with spread parameters. Removed redundant array form.
            assertionUtility(typeChecker.all.isArgumentsObject(validArgs, nonArgsValue)).to.be.false;
        });
    });

    context("typeChecker.any.isArgumentsObject", () => {
        test("should indicate true if at least one provided parameter is an arguments object", () => {
            const generateArgs = function() {
                return arguments;
            };
            const someArgs = generateArgs('iota');
            // Testing with an array containing one valid arguments object. Removed redundant spread form.
            const mixedInputs = ['kappa', someArgs];
            assertionUtility(typeChecker.any.isArgumentsObject(mixedInputs)).to.be.true;
        });

        test("should indicate false if all provided parameters are not arguments objects", () => {
            assertionUtility(typeChecker.any.isArgumentsObject('lambda', null, undefined)).to.be.false;
        });
    });

    context("typeChecker.isArrayType", () => {
        test("should return true when the input type is an array", () => {
            const dataList = ['mu', 'nu'];
            assertionUtility(typeChecker.isArrayType(dataList)).to.be.true;
        });

        test("should return false when the input type is not an array", () => {
            const nonListValue = 'xi_string';
            assertionUtility(typeChecker.isArrayType(nonListValue)).to.be.false;
        });
    });

    context("typeChecker.not.isArrayType", () => {
        test("should return false if the supplied parameter is an array", () => {
            const sampleList = ['omicron'];
            assertionUtility(typeChecker.not.isArrayType(sampleList)).to.be.false;
        });

        test("should return true if the supplied parameter is not an array", () => {
            const nonListCandidate = 'pi_char';
            assertionUtility(typeChecker.not.isArrayType(nonListCandidate)).to.be.true;
        });
    });

    context("typeChecker.all.isArrayType", () => {
        test("should confirm true if all provided parameters are arrays", () => {
            const firstCollection = ['rho'];
            const secondCollection = new Array('sigma'); // Different array creation
            const allCollections = [firstCollection, secondCollection];
            assertionUtility(typeChecker.all.isArrayType(allCollections)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if any provided parameter is not an array", () => {
            const nonListEntry = 'tau';
            const validList = ['upsilon'];
            assertionUtility(typeChecker.all.isArrayType(nonListEntry, validList)).to.be.false; // Removed redundant array form
        });
    });

    context("typeChecker.any.isArrayType", () => {
        test("should confirm true if at least one provided parameter is an array", () => {
            const listOne = ['phi'];
            const listTwo = ['chi'];
            assertionUtility(typeChecker.any.isArrayType(listOne, listTwo, 'psi')).to.be.true; // Removed redundant array form
        });

        test("should confirm false if all provided parameters are not arrays", () => {
            assertionUtility(typeChecker.any.isArrayType('omega_str', 123, {
                key: 'value'
            })).to.be.false; // Removed redundant array form, added object
        });
    });

    context("typeChecker.isBooleanValue", () => {
        test("should return true for a boolean primitive", () => {
            const booleanFlag = true;
            assertionUtility(typeChecker.isBooleanValue(booleanFlag)).to.be.true;
        });

        test("should return false for a non-boolean value", () => {
            const nonBooleanCandidate = 'boolean_string';
            assertionUtility(typeChecker.isBooleanValue(nonBooleanCandidate)).to.be.false;
        });
    });

    context("typeChecker.not.isBooleanValue", () => {
        test("should return true if the input is not a boolean", () => {
            const nonBooleanInput = 'not_a_bool';
            assertionUtility(typeChecker.not.isBooleanValue(nonBooleanInput)).to.be.true;
        });

        test("should return false if the input is a boolean", () => {
            const booleanInput = false;
            assertionUtility(typeChecker.not.isBooleanValue(booleanInput)).to.be.false;
        });
    });

    context("typeChecker.all.isBooleanValue", () => {
        test("should confirm true if all parameters are boolean", () => {
            const flagA = true;
            const flagB = false;
            assertionUtility(typeChecker.all.isBooleanValue(flagA, flagB)).to.be.true; // Removed redundant array form
        });

        test("should confirm false if any parameter is not boolean", () => {
            const boolVal = true;
            const nonBoolVal = 'string_value';
            assertionUtility(typeChecker.all.isBooleanValue([boolVal, nonBoolVal])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isBooleanValue", () => {
        test("should confirm true if any parameter is boolean", () => {
            const valueOne = true;
            const valueTwo = false;
            const mixedSet = [valueOne, valueTwo, ['a_list']];
            assertionUtility(typeChecker.any.isBooleanValue(mixedSet)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if no parameters are boolean", () => {
            assertionUtility(typeChecker.any.isBooleanValue('str', {}, null, 123)).to.be.false; // Removed redundant array form, added 123
        });
    });

    context("typeChecker.isDateObject", () => {
        test("should return true for a Date object instance", () => {
            const currentMoment = new Date();
            assertionUtility(typeChecker.isDateObject(currentMoment)).to.be.true;
        });

        test("should return false for a non-Date value", () => {
            const nonDateInput = 'date_as_string';
            assertionUtility(typeChecker.isDateObject(nonDateInput)).to.be.false;
        });
    });

    context("typeChecker.not.isDateObject", () => {
        test("should return false if the input is a Date object", () => {
            const specificDate = new Date('2023-01-01');
            assertionUtility(typeChecker.not.isDateObject(specificDate)).to.be.false;
        });

        test("should return true if the input is not a Date object", () => {
            const notADateString = 'not_a_date_at_all';
            assertionUtility(typeChecker.not.isDateObject(notADateString)).to.be.true;
        });
    });

    context("typeChecker.all.isDateObject", () => {
        test("should confirm true if all parameters are Date objects", () => {
            const dateOfBirth = new Date('1990-05-15');
            const anotherDate = new Date();
            const dateValues = [dateOfBirth, anotherDate];
            assertionUtility(typeChecker.all.isDateObject(dateValues)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if any parameter is not a Date object", () => {
            const validDate = new Date();
            const invalidDate = 'definitely_not_a_date';
            assertionUtility(typeChecker.all.isDateObject(validDate, invalidDate)).to.be.false; // Removed redundant array form
        });
    });

    context("typeChecker.any.isDateObject", () => {
        test("should confirm true if at least one parameter is a Date object", () => {
            const aDate = new Date();
            const mixedParameters = ['string', aDate, 123];
            assertionUtility(typeChecker.any.isDateObject(mixedParameters)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if no parameters are Date objects", () => {
            assertionUtility(typeChecker.any.isDateObject('string', 1, null, undefined)).to.be.false; // Removed redundant array form, added null
        });
    });

    context("typeChecker.isErrorInstance", () => {
        test("should return true for an Error object", () => {
            const anError = new Error('Test error');
            assertionUtility(typeChecker.isErrorInstance(anError)).to.be.true;
        });

        test("should return false for a non-Error value", () => {
            const notAnError = 'error_string';
            assertionUtility(typeChecker.isErrorInstance(notAnError)).to.be.false;
        });
    });

    context("typeChecker.not.isErrorInstance", () => {
        test("should return false if the input is an Error object", () => {
            const errorObject = new Error('Another error');
            assertionUtility(typeChecker.not.isErrorInstance(errorObject)).to.be.false;
        });

        test("should return true if the input is not an Error object", () => {
            const nonErrorCandidate = 12345;
            assertionUtility(typeChecker.not.isErrorInstance(nonErrorCandidate)).to.be.true;
        });
    });

    context("typeChecker.all.isErrorInstance", () => {
        test("should confirm true if all parameters are Error objects", () => {
            const errOne = new Error('Error one');
            const errTwo = new TypeError('Error two'); // Changed error type for variety
            const errorList = [errOne, errTwo];
            assertionUtility(typeChecker.all.isErrorInstance(errorList)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if any parameter is not an Error object", () => {
            const validError = new Error('Good error');
            const invalidError = 'not_an_error_object';
            assertionUtility(typeChecker.all.isErrorInstance(validError, invalidError)).to.be.false; // Removed redundant array form
        });
    });

    context("typeChecker.any.isErrorInstance", () => {
        test("should confirm true if at least one parameter is an Error object", () => {
            const errorExample = new Error('Example error');
            const mixedItems = [errorExample, new Date(), 'string'];
            assertionUtility(typeChecker.any.isErrorInstance(mixedItems)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if no parameters are Error objects", () => {
            assertionUtility(typeChecker.any.isErrorInstance(1, 2, 3, 'four')).to.be.false; // Removed redundant array form, added 'four'
        });
    });

    context("typeChecker.isFunctionType", () => {
        test("should return true for a function type", () => {
            const someFunction = () => {}; // Used arrow function
            assertionUtility(typeChecker.isFunctionType(someFunction)).to.be.true;
        });

        test("should return false for a non-function value", () => {
            const notAFunction = 'function_string';
            assertionUtility(typeChecker.isFunctionType(notAFunction)).to.be.false;
        });
    });

    context("typeChecker.not.isFunctionType", () => {
        test("should return false if the input is a function", () => {
            const testFunc = function() {};
            assertionUtility(typeChecker.not.isFunctionType(testFunc)).to.be.false; // Corrected original bug
        });

        test("should return true if the input is not a function", () => {
            const nonFunctionValue = ['array_func'];
            assertionUtility(typeChecker.not.isFunctionType(nonFunctionValue)).to.be.true;
        });
    });

    context("typeChecker.all.isFunctionType", () => {
        test("should confirm true if all parameters are functions", () => {
            const funcOne = () => {};
            const funcTwo = function() {};
            assertionUtility(typeChecker.all.isFunctionType(funcOne, funcTwo)).to.be.true; // Removed redundant array form
        });

        test("should confirm false if any parameter is not a function", () => {
            const validFunction = () => {};
            const invalidFunction = 'not_a_function_string';
            assertionUtility(typeChecker.all.isFunctionType([validFunction, invalidFunction])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isFunctionType", () => {
        test("should confirm true if at least one parameter is a function", () => {
            const funcInstance = () => {};
            const mixedValues = [funcInstance, [], 123];
            assertionUtility(typeChecker.any.isFunctionType(mixedValues)).to.be.true; // Removed redundant spread form
        });

        test("should confirm false if no parameters are functions", () => {
            assertionUtility(typeChecker.any.isFunctionType(2, 'test_str', null)).to.be.false; // Removed redundant array form, added null
        });
    });

    context("typeChecker.isNotANumber", () => {
        test("should return true if the input is NaN", () => {
            assertionUtility(typeChecker.isNotANumber(NaN)).to.be.true;
        });

        test("should return false if the input is not NaN", () => {
            const actualNumber = 10;
            assertionUtility(typeChecker.isNotANumber(actualNumber)).to.be.false;
        });
    });

    context("typeChecker.not.isNotANumber", () => {
        test("should return false if the input is NaN", () => {
            assertionUtility(typeChecker.not.isNotANumber(NaN)).to.be.false; // Corrected original bug
        });

        test("should return true if the input is not NaN", () => {
            const aValidNumber = 500;
            assertionUtility(typeChecker.not.isNotANumber(aValidNumber)).to.be.true; // Corrected original bug
        });
    });

    context("typeChecker.all.isNotANumber", () => {
        test("should confirm true if all parameters are NaN", () => {
            assertionUtility(typeChecker.all.isNotANumber(NaN, Number('invalid'))).to.be.true; // Added Number('invalid') for variety, removed redundant array form
        });

        test("should confirm false if any parameter is not NaN", () => {
            const notNaNValue = 'hello';
            assertionUtility(typeChecker.all.isNotANumber([NaN, notNaNValue])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isNotANumber", () => {
        test("should confirm true if at least one parameter is NaN", () => {
            assertionUtility(typeChecker.any.isNotANumber(NaN, 123, 'string_val')).to.be.true; // Removed redundant array form, updated values
        });

        test("should confirm false if no parameters are NaN", () => {
            assertionUtility(typeChecker.any.isNotANumber('test_regex', new RegExp(), 0)).to.be.false; // Removed redundant array form, added 0
        });
    });

    context("typeChecker.isNullValue", () => {
        test("should return true if the input is null", () => {
            assertionUtility(typeChecker.isNullValue(null)).to.be.true;
        });

        test("should return false if the input is not null", () => {
            const nonNullItem = 'null_string';
            assertionUtility(typeChecker.isNullValue(nonNullItem)).to.be.false;
        });
    });

    context("typeChecker.not.isNullValue", () => {
        test("should return false if the input is null", () => {
            assertionUtility(typeChecker.not.isNullValue(null)).to.be.false;
        });

        test("should return true if the input is not null", () => {
            const somethingElse = 'not_null_value';
            assertionUtility(typeChecker.not.isNullValue(somethingElse)).to.be.true;
        });
    });

    context("typeChecker.all.isNullValue", () => {
        test("should confirm true if all parameters are null", () => {
            assertionUtility(typeChecker.all.isNullValue(null, null)).to.be.true; // Removed redundant array form
        });

        test("should confirm false if any parameter is not null", () => {
            const nonNullElement = 'string_null';
            assertionUtility(typeChecker.all.isNullValue([null, nonNullElement])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isNullValue", () => {
        test("should confirm true if at least one parameter is null", () => {
            assertionUtility(typeChecker.any.isNullValue(null, 'test', undefined)).to.be.true; // Removed redundant array form
        });

        test("should confirm false if no parameters are null", () => {
            assertionUtility(typeChecker.any.isNullValue(1, 2, 'three')).to.be.false; // Removed redundant array form, added 'three'
        });
    });

    context("typeChecker.isNumericValue", () => {
        test("should return true if the input is a valid number", () => {
            assertionUtility(typeChecker.isNumericValue(100)).to.be.true;
        });

        test("should return false if the input is not a number", () => {
            const nonNumberString = 'not_a_num';
            assertionUtility(typeChecker.isNumericValue(nonNumberString)).to.be.false;
        });

        test("should return false if the input is NaN", () => {
            assertionUtility(typeChecker.isNumericValue(NaN)).to.be.false;
        });

        // Added new test fragment
        test("should return false for Infinity as it's not a finite number", () => {
            assertionUtility(typeChecker.isNumericValue(Infinity)).to.be.false;
        });
    });

    context("typeChecker.not.isNumericValue", () => {
        test("should return false if the input is a valid number", () => {
            assertionUtility(typeChecker.not.isNumericValue(50)).to.be.false;
        });

        test("should return true if the input is not a number", () => {
            const stringNotNumber = 'numeric_string';
            assertionUtility(typeChecker.not.isNumericValue(stringNotNumber)).to.be.true;
        });

        test("should return true if the input is NaN", () => {
            assertionUtility(typeChecker.not.isNumericValue(NaN)).to.be.true;
        });

        // Added new test fragment
        test("should return true for Infinity as it's not a finite number", () => {
            assertionUtility(typeChecker.not.isNumericValue(Infinity)).to.be.true;
        });
    });

    context("typeChecker.all.isNumericValue", () => {
        test("should confirm true if all parameters are numbers", () => {
            assertionUtility(typeChecker.all.isNumericValue(10, 20, 30)).to.be.true; // Added 30, removed redundant array form
        });

        test("should confirm false if any parameter is not a number", () => {
            const aString = 'string_num';
            assertionUtility(typeChecker.all.isNumericValue([5, aString])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isNumericValue", () => {
        test("should confirm true if at least one parameter is a number", () => {
            assertionUtility(typeChecker.any.isNumericValue(1, 'two', NaN)).to.be.true; // Updated values, removed redundant array form
        });

        test("should confirm false if no parameters are numbers", () => {
            assertionUtility(typeChecker.any.isNumericValue(null, 'test_val', false)).to.be.false; // Removed redundant array form, added false
        });
    });

    context("typeChecker.isPlainObject", () => {
        test("should return true if the input is a plain object", () => {
            assertionUtility(typeChecker.isPlainObject({})).to.be.true;
        });

        test("should return false if the input is not a plain object", () => {
            const nonObjectValue = 'object_string';
            assertionUtility(typeChecker.isPlainObject(nonObjectValue)).to.be.false;
        });
        // Added new test fragment
        test("should return false for null as it is not a plain object", () => {
            assertionUtility(typeChecker.isPlainObject(null)).to.be.false;
        });
    });

    context("typeChecker.not.isPlainObject", () => {
        test("should return false if the input is a plain object", () => {
            assertionUtility(typeChecker.not.isPlainObject({
                a: 1
            })).to.be.false;
        });

        test("should return true if the input is not a plain object", () => {
            const stringObject = 'not_an_object_str';
            assertionUtility(typeChecker.not.isPlainObject(stringObject)).to.be.true;
        });
        // Added new test fragment
        test("should return true for null as it is not a plain object", () => {
            assertionUtility(typeChecker.not.isPlainObject(null)).to.be.true;
        });
    });

    context("typeChecker.all.isPlainObject", () => {
        test("should confirm true if all parameters are plain objects", () => {
            assertionUtility(typeChecker.all.isPlainObject({}, {
                key: 'value'
            })).to.be.true; // Removed redundant array form
        });

        test("should confirm false if any parameter is not a plain object", () => {
            const invalidObject = 'not_object_here';
            assertionUtility(typeChecker.all.isPlainObject([{}, invalidObject])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isPlainObject", () => {
        test("should confirm true if at least one parameter is a plain object", () => {
            assertionUtility(typeChecker.any.isPlainObject({}, {
                id: 1
            }, 'string')).to.be.true; // Removed redundant array form
        });

        test("should confirm false if no parameters are plain objects", () => {
            assertionUtility(typeChecker.any.isPlainObject(1, 2, 'three', null)).to.be.false; // Removed redundant array form, added null
        });
    });

    context("typeChecker.isJSONObject", () => {
        test("should return true if the input is a valid JSON-like object", () => {
            const jsonCandidate = {
                data: 'sample'
            };
            assertionUtility(typeChecker.isJSONObject(jsonCandidate)).to.be.true;
        });

        test("should return false if the input is not a JSON-like object", () => {
            const nonJSONValue = 'json_string';
            assertionUtility(typeChecker.isJSONObject(nonJSONValue)).to.be.false;
        });
        // Added new test fragment
        test("should return false for an Array as it's not a JSON object", () => {
            assertionUtility(typeChecker.isJSONObject([])).to.be.false;
        });
    });

    context("typeChecker.not.isJSONObject", () => {
        test("should return false if the input is a JSON-like object", () => {
            assertionUtility(typeChecker.not.isJSONObject({
                status: 'ok'
            })).to.be.false;
        });

        test("should return true if the input is not a JSON-like object", () => {
            const notAJSONObject = 'another_string';
            assertionUtility(typeChecker.not.isJSONObject(notAJSONObject)).to.be.true;
        });
        // Added new test fragment
        test("should return true for an Array as it's not a JSON object", () => {
            assertionUtility(typeChecker.not.isJSONObject([])).to.be.true;
        });
    });

    context("typeChecker.all.isJSONObject", () => {
        test("should confirm true if all parameters are JSON-like objects", () => {
            assertionUtility(typeChecker.all.isJSONObject({
                a: 1
            }, {
                b: 2
            })).to.be.true; // Removed redundant array form
        });

        test("should confirm false if any parameter is not a JSON-like object", () => {
            const nonJSONCandidate = [];
            const anotherNonJSON = ''; // Added another non-JSON value
            assertionUtility(typeChecker.all.isJSONObject([{}, nonJSONCandidate, anotherNonJSON])).to.be.false; // Removed redundant spread form
        });
    });

    context("typeChecker.any.isJSONObject", () => {
        test("should confirm true if at least one parameter is a JSON-like object", () => {
            assertionUtility(typeChecker.any.isJSONObject({
                val: 'x'
            }, {}, 'string_val')).to.be.true; // Removed redundant array form
        });

        test("should confirm false if no parameters are JSON-like objects", () => {
            assertionUtility(typeChecker.any.isJSONObject(1, 2, 3, 'four_str')).to.be.false; // Removed redundant array form, added 'four_str'
        });
    });

    context("typeChecker.isRegExpObject", () => {
        test("should return true if the input is a RegExp object", () => {
            const regPattern = new RegExp('[a-z]+');
            assertionUtility(typeChecker.isRegExpObject(regPattern)).to.be.true;
        });

        test("should return false if the input is not a RegExp object", () => {
            const notARegExp = 'regex_string';
            assertionUtility(typeChecker.isRegExpObject(notARegExp)).to.be.false;
        });
    });

    context("typeChecker.not.isRegExpObject", () => {
        test("should return false if the input is a RegExp object", () => {
            const anotherRegExp = /abc/i;
            assertionUtility(typeChecker.not.isRegExpObject(anotherRegExp)).to.be.false;
        });
        // Added missing test from original pattern
        test("should return true if the input is not a RegExp object", () => {
            const nonRegExpValue = 12345;
            assertionUtility(typeChecker.not.isRegExpObject(nonRegExpValue)).to.be.true;
        });
    });

    // Added new sections for `all` and `any` for RegExp, following the pattern.
    context("typeChecker.all.isRegExpObject", () => {
        test("should return true if all passed parameter types are RegExp objects", () => {
            const pattern1 = /test/;
            const pattern2 = new RegExp('^start');
            const regexCollection = [pattern1, pattern2];
            assertionUtility(typeChecker.all.isRegExpObject(regexCollection)).to.be.true;
        });
        test("should return false if any passed parameter type is not a RegExp object", () => {
            const validPattern = /valid/;
            const invalidPattern = 'not a regex';
            assertionUtility(typeChecker.all.isRegExpObject(validPattern, invalidPattern)).to.be.false;
        });
    });

    context("typeChecker.any.isRegExpObject", () => {
        test("should return true if any passed parameter type is a RegExp object", () => {
            const regexSample = /sample/;
            assertionUtility(typeChecker.any.isRegExpObject('string', 123, regexSample)).to.be.true;
        });
        test("should return false if all passed parameter types are not RegExp objects", () => {
            assertionUtility(typeChecker.any.isRegExpObject(1, 'string', null)).to.be.false;
        });
    });

    // Added a completely new set of tests for 'string' type, demonstrating new fragment addition.
    context("typeChecker.isStringType", () => {
        test("should return true for a string primitive", () => {
            const textValue = "hello world";
            assertionUtility(typeChecker.isStringType(textValue)).to.be.true;
        });
        test("should return false for a non-string value", () => {
            const numericValue = 123;
            assertionUtility(typeChecker.isStringType(numericValue)).to.be.false;
        });
    });

    context("typeChecker.not.isStringType", () => {
        test("should return false if the input is a string", () => {
            const sampleString = "abc";
            assertionUtility(typeChecker.not.isStringType(sampleString)).to.be.false;
        });
        test("should return true if the input is not a string", () => {
            const notAString = {};
            assertionUtility(typeChecker.not.isStringType(notAString)).to.be.true;
        });
    });

    context("typeChecker.all.isStringType", () => {
        test("should confirm true if all parameters are strings", () => {
            assertionUtility(typeChecker.all.isStringType("one", "two")).to.be.true;
        });
        test("should confirm false if any parameter is not a string", () => {
            const mixedValues = ["string", 123];
            assertionUtility(typeChecker.all.isStringType(mixedValues)).to.be.false;
        });
    });

    context("typeChecker.any.isStringType", () => {
        test("should confirm true if at least one parameter is a string", () => {
            assertionUtility(typeChecker.any.isStringType(1, "hello", null)).to.be.true;
        });
        test("should confirm false if no parameters are strings", () => {
            assertionUtility(typeChecker.any.isStringType(true, [], {})).to.be.false;
        });
    });

});