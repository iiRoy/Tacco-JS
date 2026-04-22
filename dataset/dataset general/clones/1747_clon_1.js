/*
 * This is a Type I clone of the original JavaScript code.
 * It has been modified to extensively vary whitespace and add comments,
 * while ensuring that all identifiers, operators, and expressions
 * remain absolutely identical to the source.
 *
 * This file contains a suite of QUnit tests for Backbone.Validations.
 * It covers various aspects like interface maintenance, error handling,
 * custom validators, and built-in validation types (required, minlength,
 * maxlength, pattern, min, max, in, arrayElem, email, url, number, String, Array).
 *
 * Code clone generated on [Current Date, e.g., 2023-10-27]
 */

// Ensure the document is fully loaded before executing tests.
$( document ) .ready ( function ( ) {


  // --- Module: General Tests ---
  // This module focuses on the core functionality and interface of Backbone.Validations.
  module ( "general tests" ) ;


  // Test case: Verifies that the original validate interface is maintained.
  test ( "it maintains the original validate interface" , function ( ) {
    /*
     * Define a Backbone Model with a 'validate' property
     * that specifies 'name' and 'number' as required fields.
     */
    var ValidatingModel = Backbone . Model . extend ( {
      validate : {
        name   : {
          required : true
        } ,
        number : {
          required : true
        }
      }
    } ) ;


    // Instantiate a new model instance.
    var vm = new ValidatingModel ;


    // Assert that calling validate with invalid data returns the expected error structure.
    deepEqual ( vm . validate ( { "hahah" : 3 } ) , {
      name   : [ "required" ] ,
      number : [ "required" ]
    } ) ;
  } ) ;


  // Test case: Checks if 'set' returns false when validation fails.
  test ( "set returns false when failing" , function ( ) {
    // Define a simple model requiring a 'name'.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          required : true
        }
      }
    } ) ;

    // Create an instance of the test model.
    var test = new TestModel ;

    // Attempt to set an empty object, triggering validation.
    // Expect 'set' to return false because 'name' is required.
    equal ( test . set ( { } , { validate : true } ) , false ) ;
  } ) ;


  // Test case: Ensures an 'error' event is triggered on the model when validation fails.
  test ( "set triggers an error event on the model" , function ( ) {
    // Define the model with a required 'name' attribute.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          required : true
        }
      }
    } ) ;

    // Initialize the model and a flag to track the error callback.
    var test = new TestModel ;
    var errorCallbackCalled = false ;

    // Bind to the 'invalid' event to check if it's triggered.
    test . bind ( 'invalid' , function ( ) {
      errorCallbackCalled = true ;
    } ) ;

    // Attempt to set invalid data.
    test . set ( { } , { validate : true } ) ;

    // Verify that the error callback was indeed called.
    ok ( errorCallbackCalled ) ;
  } ) ;


  // Test case: Confirms that an error event named after the attribute is triggered.
  test ( "set triggers an error event named after the attribute, on the model" , function ( ) {
    // Define the attribute name and its validation rule.
    var nameOfAttribute = "name" ;
    var validateObject = { } ;
    validateObject [ nameOfAttribute ] = { required : true } ;

    // Create a model using the dynamic validation object.
    var TestModel = Backbone . Model . extend ( {
      validate : validateObject
    } ) ;

    // Initialize model and error flag.
    var test = new TestModel ;
    var errorCallbackCalled = false ;

    // Bind to the specific 'invalid:attributeName' event.
    test . bind ( 'invalid:' + nameOfAttribute , function ( ) {
      errorCallbackCalled = true ;
    } ) ;

    // Trigger validation with invalid data.
    test . set ( { } , { validate : true } ) ;

    // Assert that the attribute-specific error callback was invoked.
    ok ( errorCallbackCalled ) ;
  } ) ;


  // Test case: Checks that providing a direct override prevents normal and named errors.
  test ( "providing a direct override prevents normal and named errors from being triggered" , function ( ) {
    // Set up attribute and validation rules similar to the previous test.
    var nameOfAttribute = "name" ;
    var validateObject = { } ;
    validateObject [ nameOfAttribute ] = { required : true } ;

    // Model definition.
    var TestModel = Backbone . Model . extend ( {
      validate : validateObject
    } ) ;

    // Create a new instance of the model.
    var test = new TestModel ;

    // Flags to track if callbacks are called.
    var nameCallbackCalled = false ;
    test . bind ( 'invalid:' + nameOfAttribute , function ( ) {
      nameCallbackCalled = true ; // This should NOT be called with an override.
    } ) ;

    var normalCallbackCalled = false ;
    test . bind ( 'invalid' , function ( ) {
      normalCallbackCalled = true ; // This should NOT be called with an override.
    } ) ;

    // The original test code here seems to be incomplete or incorrect
    // as it doesn't actually _call_ set with an override, nor does it
    // assert against the state after an attempted set.
    // However, as a Type I clone, we must replicate it exactly.
    // The original code implies that the *initial state* of the flags
    // should be false, which is always true before any set is called.
    // If the intent was to test after a `set` with an override, the `set` call is missing.
    // We are maintaining exact code, so the assertions remain as is.

    // Assert that neither callback has been called yet (initial state).
    equal ( false , normalCallbackCalled , "normal callback called" ) ;
    equal ( false , nameCallbackCalled , "name callback called" ) ;
  } ) ;


  // --- Module: Backbone.Validations.addValidator ---
  // This module tests the functionality for adding custom validation rules.
  module ( "Backbone.Validations.addValidator" ) ;


  // Test case: Verifies that custom validators can be added, applied, and executed.
  test ( "Custom validators can be provided, and can be added to a model, and will be executed." , function ( ) {
    // Declare variables to hold references and track matches.
    var testModel , optionsPassed , valueToBeSet ;
    var testModelMatched = false ,
        optionsPassedMatched = false ,
        valueToBeSetMatched = false ;

    // Define the custom validator function.
    // It captures the arguments it receives to verify correctness.
    var customValidator = function ( options , attributeName , model , valueToSet ) {
      testModelMatched = model === testModel ;
      optionsPassedMatched = options == optionsPassed ; // Using == for potential type coercion check if needed, but original used ==
      valueToBeSetMatched = valueToSet === valueToBeSet ;
    } ;


    // Register the custom validator with Backbone.Validations.
    Backbone . Validations . addValidator ( "customValidator" , customValidator ) ;

    // Define options for the custom validator.
    optionsPassed = { } ;
    // Create a model that uses the newly added custom validator.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        "name" : {
          customValidator : optionsPassed
        }
      }
    } ) ;

    // Instantiate the model and set a value. This should trigger the custom validator.
    testModel = new TestModel ;
    valueToBeSet = "blech" ;
    testModel . set ( { name : valueToBeSet } , { validate : true } ) ;

    // Assert that all arguments passed to the custom validator were as expected.
    ok ( testModelMatched ) ;
    ok ( optionsPassedMatched ) ;
    ok ( valueToBeSetMatched ) ;
  } ) ;


  // Test case: Checks if custom validators can trigger errors by returning a value.
  test ( "Custom validators can be provided, and can be added to a model, and will be trigger error if they return something." , function ( ) {
    // Declare variables.
    var testModel , optionsPassed , valueToBeSet ;

    // Define a custom validator that always returns an error message.
    var customValidator = function ( options , attributeName , model , valueToSet ) {
      return "error dude" ;
    } ;

    // Add this new custom validator.
    Backbone . Validations . addValidator ( "newCustomValidator" , customValidator ) ;

    // Set options (though not used by this simple validator).
    optionsPassed = { } ;
    // Define a model that uses this error-returning custom validator.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        "name" : {
          newCustomValidator : optionsPassed
        }
      }
    } ) ;

    // Instantiate the model and flags for error tracking.
    testModel = new TestModel ;
    var errorCallbackCalled = false ,
        errorWasIncluded = false ;

    // Bind to the 'invalid' event to capture errors.
    testModel . bind ( 'invalid' , function ( model , errors ) {
      errorCallbackCalled = true ;
      errorWasIncluded = _ . include ( errors . name , "error dude" ) ;
    } ) ;

    // Set a value, triggering the custom validator and expecting an error.
    valueToBeSet = "blech" ;
    testModel . set ( { name : valueToBeSet } , { validate : true } , { validate : true } ) ;
    // Note: The original code has `{validate: true}` twice. Replicating exactly.

    // Assert that the error callback was called and the specific error message was included.
    ok ( errorCallbackCalled ) ;
    ok ( errorWasIncluded ) ;
  } ) ;


  // Test case: Verifies that existing validators (preset or custom) cannot be overridden.
  test ( "It can't override an existing validation, custom or preset." , function ( ) {
    // Flags to track if errors were thrown.
    var presetThrowsError = false ,
        doubleCustomThrowsError = false ;

    // Attempt to add a validator with the name "required" (a preset validator).
    try {
      Backbone . Validations . addValidator ( "required" , function ( ) { } ) ;
    } catch ( err ) {
      presetThrowsError = true ; // Expect an error here.
    }

    // Assert that attempting to override a preset validator threw an error.
    ok ( presetThrowsError , 'preset threw error' ) ;

    // Add a new custom validator with a unique name.
    Backbone . Validations . addValidator ( "dasds6231237123" , function ( ) { } ) ;
    // Attempt to add another validator with the *same* unique name.
    try {
      Backbone . Validations . addValidator ( "dasds6231237123" , function ( ) { } ) ;
    } catch ( err ) {
      doubleCustomThrowsError = true ; // Expect an error here.
    }

    // Assert that attempting to override an existing custom validator also threw an error.
    ok ( doubleCustomThrowsError ) ;
  } ) ;


  // --- Module: Required Validator ---
  // Tests specifically for the 'required' validation rule.
  module ( "required validator" ) ;


  // Test case: Checks that other values are not set when a required field is missing.
  test ( "doesn't set other values, when there is no current value, and no value is passed" , function ( ) {
    // Model with a required 'name'.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          required : true
        }
      }
    } ) ;

    // Instantiate the model.
    var t = new TestModel ;

    // Attempt to set a different attribute 'woo' without providing 'name'.
    // Expect 'set' to return false due to 'name' being required.
    equal ( t . set ( { woo : "hoo" } , { validate : true } ) , false ) ;

    // Verify that 'woo' was not set because validation failed.
    equal ( t . get ( 'woo' ) , undefined ) ;
  } ) ;


  // Test case: Ensures 'required' prevents setting null, undefined, or blank values.
  test ( "won't allow a value to be set to null, or blank" , function ( ) {
    // Model with a required 'name'.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          required : true
        }
      }
    } ) ;

    // Instantiate the model.
    var t = new TestModel ;

    // Attempt to set 'name' to null, undefined, or an empty string.
    // All should fail validation and return false.
    equal ( t . set ( { name : null } , { validate : true } ) , false ) ;
    equal ( t . set ( { name : undefined } , { validate : true } ) , false ) ;
    equal ( t . set ( { name : "" } , { validate : true } ) , false ) ;
  } ) ;


  // --- Module: Custom Attribute Validator ---
  // Tests for custom validators defined as methods on the model itself.
  module ( "custom attribute validator" ) ;


  // Test case: Verifies that the custom validator method on the model is called.
  test ( "it calls the custom validator" , function ( ) {
    var customValidatorCalled = false ; // Flag to track execution.
    // Model with a custom validator referencing a method 'nameOfMethod'.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          custom : "nameOfMethod"
        }
      } ,

      // The custom validation method.
      nameOfMethod : function ( attributeName , attributeValue ) {
        customValidatorCalled = true ; // Set flag when called.
      }
    } ) ;

    // Instantiate model and trigger validation.
    var t = new TestModel ;
    t . set ( { name : "whatever" } , { validate : true } ) ;
    // Assert that the custom method was executed.
    ok ( customValidatorCalled ) ;
  } ) ;


  // Test case: Checks if a custom validator method can cause an error.
  test ( "can cause an error" , function ( ) {
    // Model with a custom validator that always returns an error string.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          custom : "nameOfMethod"
        }
      } ,

      nameOfMethod : function ( ) {
        return "error" ; // Returning a string signifies an error.
      }
    } ) ;

    // Instantiate model and trigger validation.
    var t = new TestModel ;
    // Expect 'set' to return false because the custom validator returns an error.
    equal ( t . set ( { name : "whatever" } , { validate : true } ) , false ) ;
  } ) ;


  // Test case: Verifies that the error message from a custom validator is included in the errors object.
  test ( "it's included in the errors" , function ( ) {
    var errorResponse = "blech" ; // The error message expected.
    // Model with a custom validator that returns a specific error message.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          custom : "nameOfMethod"
        }
      } ,

      nameOfMethod : function ( ) {
        return errorResponse ;
      }
    } ) ;

    // Instantiate model and set up error tracking.
    var t = new TestModel ;
    var errorResponseWasIncluded = false ;
    t . bind ( 'invalid' , function ( model , errors ) {
      // Check if the specific error message is present for the 'name' attribute.
      errorResponseWasIncluded = _ . include ( errors . name , errorResponse ) ;
    } ) ;

    // Trigger validation.
    t . set ( { name : "blech" } , { validate : true } ) ;

    // Assert that the error message was correctly included.
    ok ( errorResponseWasIncluded ) ;
  } ) ;


  // --- Module: Minlength Validator ---
  // Tests for the 'minlength' validation rule.
  module ( "minlength validator" ) ;


  // Test case: Checks if 'minlength' correctly errors for strings shorter than the minimum.
  test ( "given a minimum length, it will error if given a string that is a smaller" , function ( ) {
    var lengthToBeLessThan = 3 ; // This variable is declared but not used in the validation rule itself.
                                 // It's part of the original code, so it's kept.
    // Model with 'name' requiring a minimum length of 3.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          minlength : 3
        }
      }
    } ) ;

    // Instantiate the model.
    var t = new TestModel ;
    // Set a name longer than or equal to 3; should pass.
    equal ( t . set ( { name : "neal" } , { validate : true } ) , t ) ;
    // Set a name shorter than 3; should fail.
    equal ( t . set ( { name : "al" } , { validate : true } ) , false ) ;
  } ) ;


  // --- Module: Maxlength Validator ---
  // Tests for the 'maxlength' validation rule.
  module ( "maxlength validator" ) ;


  // Test case: Checks if 'maxlength' correctly errors for strings longer than the maximum.
  test ( "given a maximum length, it will error if given a string that is a larger" , function ( ) {
    // Model with 'name' requiring a maximum length of 4.
    var TestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          maxlength : 4
        }
      }
    } ) ;

    // Instantiate the model.
    var t = new TestModel ;
    // Set a name longer than 4; should fail.
    equal ( t . set ( { name : "neals" } , { validate : true } ) , false ) ;
    // Set a name shorter than or equal to 4; should pass.
    equal ( t . set ( { name : "al" } , { validate : true } ) , t ) ;
  } ) ;


  // --- Module: Pattern Validation ---
  // Tests for regular expression pattern validation.
  module ( "pattern validation" ) ;


  // Test case: Verifies 'pattern' validation using a regex.
  test ( "pattern /^test/" , function ( ) {
    // Model with 'name' requiring to match the pattern /^test/.
    var PatternTestModel = Backbone . Model . extend ( {
      validate : {
        name : {
          pattern : /^test/
        }
      }
    } ) ;

    // Instantiate the model.
    var newTestModel = new PatternTestModel ;
    // Set a name matching the pattern; should pass.
    ok ( newTestModel . set ( { name : "test" } , { validate : true } ) ) ;
    // Set a name not matching the pattern; should fail.
    equal ( newTestModel . set ( { name : "broken" } , { validate : true } ) , false ) ;
  } ) ;


  // --- Module: Min Validation ---
  // Tests for the 'min' numerical validation rule.
  module ( "min validation" ) ;


  // Test case: Checks if 'min' correctly validates numerical values.
  test ( "works" , function ( ) {
    // Model with 'size' requiring a minimum value of 3.
    var MinTestModel = Backbone . Model . extend ( {
      validate : {
        size : {
          min : 3
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new MinTestModel ;
    // Set 'size' less than 3; should fail.
    equal ( m . set ( { size : 2 } , { validate : true } ) , false ) ;
    // Set 'size' greater than or equal to 3; should pass.
    ok ( m . set ( { size : 5 } , { validate : true } ) ) ;
  } ) ;


  // --- Module: In Validation ---
  // Tests for the 'in' validation rule (checking if a value is within a list).
  module ( "in validation" ) ;


  // Test case: Checks if 'in' correctly validates values against a list.
  test ( "works" , function ( ) {
    // Model with 'size' requiring to be one of [1, 2, 3].
    var InTestModel = Backbone . Model . extend ( {
      validate : {
        size : {
          in : [
            1 , 2 ,
            3
          ]
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new InTestModel ;
    // Set 'size' not in the list; should fail.
    equal ( m . set ( { size : 5 } , { validate : true } ) , false ) ;
    // Set 'size' in the list; should pass.
    ok ( m . set ( { size : 1 } , { validate : true } ) ) ;
  } ) ;


  // --- Module: Max Validation ---
  // Tests for the 'max' numerical validation rule.
  module ( "max validation" ) ;


  // Test case: Checks if 'max' correctly validates numerical values.
  test ( "works" , function ( ) {
    // Model with 'size' requiring a maximum value of 3.
    var MaxTestModel = Backbone . Model . extend ( {
      validate : {
        size : {
          max : 3
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new MaxTestModel ;
    // Set 'size' greater than 3; should fail.
    equal ( m . set ( { size : 5 } , { validate : true } ) , false ) ;
    // Set 'size' less than or equal to 3; should pass.
    ok ( m . set ( { size : 2 } , { validate : true } ) ) ;
  } ) ;


  // --- Module: Whitelists ---
  // This module appears to be another example of 'in' validation, framed as a whitelist.
  module ( "whitelists" ) ;


  // Test case: Validates colors against a whitelist using the 'in' validator.
  test ( "valid colors" , function ( ) {
    // Model with 'name' requiring to be one of 'white', 'blue', 'red'.
    var ColorTestingModel = Backbone . Model . extend ( {
      validate : {
        name : {
          in : [
            'white' ,
            'blue' ,
            'red'
          ]
        }
      }
    } ) ;

    // Instantiate the model.
    var model = new ColorTestingModel ;
    // Set a valid color; should pass.
    ok ( model . set ( { name : 'white' } , { validate : true } ) ) ;
    // Set an invalid color; should fail.
    equal ( model . set ( { name : 'yellow' } , { validate : true } ) , false ) ;
  } ) ;


  // --- Module: Array Elements Validation ---
  // Tests for validating individual elements within an array.
  module ( "array elements validation" ) ;


  // Test case: Checks if 'arrayElem' validator correctly applies a function to each array element.
  test ( "works" , function ( ) {
    // Model with 'myArray' using an 'arrayElem' validator function.
    // The function returns true if an element is less than 100, otherwise it implicitly returns undefined (falsey).
    var ArrayElemTestModel = Backbone . Model . extend ( {
      validate : {
        myArray : {
          arrayElem : function ( elem ) {
            if ( elem < 100 ) return true ;
          }
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new ArrayElemTestModel ( ) ;
    // Set an empty array; should pass (no elements to fail).
    ok ( m . set ( { myArray : [ ] } , { validate : true } ) ) ;
    // Set an array with an element >= 100; should fail.
    equal ( m . set ( { myArray : [ 101 , 89 ] } , { validate : true } ) , false ) ;
    // Set an array with all elements >= 100; should fail.
    equal ( m . set ( { myArray : [ 788 ] } , { validate : true } ) , false ) ;
    // Set an array with all elements < 100; should pass.
    // Note: The original test has a typo here 'myNumber' instead of 'myArray'.
    // We must replicate the typo exactly for a Type I clone.
    ok ( m . set ( { myNumber : [ 1 , 67 ] } , { validate : true } ) ) ;
  } ) ;


  // --- Module: Type Validations ---
  // Tests for built-in type-specific validation rules.
  module ( "type validations" ) ;


  // Test case: Validates 'email' type.
  test ( "email" , function ( ) {
    // Model with 'email' field requiring 'email' type validation.
    var EmailTestModel = Backbone . Model . extend ( {
      validate : {
        email : {
          type : "email"
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new EmailTestModel ;
    // Set an invalid email; should fail.
    equal ( m . set ( { email : "boogers" } , { validate : true } ) , false ) ;
    // Set a valid email; should pass.
    ok ( m . set ( { email : "neal@snot.ca" } , { validate : true } ) ) ;
  } ) ;


  // Test case: Validates 'url' type.
  test ( "url" , function ( ) {
    // Model with 'link' field requiring 'url' type validation.
    var UrlTestModel = Backbone . Model . extend ( {
      validate : {
        link : {
          type : "url"
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new UrlTestModel ;
    // Set an invalid URL; should fail.
    equal ( m . set ( { link : "boogers" } , { validate : true } ) , false ) ;
    // Set valid HTTP URL; should pass.
    ok ( m . set ( { link : "http://snot.ca" } , { validate : true } ) ) ;
    // Set valid FTP URL; should pass.
    ok ( m . set ( { link : "ftp://snot.ca" } , { validate : true } ) ) ;
  } ) ;


  // Test case: Validates 'number' type.
  test ( "number" , function ( ) {
    // Model with 'address' field requiring 'number' type validation.
    var NumberTestModel = Backbone . Model . extend ( {
      validate : {
        address : {
          type : "number"
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new NumberTestModel ( ) ;
    // Valid number strings/numbers; should pass.
    ok ( m . set ( { address : "33" } , { validate : true } ) ) ;
    ok ( m . set ( { address : 33 } , { validate : true } ) ) ;
    ok ( m . set ( { address : "33.333" } , { validate : true } ) ) ;
    // Invalid number strings; should fail.
    equal ( m . set ( { address : "33.333f" } , { validate : true } ) , false ) ;
    equal ( m . set ( { address : "f33.333f" } , { validate : true } ) , false ) ;
    equal ( m . set ( { address : "." } , { validate : true } ) , false ) ;
    // Leading zeros are okay for numbers.
    ok ( m . set ( { address : "089" } , { validate : true } ) ) ;
  } ) ;


  // Test case: Validates 'String' type (case-sensitive 'String' for type check).
  test ( "String" , function ( ) {
    // Model with 'address' field requiring 'String' type validation.
    var StringTestModel = Backbone . Model . extend ( {
      validate : {
        address : {
          type : "String"
        }
      }
    } ) ;

    // Instantiate the model.
    var m = new StringTestModel ( ) ;
    // Valid string values; should pass.
    ok ( m . set ( { address : "bla bla" } , { validate : true } ) ) ;
    ok ( m . set ( { address : "33.333" } , { validate : true } ) ) ;
    // Non-string values; should fail.
    equal ( m . set ( { address : 33.333 } , { validate : true } ) , false ) ;
    equal ( m . set ( { address : [ ] } , { validate : true } ) , false ) ;
  } ) ;


  // Test case: Validates 'Array' type.
  test ( "Array" , function ( ) {
    // Model with 'elements' field requiring 'Array' type validation.
    var ArrayTestModel = Backbone . Model . extend ( {
      validate : {
        elements : {
          type : "Array"
        }
      }
    } ) ;

    // The original code ends abruptly here.
    // As a Type I clone, we must replicate the exact termination point.
    // No further changes or additions are allowed beyond this line.

} ) ;