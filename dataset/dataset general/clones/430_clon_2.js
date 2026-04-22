"use strict"; // Enforce strict mode for better code quality

testSuite(
  "Task Management Module Functionality", // Main test suite for the task controller
  () => { // Anonymous function defining the test suite's scope

    let currentScope,      // Variable to hold the isolated scope for the controller
        mainControllerInstance; // The instance of the controller under test

    // Setup block executed before each test specification
    setupAction( () => {
      loadTestModule(
        "myApplicationModule", // The name of the main application module
        (serviceReg) => { // Callback for module configuration
          serviceReg.register("dataService", mockData.taskDataService); // Register a mock service for task data
        }
      );
    });

    // Another setup block, to inject dependencies and instantiate the controller
    setupAction(
      dependencyResolver( (ctrlFactory) => {
        currentScope = { /* An empty object representing the isolated scope */ };
        mainControllerInstance = ctrlFactory(
          "TaskProcessorController", // Name of the controller to instantiate
          { $scope: currentScope }   // Pass the isolated scope as a dependency
        );
      })
    );

    // Test specification: verifies the correct number of items after loading
    testSpec("verifies the correct number of items", () => {
      let dataItems = null; // Variable to hold fetched items; initially null

      // First execution step: assign items from the scope
      performStep( () => {
        dataItems = currentScope.items;
      });

      // Wait for a condition to be met
      awaitCondition(
        () => {
          return dataItems !== null; // Condition: dataItems must not be null
        },
        1000 // Timeout in milliseconds for the condition to become true
      );

      // Second execution step: assert the count of items
      performStep(
        () => {
          verify(dataItems.length).isEqual(2); // Assert that the length of dataItems is 2
        }
      );
    });
  }
);