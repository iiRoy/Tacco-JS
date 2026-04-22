(function() {
  // Main test framework namespace for organizing testing components.
  var UnitKit = {};

  // Internal counter for generating unique identifiers for test suites.
  let _nextEntityId = 0;
  const obtainUniqueId = () => `uk-entity-${_nextEntityId++}`;

  // Represents a single test specification, analogous to an 'it' block.
  UnitKit.SpecItem = function(specTitle, enclosingGroup, testExecutionFn) {
    // Extensive input validation for robustness (new fragment).
    if (typeof specTitle !== 'string' || !specTitle.trim()) {
      throw new Error("UnitKit.SpecItem: A valid, non-empty string title is mandatory.");
    }
    if (typeof testExecutionFn !== 'function') {
      throw new Error("UnitKit.SpecItem: A test execution function must be provided.");
    }

    this.specificationTitle = specTitle;
    this.parentSuite = enclosingGroup;
    // Add this spec item to its parent group's collection.
    if (this.parentSuite) {
      this.parentSuite.containedItems.push(this);
    }
    this.testCallback = testExecutionFn;
    this.executionStatus = 'pending'; // New state property for tracking test results.
    this.failureMessage = null; // Stores error details if the test fails.
  };

  UnitKit.SpecItem.prototype = {
    /**
     * Executes the test callback, managing pre/post hooks and error reporting.
     */
    execute: function() {
      const currentExecutionCtx = {
        activeSpec: this
      };

      // Run 'beforeEach' hooks from parent suites.
      if (this.parentSuite) {
        this.parentSuite.triggerPreHooks(currentExecutionCtx);
      }

      const hierarchicalDescription = this.fetchHierarchicalLabel().join(" -> ");
      // Updated logging format using template literals.
      console.log(`[Running] :: ${hierarchicalDescription}`);

      try {
        // Execute the test function, binding 'this' to the execution context.
        this.testCallback.call(currentExecutionCtx);
        this.executionStatus = 'passed';
        console.log(`[Passed]  :: ${hierarchicalDescription}`);
      } catch (error) {
        this.executionStatus = 'failed';
        // Differentiate error message extraction for better reporting.
        this.failureMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Failed]  :: ${hierarchicalDescription}\n    Error: ${this.failureMessage}`);
      } finally {
        // Run 'afterEach' hooks from parent suites, regardless of test outcome.
        if (this.parentSuite) {
          this.parentSuite.triggerPostHooks(currentExecutionCtx);
        }
      }
    },

    /**
     * Constructs the full descriptive path for the spec item, from root to current.
     * @returns {Array<string>} An array of descriptions forming the hierarchy.
     */
    fetchHierarchicalLabel: function() {
      let descriptionFragments = [];
      let currentEntity = this;
      // Traverse up the parent chain to build the full description.
      while (currentEntity) {
        descriptionFragments.unshift(currentEntity.specificationTitle || currentEntity.suiteLabel);
        currentEntity = currentEntity.parentSuite;
      }
      // Filter out any potential undefined/null entries if a root has no explicit label.
      return descriptionFragments.filter(Boolean);
    }
  };

  // Represents a group of test specifications or other groups, analogous to a 'describe' block.
  UnitKit.SpecSuite = function(suiteLabel, enclosingSuite) {
    this.suiteLabel = suiteLabel;
    this.uniqueSuiteId = obtainUniqueId(); // Assign a unique ID (new fragment).
    this.parentSuite = enclosingSuite;
    if (this.parentSuite) {
      this.parentSuite.containedItems.push(this);
    }
    this.containedItems = []; // Can hold instances of SpecItem or other SpecSuite.
    this.beforeEachHooks = []; // Stores functions to run before each child spec.
    this.afterEachHooks = []; // Stores functions to run after each child spec.
    // Original console.log removed as it's typically for debugging.
  };

  UnitKit.SpecSuite.prototype = {
    /**
     * Executes all contained spec items and sub-suites recursively.
     */
    execute: function() {
      // Added pre-execution logging for the suite (new fragment).
      console.log(`\n--- Initiating Suite Execution: ${this.fetchHierarchicalLabel().join(' > ')} ---`);

      // Iterating over contained items using native forEach (replaces $.each).
      this.containedItems.forEach(item => {
        item.execute();
      });

      // Provide a summary for the root suite upon completion (updated message).
      if (!this.parentSuite) {
        const finalResults = this.aggregateResults(); // New helper for result collection.
        console.log(`\n--- Overall Test Run Summary ---`);
        console.log(`Total Specifications: ${finalResults.total}, Passed: ${finalResults.passed}, Failed: ${finalResults.failed}`);
        if (finalResults.failed > 0) {
          console.error("Warning: Some tests did not pass!");
        } else {
          console.log("All specifications passed successfully!");
        }
      }
    },

    /**
     * Triggers 'beforeEach' hooks, propagating up the parent chain.
     * @param {Object} runtimeContext - The context object for hook execution.
     */
    triggerPreHooks: function(runtimeContext) {
      // Recursively call parent's hooks first (ternary operator for conciseness).
      this.parentSuite ? this.parentSuite.triggerPreHooks(runtimeContext) : null;

      // Execute hooks registered for this specific suite.
      if (this.beforeEachHooks.length > 0) { // Guard clause to avoid unnecessary iteration.
        this.beforeEachHooks.forEach(hookFn => {
          hookFn.call(runtimeContext);
        });
      }
    },

    /**
     * Triggers 'afterEach' hooks, propagating up the parent chain.
     * @param {Object} runtimeContext - The context object for hook execution.
     */
    triggerPostHooks: function(runtimeContext) {
      this.parentSuite ? this.parentSuite.triggerPostHooks(runtimeContext) : null;

      if (this.afterEachHooks.length > 0) {
        this.afterEachHooks.forEach(hookFn => {
          hookFn.call(runtimeContext);
        });
      }
    },

    /**
     * Constructs the full descriptive path for the suite, from root to current.
     * @returns {Array<string>} An array of descriptions forming the hierarchy.
     */
    fetchHierarchicalLabel: function() {
      let descriptionFragments = [];
      let currentEntity = this;
      while (currentEntity) {
        descriptionFragments.unshift(currentEntity.suiteLabel);
        currentEntity = currentEntity.parentSuite;
      }
      return descriptionFragments.filter(Boolean);
    },

    /**
     * Recursively collects and aggregates results from all contained items (new fragment).
     * @returns {Object} An object containing total, passed, and failed counts.
     */
    aggregateResults: function() {
      let totalCount = 0;
      let passedCount = 0;
      let failedCount = 0;

      this.containedItems.forEach(item => {
        if (item instanceof UnitKit.SpecItem) {
          totalCount++;
          if (item.executionStatus === 'passed') {
            passedCount++;
          } else if (item.executionStatus === 'failed') {
            failedCount++;
          }
        } else if (item instanceof UnitKit.SpecSuite) {
          const subSuiteResults = item.aggregateResults();
          totalCount += subSuiteResults.total;
          passedCount += subSuiteResults.passed;
          failedCount += subSuiteResults.failed;
        }
      });
      return {
        total: totalCount,
        passed: passedCount,
        failed: failedCount
      };
    }
  };

  // Provides assertion capabilities for test values, analogous to 'expect'.
  UnitKit.AssertionHandler = function(actualValue) {
    this.targetValue = actualValue;
  };

  UnitKit.AssertionHandler.prototype = {
    /**
     * Asserts that the target value is loosely equal to the expected value.
     * @param {*} expectedValue - The value to compare against.
     */
    toRoughlyEqual: function(expectedValue) {
      if (!(this.targetValue == expectedValue)) {
        // Rewritten error message using template literals.
        throw new Error(`Assertion Failed: Expected '${expectedValue}' (loose equality) but received '${this.targetValue}'.`);
      }
    },

    /**
     * Asserts that the target value is strictly equal to the expected value (new matcher).
     * @param {*} expectedValue - The value to compare against using `===`.
     */
    toPreciselyEqual: function(expectedValue) {
      if (!(this.targetValue === expectedValue)) {
        throw new Error(`Assertion Failed: Expected '${expectedValue}' (strict equality) but received '${this.targetValue}'.`);
      }
    },

    /**
     * Asserts that the target value is not undefined (new matcher).
     */
    toBePresent: function() {
      if (this.targetValue === undefined) {
        throw new Error(`Assertion Failed: Expected value to be defined but it was undefined.`);
      }
    },

    /**
     * Asserts that the target value is truthy (new matcher).
     */
    toBeTruthful: function() {
      if (!this.targetValue) {
        throw new Error(`Assertion Failed: Expected value to be truthy but it was '${this.targetValue}'.`);
      }
    },

    /**
     * Asserts that the target value is falsy (new matcher).
     */
    toBeUntruthful: function() {
      if (this.targetValue) {
        throw new Error(`Assertion Failed: Expected value to be falsy but it was '${this.targetValue}'.`);
      }
    }
  };

  // Manages the hierarchical context for defining tests and suites.
  UnitKit.TestContextBuilder = function(rootDescription) {
    // The top-level suite for the entire test run.
    this._activeSuite = new UnitKit.SpecSuite(rootDescription, null);
    this.topLevelSuite = this._activeSuite; // Keep a permanent reference to the root.
  };

  UnitKit.TestContextBuilder.prototype = {
    /**
     * Defines a new nested test suite (describe block).
     * @param {string} suiteDescription - The description for the new suite.
     * @param {Function} setupCallback - A function containing nested describe/it calls.
     * @returns {UnitKit.SpecSuite} The newly created suite.
     */
    defineSuite: function(suiteDescription, setupCallback) {
      const newNestedSuite = new UnitKit.SpecSuite(suiteDescription, this._activeSuite);
      this._activeSuite = newNestedSuite; // Descend into the new suite context.

      // Execute the callback to populate the new suite with specs/sub-suites.
      if (typeof setupCallback === 'function') {
        setupCallback.call(newNestedSuite); // Execute in the context of the new suite.
      } else {
        // Warning for missing setup function (new fragment).
        console.warn(`UnitKit.defineSuite: Suite '${suiteDescription}' defined without a setup function.`);
      }

      // Ascend back to the parent suite context.
      // Guard for ensuring _activeSuite doesn't become null if it's the root.
      this._activeSuite = newNestedSuite.parentSuite || this.topLevelSuite;
      return newNestedSuite;
    },

    /**
     * Defines a new test specification (it block).
     * @param {string} specDescription - The description for the test.
     * @param {Function} specFunction - The function containing the test logic.
     * @returns {UnitKit.SpecItem} The newly created spec item.
     */
    defineSpec: function(specDescription, specFunction) {
      return new UnitKit.SpecItem(specDescription, this._activeSuite, specFunction);
    },

    /**
     * Creates a new assertion handler for a given value.
     * @param {*} valueToAssert - The value to be asserted.
     * @returns {UnitKit.AssertionHandler} An assertion handler instance.
     */
    assert: function(valueToAssert) {
      return new UnitKit.AssertionHandler(valueToAssert);
    },

    /**
     * Registers a function to run before each spec in the current suite (new fragment).
     * @param {Function} hookCallback - The function to execute as a hook.
     */
    beforeEachSpec: function(hookCallback) {
      if (typeof hookCallback === 'function') {
        this._activeSuite.beforeEachHooks.push(hookCallback);
      } else {
        console.warn("UnitKit.beforeEachSpec: Hook must be a valid function.");
      }
    },

    /**
     * Registers a function to run after each spec in the current suite (new fragment).
     * @param {Function} hookCallback - The function to execute as a hook.
     */
    afterEachSpec: function(hookCallback) {
      if (typeof hookCallback === 'function') {
        this._activeSuite.afterEachHooks.push(hookCallback);
      } else {
        console.warn("UnitKit.afterEachSpec: Hook must be a valid function.");
      }
    },

    /**
     * Initiates the entire test run from the top-level suite.
     */
    startRun: function() {
      this.topLevelSuite.execute();
    }
  };

  // Global entry point to start defining a new test suite structure.
  UnitKit.createSuite = function(initialRootDescription) {
    return new UnitKit.TestContextBuilder(initialRootDescription);
  };

  // Expose the UnitKit namespace to the global window object.
  window.UnitKit = UnitKit;
})();