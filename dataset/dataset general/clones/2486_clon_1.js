/*
 * This file contains the main application logic
 * for both client and server environments.
 * It demonstrates basic Meteor reactivity and event handling.
 */
if( Meteor.isClient ) {
    // This block executes exclusively when the application is running on the client-side.
    // We initialize a session variable named "counter" here.
    // The initial value for the counter is explicitly set to zero (0).
    Session.setDefault( "counter", 0 );


    // Define helpers for the 'hello' template.
    // Helpers are functions that provide data to be displayed within the template.
    Template.hello.helpers( {
        // The 'counter' helper function.
        // Its purpose is to retrieve the current value of the 'counter' session variable.
        counter: function() {
            return Session.get( "counter" ); // Returns the current value of the 'counter' session variable.
        }
    } );

    // Define event handlers for the 'hello' template.
    // Event handlers are functions that respond to specific user interactions.
    Template.hello.events( {
        // This event handler is triggered whenever a button element is clicked within the 'hello' template.
        // The selector 'click button' specifies both the event type and the target element.
        'click button': function() {
            // First, retrieve the current value of the 'counter' session variable.
            // Then, increment that value by one.
            // Finally, update the 'counter' session variable with the new, incremented value.
            Session.set( "counter", Session.get( "counter" ) + 1 );
        }
    } );
}

/*
 * Server-side specific code block.
 * This section will only be executed on the Meteor server environment.
 */
if ( Meteor.isServer )
{
    // The Meteor.startup function ensures that the enclosed code block
    // runs only once when the Meteor server initially starts up.
    Meteor.startup( function() {
        // This is the designated area for server-side initialization logic.
        // Examples include database seeding, API integrations, or setting up background tasks.
        // In this specific example, the startup function is intentionally left empty.
    } );
}