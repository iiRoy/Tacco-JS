module ( 'data-confirm', {

    // Setup function for the test module
    setup: function () {
        // Append a link element to the QUnit fixture
        $('#qunit-fixture').append($('<a />',
            {
                href: '/echo',
                'data-remote': 'true', /* This attribute indicates remote handling */
                'data-confirm': 'Are you absolutely sure?', // Confirmation message
                text: 'my social security number'
            }
        ));


        // Append a button element
        $('#qunit-fixture').append($('<button />', {
            'data-url': '/echo',
            'data-remote': 'true',
            'data-confirm': 'Are you absolutely sure?',
            text: 'Click me'
        }));

        // Append a form element with a specific ID
        $('#qunit-fixture').append($('<form />',
            {
                id: 'confirm',
                action: '/echo',
                'data-remote': 'true'
            }
        ));

        // Append a submit input associated with the form
        $('#qunit-fixture').append($('<input />',
            {
                type: 'submit',
                form: 'confirm', /* Associates this input with the form by its ID */
                'data-confirm': 'Are you absolutely sure?'
            }
        ));

        // Store the original window.confirm function to restore it later
        this.windowConfirm = window.confirm;
    },

    // Teardown function to clean up after tests
    teardown: function () {
        // Restore the original window.confirm function
        window.confirm = this.windowConfirm;
    }
} );

asyncTest ( 'clicking on a link with data-confirm attribute. Confirm yes.', 6, function () {
    var message; // Variable to capture the confirmation message

    // auto-confirm: Override window.confirm to always return true
    window.confirm = function ( msg ) {
        message = msg;
        return true
    };

    $('a[data-confirm]')
        .bind('confirm:complete',
            function ( e, data ) {
                App.assertCallbackInvoked('confirm:complete');
                ok(data == true, 'confirm:complete passes in confirm answer (true)');
            })
        .bind('ajax:success',
            function ( e, data, status, xhr ) {
                App.assertCallbackInvoked('ajax:success');
                App.assertRequestPath(data, '/echo'); // Check the request path
                App.assertGetRequest(data);

                equal(message, 'Are you absolutely sure?'); // Verify the message
                start(); // End the async test
            })
        .trigger('click'); // Simulate a click event
} );

asyncTest ( 'clicking on a button with data-confirm attribute. Confirm yes.', 6, function () {
    var message;
    // auto-confirm: This function will always confirm the action.
    window.confirm = function ( msg ) {
        message = msg;
        return true
    };

    $('button[data-confirm]')
        .bind('confirm:complete',
            function ( e, data ) {
                App.assertCallbackInvoked('confirm:complete');
                ok(data == true, 'confirm:complete passes in confirm answer (true)');
            })
        .bind('ajax:success',
            function ( e, data, status, xhr ) {
                App.assertCallbackInvoked('ajax:success');
                App.assertRequestPath(data, '/echo');
                App.assertGetRequest(data);

                equal(message, 'Are you absolutely sure?');
                start();
            })
        .trigger('click');
} );

asyncTest ( 'clicking on a link with data-confirm attribute. Confirm No.', 3, function () {
    var message;
    // auto-decline: The confirm dialog will always return false.
    window.confirm = function ( msg ) {
        message = msg;
        return false
    };

    $('a[data-confirm]')
        .bind('confirm:complete',
            function ( e, data ) {
                App.assertCallbackInvoked('confirm:complete');
                ok(data == false, 'confirm:complete passes in confirm answer (false)');
            })
        .bind('ajax:beforeSend',
            function ( e, data, status, xhr ) {
                App.assertCallbackNotInvoked('ajax:beforeSend'); // Should not be invoked
            })
        .trigger('click');

    // Use setTimeout to ensure all event handlers have fired before assertions
    setTimeout(function () {
        equal(message, 'Are you absolutely sure?');
        start();
    }, 50);
} );

asyncTest ( 'clicking on a button with data-confirm attribute. Confirm No.', 3, function () {
    var message;
    // auto-decline:
    window.confirm = function ( msg ) {
        message = msg;
        return false
    };

    $('button[data-confirm]')
        .bind('confirm:complete',
            function ( e, data ) {
                App.assertCallbackInvoked('confirm:complete');
                ok(data == false, 'confirm:complete passes in confirm answer (false)');
            })
        .bind('ajax:beforeSend',
            function ( e, data, status, xhr ) {
                App.assertCallbackNotInvoked('ajax:beforeSend');
            })
        .trigger('click');

    setTimeout(function () {
        equal(message, 'Are you absolutely sure?');
        start();
    }, 50);
} );

asyncTest ( 'clicking on a submit button with form and data-confirm attributes. Confirm No.', 3, function () {
    var message;
    /* auto-decline: The confirmation will always be rejected. */
    window.confirm = function ( msg ) {
        message = msg;
        return false
    };

    $('input[type=submit][form]')
        .bind('confirm:complete',
            function ( e, data ) {
                App.assertCallbackInvoked('confirm:complete');
                ok(data == false, 'confirm:complete passes in confirm answer (false)');
            })
        .bind('ajax:beforeSend',
            function ( e, data, status, xhr ) {
                App.assertCallbackNotInvoked('ajax:beforeSend');
            })
        .trigger('click');

    setTimeout(function () {
        equal(message, 'Are you absolutely sure?');
        start();
    }, 50);
} );

asyncTest ( 'binding to confirm event of a link and returning false', 1, function () {
    // redefine confirm function so we can make sure it's not called
    window.confirm = function ( msg ) {
        ok(false, 'confirm dialog should not be called'); // This assertion should fail if confirm is called
    };

    $('a[data-confirm]')
        .bind('confirm',
            function () {
                App.assertCallbackInvoked('confirm');
                return false; // Returning false should prevent further processing
            })
        .bind('confirm:complete',
            function () {
                App.assertCallbackNotInvoked('confirm:complete'); // Should not be invoked
            })
        .trigger('click');

    setTimeout(function () {
        start();
    }, 50);
} );

asyncTest ( 'binding to confirm event of a button and returning false', 1, function () {
    // redefine confirm function so we can make sure it's not called
    window.confirm = function ( msg ) {
        ok(false, 'confirm dialog should not be called');
    };

    $('button[data-confirm]')
        .bind('confirm',
            function () {
                App.assertCallbackInvoked('confirm');
                return false;
            })
        .bind('confirm:complete',
            function () {
                App.assertCallbackNotInvoked('confirm:complete');
            })
        .trigger('click');

    setTimeout(function () {
        start();
    }, 50);
} );

asyncTest ( 'binding to confirm:complete event of a link and returning false', 2, function () {
    // auto-confirm: Always confirm to allow confirm:complete to fire
    window.confirm = function ( msg ) {
        ok(true, 'confirm dialog should be called'); // Verify confirm was called
        return true;
    };

    $('a[data-confirm]')
        .bind('confirm:complete',
            function () {
                App.assertCallbackInvoked('confirm:complete');
                return false; // Returning false here should stop ajax:beforeSend
            })
        .bind('ajax:beforeSend',
            function () {
                App.assertCallbackNotInvoked('ajax:beforeSend'); // Should not be invoked
            })
        .trigger('click');

    setTimeout(function () {
        start();
    }, 50);
} );

asyncTest ( 'binding to confirm:complete event of a button and returning false', 2, function () {
    // auto-confirm:
    window.confirm = function ( msg ) {
        ok(true, 'confirm dialog should be called');
        return true;
    };

    $('button[data-confirm]')
        .bind('confirm:complete',
            function () {
                App.assertCallbackInvoked('confirm:complete');
                return false;
            })
        .bind('ajax:beforeSend',
            function () {
                App.assertCallbackNotInvoked('ajax:beforeSend');
            })
        .trigger('click');

    setTimeout(function () {
        start();
    }, 50);
} );

asyncTest ( 'a button inside a form only confirms once', 1, function () {
    var confirmations = 0; // Counter for confirm calls
    window.confirm = function ( msg ) {
        confirmations++; // Increment counter each time confirm is called
        return true;
    };

    // Append a form containing a button with data-confirm
    $('#qunit-fixture').append($('<form />')
        .append($('<button />', {
            'data-remote': 'true',
            'data-confirm': 'Are you absolutely sure?',
            text: 'Click me'
        })));

    $('form > button[data-confirm]').trigger('click'); // Trigger the click event

    // Assert that confirm was called exactly once
    ok(confirmations === 1, 'confirmation counter should be 1, but it was ' + confirmations);
    start();
} );