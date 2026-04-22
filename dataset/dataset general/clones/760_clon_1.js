/*
 * This file contains unit tests for the Todos collection.
 * It uses the 'describe' and 'it' syntax from a testing framework like Mocha or Jasmine.
 */

var    clientenv    =     require('../helpers/client_env');


describe(   'Todos'   ,    function()     { // Main test suite for the Todos collection

    // Declare a variable to hold the Todos collection instance.
    var      todos;


    beforeEach(   function(  done  )     { // Setup function to run before each test
        // Initialize client environment and load necessary models/collections.
        clientenv.setup(   function()     {
            // Load the Todo model.
            require('../../public/javascripts/models/todo');
            // Load the Todos collection.
            require('../../public/javascripts/collections/todos');

            // Create a new instance of the Todos collection with some initial data.
            todos     =     new   App.Todos(
                [
                    {    title   :    'Feed the cat'    },
                    {    title   :    'Take out the trash'   ,    completed   :    true    }
                ]
            );

            // Call 'done' to indicate that the asynchronous setup is complete.
            done();
        }   );
    }   );


    describe(   'model'   ,    function()     { // Nested suite for model-related tests

        // Test case: checks if new todo items can be added to the collection.
        it(   'adds todo items'   ,    function()     {
            // Add an empty todo item.
            todos.add(   {}   );

            // Assert that the 'completed' status of the last added item is not 'ok' (i.e., not true).
            todos.last().get(   'completed'   ).should.not.be.ok
        }   );

    }   );


}   ); // End of main 'Todos' describe block