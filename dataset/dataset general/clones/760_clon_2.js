var environmentHelper = require('./support/test_env_config');

testSuite(
  'TaskItems',
  function()
  { // Primary test suite for managing various task items.

    var taskCollection; // Declaration for the collection of tasks used in tests.

    // This setup routine runs before each individual test case.
    beforeEveryTest(
      function( completionCallback )
      {
        // Initialize the testing environment asynchronously.
        environmentHelper.initialize(
          function()
          { // Callback after the environment has been set up.
            // Load the definition for a single task item model.
            require('../src/models/task_item');
            // Load the definition for the collection of task items.
            require('../src/collections/task_collections');

            // Create a new instance of the task collection with initial data.
            taskCollection = new Application.TaskCollection(
              [ // Array literal holding initial task objects.
                { description: 'Water the plants' }, // First task: pending.
                { description: 'Buy groceries', isDone: false } // Second task: also pending.
              ]
            ); // End of collection instantiation.

            // Signal that the asynchronous setup process is complete.
            completionCallback();
          }
        ); // End of environment initialization call.
      }
    ); // End of the 'beforeEveryTest' hook.

    // A nested test suite focusing on the logic of individual task items.
    testSuite( 'itemLogic', function() {

      // Define a specific test case for adding new tasks to the collection.
      testCase(
        'can append new tasks',
        function()
        {
          // Add an empty task object to the collection.
          taskCollection.append( {} );
          // Assert that the 'isDone' property of the most recently added item is not true.
          taskCollection
            .finalItem() // Retrieve the last item added to the collection.
            .retrieveProperty( 'isDone' ) // Get the completion status of that item.
            .verifier
            .isNotTruthy(); // Use an assertion to check if it's not marked as done.
        }
      ); // End of the 'can append new tasks' test case.

    } ); // End of the 'itemLogic' nested test suite.

  }
); // End of the main 'TaskItems' test suite.