/*
 * This file contains QUnit tests for the Spinner component.
 * It thoroughly checks the functionality of the spinner,
 * including its value retrieval, delay mechanisms, event handling,
 * and interactions with user input and disabled states.
 */

( function ( $ ) { // Wrapping the entire test suite in an Immediately Invoked Function Expression (IIFE), passing jQuery as $

    // Define a QUnit module named 'Spinner'.
    // This groups related tests and provides setup/teardown functionality.
    module( 'Spinner', {
        // The setup function runs before each test in this 'Spinner' module.
        setup : function () {
            // Locate the main spinner element using its data-trigger attribute.
            this.el = $( '[data-trigger="spinner"]' );

            // Find the 'spin up' button within the spinner element.
            this.spinUp = $( "[data-spin='up']", this.el );

            // Find the 'spin down' button within the spinner element.
            this.spinDown = $( "[data-spin='down']", this.el );

            // Retrieve the jQuery UI spinner instance associated with the element.
            this.spinner = this.el.data( 'spinner' );
        },

        // The teardown function runs after each test in this 'Spinner' module.
        teardown : function () {
            // Reset the spinner's delay to a default value (500ms).
            // Also, clear any custom 'changed' and 'changing' event handlers
            // to ensure tests run in isolation.
            this.el
                .spinner( 'delay', 500 )       // Reset delay to default
                .spinner( 'changed', null )    // Clear 'changed' event handler
                .spinner( 'changing', null );  // Clear 'changing' event handler

            // Ensure the underlying input's value is reset to 1 for the next test.
            this.spinner.spinning.$el.val( 1 );
        }
    } ); // End of 'Spinner' module definition


    // Test case for the `Spinner#value` method.
    // Expects 1 assertion.
    test( 'Spinner#value', 1, function () {
        // Verify that the initial value returned by the spinner is 1.
        strictEqual( this.spinner.value(), 1, 'The initial spinner value should be 1.' );
    } );


    // Test case for the `Spinner#delay` method.
    // Expects 2 assertions.
    test( 'Spinner#delay', 2, function () {
        // Assert that the default delay configured in the spinner's constructor is 600ms.
        strictEqual( this.spinner.constructor.delay, 600, 'The default constructor delay should be 600ms.' );

        // Set a new delay value for the spinner. The third argument is a message.
        this.el.spinner( 'delay', 300, 'should plus 100' );

        // Assert that the delay has been updated correctly (300 + 100 = 400ms)
        // as per the internal logic of the 'delay' method.
        strictEqual( this.spinner.constructor.delay, 400, 'The delay should be updated to 400ms after setting 300ms.' );
    } );


    // Asynchronous test case for the `Spinner#changed` event.
    // Expects 1 assertion.
    asyncTest( 'Spinner#changed', 1, function () {
        var x = this.spinner.value(), // Store the initial spinner value.
            y = 0;                   // Initialize a variable to capture the new value from the event.

        // Set a short delay for the spinner and attach a 'changed' event handler.
        this.el.spinner( 'delay', 50 ).spinner( 'changed', function ( e, newVal ) {
            y = newVal; // When the spinner's value changes, update 'y' with the new value.
        } );

        // Simulate a click on the 'spin up' button to trigger a value change.
        this.spinUp.click();

        // Use setTimeout to wait for the asynchronous 'changed' event to potentially fire
        // and for the spinner's internal delay to pass.
        setTimeout( function () {
            // Assert that the captured new value 'y' is one greater than the initial value 'x'.
            strictEqual( y, x + 1, 'The "changed" event handler should receive the correct new value.' );
            start(); // Resume QUnit testing after the asynchronous operation completes.
        }, 200 ); // Wait for 200 milliseconds, which is longer than the 50ms spinner delay.
    } );


    // Test case for the `Spinner#changing` event.
    // Expects 1 assertion.
    test( 'Spinner#changing', 1, function () {
        // Attach a 'changing' event handler to the spinner.
        // This event fires *before* the value is actually updated.
        this.el.spinner( 'changing', function ( e, newVal ) {
            // Assert that the proposed new value (before the change is finalized) is 2.
            strictEqual( newVal, 2, 'The "changing" event should indicate the correct upcoming value (2).' );
        } );

        // Simulate a click on the 'spin up' button. This will trigger the 'changing' event.
        this.spinUp.click();
    } );


    // Test case for spinning the value up and down via mouse clicks.
    // Expects 3 assertions.
    test( 'spin via mouse click', 3, function () {
        // Assert the initial spinner value is 1.
        strictEqual( this.spinner.value(), 1, 'Initial spinner value should be 1.' );

        // Simulate a click on the 'spin up' button.
        this.spinUp.click();
        // Assert that the value has increased to 2.
        strictEqual( this.spinner.value(), 2, 'Value should be 2 after spinning up once.' );

        // Simulate a click on the 'spin down' button.
        this.spinDown.click();
        // Assert that the value has decreased back to 1.
        strictEqual( this.spinner.value(), 1, 'Value should revert to 1 after spinning down once.' );
    } );


    // Test case for passing a custom step function to the spinner.
    // Expects 3 assertions.
    test( 'pass step as a function', 3, function () {
        // Assert the initial spinner value is 1.
        strictEqual( this.spinner.value(), 1, 'Initial spinner value is 1.' );

        /*
         * Define a custom step function.
         * This function modifies the step increment/decrement logic.
         * Specifically, it makes the spinner jump from 1 to -1 (and vice-versa)
         * effectively skipping 0 when spinning down from 1 or up from -1.
         */
        this.spinner.spinning.options.step = function ( dir ) {
            // If spinning down from 1, or spinning up from -1, return a step of 2.
            if ( ( this.oldValue === 1 && dir === 'down' ) || ( this.oldValue === -1 && dir === 'up' ) ) {
                return 2;
            }
            // For all other cases, return the default step of 1.
            return 1;
        };

        // Simulate a click on the 'spin down' button.
        // With the custom step, 1 should become -1 (skipping 0).
        this.spinDown.click();
        strictEqual( this.spinner.value(), -1, 'Value should be -1 after spinning down from 1 with custom step function.' );

        // Simulate a click on the 'spin up' button.
        // With the custom step, -1 should become 1 (skipping 0).
        this.spinUp.click();
        strictEqual( this.spinner.value(), 1, 'Value should be 1 after spinning up from -1 with custom step function.' );
    } );


    // Test case to ensure that the spinner does not change value when its input is disabled.
    // Expects 3 assertions.
    test( 'no spinning on disabled input', 3, function () {
        // Disable the underlying input element of the spinner.
        this.spinner.spinning.$el.attr( 'disabled', 'disabled' );

        // Assert the initial spinner value is 1.
        strictEqual( this.spinner.value(), 1, 'Initial spinner value is 1.' );

        // Attempt to spin up while the input is disabled.
        this.spinUp.click();
        // Assert that the value remains 1, as spinning should be prevented.
        strictEqual( this.spinner.value(), 1, 'Value should remain 1 because the input is disabled.' );

        // Manually set the input value to 2 (this bypasses the spinner's logic).
        this.spinner.spinning.$el.val( 2 );
        // Attempt to spin down.
        this.spinDown.click();
        // Assert that the value remains 2, as spinning should still be prevented.
        strictEqual( this.spinner.value(), 2, 'Value should remain 2 as input is disabled, even after manual value set.' );

        // Re-enable the input element. This is crucial for subsequent tests or teardown to function correctly.
        this.spinner.spinning.$el.removeAttr( 'disabled', 'disabled' );
    } );

} ( jQuery ) ); // End of the IIFE, passing the jQuery object.