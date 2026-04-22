/*
 * This file serves as a comprehensive unit test suite
 * for the 'types' module. It utilizes Node.js's built-in
 * 'assert' module for validation, along with a testing framework
 * (implied by 'describe' and 'it', likely Mocha).
 */

var assert = require('assert'),
  t = require('../types'); // The 'types' module being tested

// The main test suite for the 'types.js' functionality.
describe("types.js", function() {

  // --- Group of tests for successful type validations ---
  describe("Pass", function() {

    // Test case: Validating a String type successfully.
    it("String", function() {
      // Expect no exception when a string value is checked against the String type.
      assert.doesNotThrow(function() {
        t('name', String); // 'name' is a string, String is the expected type.
      });
    }); // End of 'String' test (Pass)

    // Test case: Validating a Number type successfully.
    it("Number", function() {
      // Test with a positive integer.
      assert.doesNotThrow(function() {
        t(1, Number);
      });

      // Test with zero.
      assert.doesNotThrow(function() {
        t(0, Number);
      });

      // Test with a negative integer.
      assert.doesNotThrow(function() {
        t(-1, Number);
      });
    }); // End of 'Number' test (Pass)

    // Test case: Validating an Array type successfully.
    it("Array", function() {
      // An empty array should pass the Array type check.
      assert.doesNotThrow(function() {
        t([], Array);
      });
    }); // End of 'Array' test (Pass)

    // Test case: Validating an Object type successfully.
    it("Object", function() {
      // An empty object literal should pass the Object type check.
      assert.doesNotThrow(function() {
        t({}, Object);
      });
    }); // End of 'Object' test (Pass)

    // Test case: Validating against multiple possible types.
    it("Multiple types", function() {
      // A number should pass if its type is included in the array of expected types.
      assert.doesNotThrow(function() {
        t(1, [String, Number]); // 1 is a Number, which is in the array.
      });
    }); // End of 'Multiple types' test (Pass)

    // Test case: Validating a custom user-defined type.
    it("CustomType", function() {
      // Define a constructor function for our custom type.
      var CustomType = function() {
        this.custom = 2 * true; // Example property initialization.
      };

      // Create an instance of the custom type.
      var instance = new CustomType();

      // The instance should pass validation against its own constructor function.
      assert.doesNotThrow(function() {
        t(instance, CustomType);
      });
    }); // End of 'CustomType' test (Pass)
  }); // End of "Pass" describe block

  // --- Group of tests for failing type validations (expecting errors) ---
  describe("Fail", function() {

    // Test case: Failing String type validation.
    it("String", function() {
      // Expect an error when an array is checked against the String type.
      assert.throws(function() {
        t([], String); // An array is not a string.
      });
    }); // End of 'String' test (Fail)

    // Test case: Failing Number type validation.
    it("Number", function() {
      // Expect an error when an array is checked against the Number type.
      assert.throws(function() {
        t([], Number); // An array is not a number.
      });
      // Expect an error when NaN is checked against the Number type (NaN is a number, but often excluded).
      assert.throws(function() {
        t(NaN, Number); // NaN should typically fail a strict Number check.
      });
    }); // End of 'Number' test (Fail)

    // Test case: Failing Array type validation.
    it("Array", function() {
      // Expect an error when an empty string is checked against the Array type.
      assert.throws(function() {
        t('', Array); // An empty string is not an array.
      });
    }); // End of 'Array' test (Fail)

    // Test case: Failing Object type validation.
    it("Object", function() {
      // Expect an error when an array is checked against the Object type.
      assert.throws(function() {
        t([], Object); // While arrays are technically objects, this check might be more specific.
      });
    }); // End of 'Object' test (Fail)

    // Test case: Failing validation against multiple types.
    it("Multiple types", function() {
      // Expect an error when an array is checked against a list of types that do not include Array.
      assert.throws(function() {
        t([], [String, Number]); // Array is neither String nor Number.
      });
    }); // End of 'Multiple types' test (Fail)

    // Test case: Failing custom type validation.
    it("CustomType", function() {
      // Re-define CustomType for clarity in this test block.
      var CustomType = function() {
        this.custom = 2 * true;
      };

      // Instance creation is not strictly necessary for this specific fail test,
      // but it's part of the original structure.
      var instance = new CustomType();

      // Expect an error when an array is checked against the CustomType.
      assert.throws(function() {
        t([], CustomType); // An array is not an instance of CustomType.
      });
    }); // End of 'CustomType' test (Fail)
  }); // End of "Fail" describe block

  // --- Group of tests for various options of the type checking function ---
  describe("Options", function() {

    // Test case: 'required = false' option.
    it("required = false", function() {
      // Null and undefined values should not throw an error when 'required' is explicitly false.
      assert.doesNotThrow(function() {
        t(null, String, false); // Null is allowed when not required.
        t(undefined, String, false); // Undefined is allowed when not required.
      });
    }); // End of 'required = false' test

    // Test case: 'required = "optional"' option (alternative to boolean false).
    it("required = 'optional'", function() {
      // Null and undefined values should also not throw an error when 'required' is 'optional'.
      assert.doesNotThrow(function() {
        t(null, String, 'optional'); // Null is allowed when optional.
        t(undefined, String, 'optional'); // Undefined is allowed when optional.
      });
    }); // End of 'required = "optional"' test
  }); // End of "Options" describe block

  // --- Group of tests for global settings of the type checking module ---
  describe("Settings", function() {

    // Test case: The 'enabled' setting.
    it("enabled", function() {
      // Temporarily disable the type checking mechanism.
      t.enabled = false;

      // When disabled, type mismatches should *not* throw errors.
      assert.doesNotThrow(function() {
        t(1999, String); // A number passed as a string, but no error because checking is disabled.
      });

      // Crucially, re-enable type checking to avoid affecting subsequent tests.
      t.enabled = true;
    }); // End of 'enabled' setting test
  }); // End of "Settings" describe block

  // --- Group of tests for the 'check' function (which returns boolean instead of throwing) ---
  describe("check", function() {

    // Test case: Verifying the return values of the 'check' function.
    it("returns", function() {
      // The 'check' function itself should never throw an error, regardless of type mismatch.
      assert.doesNotThrow(function() {
        t.check(1999, String); // This call will return false, but not throw.
      });
      // A number should successfully pass a check for the Number type.
      assert.equal(t.check(1999, Number), true);
      // A number should fail a check for the String type.
      assert.equal(t.check(1999, String), false);
    }); // End of 'returns' test
  }); // End of "check" describe block

}); // End of the main 'types.js' test suite.