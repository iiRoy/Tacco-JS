(function(jq) {

  // This QUnit module is dedicated to testing the functionality of the NumericInput widget.
  // It ensures that various operations, configurations, and event handling work as expected.
  QUnit.module('ValueAdjustmentControl', {
    // This function runs before each test case within this module.
    // It sets up the necessary DOM elements and widget instances for testing.
    beforeEachTest: function() {
      // Locate the primary component wrapper element using its data attribute.
      this.targetComponent = jq('[data-component="value-input-widget"]');
      // Identify the button responsible for increasing the value.
      this.incrementActionBtn = jq("[data-action='increase-value']", this.targetComponent);
      // Identify the button responsible for decreasing the value.
      this.decrementActionBtn = jq("[data-action='decrease-value']", this.targetComponent);
      // Retrieve the JavaScript instance of the widget attached to the component.
      this.controlWidgetInstance = this.targetComponent.data('valueModifier');

      // Define a standard initial value to use across multiple tests.
      this.standardInitialValue = 1;

      // Log a warning if the widget instance is not correctly initialized,
      // which might indicate a setup issue.
      if (!this.controlWidgetInstance) {
        console.warn('ValueAdjustmentControl widget instance was not found during test setup.');
      }
    },
    // This function runs after each test case within this module.
    // It's used to reset the widget's state to prevent test interference.
    afterEachTest: function() {
      // Reset event handlers and configuration properties to default states.
      // This ensures previous tests don't leave lingering effects.
      if (this.targetComponent && typeof this.targetComponent.valueModifier === 'function') {
        this.targetComponent
          .valueModifier('configureDelay', 500) // Reset delay to a common value.
          .valueModifier('onValueUpdated', null) // Clear any custom 'updated' callbacks.
          .valueModifier('onValuePreChange', null); // Clear any custom 'pre-change' callbacks.
      }

      // If the widget's internal input element exists, reset its value and enable it.
      if (this.controlWidgetInstance && this.controlWidgetInstance.boundInput) {
        this.controlWidgetInstance.boundInput.val(this.standardInitialValue);
        this.controlWidgetInstance.boundInput.prop('disabled', false); // Ensure input is re-enabled.
      }
    }
  });

  // Test case: Verify that the widget reports its current value correctly.
  QUnit.test('ValueAdjustmentControl: Retrieve Current Value', 1, function(assert) {
    const expectedCurrentValue = this.standardInitialValue;
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), expectedCurrentValue,
      `The widget's initial value should be ${expectedCurrentValue}.`);
  });

  // Test case: Confirm that the widget's delay setting can be configured and retrieved.
  QUnit.test('ValueAdjustmentControl: Delay Mechanism Configuration', 2, function(assert) {
    const defaultOperationDelay = 600;
    assert.strictEqual(this.controlWidgetInstance.constructor.settings.actionDelay, defaultOperationDelay,
      `The default operation delay should be ${defaultOperationDelay} milliseconds.`);

    const customShortDelay = 300;
    // Apply a new delay setting to the widget.
    this.targetComponent.valueModifier('configureDelay', customShortDelay, 'Setting a faster response delay.');
    // The widget's internal logic might add a fixed offset to the configured delay.
    const anticipatedFinalDelay = customShortDelay + 100; // Original logic adds 100.
    assert.strictEqual(this.controlWidgetInstance.constructor.settings.actionDelay, anticipatedFinalDelay,
      `After configuration, the adjusted delay should be ${anticipatedFinalDelay} milliseconds.`);
  });

  // Asynchronous test case: Validate the 'value updated' event, which fires after a value change.
  QUnit.asyncTest('ValueAdjustmentControl: Value Update Event Firing', 1, function(assert) {
    let initialReading = this.controlWidgetInstance.fetchCurrentValue();
    let capturedNewValue = 0;
    const eventResponseDelay = 50;

    // Attach a callback to the 'onValueUpdated' event.
    this.targetComponent.valueModifier('configureDelay', eventResponseDelay)
      .valueModifier('onValueUpdated', (eventObject, updatedNumber) => {
        capturedNewValue = updatedNumber;
      });

    // Simulate a click on the increment button to trigger a value change.
    this.incrementActionBtn.trigger('click');

    // Allow sufficient time for the asynchronous operation and event propagation.
    const verificationTimeout = 200;
    setTimeout(() => {
      const expectedIncrementedValue = initialReading + 1;
      assert.strictEqual(capturedNewValue, expectedIncrementedValue,
        `The value captured by the 'onValueUpdated' event (${capturedNewValue}) should be one greater than the initial value (${initialReading}).`);
      QUnit.start(); // Crucial for completing asynchronous tests in QUnit.
    }, verificationTimeout);
  });

  // Test case: Check the 'value pre-change' event, which fires before the value is finalized.
  QUnit.test('ValueAdjustmentControl: Pre-Change Event Notification', 1, function(assert) {
    const expectedProspectiveValue = this.standardInitialValue + 1;

    // Register a handler for the 'onValuePreChange' event.
    this.targetComponent.valueModifier('onValuePreChange', (eventData, potentialNewVal) => {
      assert.strictEqual(potentialNewVal, expectedProspectiveValue,
        `The 'onValuePreChange' event should report the upcoming value as ${expectedProspectiveValue}.`);
    });
    // Trigger an increment action to fire the event.
    this.incrementActionBtn.click();
  });

  // Test case: Confirm that clicking the increment/decrement buttons correctly modifies the value.
  QUnit.test('ValueAdjustmentControl: Direct Click Interactions', 3, function(assert) {
    const currentInitialVal = this.standardInitialValue;
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), currentInitialVal,
      `Initial value should be ${currentInitialVal}.`);

    this.incrementActionBtn.click();
    const valAfterUpClick = currentInitialVal + 1;
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), valAfterUpClick,
      `Value should increment to ${valAfterUpClick} after clicking the 'increase' button.`);

    this.decrementActionBtn.click();
    const valAfterDownClick = currentInitialVal; // Should revert to initial
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), valAfterDownClick,
      `Value should decrement back to ${valAfterDownClick} after clicking the 'decrease' button.`);
  });

  // Test case: Evaluate the widget's behavior when a custom step function is provided.
  QUnit.test('ValueAdjustmentControl: Custom Stepping Logic', 3, function(assert) {
    const initialTestVal = this.standardInitialValue;
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), initialTestVal,
      `Initial value should be ${initialTestVal}.`);

    // Assign a custom function to determine the step amount.
    this.controlWidgetInstance.options.stepCalculationFunction = (actionType) => {
      const currentObservedValue = this.controlWidgetInstance.fetchCurrentValue();
      const customJumpAmount = 2; // Define a specific jump size.

      // This logic provides a custom step (2) when transitioning between 1 and -1,
      // effectively skipping 0.
      if ((currentObservedValue === 1 && actionType === 'down') ||
        (currentObservedValue === -1 && actionType === 'up')) {
        return customJumpAmount;
      }
      return 1; // Default step for all other movements.
    };

    this.decrementActionBtn.click();
    const expectedValueAfterCustomDown = -1; // 1 -> -1 due to custom step.
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), expectedValueAfterCustomDown,
      `Value should become ${expectedValueAfterCustomDown} following custom 'down' step logic.`);

    this.incrementActionBtn.click();
    const expectedValueAfterCustomUp = 1; // -1 -> 1 due to custom step.
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), expectedValueAfterCustomUp,
      `Value should return to ${expectedValueAfterCustomUp} following custom 'up' step logic.`);
  });

  // Test case: Confirm that value changes are prevented when the underlying input is disabled.
  QUnit.test('ValueAdjustmentControl: Disabled Input Prevents Spin', 3, function(assert) {
    const disableProperty = 'disabled';
    const initialInputVal = this.standardInitialValue;

    // Programmatically disable the widget's bound input element.
    this.controlWidgetInstance.boundInput.prop(disableProperty, true);

    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), initialInputVal,
      `Value should start at ${initialInputVal}.`);

    this.incrementActionBtn.click();
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), initialInputVal,
      `Value must remain ${initialInputVal} even after an 'increase' click on a disabled input.`);

    // Manually set a new value while the input is disabled (should still not be affected by clicks).
    const manuallySetDisabledVal = 2;
    this.controlWidgetInstance.boundInput.val(manuallySetDisabledVal);
    this.decrementActionBtn.click();
    assert.strictEqual(this.controlWidgetInstance.fetchCurrentValue(), manuallySetDisabledVal,
      `Value must remain ${manuallySetDisabledVal} after a 'decrease' click on a disabled input, even if manually overridden.`);

    // Re-enable the input to ensure proper cleanup for subsequent tests.
    this.controlWidgetInstance.boundInput.prop(disableProperty, false);
  });

}(jQuery));