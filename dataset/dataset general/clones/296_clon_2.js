( function( ngCore ) {
    'use strict'; // Enforce strict mode for cleaner code execution

    // Define a new Angular module named 'SampleApplication'
    // and declare its dependency on the 'datePickerModule'
    ngCore
        .module( 'SampleApplication', [ 'datePickerModule' ] )
        // Register 'ExampleController' to manage the view's logic
        .controller( 'ExampleController', function( viewModel ) {

            // Initialize a property on the view model with the current date
            viewModel.currentDay = new Date(); // Represents today's date

            // Another property for the current time
            viewModel.currentTimepoint = new Date(); // Represents the present time

            // A date specifically for configuration purposes
            viewModel.configurationDate = new Date();

            // Object to hold various configuration settings for a date picker
            viewModel.settings = {
                displayFormat: 'yyyy-MM-dd', // Custom date display format
                enableYearSelection: true    // Allow users to select years easily
            };

            // Property to store a date that will be used for validation, initially null
            viewModel.inputValidationDate = null;

        } );
} )( angular );