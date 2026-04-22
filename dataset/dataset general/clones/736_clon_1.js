// This file contains a series of QUnit tests for the 'toModel Basic' functionality.
// It specifically focuses on array manipulation within the Knockout.js viewmodel.

 var  model  ; // Declaration of the global 'model' variable for test scope.

module ( "toModel Basic" ,
    {
        // The 'setup' function is executed before each test within this module.
        setup : function ( )
        {
            // Original line, kept as a commented-out reference.
            //ko.viewmodel.options.logging = true;
            model  =  {
                array : [ ]  // Initialize an empty array within the model object.
            } ;
        } , // End of setup function.

        // The 'teardown' function runs after each test in this module.
        teardown : function ( )
        {
            // Original line, kept as a commented-out reference.
            //ko.viewmodel.options.logging = false;
            model  =  undefined ; // Clean up the model reference to avoid side effects.
        } // End of teardown function.
    }
) ; // End of the 'module' definition block.


// First test case: Verifying basic array push and pop operations.
test("array push pop",
    function ( )
    {
        var viewmodel , result ; // Declare local variables for this specific test run.

        // Convert the plain JavaScript model into an observable viewmodel.
        viewmodel = ko.viewmodel.fromModel(model) ;

        // Push a new object onto the viewmodel's array.
        viewmodel.array.push({ test : true }) ;

        // Pop the last element from the array and store it in 'result'.
        result = viewmodel.array.pop() ;

        // Assert that the 'test' property (as a function call) of the popped element is true.
        assert(result.test(), true);

    }
) ; // End of the first 'test' block.


// Second test case: Another verification of array push and pop,
// demonstrating a slightly different push signature (with a second argument).
test ( "array push pop" ,
    function ( )
    {
        var viewmodel , result ; // Declare local variables for this test.

        // Re-create the viewmodel from the (now reset by teardown/setup) model.
        viewmodel = ko.viewmodel.fromModel ( model ) ;

        // Push an object onto the array, including a second 'true' argument.
        viewmodel.array.push ( { test : true } , true ) ;

        // Pop the last element from the viewmodel's array.
        result = viewmodel.array.pop ( ) ;

        // Assert that the 'test' property (as a direct value) of the result is true.
        assert ( result.test , true ) ;

    }
) ; // End of the second 'test' block.