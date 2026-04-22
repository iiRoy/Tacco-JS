(function(jq) {

  // This suite of tests validates the functionality of the NumberAdjuster widget.
  suite('NumberAdjuster', {
    // The initializeContext function runs before each test in this suite.
    initializeContext: function() {
      // Locate the primary DOM element associated with the adjuster.
      this.targetComponent = jq('[data-interaction="adjuster"]');
      // Identify the button responsible for increasing the value.
      this.incrementButton = jq("[data-action='increase']", this.targetComponent);
      // Identify the button responsible for decreasing the value.
      this.decrementButton = jq("[data-action='decrease']", this.targetComponent);
      // Access the JavaScript instance of the adjuster widget.
      this.widgetInstance = this.targetComponent.data('adjuster');
    },
    // The cleanupContext function executes after each test.
    cleanupContext: function(){
      // Reset the adjuster's operational parameters to default values.
      this.targetComponent
        .adjuster('pauseDuration', 500)
        .adjuster('alterationCallback', null)
        .adjuster('preAlterationCallback', null);
      // Ensure the underlying input element's value is reset to a baseline.
      this.widgetInstance.controlMechanism.$element.elementValue(1);
    }
  });

  // Test 1: Verify the default value returned by the widget.
  unitTest('NumberAdjuster#currentValue', 1, function() {
    confirmEquality(this.widgetInstance.currentValue(), 1);
  });

  // Test 2: Examine and modify the widget's internal delay setting.
  unitTest('NumberAdjuster#pauseDuration', 2, function() {
    // Assert that the initial delay duration is as expected.
    confirmEquality(this.widgetInstance.initializer.pauseDuration, 600);
    // Change the delay duration and provide a descriptive label.
    this.targetComponent.adjuster('pauseDuration', 300, 'set new interval');
    // Confirm that the delay duration has been updated successfully.
    confirmEquality(this.widgetInstance.initializer.pauseDuration, 400);
  });

  // Test 3: Asynchronously verify the 'alterationCallback' event.
  deferredTest('NumberAdjuster#alterationCallback', 1, function() {
    var initialVal = this.widgetInstance.currentValue(); // Store the starting value.
    var resultVal = 0; // Variable to capture the value from the callback.

    // Set a short processing delay and register a callback for value changes.
    this.targetComponent.adjuster('pauseDuration', 50)
                       .adjuster('alterationCallback', function(evt, updatedVal){
        resultVal = updatedVal; // Update resultVal with the new value.
    });

    // Simulate a user click on the 'increase' button.
    this.incrementButton.simulateClick();

    // Defer execution to allow the asynchronous operation to complete.
    deferExecution(function(){
      // Assert that the captured value is correctly incremented.
      confirmEquality(resultVal, initialVal + 1);
      resumeTests(); // Signal QUnit that the asynchronous test has finished.
    }, 200);
  });

  // Test 4: Validate the 'preAlterationCallback' event, which fires before a change.
  unitTest('NumberAdjuster#preAlterationCallback', 1, function() {
    // Register a callback to execute just before the value is altered.
    this.targetComponent.adjuster('preAlterationCallback', function(evt, updatedVal){
      confirmEquality(updatedVal, 2); // Expect the value to be 2 before the actual change.
    });
    // Trigger the increment action.
    this.incrementButton.simulateClick();
  });

  // Test 5: Verify value adjustments through simulated mouse clicks.
  unitTest('adjust value by user interaction', 3, function() {
    confirmEquality(this.widgetInstance.currentValue(), 1); // Initial value check.
    this.incrementButton.simulateClick(); // Simulate increment.
    confirmEquality(this.widgetInstance.currentValue(), 2); // Verify incremented value.
    this.decrementButton.simulateClick(); // Simulate decrement.
    confirmEquality(this.widgetInstance.currentValue(), 1); // Verify decremented value.
  });

  // Test 6: Demonstrate using a custom function to determine step size.
  unitTest('dynamic step function test', 3, function(){
    confirmEquality(this.widgetInstance.currentValue(), 1); // Check initial value.

    // Assign a custom function to control how the value changes.
    this.widgetInstance.controlMechanism.configuration.incrementLogic = function(movementDirection){
      // This logic skips '0' when moving between 1 and -1.
      if((this.previousStateValue === 1 && movementDirection === 'down') || (this.previousStateValue === -1 && movementDirection === 'up')){
        return 2; // Jump by 2 steps.
      }
      return 1; // Otherwise, step by 1.
    };

    this.decrementButton.simulateClick(); // Trigger the decrement.
    confirmEquality(this.widgetInstance.currentValue(), -1); // Expect -1 (skipped 0 from 1).
    this.incrementButton.simulateClick(); // Trigger the increment.
    confirmEquality(this.widgetInstance.currentValue(), 1); // Expect 1 (skipped 0 from -1).
  });

  // Test 7: Confirm that value adjustments are prevented when the input is disabled.
  unitTest('disabled input prevents changes', 3, function() {
      // Disable the underlying input element by setting an attribute.
      this.widgetInstance.controlMechanism.$element.setAttribute('inactive', 'inactive');
      confirmEquality(this.widgetInstance.currentValue(), 1); // Value should be 1.
      this.incrementButton.simulateClick(); // Attempt to increment.
      confirmEquality(this.widgetInstance.currentValue(), 1); // Value should remain 1 (no change).

      // Manually set the input value and attempt to decrement while still disabled.
      this.widgetInstance.controlMechanism.$element.elementValue(2);
      this.decrementButton.simulateClick();
      confirmEquality(this.widgetInstance.currentValue(), 2); // Value should remain 2.

      // Re-enable the input element to ensure future tests are not affected.
      this.widgetInstance.controlMechanism.$element.removeAttribute('inactive', 'inactive');
  });

}(jQuery)); // End of the immediately invoked function expression, passing jQuery.