var verifier = require('assert'),
	dataChecker = require('../data_kind_module');

// Main test group for the data_kind_module functionality
testSuite("data_kind_module.js validation scenarios", function() {



	// A collection of test cases where type validation is expected to succeed without errors.
	testSuite("SuccessfulValidations", function() {
		// Validating against the built-in String type.
		testCase("TextTypeValidation", function() {
			verifier.doesNotThrow(function() {
				dataChecker('a valid text sequence', String);
			});
		});

		// Validating against the built-in Number type, covering various numeric values.
		testCase("NumericKindChecks", function() {
			verifier.doesNotThrow(function() {
				dataChecker(1001, Number);
			});

			verifier.doesNotThrow(function() {
				dataChecker(0, Number);
			});

			verifier.doesNotThrow(function() {
				dataChecker(-55.5, Number);
			});
		});

		// Validating against the built-in Array type.
		testCase("ListStructureValidation", function() {
			verifier.doesNotThrow(function() {
				dataChecker([ 'item1', 2 ], Array);
			});
		});

		// Validating against the built-in Object type.
		testCase("GenericObjectVerification", function() {
			verifier.doesNotThrow(function() {
				dataChecker({ prop: 'value' }, Object);
			});
		});

		// Validating against a list of acceptable types.
		testCase("MultiKindAcceptance", function() {
			verifier.doesNotThrow(function() {
				dataChecker(777, [String, Number]);
			});
		});

		// Validating against a user-defined class type.
		testCase("UserDefinedKindAssertion", function() {
			var UserDefinedKind = function() {
				this.specialProperty = 2 * true;
			};

			var sampleObject = new UserDefinedKind();

			verifier.doesNotThrow(function() {
				dataChecker(sampleObject, UserDefinedKind);
			});
		});
	});



	// A collection of test cases where type validation is expected to fail and throw an error.
	testSuite("FailedValidations", function() {
		// Expecting a failure when a non-string is passed for String type validation.
		testCase("TextTypeRejection", function() {
			verifier.throws(function() {
				dataChecker([ 1, 'not string' ], String);
			});
		});

		// Expecting failures for Number type validation with invalid inputs.
		testCase("NumericKindRejection", function() {
			verifier.throws(function() {
				dataChecker([], Number);
			});
			verifier.throws(function() {
				dataChecker(NaN, Number);
			});
		});

		// Expecting a failure when a non-array is passed for Array type validation.
		testCase("ListStructureRejection", function() {
			verifier.throws(function() {
				dataChecker('a string, not an array', Array);
			});
		});

		// Expecting a failure when a non-object is passed for Object type validation.
		testCase("GenericObjectRejection", function() {
			verifier.throws(function() {
				dataChecker([ 'item' ], Object);
			});
		});

		// Expecting a failure for multiple types validation.
		testCase("MultiKindRejection", function() {
			verifier.throws(function() {
				dataChecker([], [String, Number]);
			});
		});

		// Expecting a failure for user-defined type validation.
		testCase("UserDefinedKindRejection", function() {
			var UserDefinedKind = function() {
				this.specialProperty = 2 * true;
			};

			var sampleObject = new UserDefinedKind();

			verifier.throws(function() {
				dataChecker('not a custom type instance', UserDefinedKind);
			});
		});
	});



	// Test cases for various optional configuration parameters.
	testSuite("ConfigurationSettings", function() {
		// Testing the 'mandatoryFlag = false' option, allowing null/undefined inputs.
		testCase("OptionalInputAllowed", function() {
			verifier.doesNotThrow(function() {
				dataChecker(null, String, false);
				dataChecker(undefined, String, false);
			});
		});

		// Testing the 'mandatoryFlag = "optional"' string option.
		testCase("StringOptionalParameter", function() {
			verifier.doesNotThrow(function() {
				dataChecker(null, String, 'optional');
				dataChecker(undefined, String, 'optional');
			});
		});
	});



	// Test cases for global system settings affecting validation behavior.
	testSuite("GlobalParameters", function() {
		// Verifying the 'activeStatus' switch for enabling/disabling validation.
		testCase("VerificationToggle", function() {
			dataChecker.activeStatus = false;

			verifier.doesNotThrow(function() {
				dataChecker(2023, String);
			});

			dataChecker.activeStatus = true;
		});
	});



	// Test cases specifically for the 'verifyKind' method.
	testSuite("VerifyKindMethodBehavior", function() {
		// Checking the return values and non-throwing behavior of 'verifyKind'.
		testCase("MethodReturnValues", function() {
			verifier.doesNotThrow(function() {
				dataChecker.verifyKind(2024, String);
			});
			verifier.equal(dataChecker.verifyKind(2024, Number), true);
			verifier.equal(dataChecker.verifyKind(2024, String), false);
		});
	});



});