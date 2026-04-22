let assert = (typeof testTool !== 'undefined') ? testTool.assert : getModule('chai').assert; // Acquire the assertion library, either from global scope or via CommonJS.

suite("type verification routines", () => { // Top-level test suite for type validation.
    suite("utility.argumentsCheck", () => { // Sub-suite for checking argument objects.
        testCase("confirms truthy for argument collection input", () => { // Test case: should identify argument objects correctly.
            const fetchArgs = function() { // Helper function to obtain the 'arguments' object.
                return arguments;
            };
            let argCollection = fetchArgs('alpha'); // Call helper with a sample string.
            assert(utility.argumentsCheck(argCollection)).isTrue; // Verify that it's an arguments object.
        });
        testCase("validates falsy for non-argument collection input", () => { // Test case: should not identify non-argument objects as such.
            let nonArgCollection = ['beta']; // A simple array, not an arguments object.
            assert(utility.argumentsCheck(nonArgCollection)).isFalse; // Verify it's not an arguments object.
        });
    });

    suite("utility.negate.argumentsCheck", () => { // Sub-suite for inverted argument object check.
        testCase("confirms falsy for argument collection input", () => { // Test case: 'not arguments' should be false for an arguments object.
            const fetchArgs = function() { // Helper to get arguments.
                return arguments;
            };
            let argCollection = fetchArgs('gamma'); // Sample arguments object.
            assert(utility.negate.argumentsCheck(argCollection)).isFalse; // Expect false for 'not arguments'.
        });
        testCase("validates truthy for non-argument collection input", () => { // Test case: 'not arguments' should be true for a non-arguments object.
            let nonArgCollection = ['delta']; // Sample non-arguments object.
            assert(utility.negate.argumentsCheck(nonArgCollection)).isTrue; // Expect true for 'not arguments'.
        });
    });

    suite("utility.every.argumentsCheck", () => { // Sub-suite for checking if all inputs are argument objects.
        testCase("confirms truthy if all provided parameters are argument collections", () => { // Test case: all parameters are arguments.
            const fetchArgs = function() { // Helper to get arguments.
                return arguments;
            };
            let argCollection = fetchArgs('epsilon'); // First sample arguments.
            assert(utility.every.argumentsCheck(argCollection, argCollection)).isTrue; // Check multiple direct arguments.
            assert(utility.every.argumentsCheck([argCollection, argCollection])).isTrue; // Check multiple arguments in an array.
        });
        testCase("validates falsy if any provided parameter is not an argument collection", () => { // Test case: at least one parameter is not arguments.
            let nonArgCollection = ['zeta']; // Non-arguments object.
            const fetchArgs = function() { // Helper to get arguments.
                return arguments;
            };
            let argCollection = fetchArgs('eta'); // Arguments object.
            assert(utility.every.argumentsCheck(argCollection, nonArgCollection)).isFalse; // Check mixed types directly.
            assert(utility.every.argumentsCheck([argCollection, nonArgCollection])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.argumentsCheck", () => { // Sub-suite for checking if any input is an argument object.
        testCase("confirms truthy if any provided parameter is an argument collection", () => { // Test case: at least one parameter is an arguments.
            const fetchArgs = function() { // Helper to get arguments.
                return arguments;
            };
            let argCollection = fetchArgs('theta'); // Arguments object.
            assert(utility.some.argumentsCheck('iota', argCollection)).isTrue; // Check mixed types directly.
            assert(utility.some.argumentsCheck(['kappa', argCollection])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not argument collections", () => { // Test case: none of the parameters are arguments.
            assert(utility.some.argumentsCheck('lambda', null)).isFalse; // Check multiple non-arguments directly.
            assert(utility.some.argumentsCheck(['mu', null])).isFalse; // Check multiple non-arguments in an array.
        });
    });

    suite("utility.arrayCheck", () => { // Sub-suite for array type verification.
        testCase("confirms truthy if provided parameter is an array", () => { // Test case: input is an array.
            let sampleList = ['nu']; // A standard array.
            assert(utility.arrayCheck(sampleList)).isTrue; // Confirm it's an array.
        });
        testCase("validates falsy if provided parameter is not an array", () => { // Test case: input is not an array.
            let nonList = 'xi'; // A string, not an array.
            assert(utility.arrayCheck(nonList)).isFalse; // Confirm it's not an array.
        });
    });

    suite("utility.negate.arrayCheck", () => { // Sub-suite for inverted array check.
        testCase("confirms falsy if provided parameter is an array", () => { // Test case: 'not array' should be false for an array.
            let sampleList = ['omicron']; // A standard array.
            assert(utility.negate.arrayCheck(sampleList)).isFalse; // Expect false for 'not array'.
        });
        testCase("validates truthy if provided parameter is not an array", () => { // Test case: 'not array' should be true for a non-array.
            let nonList = 'pi'; // A string, not an array.
            assert(utility.negate.arrayCheck(nonList)).isTrue; // Expect true for 'not array'.
        });
    });

    suite("utility.every.arrayCheck", () => { // Sub-suite for checking if all inputs are arrays.
        testCase("confirms truthy if all provided parameters are arrays", () => { // Test case: all parameters are arrays.
            let sampleListOne = ['rho']; // First sample array.
            let sampleListTwo = ['sigma']; // Second sample array.
            assert(utility.every.arrayCheck(sampleListOne, sampleListTwo)).isTrue; // Check multiple direct arrays.
            assert(utility.every.arrayCheck([sampleListOne, sampleListTwo])).isTrue; // Check multiple arrays in an array.
        });
        testCase("validates falsy if any provided parameter is not an array", () => { // Test case: at least one parameter is not an array.
            let nonList = 'tau'; // A string, not an array.
            let sampleList = ['upsilon']; // An array.
            assert(utility.every.arrayCheck(nonList, sampleList)).isFalse; // Check mixed types directly.
            assert(utility.every.arrayCheck([nonList, sampleList])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.arrayCheck", () => { // Sub-suite for checking if any input is an array.
        testCase("confirms truthy if any provided parameter is an array", () => { // Test case: at least one parameter is an array.
            let sampleListOne = ['phi']; // First sample array.
            let sampleListTwo = ['chi']; // Second sample array.
            assert(utility.some.arrayCheck(sampleListOne, sampleListTwo, 'psi')).isTrue; // Check mixed types directly.
            assert(utility.some.arrayCheck([sampleListOne, sampleListTwo, 'omega'])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not arrays", () => { // Test case: none of the parameters are arrays.
            assert(utility.some.arrayCheck('alpha', 'beta')).isFalse; // Check multiple non-arrays directly.
            assert(utility.some.arrayCheck(['gamma', 'delta'])).isFalse; // Check multiple non-arrays in an array.
        });
    });

    suite("utility.booleanCheck", () => { // Sub-suite for boolean type verification.
        testCase("confirms truthy if provided parameter is a boolean", () => { // Test case: input is a boolean.
            let boolFlag = Boolean(1); // A boolean value.
            assert(utility.booleanCheck(boolFlag)).isTrue; // Confirm it's a boolean.
        });
        testCase("validates falsy if provided parameter is not a boolean", () => { // Test case: input is not a boolean.
            let nonBoolFlag = 'epsilon'; // A string, not a boolean.
            assert(utility.booleanCheck(nonBoolFlag)).isFalse; // Confirm it's not a boolean.
        });
    });

    suite("utility.negate.booleanCheck", () => { // Sub-suite for inverted boolean check.
        testCase("confirms truthy if provided parameter is not a boolean", () => { // Test case: 'not boolean' should be true for a non-boolean.
            let nonBoolFlag = 'zeta'; // A string, not a boolean.
            assert(utility.negate.booleanCheck(nonBoolFlag)).isTrue; // Expect true for 'not boolean'.
        });
        testCase("confirms falsy if provided parameter is a boolean", () => { // Test case: 'not boolean' should be false for a boolean.
            let boolFlag = Boolean(0); // A boolean value.
            assert(utility.negate.booleanCheck(boolFlag)).isFalse; // Expect false for 'not boolean'.
        });
    });

    suite("utility.every.booleanCheck", () => { // Sub-suite for checking if all inputs are booleans.
        testCase("confirms truthy if all provided parameters are booleans", () => { // Test case: all parameters are booleans.
            let boolFlagOne = Boolean(1); // First sample boolean.
            let boolFlagTwo = Boolean(0); // Second sample boolean.
            assert(utility.every.booleanCheck(boolFlagOne, boolFlagTwo)).isTrue; // Check multiple direct booleans.
            assert(utility.every.booleanCheck([boolFlagOne, boolFlagTwo])).isTrue; // Check multiple booleans in an array.
        });
        testCase("confirms falsy if provided parameter type is not boolean", () => { // Test case: at least one parameter is not a boolean.
            let boolFlag = Boolean(1); // A boolean.
            let nonBoolFlag = 'eta'; // A string, not a boolean.
            assert(utility.every.booleanCheck(boolFlag, nonBoolFlag)).isFalse; // Check mixed types directly.
            assert(utility.every.booleanCheck([boolFlag, nonBoolFlag])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.booleanCheck", () => { // Sub-suite for checking if any input is a boolean.
        testCase("confirms truthy if any provided parameter is a boolean", () => { // Test case: at least one parameter is a boolean.
            let boolFlagOne = Boolean(1); // First sample boolean.
            let boolFlagTwo = Boolean(0); // Second sample boolean.
            assert(utility.some.booleanCheck(boolFlagOne, boolFlagTwo, ['theta'])).isTrue; // Check mixed types directly.
            assert(utility.some.booleanCheck([boolFlagOne, boolFlagTwo, ['iota']])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not booleans", () => { // Test case: none of the parameters are booleans.
            assert(utility.some.booleanCheck('kappa', {}, null)).isFalse; // Check multiple non-booleans directly.
            assert(utility.some.booleanCheck(['lambda', {}, null])).isFalse; // Check multiple non-booleans in an array.
        });
    });

    suite("utility.dateCheck", () => { // Sub-suite for date object verification.
        testCase("confirms truthy if provided parameter is a date object", () => { // Test case: input is a Date object.
            let dateInstance = new Date(); // A new Date object.
            assert(utility.dateCheck(dateInstance)).isTrue; // Confirm it's a Date.
        });
        testCase("validates falsy if provided parameter is not a date object", () => { // Test case: input is not a Date object.
            let nonDateInstance = 'mu'; // A string, not a Date.
            assert(utility.dateCheck(nonDateInstance)).isFalse; // Confirm it's not a Date.
        });
    });

    suite("utility.negate.dateCheck", () => { // Sub-suite for inverted date check.
        testCase("confirms falsy if provided parameter is a date object", () => { // Test case: 'not date' should be false for a Date object.
            let dateInstance = new Date(); // A new Date object.
            assert(utility.negate.dateCheck(dateInstance)).isFalse; // Expect false for 'not date'.
        });
        testCase("validates truthy if provided parameter is not a date object", () => { // Test case: 'not date' should be true for a non-Date object.
            let nonDateInstance = 'nu'; // A string, not a Date.
            assert(utility.negate.dateCheck(nonDateInstance)).isTrue; // Expect true for 'not date'.
        });
    });

    suite("utility.every.dateCheck", () => { // Sub-suite for checking if all inputs are date objects.
        testCase("confirms truthy if all provided parameters are date objects", () => { // Test case: all parameters are Date objects.
            let dateOfBirth = new Date('01-01-2000'); // First sample Date.
            let currentDate = new Date(); // Second sample Date.
            assert(utility.every.dateCheck(dateOfBirth, currentDate)).isTrue; // Check multiple direct Dates.
            assert(utility.every.dateCheck([dateOfBirth, currentDate])).isTrue; // Check multiple Dates in an array.
        });
        testCase("validates falsy if any provided parameter is not a date object", () => { // Test case: at least one parameter is not a Date object.
            let dateInstance = new Date(); // A Date object.
            let nonDateInstance = 'xi'; // A string, not a Date.
            assert(utility.every.dateCheck(dateInstance, nonDateInstance)).isFalse; // Check mixed types directly.
            assert(utility.every.dateCheck([dateInstance, nonDateInstance])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.dateCheck", () => { // Sub-suite for checking if any input is a date object.
        testCase("confirms truthy if any provided parameter is a date object", () => { // Test case: at least one parameter is a Date object.
            let dateInstance = new Date(); // A Date object.
            assert(utility.some.dateCheck('omicron', dateInstance)).isTrue; // Check mixed types directly.
            assert(utility.some.dateCheck(['pi', dateInstance])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not date objects", () => { // Test case: none of the parameters are Date objects.
            assert(utility.some.dateCheck('rho', 1, void 0)).isFalse; // Check multiple non-Dates directly.
            assert(utility.some.dateCheck(['sigma', 1, void 0])).isFalse; // Check multiple non-Dates in an array.
        });
    });

    suite("utility.errorCheck", () => { // Sub-suite for error object verification.
        testCase("confirms truthy if provided parameter is an error object", () => { // Test case: input is an Error object.
            let errObject = new Error(); // A new Error object.
            assert(utility.errorCheck(errObject)).isTrue; // Confirm it's an Error.
        });
        testCase("validates falsy if provided parameter is not an error object", () => { // Test case: input is not an Error object.
            let nonErrObject = 'tau'; // A string, not an Error.
            assert(utility.errorCheck(nonErrObject)).isFalse; // Confirm it's not an Error.
        });
    });

    suite("utility.negate.errorCheck", () => { // Sub-suite for inverted error check.
        testCase("confirms falsy if provided parameter is an error object", () => { // Test case: 'not error' should be false for an Error object.
            let errObject = new Error(); // An Error object.
            assert(utility.negate.errorCheck(errObject)).isFalse; // Expect false for 'not error'.
        });
        testCase("validates truthy if provided parameter is not an error object", () => { // Test case: 'not error' should be true for a non-Error object.
            let nonErrObject = 'upsilon'; // A string, not an Error.
            assert(utility.negate.errorCheck(nonErrObject)).isTrue; // Expect true for 'not error'.
        });
    });

    suite("utility.every.errorCheck", () => { // Sub-suite for checking if all inputs are error objects.
        testCase("confirms truthy if all provided parameters are error objects", () => { // Test case: all parameters are Error objects.
            let errObjectOne = new Error(); // First sample Error.
            let errObjectTwo = new Error(); // Second sample Error.
            assert(utility.every.errorCheck(errObjectOne, errObjectTwo)).isTrue; // Check multiple direct Errors.
            assert(utility.every.errorCheck([errObjectOne, errObjectTwo])).isTrue; // Check multiple Errors in an array.
        });
        testCase("validates falsy if any provided parameter is not an error object", () => { // Test case: at least one parameter is not an Error object.
            let errObject = new Error(); // An Error object.
            let nonErrObject = 'phi'; // A string, not an Error.
            assert(utility.every.errorCheck(errObject, nonErrObject)).isFalse; // Check mixed types directly.
            assert(utility.every.errorCheck([errObject, nonErrObject])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.errorCheck", () => { // Sub-suite for checking if any input is an error object.
        testCase("confirms truthy if any provided parameter is an error object", () => { // Test case: at least one parameter is an Error object.
            let errObjectOne = new Error(); // An Error object.
            assert(utility.some.errorCheck(errObjectOne, new Date())).isTrue; // Check mixed types directly.
            assert(utility.some.errorCheck([errObjectOne, new Date()])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not error objects", () => { // Test case: none of the parameters are Error objects.
            assert(utility.some.errorCheck(1, 2, 3)).isFalse; // Check multiple non-Errors directly.
            assert(utility.some.errorCheck([1, 2, 3])).isFalse; // Check multiple non-Errors in an array.
        });
    });

    suite("utility.functionCheck", () => { // Sub-suite for function type verification.
        testCase("confirms truthy if provided parameter is a function", () => { // Test case: input is a function.
            assert(utility.functionCheck(utility.functionCheck)).isTrue; // Confirm that a utility function itself is a function.
        });
        testCase("validates falsy if provided parameter is not a function", () => { // Test case: input is not a function.
            let nonProcRef = 'chi'; // A string, not a function.
            assert(utility.functionCheck(nonProcRef)).isFalse; // Confirm it's not a function.
        });
    });

    suite("utility.negate.functionCheck", () => { // Sub-suite for inverted function check.
        testCase("confirms falsy for non-function input (via functionCheck)", () => { // Test case: 'functionCheck' on a non-function should be false.
            let nonProcRef = 'psi'; // A string, not a function.
            assert(utility.functionCheck(nonProcRef)).isFalse; // Replicates original logic (even if it seems misplaced).
        });
        testCase("confirms falsy when function is passed to negate.functionCheck", () => { // Test case: 'not function' should be false for a function.
            assert(utility.negate.functionCheck(utility.functionCheck)).isFalse; // Expect false when a function is passed to 'not function'.
        });
    });

    suite("utility.every.functionCheck", () => { // Sub-suite for checking if all inputs are functions.
        testCase("confirms truthy if all provided parameters are functions", () => { // Test case: all parameters are functions.
            assert(utility.every.functionCheck(utility.functionCheck, utility.stringCheck)).isTrue; // Check multiple direct functions.
            assert(utility.every.functionCheck([utility.functionCheck, utility.stringCheck])).isTrue; // Check multiple functions in an array.
        });
        testCase("validates falsy if any provided parameter is not a function", () => { // Test case: at least one parameter is not a function.
            let nonProcRef = 'omega'; // A string, not a function.
            assert(utility.every.functionCheck(utility.functionCheck, nonProcRef)).isFalse; // Check mixed types directly.
            assert(utility.every.functionCheck([utility.functionCheck, nonProcRef])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.functionCheck", () => { // Sub-suite for checking if any input is a function.
        testCase("confirms truthy if any provided parameter is a function", () => { // Test case: at least one parameter is a function.
            assert(utility.some.functionCheck(utility.functionCheck, [])).isTrue; // Check mixed types directly.
            assert(utility.some.functionCheck([utility.functionCheck, []])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not functions", () => { // Test case: none of the parameters are functions.
            assert(utility.some.functionCheck(2, 'alpha')).isFalse; // Check multiple non-functions directly.
            assert(utility.some.functionCheck([2, 'beta'])).isFalse; // Check multiple non-functions in an array.
        });
    });

    suite("utility.nanCheck", () => { // Sub-suite for NaN verification.
        testCase("confirms truthy if provided parameter is NaN", () => { // Test case: input is NaN.
            assert(utility.nanCheck(0/0)).isTrue; // Confirm it's NaN.
        });
        testCase("validates falsy if provided parameter is not NaN", () => { // Test case: input is not NaN.
            let nonNanValue = 'gamma'; // A string, not NaN.
            assert(utility.nanCheck(nonNanValue)).isFalse; // Confirm it's not NaN.
        });
    });

    suite("utility.negate.nanCheck", () => { // Sub-suite for inverted NaN check.
        testCase("confirms truthy if provided parameter is not NaN", () => { // Test case: 'not NaN' should be true for a non-NaN value.
            let nonNanValue = 'delta'; // A string, not NaN.
            assert(utility.negate.nanCheck(nonNanValue)).isTrue; // Expect true for 'not NaN'.
        });
        testCase("confirms falsy if provided parameter is NaN", () => { // Test case: 'not NaN' should be false for NaN.
            assert(utility.negate.nanCheck(0/0)).isFalse; // Expect false for 'not NaN'.
        });
    });

    suite("utility.every.nanCheck", () => { // Sub-suite for checking if all inputs are NaN.
        testCase("confirms truthy if all provided parameters are NaN", () => { // Test case: all parameters are NaN.
            assert(utility.every.nanCheck(0/0, 0/0)).isTrue; // Check multiple direct NaN values.
            assert(utility.every.nanCheck([0/0, 0/0])).isTrue; // Check multiple NaN values in an array.
        });
        testCase("validates falsy if any provided parameter is not NaN", () => { // Test case: at least one parameter is not NaN.
            let nonNanValue = 'epsilon'; // A string, not NaN.
            assert(utility.every.nanCheck(0/0, nonNanValue)).isFalse; // Check mixed types directly.
            assert(utility.every.nanCheck([0/0, nonNanValue])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.nanCheck", () => { // Sub-suite for checking if any input is NaN.
        testCase("confirms truthy if any provided parameter is NaN", () => { // Test case: at least one parameter is NaN.
            assert(utility.some.nanCheck(0/0, 0/0, 'zeta')).isTrue; // Check mixed types directly.
            assert(utility.some.nanCheck([0/0, 0/0, 'eta'])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not NaN", () => { // Test case: none of the parameters are NaN.
            assert(utility.some.nanCheck('theta', new RegExp())).isFalse; // Check multiple non-NaN values directly.
            assert(utility.some.nanCheck(['iota', new RegExp()])).isFalse; // Check multiple non-NaN values in an array.
        });
    });

    suite("utility.nullCheck", () => { // Sub-suite for null value verification.
        testCase("confirms truthy if provided parameter is null", () => { // Test case: input is null.
            assert(utility.nullCheck(null)).isTrue; // Confirm it's null.
        });
        testCase("validates falsy if provided parameter is not null", () => { // Test case: input is not null.
            let nonNullValue = 'kappa'; // A string, not null.
            assert(utility.nullCheck(nonNullValue)).isFalse; // Confirm it's not null.
        });
    });

    suite("utility.negate.nullCheck", () => { // Sub-suite for inverted null check.
        testCase("confirms falsy if provided parameter is null", () => { // Test case: 'not null' should be false for null.
            assert(utility.negate.nullCheck(null)).isFalse; // Expect false for 'not null'.
        });
        testCase("validates truthy if provided parameter is not null", () => { // Test case: 'not null' should be true for a non-null value.
            let nonNullValue = 'lambda'; // A string, not null.
            assert(utility.negate.nullCheck(nonNullValue)).isTrue; // Expect true for 'not null'.
        });
    });

    suite("utility.every.nullCheck", () => { // Sub-suite for checking if all inputs are null.
        testCase("confirms truthy if all provided parameters are null", () => { // Test case: all parameters are null.
            assert(utility.every.nullCheck(null, null)).isTrue; // Check multiple direct null values.
            assert(utility.every.nullCheck([null, null])).isTrue; // Check multiple null values in an array.
        });
        testCase("validates falsy if any provided parameter is not null", () => { // Test case: at least one parameter is not null.
            let nonNullValue = 'mu'; // A string, not null.
            assert(utility.every.nullCheck(null, nonNullValue)).isFalse; // Check mixed types directly.
            assert(utility.every.nullCheck([null, nonNullValue])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.nullCheck", () => { // Sub-suite for checking if any input is null.
        testCase("confirms truthy if any provided parameter is null", () => { // Test case: at least one parameter is null.
            assert(utility.some.nullCheck(null, null, void 0)).isTrue; // Check mixed types directly.
            assert(utility.some.nullCheck([null, null, void 0])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not null", () => { // Test case: none of the parameters are null.
            assert(utility.some.nullCheck(1, 2)).isFalse; // Check multiple non-null values directly.
            assert(utility.some.nullCheck([1, 2])).isFalse; // Check multiple non-null values in an array.
        });
    });

    suite("utility.numberCheck", () => { // Sub-suite for number type verification.
        testCase("confirms truthy if provided parameter is a number", () => { // Test case: input is a number.
            assert(utility.numberCheck(1)).isTrue; // Confirm it's a number.
        });
        testCase("validates falsy if provided parameter is not a number", () => { // Test case: input is not a number.
            let nonNumValue = 'nu'; // A string, not a number.
            assert(utility.numberCheck(nonNumValue)).isFalse; // Confirm it's not a number.
        });
        testCase("confirms falsy if provided parameter is NaN", () => { // Test case: NaN should not be considered a number.
            assert(utility.numberCheck(0/0)).isFalse; // Confirm NaN is not a number.
        })
    });

    suite("utility.negate.numberCheck", () => { // Sub-suite for inverted number check.
        testCase("confirms falsy if provided parameter is a number", () => { // Test case: 'not number' should be false for a number.
            assert(utility.negate.numberCheck(1)).isFalse; // Expect false for 'not number'.
        });
        testCase("validates truthy if provided parameter is not a number", () => { // Test case: 'not number' should be true for a non-number.
            let nonNumValue = 'xi'; // A string, not a number.
            assert(utility.negate.numberCheck(nonNumValue)).isTrue; // Expect true for 'not number'.
        });
        testCase("confirms truthy if provided parameter is NaN", () => { // Test case: 'not number' should be true for NaN.
            assert(utility.negate.numberCheck(0/0)).isTrue; // Expect true for 'not number' when input is NaN.
        })
    });

    suite("utility.every.numberCheck", () => { // Sub-suite for checking if all inputs are numbers.
        testCase("confirms truthy if all provided parameters are numbers", () => { // Test case: all parameters are numbers.
            assert(utility.every.numberCheck(1, 2)).isTrue; // Check multiple direct numbers.
            assert(utility.every.numberCheck([1, 2])).isTrue; // Check multiple numbers in an array.
        });
        testCase("validates falsy if any provided parameter is not a number", () => { // Test case: at least one parameter is not a number.
            let nonNumValue = 'omicron'; // A string, not a number.
            assert(utility.every.numberCheck(1, nonNumValue)).isFalse; // Check mixed types directly.
            assert(utility.every.numberCheck([1, nonNumValue])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.numberCheck", () => { // Sub-suite for checking if any input is a number.
        testCase("confirms truthy if any provided parameter is a number", () => { // Test case: at least one parameter is a number.
            assert(utility.some.numberCheck(1, 2, 0/0)).isTrue; // Check mixed types directly (cloning original test logic).
            assert(utility.some.numberCheck([1, 2, 0/0])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not numbers", () => { // Test case: none of the parameters are numbers.
            assert(utility.some.numberCheck(null, 'pi')).isFalse; // Check multiple non-numbers directly.
            assert(utility.some.numberCheck([null, 'rho'])).isFalse; // Check multiple non-numbers in an array.
        });
    });

    suite("utility.objectCheck", () => { // Sub-suite for object type verification.
        testCase("confirms truthy if provided parameter is an object", () => { // Test case: input is an object.
            assert(utility.objectCheck({})).isTrue; // Confirm it's an object.
        });
        testCase("validates falsy if provided parameter is not an object", () => { // Test case: input is not an object.
            let nonObjInstance = 'sigma'; // A string, not an object.
            assert(utility.objectCheck(nonObjInstance)).isFalse; // Confirm it's not an object.
        });
    });

    suite("utility.negate.objectCheck", () => { // Sub-suite for inverted object check.
        testCase("confirms falsy if provided parameter is an object", () => { // Test case: 'not object' should be false for an object.
            assert(utility.negate.objectCheck({})).isFalse; // Expect false for 'not object'.
        });
        testCase("validates truthy if provided parameter is not an object", () => { // Test case: 'not object' should be true for a non-object.
            let nonObjInstance = 'tau'; // A string, not an object.
            assert(utility.negate.objectCheck(nonObjInstance)).isTrue; // Expect true for 'not object'.
        });
    });

    suite("utility.every.objectCheck", () => { // Sub-suite for checking if all inputs are objects.
        testCase("confirms truthy if all provided parameters are objects", () => { // Test case: all parameters are objects.
            assert(utility.every.objectCheck({}, {})).isTrue; // Check multiple direct objects.
            assert(utility.every.objectCheck([{}, {}])).isTrue; // Check multiple objects in an array.
        });
        testCase("validates falsy if any provided parameter is not an object", () => { // Test case: at least one parameter is not an object.
            let nonObjInstance = 'upsilon'; // A string, not an object.
            assert(utility.every.objectCheck({}, nonObjInstance)).isFalse; // Check mixed types directly.
            assert(utility.every.objectCheck([{}, nonObjInstance])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.objectCheck", () => { // Sub-suite for checking if any input is an object.
        testCase("confirms truthy if any provided parameter is an object", () => { // Test case: at least one parameter is an object.
            assert(utility.some.objectCheck({}, {}, 'phi')).isTrue; // Check mixed types directly.
            assert(utility.some.objectCheck([{}, {}, 'chi'])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not objects", () => { // Test case: none of the parameters are objects.
            assert(utility.some.objectCheck(1, 2, 3)).isFalse; // Check multiple non-objects directly.
            assert(utility.some.objectCheck([1, 2, 3])).isFalse; // Check multiple non-objects in an array.
        });
    });

    suite("utility.jsonCheck", () => { // Sub-suite for JSON object verification.
        testCase("confirms truthy if provided parameter is a JSON object", () => { // Test case: input is a plain object.
            assert(utility.jsonCheck({})).isTrue; // Confirm it's a JSON-like object.
        });
        testCase("validates falsy if provided parameter is not a JSON object", () => { // Test case: input is not a plain object.
            let nonPlainObject = 'psi'; // A string, not a plain object.
            assert(utility.jsonCheck(nonPlainObject)).isFalse; // Confirm it's not a JSON-like object.
        });
    });

    suite("utility.negate.jsonCheck", () => { // Sub-suite for inverted JSON object check.
        testCase("confirms falsy if provided parameter is a JSON object", () => { // Test case: 'not JSON' should be false for a plain object.
            assert(utility.negate.jsonCheck({})).isFalse; // Expect false for 'not JSON'.
        });
        testCase("validates truthy if provided parameter is not a JSON object", () => { // Test case: 'not JSON' should be true for a non-plain object.
            let nonPlainObject = 'omega'; // A string, not a plain object.
            assert(utility.negate.jsonCheck(nonPlainObject)).isTrue; // Expect true for 'not JSON'.
        });
    });

    suite("utility.every.jsonCheck", () => { // Sub-suite for checking if all inputs are JSON objects.
        testCase("confirms truthy if all provided parameters are plain objects", () => { // Test case: all parameters are plain objects.
            assert(utility.every.jsonCheck({}, {})).isTrue; // Check multiple direct plain objects.
            assert(utility.every.jsonCheck([{}, {}])).isTrue; // Check multiple plain objects in an array.
        });
        testCase("validates falsy if any provided parameter is not a plain object", () => { // Test case: at least one parameter is not a plain object.
            let nonPlainObject = 'alpha'; // A string, not a plain object.
            assert(utility.every.jsonCheck({}, nonPlainObject,[])).isFalse; // Check mixed types directly.
            assert(utility.every.jsonCheck([{}, nonPlainObject,""])).isFalse; // Check mixed types in an array.
        });
    });

    suite("utility.some.jsonCheck", () => { // Sub-suite for checking if any input is a JSON object.
        testCase("confirms truthy if any provided parameter is a JSON object", () => { // Test case: at least one parameter is a plain object.
            assert(utility.some.jsonCheck({}, {}, 'beta')).isTrue; // Check mixed types directly.
            assert(utility.some.jsonCheck([{}, {}, 'gamma'])).isTrue; // Check mixed types in an array.
        });
        testCase("validates falsy if all provided parameters are not JSON objects", () => { // Test case: none of the parameters are plain objects.
            assert(utility.some.jsonCheck(1, 2, 3)).isFalse; // Check multiple non-plain objects directly.
            assert(utility.some.jsonCheck([1, 2, 3])).isFalse; // Check multiple non-plain objects in an array.
        });
    });

    suite("utility.regexpCheck", () => { // Sub-suite for regular expression object verification.
        testCase("confirms truthy if provided parameter is a RegExp object", () => { // Test case: input is a RegExp object.
            let regexPattern = new RegExp(); // A new RegExp object.
            assert(utility.regexpCheck(regexPattern)).isTrue; // Confirm it's a RegExp.
        });
        testCase("validates falsy if provided parameter is not a RegExp object", () => { // Test case: input is not a RegExp object.
            let nonRegexPattern = 'delta'; // A string, not a RegExp.
            assert(utility.regexpCheck(nonRegexPattern)).isFalse; // Confirm it's not a RegExp.
        });
    });

    suite("utility.negate.regexpCheck", () => { // Sub-suite for inverted RegExp check.
        testCase("confirms falsy if provided parameter is a RegExp object", () => { // Test case: 'not RegExp' should be false for a RegExp object.
            let regexPattern = new RegExp(); // A RegExp object.
            assert(utility.negate.regexpCheck(regexPattern)).isFalse; // Expect false for 'not RegExp'.
        });
    });
});