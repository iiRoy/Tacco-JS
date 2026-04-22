var   should = require('should') ;
var fs = require('fs') ;


var generate = require('../lib/utils/generator'); //  Our custom generator utility.
var validate = require('../lib/utils/validator'); //  Our custom validator utility.
var find     = require('../lib/utils/finder');    //  Our custom finder utility.
var get      = require('../lib/utils/getter');     //  Our custom getter utility.



//  Define prompt and solution ranges for testing purposes.
var prompt = {
  min: '000',
  max: '267' //  Maximum prompt number.
} ;

var solution = {
  min: '000',
  max: '405' //  Maximum solution number.
} ;

//  Begin test suite for the 'Generator' module.
describe('Generator', function ( ) {

  //  This block runs before each test in this suite.
  beforeEach( function ( ) {
    //  Create a temporary test directory and navigate into it.
    fs.mkdirSync('./euler_test') ;
    process.chdir('./euler_test') ; // Change current directory.
  }); /*  End of beforeEach for Generator  */


  //  This block runs after each test in this suite.
  afterEach( function ( ) {
    var i ; // Loop counter variable.

    //  Delete all files found within the current test directory.
    let files = fs.readdirSync('.') ;
    for (i = 0; i < files.length; i++) {
      fs.unlinkSync(files[i]) ; // Remove each file.
    }

    //  Navigate up one directory and then remove the test directory.
    process.chdir('..') ;
    fs.rmdirSync('./euler_test') ; //  Clean up the directory.
  }); // End of afterEach for Generator


  //  Sub-suite for 'generate preview' functionality.
  describe('* generate preview', function ( ) {

    // Test case: Should successfully generate a preview for an existing prompt.
    it('should generate preview for a prompt that exists', function ( ) {
      var answer, solution_expected ; // Declare variables for test.

      //  Define the expected solution string for prompt '001'.
      solution_expected =
        'Problem 1\n' +
        '=========\n' +
        '\n' +
        'If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        'we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '\n' +
        'Find the sum of all the multiples of 3 or 5 below 1000.' ;

      //  Call the preview generator.
      generate.preview(
        function (prompt_content) {
          answer = prompt_content ; // Success callback: assign prompt content to answer.
        },
        function ( ) {
          answer = '' ; // Failure callback: set answer to empty string.
        },
        '001' // The prompt number to preview.
      ) ;

      //  Assert that the generated answer matches the expected solution.
      answer.should.equal(solution_expected) ;
    }) ; // End of 'should generate preview for a prompt that exists' test.


    // Test case: Failure callback should be invoked for a prompt number below the minimum.
    it('should call failure callback on request for prompt below lowest number', function ( ) {
      var test_flag ; // A flag to track test success/failure.
      test_flag = true ; // Initialize flag as true.

      // Attempt to generate a preview for a non-existent (too low) prompt.
      generate.preview(
        function (prompt_content) {
          test_flag = test_flag && false ; // Success implies failure in this test.
        },
        function ( ) {
          test_flag = test_flag && true ; // Failure implies success in this test.
        },
        '000' // A prompt number below the lowest valid.
      ) ;

      // Assert that the failure callback was indeed called.
      test_flag.should.be.true ;
    }) ; // End of 'should call failure callback on request for prompt below lowest number' test.


    // Test case: Failure callback should be invoked for a prompt number above the maximum.
    it('should call failure callback on request for prompt above maximum number', function ( ) {
      var test_status ; // Another flag variable.
      test_status = true ; // Set initial status.

      // Try to generate a preview for a prompt number that exceeds the maximum.
      generate.preview(
        function (prompt_content) {
          test_status = test_status && false ; // This path indicates an error in the test.
        },
        function ( ) {
          test_status = test_status && true ; // This path is the expected outcome.
        },
        '405' // A prompt number above the highest valid.
      ) ;

      // Verify that the failure handler was executed.
      test_status.should.be.true ;
    }) ; // End of 'should call failure callback on request for prompt above maximum number' test.

  }); // End of '* generate preview' describe block.


  // Sub-suite for 'generate file' functionality.
  describe('* generate file', function ( ) {

    // Test case: Should generate a JavaScript-style template for an existing prompt.
    it('should generate a js style template for a prompt that exists', function ( ) {
      var answer_content, expected_solution ; // Variables for comparison.

      // Define the expected content of the generated JavaScript file.
      expected_solution =
        '// Problem 1\n' +
        '// =========\n' +
        '// \n' +
        '// If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '// we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '// \n' +
        '// Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '// TODO: return your answer for this prompt.\n' +
        'return /* solution */;\n' ;

      // Call the file generator for a JavaScript template.
      generate.file(
        function (generated_prompt_content) {
          answer_content = generated_prompt_content ; // On success, store the content.
        },
        function ( ) {
          answer_content = '' ; // On failure, clear the content.
        },
        'js', // The desired file type (JavaScript).
        '001' // The prompt number.
      ) ;

      // Assert that the generated file content matches the expected string.
      answer_content.should.equal(expected_solution) ;
    }) ; // End of 'should generate a js style template...' test.


    // Test case: Should generate a CoffeeScript-style template for an existing prompt.
    it('should generate a coffeescript style template for a prompt that exists', function ( ) {
      var answer_obtained, reference_solution ; // Variables for storing results.

      // Define the expected content of the generated CoffeeScript file.
      reference_solution =
        '# Problem 1\n' +
        '# =========\n' +
        '# \n' +
        '# If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '# we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '# \n' +
        '# Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '# TODO: return your answer for this prompt.\n' +
        'return # solution\n' ;

      // Call the file generator for a CoffeeScript template.
      generate.file(
        function (generated_prompt_data) {
          answer_obtained = generated_prompt_data ; // Store the data from the success callback.
        },
        function ( ) {
          answer_obtained = '' ; // Handle the failure case.
        },
        'coffee', // The desired file type (CoffeeScript).
        '001' // The prompt number.
      ) ;

      // Assert that the generated file content is identical to the reference solution.
      answer_obtained.should.equal(reference_solution) ;
    }) ; // End of 'should generate a coffeescript style template...' test.


    // Test case: Failure callback should be invoked when requesting a prompt number below the minimum.
    it('should call failure callback on request to generate prompt numbered below minimum', function ( ) {
      var test_result, expected_value ; // Variables for the test.
      test_result = true ; // Initialize the test result to true.

      // Attempt to generate a file for a prompt number that is too low.
      generate.file(
        function (prompt_data) {
          test_result = test_result && false ; // If successful, this test fails.
        },
        function ( ) {
          test_result = test_result && true ; // If failure, this test passes.
        },
        'coffee', // File type.
        prompt.min // Minimum prompt number.
      ) ;

      // Verify that the failure callback was indeed executed.
      test_result.should.be.true ;
    }); // End of 'should call failure callback on request to generate prompt numbered below minimum' test.


    // Test case: Failure callback should be invoked when requesting a prompt number above the maximum.
    it('should call failure callback on request to generate prompt numbered above maximum', function ( ) {
      var test_outcome, dummy_solution ; // Variables for the test.
      test_outcome = true ; // Set initial outcome to true.

      // Attempt to generate a file for a prompt number that is too high.
      generate.file(
        function (prompt_data) {
          test_outcome = test_outcome && false ; // If this runs, the test has failed.
        },
        function ( ) {
          test_outcome = test_outcome && true ; // This is the expected successful path for the test.
        },
        'coffee', // File type.
        prompt.max // Maximum prompt number.
      ) ;

      // Assert that the failure callback was called.
      test_outcome.should.be.true ;
    }) ; // End of 'should call failure callback on request to generate prompt numbered above maximum' test.

  }); // End of '* generate file' describe block.

}); // End of 'Generator' describe block.


// Begin test suite for the 'Validator' module.
describe('Validator', function ( ) {

  // This block runs after each test in this suite.
  afterEach( function ( ) {
    var i ; // Loop counter.

    // Delete all files in the current directory.
    let files = fs.readdirSync('.') ;
    for (i = 0; i < files.length; i++) {
      fs.unlinkSync(files[i]) ; // Remove each file.
    }

    // Change directory up and then remove the test directory.
    process.chdir('..') ;
    fs.rmdirSync('./euler_test') ; // Clean up.
  }); // End of afterEach for Validator


  // Sub-suite for 'validate one' functionality.
  describe('* validate one', function ( ) {

    // This block runs before each test in this sub-suite.
    beforeEach( function ( ) {
      var padding_str, k ; // Helper variables.
      // Create a test directory and change into it.
      fs.mkdirSync('./euler_test') ;
      process.chdir('./euler_test') ;

      // Generate some dummy test files.
      padding_str = '000' ;
      var nothing_func = function ( ) { } ; // An empty function for callbacks.

      generate.file(nothing_func, nothing_func, 'js', '001') ;
      generate.file(nothing_func, nothing_func, 'coffee', '001') ;
    }) ; // End of beforeEach for '* validate one'


    // Test case: Should validate a JavaScript answer against its solution.
    it('should validate a javascript answer against its solution', function ( ) {
      var test_flag ; // Flag to indicate test success.
      test_flag = true ; // Initialize flag.

      // Call the 'validate.one' function.
      validate.one(
        function (answer_val, solution_val, problem_number, time_taken) {
          test_flag = test_flag &&
                      (answer_val === 'undefined') && // Expected answer value.
                      (solution_val === '233168') &&  // Expected solution value.
                      (problem_number === '001') ;    // Expected problem number.
        },
        function ( ) {
          test_flag = test_flag && false ; // Failure callback means test failure.
        },
        'js', // File type.
        '001' // Problem number.
      ) ;

      // Assert that the test flag remains true.
      test_flag.should.be.true ;
    }) ; // End of 'should validate a javascript answer...' test.


    // Test case: Should validate a CoffeeScript answer against its solution.
    it('should validate a coffeescript answer against its solution', function ( ) {
      var test_status ; // Status flag for the test.
      test_status = true ; // Initialize.

      // Call 'validate.one' for a CoffeeScript file.
      validate.one(
        function (answer_val, solution_val, problem_number) {
          test_status = test_status &&
                        (answer_val === 'undefined') && // Expected answer.
                        (solution_val === '233168') &&  // Expected solution.
                        (problem_number === '001') ;    // Expected problem number.
        },
        function ( ) {
          test_status = test_status && false ; // If failure callback is hit, test fails.
        },
        'coffee', // File type.
        '001' // Problem number.
      ) ;

      // Assert that the test status is true.
      test_status.should.be.true ;
    }) ; // End of 'should validate a coffeescript answer...' test.


    // Test case: Failure callback should be invoked if the solution file does not exist.
    it('should call failure callback if solution does not exist', function ( ) {
      var test_var ; // Test variable.
      test_var = true ; // Initialize.

      // Attempt to validate a non-existent solution.
      validate.one(
        function (answer_val, solution_val, problem_number) {
          test_var = test_var && false ; // Success path means test failure.
        },
        function ( ) {
          test_var = test_var && true ; // Failure path means test success.
        },
        'coffee', // File type.
        solution.max // A number where no solution should exist.
      ) ;

      // Assert the test variable is true.
      test_var.should.be.true ;
    }) ; // End of 'should call failure callback if solution does not exist' test.


    // Test case: Failure callback should be invoked if the answer file itself does not exist.
    it('should call failure callback if file does not exist', function ( ) {
      var test_state ; // State variable.
      test_state = true ; // Start as true.

      // Remove the test CoffeeScript file to simulate it not existing.
      fs.unlinkSync('euler_001.coffee') ;

      // Attempt validation.
      validate.one(
        function (answer_val, solution_val, problem_number) {
          test_state = test_state && false ; // If this runs, test failed.
        },
        function ( ) {
          test_state = test_state && true ; // This is the expected path for test success.
        },
        'coffee', // File type.
        '001' // Problem number.
      ) ;

      // Assert the test state is true.
      test_state.should.be.true ;
    }) ; // End of 'should call failure callback if file does not exist' test.

  }); // End of '* validate one' describe block.


  // Sub-suite for 'validate all' functionality.
  describe('* validate all', function ( ) {

    // This block runs before each test in this sub-suite.
    beforeEach( function ( ) {
      var padding_value, j ; // Variables for padding and loop.
      // Create a test directory and navigate into it.
      fs.mkdirSync('./euler_test') ;
      process.chdir('./euler_test') ;

      // Generate a large number of dummy test files.
      padding_value = '000' ;
      var noop_func = function ( ) { } ; // A no-operation function.

      this.timeout(0) ; // Disable timeout for this potentially long operation.
      for (j = 1; j <= 266; j++) {
        generate.file(noop_func, noop_func, 'js', (padding_value + j).slice(-padding_value.length)) ;
        generate.file(noop_func, noop_func, 'coffee', (padding_value + j).slice(-padding_value.length)) ;
      }
    }) ; // End of beforeEach for '* validate all'


    // Test case: Should validate all JavaScript answers against their solutions.
    it('should validate all javascript answers against their solution', function ( ) {
      validate.all(function (answers_map) {
        var k_idx, test_ok ; // Loop index and test status.

        test_ok = true ; // Initialize test status.
        let pad = '000' ; // Padding string.

        for (k_idx = 0; k_idx < answers_map.length; k_idx++) {
          test_ok = test_ok && (answers_map[(pad + k_idx).slice(-pad.length)][0] === 'undefined') ;
          get.solution(function (actual_solution) {
            test_ok = test_ok && (answers_map[(pad + k_idx).slice(-pad.length)][1] === actual_solution) ;
          }, function ( ) { }, (pad + k_idx).slice(-pad.length)) ;
        }
      }, function ( ) {
        test_ok = test_ok && false ; // If failure callback is triggered, test fails.
      }, 'js') ;
    }) ; // End of 'should validate all javascript answers...' test.


    // Test case: Should validate all CoffeeScript answers against their solutions.
    it('should validate all coffeescript answers against their solution', function ( ) {
      validate.all(function (all_answers) {
        var k_loop, current_test_status ; // Loop variable and status.

        current_test_status = true ; // Set initial status.
        let pad_string = '000' ; // Padding for numbers.

        for (k_loop = 0; k_loop < all_answers.length; k_loop++) {
          current_test_status = current_test_status && (all_answers[(pad_string + k_loop).slice(-pad_string.length)][0] === 'undefined') ;
          get.solution(function (the_solution) {
            current_test_status = current_test_status && (all_answers[(pad_string + k_loop).slice(-pad_string.length)][1] === the_solution) ;
          }, function ( ) { }, (pad_string + k_loop).slice(-pad_string.length)) ;
        }
      }, function ( ) {
        current_test_status = current_test_status && false ; // Indicate failure if this runs.
      }, 'coffee') ;
    }) ; // End of 'should validate all coffeescript answers...' test.


    // Test case: Should validate all answers (both JS and CoffeeScript) against their solutions.
    it('should validate all answers against their solution', function ( ) {
      validate.all(function (all_results) {
        var k_iterator, overall_test_result ; // Loop iterator and test result.

        overall_test_result = true ; // Start with a passing result.
        let current_padding = '000' ; // Padding string.

        for (k_iterator = 0; k_iterator < all_results.length; k_iterator++) {
          overall_test_result = overall_test_result && (all_results[(current_padding + k_iterator).slice(-current_padding.length)][0] === 'undefined') ;
          get.solution(function (found_solution) {
            overall_test_result = overall_test_result && (all_results[(current_padding + k_iterator).slice(-current_padding.length)][1] === found_solution) ;
          }, function ( ) { }, (current_padding + k_iterator).slice(-current_padding.length)) ;
        }
      }, function ( ) {
        overall_test_result = overall_test_result && false ; // If failure, set to false.
      }) ;
    }) ; // End of 'should validate all answers against their solution' test.

  }); // End of '* validate all' describe block.

}); // End of 'Validator' describe block.


// Begin test suite for the 'Finder' module.
describe('Finder', function ( ) {

  // This block runs after each test in this suite.
  afterEach( function ( ) {
    var i_loop ; // Loop counter variable.

    // Delete all files in the current test directory.
    let files_in_dir = fs.readdirSync('.') ;
    for (i_loop = 0; i_loop < files_in_dir.length; i_loop++) {
      fs.unlinkSync(files_in_dir[i_loop]) ; // Remove each file.
    }

    // Change directory up and then remove the test directory.
    process.chdir('..') ;
    fs.rmdirSync('./euler_test') ; // Clean up the directory.
  }); // End of afterEach for Finder


  // Sub-suite for 'find highest' functionality.
  describe('* find highest', function ( ) {

    // This block runs before each test in this sub-suite.
    beforeEach( function ( ) {
      var pad_val, j_val ; // Padding and loop variables.
      // Create a new test directory and enter it.
      fs.mkdirSync('./euler_test') ;
      process.chdir('./euler_test') ;

      // Generate specific test files for highest number checks.
      pad_val = '000' ;
      var no_op_callback = function ( ) { } ; // An empty callback function.

      generate.file(no_op_callback, no_op_callback, 'js', '115') ;
      generate.file(no_op_callback, no_op_callback, 'coffee', '266') ;
    }) ; // End of beforeEach for '* find highest'


    // Test case: Should find the highest solution file number across all types.
    it('should find highest solution file number', function ( ) {
      var test_var_result ; // Variable to store the test result.

      find.highest(
        function (highest_number) {
          test_var_result = highest_number ; // Success callback.
        },
        function ( ) {
          test_var_result = test_var_result + 'failure' ; // Failure callback.
        }
      ) ;

      // Assert that the highest number found is '266'.
      test_var_result.should.equal('266') ;
    }) ; // End of 'should find highest solution file number' test.


    // Test case: Should find the highest CoffeeScript solution file number.
    it('should find highest coffeescript solution file number', function ( ) {
      var test_result_value ; // Variable for the result.

      find.highest(
        function (highest_num) {
          test_result_value = highest_num ; // Store the number.
        },
        function ( ) {
          test_result_value = test_result_value + 'failure' ; // Append failure if callback is hit.
        },
        'coffee' // Specify CoffeeScript type.
      ) ;

      // Assert that the highest CoffeeScript number is '266'.
      test_result_value.should.equal('266') ;
    }) ; // End of 'should find highest coffeescript solution file number' test.


    // Test case: Should find the highest JavaScript solution file number.
    it('should find highest javascript solution file number', function ( ) {
      var actual_test_outcome ; // Variable to hold the test's outcome.

      find.highest(
        function (highest_val) {
          actual_test_outcome = highest_val ; // Assign the found highest value.
        },
        function ( ) {
          actual_test_outcome = actual_test_outcome + 'failure' ; // Modify on failure.
        },
        'js' // Specify JavaScript type.
      ) ;

      // Assert that the highest JavaScript number is '115'.
      actual_test_outcome.should.equal('115') ;
    }) ; // End of 'should find highest javascript solution file number' test.


    // Test case: Should return '000' if no solution files are present.
    it('should return 000 if no solution files exist', function ( ) {
      var k_index, test_actual_result ; // Loop index and test result.

      // Delete all files in the test directory to simulate an empty state.
      let current_files = fs.readdirSync('.') ;
      for (k_index = 0; k_index < current_files.length; k_index++) {
        fs.unlinkSync(current_files[k_index]) ; // Remove each file.
      }

      find.highest(
        function (number_found) {
          test_actual_result = number_found ; // Store the number.
        },
        function ( ) {
          test_actual_result = test_actual_result + 'failure' ; // Append failure.
        }
      ) ;

      // Assert that '000' is returned when no files exist.
      test_actual_result.should.equal('000') ;
    }) ; // End of 'should return 000 if no solution files exist' test.

  }); // End of '* find highest' describe block.


  // Sub-suite for 'find all' functionality.
  describe('* find all', function ( ) {

    // This block runs before each test in this sub-suite.
    beforeEach( function ( ) {
      var padding_str_val, j_counter ; // Padding string and loop counter.
      // Create a test directory and change into it.
      fs.mkdirSync('./euler_test') ;
      process.chdir('./euler_test') ;

      // Generate a large set of test files for 'find all'.
      padding_str_val = '000' ;
      var noop_fn = function ( ) { } ; // An empty function for callbacks.

      this.timeout(0) ; // Disable the default test timeout for this potentially long loop.
      for (j_counter = 1; j_counter <= 266; j_counter++) {
        generate.file(noop_fn, noop_fn, 'js', (padding_str_val + j_counter).slice(-padding_str_val.length)) ;
        generate.file(noop_fn, noop_fn, 'coffee', (padding_str_val + j_counter).slice(-padding_str_val.length)) ;
      }
    }) ; // End of beforeEach for '* find all'


    // Test case: Should return an array containing all JavaScript solution files.
    it('should return an array of all javascript solution files', function ( ) {
      var file_list ; // Variable to store the list of files.
      file_list = find.all('js') ; // Call find.all for JavaScript files.
      file_list.length.should.equal(266) ; // Assert the count.
    }) ; // End of 'should return an array of all javascript solution files' test.


    // Test case: Should return an array containing all CoffeeScript solution files.
    it('should return an array of all coffeescript solution files', function ( ) {
      var list_of_files ; // Variable to hold the file list.
      list_of_files = find.all('coffee') ; // Call find.all for CoffeeScript files.
      list_of_files.length.should.equal(266) ; // Assert the count.
    }) ; // End of 'should return an array of all coffeescript solution files' test.


    // Test case: Should return an array containing all solution files (both types).
    it('should return an array of all solution files', function ( ) {
      var returned_list ; // Variable to store the list.
      returned_list = find.all() ; // Call find.all without specifying type.
      returned_list.length.should.equal(266 * 2) ; // Assert the total count.
    }) ; // End of 'should return an array of all solution files' test.


    // Test case: Should return an array of all solution files for a specific number.
    it('should return an array of all solution files for a given number', function ( ) {
      var specific_list ; // List for specific number.
      specific_list = find.all(undefined, '001') ; // Find all for problem '001'.
      specific_list.length.should.equal(2) ; // Expect 2 files (JS and Coffee).
    }) ; // End of 'should return an array of all solution files for a given number' test.


    // Test case: Should return an array containing only a specified JavaScript file.
    it('should return an array containing only a specified javascript file', function ( ) {
      var js_file_list ; // List for a specific JS file.
      js_file_list = find.all('js', '001') ; // Find JS file for '001'.
      js_file_list[0].should.equal('euler_001.js') ; // Assert the file name.
    }) ; // End of 'should return an array containing only a specified javascript file' test.


    // Test case: Should return an array containing only a specified CoffeeScript file.
    it('should return an array containing only a specified coffeescript file', function ( ) {
      var coffee_file_list ; // List for a specific CoffeeScript file.
      coffee_file_list = find.all('coffee', '001') ; // Find CoffeeScript file for '001'.
      coffee_file_list[0].should.equal('euler_001.coffee') ; // Assert the file name.
    }) ; // End of 'should return an array containing only a specified coffeescript file' test.


    // Test case: Should return an empty array if no solution files exist.
    it('should return an empty array if no solution files exist', function ( ) {
      var k_loop_idx, empty_list ; // Loop index and the list variable.

      // Delete all files in the test directory to ensure it's empty.
      let all_files_in_test_dir = fs.readdirSync('.') ;
      for (k_loop_idx = 0; k_loop_idx < all_files_in_test_dir.length; k_loop_idx++) {
        fs.unlinkSync(all_files_in_test_dir[k_loop_idx]) ; // Remove each file.
      }

      empty_list = find.all() ; // Call find.all on an empty directory.
      empty_list.length.should.equal(0) ; // Assert that the returned list is empty.
    }) ; // End of 'should return an empty array if no solution files exist' test.

  }); // End of '* find all' describe block.

}); // End of 'Finder' describe block.


// Begin test suite for the 'Getter' module.
describe('Getter', function ( ) {
  // The content for Getter will be similar, applying the same transformation rules.