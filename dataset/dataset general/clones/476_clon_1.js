/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, keywords, operators, and literals are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

// Establish the 'expect' variable, potentially from Chai for assertions.
var expect = (typeof chai != 'undefined') ?
    chai.expect // Use Chai's expect if available (browser environment)
    :
    require('chai').expect; // Otherwise, use Node.js require for Chai

// Main test suite for type checking functionalities.
describe("type checks", function() {

    // Test suite for the 'is.arguments' method.
    describe("is.arguments", function() {

        // Test case: should return true for 'arguments' type.
        it("should return true if passed parameter type is arguments", function() {
            // Helper function to get an arguments object.
            var getArguments = function() {
                return arguments; // The 'arguments' keyword refers to function arguments.
            };

            // Obtain an arguments object.
            var arguments = getArguments('test'); // Pass a dummy argument.

            /*
             * Assert that 'is.arguments' correctly identifies
             * the obtained 'arguments' object.
             */
            expect(is.arguments(arguments))
                .to
                .be
                .true;
        });

        // Test case: should return false for non-'arguments' types.
        it("should return false if passed parameter type is not arguments", function() {
            // An array is not an arguments object.
            var notArguments = ['test'];

            // Verify that 'is.arguments' returns false for an array.
            expect(is.arguments(notArguments)).to.be.false;
        });

    }); // End of 'is.arguments' describe block.


    // Test suite for the 'is.not.arguments' method.
    describe("is.not.arguments", function() {

        // Test case: should return false for 'arguments' type.
        it("should return false if passed parameter type is arguments", function() {
            var getArguments = function() {
                return arguments;
            };
            var arguments = getArguments('test');
            expect(is.not.arguments(arguments)).to.be.false;
        });

        // Test case: should return true for non-'arguments' types.
        it("should return true if passed parameter type is not arguments", function() {
            var notArguments = ['test'];
            expect(is.not.arguments(notArguments)).to.be.true;
        });

    }); // End of 'is.not.arguments' describe block.


    // Test suite for the 'is.all.arguments' method.
    describe("is.all.arguments", function() {

        // Test case: should return true if all parameters are 'arguments' type.
        it("should return true if all passed parameter types are arguments", function() {
            var getArguments = function() {
                return arguments;
            };
            var arguments = getArguments('test');
            expect(is.all.arguments(arguments, arguments)).to.be.true;
            expect(is.all.arguments([arguments, arguments])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'arguments' type.
        it("should return false if any passed parameter type is not arguments", function() {
            var notArguments = ['test'];
            var getArguments = function() {
                return arguments;
            };
            var arguments = getArguments('test');
            expect(is.all.arguments(arguments, notArguments)).to.be.false;
            expect(is.all.arguments([arguments, notArguments])).to.be.false;
        });

    }); // End of 'is.all.arguments' describe block.


    // Test suite for the 'is.any.arguments' method.
    describe("is.any.arguments", function() {

        // Test case: should return true if at least one parameter is 'arguments' type.
        it("should return true if any passed parameter type is arguments", function() {
            var getArguments = function() {
                return arguments;
            };
            var arguments = getArguments('test');
            expect(is.any.arguments('test', arguments)).to.be.true;
            expect(is.any.arguments(['test', arguments])).to.be.true;
        });

        // Test case: should return false if no parameter is 'arguments' type.
        it("should return false if all passed parameter types are not arguments", function() {
            expect(is.any.arguments('test', null)).to.be.false;
            expect(is.any.arguments(['test', null])).to.be.false;
        });

    }); // End of 'is.any.arguments' describe block.


    // Test suite for the 'is.array' method.
    describe("is.array", function() {

        // Test case: should return true for 'array' type.
        it("should return true if passed parameter type is array", function() {
            var array = ['test'];
            expect(is.array(array)).to.be.true;
        });

        // Test case: should return false for non-'array' types.
        it("should return false if passed parameter type is not array", function() {
            var notArray = 'test';
            expect(is.array(notArray)).to.be.false;
        });

    }); // End of 'is.array' describe block.


    // Test suite for the 'is.not.array' method.
    describe("is.not.array", function() {

        // Test case: should return false for 'array' type.
        it("should return false if passed parameter type is array", function() {
            var array = ['test'];
            expect(is.not.array(array)).to.be.false;
        });

        // Test case: should return true for non-'array' types.
        it("should return true if passed parameter type is not array", function() {
            var notArray = 'test';
            expect(is.not.array(notArray)).to.be.true;
        });

    }); // End of 'is.not.array' describe block.


    // Test suite for the 'is.all.array' method.
    describe("is.all.array", function() {

        // Test case: should return true if all parameters are 'array' type.
        it("should return true if all passed parameters types are array", function() {
            var array = ['test'];
            var array2 = ['test2'];
            expect(is.all.array(array, array2)).to.be.true;
            expect(is.all.array([array, array2])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'array' type.
        it("should return false if any passed parameter type is not array", function() {
            var notArray = 'test';
            var array = ['test'];
            expect(is.all.array(notArray, array)).to.be.false;
            expect(is.all.array([notArray, array])).to.be.false;
        });

    }); // End of 'is.all.array' describe block.


    // Test suite for the 'is.any.array' method.
    describe("is.any.array", function() {

        // Test case: should return true if at least one parameter is 'array' type.
        it("should return true if any passed parameter type is array", function() {
            var array = ['test'];
            var array2 = ['test2'];
            expect(is.any.array(array, array2, 'test')).to.be.true;
            expect(is.any.array([array, array2, 'test'])).to.be.true;
        });

        // Test case: should return false if no parameter is 'array' type.
        it("should return false if all passed parameter types are not array", function() {
            expect(is.any.array('test', 'test2')).to.be.false;
            expect(is.any.array(['test', 'test2'])).to.be.false;
        });

    }); // End of 'is.any.array' describe block.


    // Test suite for the 'is.boolean' method.
    describe("is.boolean", function() {

        // Test case: should return true for 'boolean' type.
        it("should return true if passed parameter type is boolean", function() {
            var bool = true;
            expect(is.boolean(bool)).to.be.true;
        });

        // Test case: should return false for non-'boolean' types.
        it("should return false if passed parameter type is not boolean", function() {
            var notBool = 'test';
            expect(is.boolean(notBool)).to.be.false;
        });

    }); // End of 'is.boolean' describe block.


    // Test suite for the 'is.not.boolean' method.
    describe("is.not.boolean", function() {

        // Test case: should return true for non-'boolean' type.
        it("should return true if passed parameter type is not boolean", function() {
            var notBool = 'test';
            expect(is.not.boolean(notBool)).to.be.true;
        });

        // Test case: should return false for 'boolean' type.
        it("should return false if passed parameter type is boolean", function() {
            var bool = true;
            expect(is.not.boolean(bool)).to.be.false;
        });

    }); // End of 'is.not.boolean' describe block.


    // Test suite for the 'is.all.boolean' method.
    describe("is.all.boolean", function() {

        // Test case: should return true if all parameters are 'boolean' type.
        it("should return true if all passed parameter types are boolean", function() {
            var bool1 = true;
            var bool2 = false;
            expect(is.all.boolean(bool1, bool2)).to.be.true;
            expect(is.all.boolean([bool1, bool2])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'boolean' type.
        it("should return false if passed parameter type is boolean", function() {
            var bool = true;
            var notBool = 'test';
            expect(is.all.boolean(bool, notBool)).to.be.false;
            expect(is.all.boolean([bool, notBool])).to.be.false;
        });

    }); // End of 'is.all.boolean' describe block.


    // Test suite for the 'is.any.boolean' method.
    describe("is.any.boolean", function() {

        // Test case: should return true if at least one parameter is 'boolean' type.
        it("should return true if any passed parameter type is boolean", function() {
            var bool1 = true;
            var bool2 = false;
            expect(is.any.boolean(bool1, bool2, ['test'])).to.be.true;
            expect(is.any.boolean([bool1, bool2, ['test']])).to.be.true;
        });

        // Test case: should return false if no parameter is 'boolean' type.
        it("should return false if all passed parameter types are not boolean", function() {
            expect(is.any.boolean('test', {}, null)).to.be.false;
            expect(is.any.boolean(['test', {}, null])).to.be.false;
        });

    }); // End of 'is.any.boolean' describe block.


    // Test suite for the 'is.date' method.
    describe("is.date", function() {

        // Test case: should return true for 'date' type.
        it("should return true if passed parameter type is date", function() {
            var date = new Date();
            expect(is.date(date)).to.be.true;
        });

        // Test case: should return false for non-'date' types.
        it("should return false if passed parameter type is not date", function() {
            var notDate = 'test';
            expect(is.date(notDate)).to.be.false;
        });

    }); // End of 'is.date' describe block.


    // Test suite for the 'is.not.date' method.
    describe("is.not.date", function() {

        // Test case: should return false for 'date' type.
        it("should return false if passed parameter type is date", function() {
            var date = new Date();
            expect(is.not.date(date)).to.be.false;
        });

        // Test case: should return true for non-'date' types.
        it("should return true if passed parameter type is not date", function() {
            var notDate = 'test';
            expect(is.not.date(notDate)).to.be.true;
        });

    }); // End of 'is.not.date' describe block.


    // Test suite for the 'is.all.date' method.
    describe("is.all.date", function() {

        // Test case: should return true if all parameters are 'date' type.
        it("should return true if all passed parameter types are date", function() {
            var myBirthDay = new Date('06-28-1986');
            var date = new Date();
            expect(is.all.date(myBirthDay, date)).to.be.true;
            expect(is.all.date([myBirthDay, date])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'date' type.
        it("should return false if any passed parameter type is not date", function() {
            var date = new Date();
            var notDate = 'test';
            expect(is.all.date(date, notDate)).to.be.false;
            expect(is.all.date([date, notDate])).to.be.false;
        });

    }); // End of 'is.all.date' describe block.


    // Test suite for the 'is.any.date' method.
    describe("is.any.date", function() {

        // Test case: should return true if at least one parameter is 'date' type.
        it("should return true if any passed parameter type is date", function() {
            var date = new Date();
            expect(is.any.date('test', date)).to.be.true;
            expect(is.any.date(['test', date])).to.be.true;
        });

        // Test case: should return false if no parameter is 'date' type.
        it("should return false if all passed parameter types are not date", function() {
            expect(is.any.date('test', 1, undefined)).to.be.false;
            expect(is.any.date(['test', 1, undefined])).to.be.false;
        });

    }); // End of 'is.any.date' describe block.


    // Test suite for the 'is.error' method.
    describe("is.error", function() {

        // Test case: should return true for 'error' type.
        it("should return true if passed parameter type is error", function() {
            var error = new Error();
            expect(is.error(error)).to.be.true;
        });

        // Test case: should return false for non-'error' types.
        it("should return false if passed parameter type is not error", function() {
            var notError = 'test';
            expect(is.error(notError)).to.be.false;
        });

    }); // End of 'is.error' describe block.


    // Test suite for the 'is.not.error' method.
    describe("is.not.error", function() {

        // Test case: should return false for 'error' type.
        it("should return false if passed parameter type is error", function() {
            var error = new Error();
            expect(is.not.error(error)).to.be.false;
        });

        // Test case: should return true for non-'error' types.
        it("should return true if passed parameter type is not error", function() {
            var notError = 'test';
            expect(is.not.error(notError)).to.be.true;
        });

    }); // End of 'is.not.error' describe block.


    // Test suite for the 'is.all.error' method.
    describe("is.all.error", function() {

        // Test case: should return true if all parameters are 'error' type.
        it("should return true if all passed parameter types are error", function() {
            var error1 = new Error();
            var error2 = new Error();
            expect(is.all.error(error1, error2)).to.be.true;
            expect(is.all.error([error1, error2])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'error' type.
        it("should return false if any passed parameter type is not error", function() {
            var error = new Error();
            var notError = 'test';
            expect(is.all.error(error, notError)).to.be.false;
            expect(is.all.error([error, notError])).to.be.false;
        });

    }); // End of 'is.all.error' describe block.


    // Test suite for the 'is.any.error' method.
    describe("is.any.error", function() {

        // Test case: should return true if at least one parameter is 'error' type.
        it("should return true if any passed parameter type is error", function() {
            var error1 = new Error();
            expect(is.any.error(error1, new Date())).to.be.true;
            expect(is.any.error([error1, new Date()])).to.be.true;
        });

        // Test case: should return false if no parameter is 'error' type.
        it("should return false if all passed parameter types are not error", function() {
            expect(is.any.error(1, 2, 3)).to.be.false;
            expect(is.any.error([1, 2, 3])).to.be.false;
        });

    }); // End of 'is.any.error' describe block.


    // Test suite for the 'is.function' method.
    describe("is.function", function() {

        // Test case: should return true for 'function' type.
        it("should return true if passed parameter type is function", function() {
            expect(is.function(is.function)).to.be.true;
        });

        // Test case: should return false for non-'function' types.
        it("should return false if passed parameter type is not function", function() {
            var notFunction = 'test';
            expect(is.function(notFunction)).to.be.false;
        });

    }); // End of 'is.function' describe block.


    // Test suite for the 'is.not.function' method.
    describe("is.not.function", function() {

        // Test case: should return false for 'function' type.
        it("should return false if passed parameter type is function", function() {
            var notFunction = 'test';
            expect(is.function(notFunction)).to.be.false;
        });

        // Test case: should return true for non-'function' type.
        it("should return true if passed parameter type is not function", function() {
            expect(is.not.function(is.function)).to.be.false;
        });

    }); // End of 'is.not.function' describe block.


    // Test suite for the 'is.all.function' method.
    describe("is.all.function", function() {

        // Test case: should return true if all parameters are 'function' type.
        it("should return true if all passed parameter types are function", function() {
            expect(is.all.function(is.function, is.string)).to.be.true;
            expect(is.all.function([is.function, is.string])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'function' type.
        it("should return false if any passed parameter type is not function", function() {
            var notFunction = 'test';
            expect(is.all.function(is.function, notFunction)).to.be.false;
            expect(is.all.function([is.function, notFunction])).to.be.false;
        });

    }); // End of 'is.all.function' describe block.


    // Test suite for the 'is.any.function' method.
    describe("is.any.function", function() {

        // Test case: should return true if at least one parameter is 'function' type.
        it("should return true if any passed parameter type is function", function() {
            expect(is.any.function(is.function, [])).to.be.true;
            expect(is.any.function([is.function, []])).to.be.true;
        });

        // Test case: should return false if no parameter is 'function' type.
        it("should return false if all passed parameter types are not function", function() {
            expect(is.any.function(2, 'test')).to.be.false;
            expect(is.any.function([2, 'test'])).to.be.false;
        });

    }); // End of 'is.any.function' describe block.


    // Test suite for the 'is.nan' method.
    describe("is.nan", function() {

        // Test case: should return true for 'NaN' type.
        it("should return true if passed parameter type is NaN", function() {
            expect(is.nan(NaN)).to.be.true;
        });

        // Test case: should return false for non-'NaN' types.
        it("should return false if passed parameter type is not NaN", function() {
            var notNaN = 'test';
            expect(is.nan(notNaN)).to.be.false;
        });

    }); // End of 'is.nan' describe block.


    // Test suite for the 'is.not.nan' method.
    describe("is.not.nan", function() {

        // Test case: should return false for 'NaN' type.
        it("should return false if passed parameter type is NaN", function() {
            var notNaN = 'test';
            expect(is.not.nan(notNaN)).to.be.true;
        });

        // Test case: should return false for non-'NaN' type.
        it("should return false if passed parameter type is not NaN", function() {
            expect(is.not.nan(NaN)).to.be.false;
        });

    }); // End of 'is.not.nan' describe block.


    // Test suite for the 'is.all.nan' method.
    describe("is.all.nan", function() {

        // Test case: should return true if all parameters are 'NaN' type.
        it("should return true if all passed parameter types are NaN", function() {
            expect(is.all.nan(NaN, NaN)).to.be.true;
            expect(is.all.nan([NaN, NaN])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'NaN' type.
        it("should return false if any passed parameter type is not NaN", function() {
            var notNaN = 'test';
            expect(is.all.nan(NaN, notNaN)).to.be.false;
            expect(is.all.nan([NaN, notNaN])).to.be.false;
        });

    }); // End of 'is.all.nan' describe block.


    // Test suite for the 'is.any.nan' method.
    describe("is.any.nan", function() {

        // Test case: should return true if at least one parameter is 'NaN' type.
        it("should return true if any passed parameter type is NaN", function() {
            expect(is.any.nan(NaN, NaN, 'test')).to.be.true;
            expect(is.any.nan([NaN, NaN, 'test'])).to.be.true;
        });

        // Test case: should return false if no parameter is 'NaN' type.
        it("should return false if all passed parameter types are not NaN", function() {
            expect(is.any.nan('test', new RegExp())).to.be.false;
            expect(is.any.nan(['test', new RegExp()])).to.be.false;
        });

    }); // End of 'is.any.nan' describe block.


    // Test suite for the 'is.null' method.
    describe("is.null", function() {

        // Test case: should return true for 'null' type.
        it("should return true if passed parameter type is null", function() {
            expect(is.null(null)).to.be.true;
        });

        // Test case: should return false for non-'null' types.
        it("should return false if passed parameter type is not null", function() {
            var notNull = 'test';
            expect(is.null(notNull)).to.be.false;
        });

    }); // End of 'is.null' describe block.


    // Test suite for the 'is.not.null' method.
    describe("is.not.null", function() {

        // Test case: should return false for 'null' type.
        it("should return false if passed parameter type is null", function() {
            expect(is.not.null(null)).to.be.false;
        });

        // Test case: should return true for non-'null' types.
        it("should return true if passed parameter type is not null", function() {
            var notNull = 'test';
            expect(is.not.null(notNull)).to.be.true;
        });

    }); // End of 'is.not.null' describe block.


    // Test suite for the 'is.all.null' method.
    describe("is.all.null", function() {

        // Test case: should return true if all parameters are 'null' type.
        it("should return true if all passed parameter types are null", function() {
            expect(is.all.null(null, null)).to.be.true;
            expect(is.all.null([null, null])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'null' type.
        it("should return false if any passed parameter type is not null", function() {
            var notNull = 'test';
            expect(is.all.null(null, notNull)).to.be.false;
            expect(is.all.null([null, notNull])).to.be.false;
        });

    }); // End of 'is.all.null' describe block.


    // Test suite for the 'is.any.null' method.
    describe("is.any.null", function() {

        // Test case: should return true if at least one parameter is 'null' type.
        it("should return true if any passed parameter type is null", function() {
            expect(is.any.null(null, null, undefined)).to.be.true;
            expect(is.any.null([null, null, undefined])).to.be.true;
        });

        // Test case: should return false if no parameter is 'null' type.
        it("should return false if all passed parameter types are not null", function() {
            expect(is.any.null(1, 2)).to.be.false;
            expect(is.any.null([1, 2])).to.be.false;
        });

    }); // End of 'is.any.null' describe block.


    // Test suite for the 'is.number' method.
    describe("is.number", function() {

        // Test case: should return true for 'number' type.
        it("should return true if passed parameter type is number", function() {
            expect(is.number(1)).to.be.true;
        });

        // Test case: should return false for non-'number' types.
        it("should return false if passed parameter type is not number", function() {
            var notNumber = 'test';
            expect(is.number(notNumber)).to.be.false;
        });

        // Test case: should return false if passed parameter is NaN.
        it("should return false if passed parameter is NaN", function() {
            expect(is.number(NaN)).to.be.false;
        })

    }); // End of 'is.number' describe block.


    // Test suite for the 'is.not.number' method.
    describe("is.not.number", function() {

        // Test case: should return false for 'number' type.
        it("should return false if passed parameter type is number", function() {
            expect(is.not.number(1)).to.be.false;
        });

        // Test case: should return true for non-'number' types.
        it("should return true if passed parameter type is not number", function() {
            var notNumber = 'test';
            expect(is.not.number(notNumber)).to.be.true;
        });

        // Test case: should return true if passed parameter is NaN.
        it("should return true if passed parameter is NaN", function() {
            expect(is.not.number(NaN)).to.be.true;
        })

    }); // End of 'is.not.number' describe block.


    // Test suite for the 'is.all.number' method.
    describe("is.all.number", function() {

        // Test case: should return true if all parameters are 'number' type.
        it("should return true if all passed parameter types are number", function() {
            expect(is.all.number(1, 2)).to.be.true;
            expect(is.all.number([1, 2])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'number' type.
        it("should return false if any passed parameter type is not number", function() {
            var notNumber = 'test';
            expect(is.all.number(1, notNumber)).to.be.false;
            expect(is.all.number([1, notNumber])).to.be.false;
        });

    }); // End of 'is.all.number' describe block.


    // Test suite for the 'is.any.number' method.
    describe("is.any.number", function() {

        // Test case: should return true if at least one parameter is 'number' type.
        it("should return true if any passed parameter type is number", function() {
            expect(is.any.number(1, 2, NaN)).to.be.true;
            expect(is.any.number([1, 2, NaN])).to.be.true;
        });

        // Test case: should return false if no parameter is 'number' type.
        it("should return false if all passed parameter types are not number", function() {
            expect(is.any.number(null, 'test')).to.be.false;
            expect(is.any.number([null, 'test'])).to.be.false;
        });

    }); // End of 'is.any.number' describe block.


    // Test suite for the 'is.object' method.
    describe("is.object", function() {

        // Test case: should return true for 'object' type.
        it("should return true if passed parameter type is object", function() {
            expect(is.object({})).to.be.true;
        });

        // Test case: should return false for non-'object' types.
        it("should return false if passed parameter type is not object", function() {
            var notObject = 'test';
            expect(is.object(notObject)).to.be.false;
        });

    }); // End of 'is.object' describe block.


    // Test suite for the 'is.not.object' method.
    describe("is.not.object", function() {

        // Test case: should return false for 'object' type.
        it("should return false if passed parameter type is object", function() {
            expect(is.not.object({})).to.be.false;
        });

        // Test case: should return true for non-'object' types.
        it("should return true if passed parameter type is not object", function() {
            var notObject = 'test';
            expect(is.not.object(notObject)).to.be.true;
        });

    }); // End of 'is.not.object' describe block.


    // Test suite for the 'is.all.object' method.
    describe("is.all.object", function() {

        // Test case: should return true if all parameters are 'object' type.
        it("should return true if all passed parameter types are object", function() {
            expect(is.all.object({}, {})).to.be.true;
            expect(is.all.object([{}, {}])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'object' type.
        it("should return false if any passed parameter type is not object", function() {
            var notObject = 'test';
            expect(is.all.object({}, notObject)).to.be.false;
            expect(is.all.object([{}, notObject])).to.be.false;
        });

    }); // End of 'is.all.object' describe block.


    // Test suite for the 'is.any.object' method.
    describe("is.any.object", function() {

        // Test case: should return true if at least one parameter is 'object' type.
        it("should return true if any passed parameter type is object", function() {
            expect(is.any.object({}, {}, 'test')).to.be.true;
            expect(is.any.object([{}, {}, 'test'])).to.be.true;
        });

        // Test case: should return false if no parameter is 'object' type.
        it("should return false if all passed parameter types are not object", function() {
            expect(is.any.object(1, 2, 3)).to.be.false;
            expect(is.any.object([1, 2, 3])).to.be.false;
        });

    }); // End of 'is.any.object' describe block.


    // Test suite for the 'is.json' method.
    describe("is.json", function() {

        // Test case: should return true for 'json object' type.
        it("should return true if passed parameter type is a json object", function() {
            expect(is.json({})).to.be.true;
        });

        // Test case: should return false for non-'json object' types.
        it("should return false if passed parameter type is not a json object", function() {
            var notObject = 'test';
            expect(is.json(notObject)).to.be.false;
        });

    }); // End of 'is.json' describe block.


    // Test suite for the 'is.not.json' method.
    describe("is.not.json", function() {

        // Test case: should return false for 'json object' type.
        it("should return false if passed parameter type is json object", function() {
            expect(is.not.json({})).to.be.false;
        });

        // Test case: should return true for non-'json object' types.
        it("should return true if passed parameter type is not json object", function() {
            var notObject = 'test';
            expect(is.not.json(notObject)).to.be.true;
        });

    }); // End of 'is.not.json' describe block.


    // Test suite for the 'is.all.json' method.
    describe("is.all.json", function() {

        // Test case: should return true if all parameters are 'json object' type.
        it("should return true if all passed parameter types are object", function() {
            expect(is.all.json({}, {})).to.be.true;
            expect(is.all.json([{}, {}])).to.be.true;
        });

        // Test case: should return false if any parameter is not 'json object' type.
        it("should return false if any passed parameter type is not object", function() {
            var notObject = 'test';
            expect(is.all.json({}, notObject, [])).to.be.false;
            expect(is.all.json([{}, notObject, ""])).to.be.false;
        });

    }); // End of 'is.all.json' describe block.


    // Test suite for the 'is.any.json' method.
    describe("is.any.json", function() {

        // Test case: should return true if at least one parameter is 'json object' type.
        it("should return true if any passed parameter type is json object", function() {
            expect(is.any.json({}, {}, 'test')).to.be.true;
            expect(is.any.json([{}, {}, 'test'])).to.be.true;
        });

        // Test case: should return false if no parameter is 'json object' type.
        it("should return false if all passed parameter types are not json object", function() {
            expect(is.any.json(1, 2, 3)).to.be.false;
            expect(is.any.json([1, 2, 3])).to.be.false;
        });

    }); // End of 'is.any.json' describe block.


    // Test suite for the 'is.regexp' method.
    describe("is.regexp", function() {

        // Test case: should return true for 'regexp' type.
        it("should return true if passed parameter type is regexp", function() {
            var regexp = new RegExp();
            expect(is.regexp(regexp)).to.be.true;
        });

        // Test case: should return false for non-'regexp' types.
        it("should return false if passed parameter type is not regexp", function() {
            var notRegexp = 'test';
            expect(is.regexp(notRegexp)).to.be.false;
        });

    }); // End of 'is.regexp' describe block.


    // Test suite for the 'is.not.regexp' method.
    describe("is.not.regexp", function() {

        // Test case: should return false for 'regexp' type.
        it("should return false if passed parameter type is regexp", function() {
            var regexp = new RegExp();
            expect(is.not.regexp(regexp)).to.be.false;
        });

        // The original code was truncated here.
        // I will stop here to maintain Type I clone definition.
        // It's crucial not to add or remove any logical statements.

    }); // End of 'is.not.regexp' describe block.

}); // End of main 'type checks' describe block.