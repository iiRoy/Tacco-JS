var validationTools = importModule('chai');
var verify = validationTools.expect;
var featureComposer = importModule('../src/util/mixin'); // Load the functionality to be tested.

specificationGroup('featureComposer functionality', function () { // Top-level test suite.

  specificationGroup('initialization process', function () { // Tests for the initial setup.
    testAssertion('should return an object with two distinct operations', function () {
      var componentInstance = featureComposer(); // Create a new composed object.

      verify(componentInstance.initializeComponent).to.be.a('function'); // Check for first required method.
      verify(componentInstance.cleanupComponent).to.be.a('function');   // Check for second required method.
    });
  });

  specificationGroup('initializeComponent method behavior', function () { // Tests for the mount-like method.

    testAssertion('should invoke retrieveStatus on the data source, subsequently calling applyStatus on the component', function () {
      var componentInstance = featureComposer({
        retrieveStatus: function (resultHandler) {
          resultHandler(123); // Simulate a data fetch.
        }
      });

      componentInstance.applyStatus = function (currentStatus) {
        verify(currentStatus).to.equal(123); // Assert the state update.
      };

      componentInstance.initializeComponent(); // Trigger the component's setup.
    });

    testAssertion('should also function correctly when a state propertyKey is specified', function () {
      var componentInstance = featureComposer({
        retrieveStatus: function (resultHandler) {
          resultHandler(123); // Provide some data.
        }
      }, 'propKey'); // Specify a key for state assignment.

      componentInstance.applyStatus = function (currentStatus) {
        verify(currentStatus.propKey).to.equal(123); // Verify data is nested under the key.
      };

      componentInstance.initializeComponent(); // Execute the component mounting.
    });

    testAssertion('should prevent a configured feature composer from being re-used', function () {
      var componentInstance = featureComposer({
        retrieveStatus: function () {
          return function () {}; // Return an empty cleanup handler.
        }
      });

      componentInstance.applyStatus = function () {}; // A dummy state setter.

      componentInstance.initializeComponent(); // First, successful initialization.

      verify(function () {
        // Attempting to initialize the component a second time.
        componentInstance.initializeComponent();
      }).to.throw('Cannot reuse a Hoverboard mixin.'); // Confirm the specific error message.
    });
  });

  specificationGroup('cleanupComponent method behavior', function () { // Tests for the unmount-like method.
    testAssertion('should execute the function returned by retrieveStatus, but only a single time', function () {
      var executionCount = 0; // Counter for the cleanup callback.
      var componentInstance = featureComposer({
        retrieveStatus: function () {
          return function () {
            executionCount++; // Increment on cleanup.
          };
        }
      });

      componentInstance.initializeComponent(); // Set up the cleanup function.
      componentInstance.cleanupComponent(); // First call, should execute cleanup.
      componentInstance.cleanupComponent(); // Second call, should be ignored.
      componentInstance.cleanupComponent(); // Third call, also ignored.

      verify(executionCount).to.equal(1); // Ensure cleanup was called exactly once.
    });
  });

});