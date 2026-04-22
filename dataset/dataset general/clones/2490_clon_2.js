(() => {
  // Main object to encapsulate our testing framework components.
  const SpecEngine = {};

  // This class represents a single, executable test specification.
  SpecEngine.TestItem = function(specLabel, ancestor, specLogic) {
    this.specLabel = specLabel; // A descriptive name for this individual test.
    this.ancestor = ancestor; // Reference to the parent suite container.
    // If there's a parent, add this test item to its collection.
    if (this.ancestor)
      this.ancestor.childSpecs.push(this);
    this.specLogic = specLogic; // The actual function containing the test code.
  }; // End of TestItem constructor.

  // Define methods for the TestItem prototype.
  SpecEngine.TestItem.prototype = {

    /**
     * Executes the specific test case.
     * This involves running parent setup hooks, the test logic, and parent teardown hooks.
     */
    execute: function() {
      // Create an execution environment for the test.
      let execEnv = {
        activeSpec: this
      };

      // Run any setup handlers defined by parent suites.
      if (this.ancestor) {
        this.ancestor.invokeSetupHooks(execEnv);
      }

      // Log the execution of this test item.
      console.info("Executing test: " + this.collectNames().join(" => "));

      // Apply the test's core logic within the execution environment.
      this.specLogic.apply(execEnv);

      // Run any teardown handlers defined by parent suites.
      if (this.ancestor) {
        this.ancestor.invokeTeardownHooks(execEnv);
      }
    }, // End of execute method.

    /**
     * Gathers a hierarchical list of labels from this test item up to its root ancestor.
     * @returns {Array<string>} An ordered array of descriptive labels.
     */
    collectNames: function() {
      let collectedLabels = this.ancestor ? this.ancestor.collectNames() : []; // Recursively get parent labels.
      collectedLabels.push(this.specLabel); // Add this item's label.
      return collectedLabels; // Return the full path of labels.
    } // End of collectNames method.

  }; // End of TestItem prototype.

  // This class organizes multiple test items or other suite containers.
  SpecEngine.SuiteContainer = function(specLabel, ancestor) {
    this.specLabel = specLabel; // The name of this test suite.
    this.ancestor = ancestor; // Link to the containing suite.

    // If a parent suite exists, register this group as its child.
    if (this.ancestor)
      this.ancestor.childSpecs.push(this);

    this.childSpecs = []; // Array to hold nested TestItems or SuiteContainers.
    this.setupHandlers = []; // Functions to run before each test in this suite.
    this.teardownHandlers = []; // Functions to run after each test in this suite.

    /* A previous debugging console log was removed here. */
  }; // End of SuiteContainer constructor.

  // Define methods for the SuiteContainer prototype.
  SpecEngine.SuiteContainer.prototype = {

    /**
     * Initiates the execution of all child test items and nested suites within this container.
     */
    execute: function() {
      // A local reference to the current suite.
      const currentSuite = this;

      // Iterate through all child specifications and execute them.
      this.childSpecs.forEach(function(item) {
        // Each child, whether a test or another suite, has its own execute method.
        item.execute();
      });

      // If this is the top-level suite (no parent), indicate overall success.
      if (!this.ancestor)
        console.info("All tests completed successfully!");
    }, // End of execute method.

    /**
     * Executes all registered setup hooks for this suite, and recursively for parent suites.
     * @param {Object} execEnv - The execution environment context.
     */
    invokeSetupHooks: function(execEnv) {
      // First, invoke setup hooks of the parent suite, if any.
      if (this.ancestor)
        this.ancestor.invokeSetupHooks();

      // Then, run the setup handlers defined directly for this suite.
      this.setupHandlers.forEach(function(hookFn) {
        hookFn.apply(execEnv);
      });
    }, // End of invokeSetupHooks method.

    /**
     * Executes all registered teardown hooks for this suite, and recursively for parent suites.
     * @param {Object} execEnv - The execution environment context.
     */
    invokeTeardownHooks: function(execEnv) {
      // First, invoke teardown hooks of the parent suite, if any.
      if (this.ancestor)
        this.ancestor.invokeTeardownHooks();

      // Then, run the teardown handlers defined directly for this suite.
      this.teardownHandlers.forEach(function(hookFn) {
        hookFn.apply(execEnv);
      });
    }, // End of invokeTeardownHooks method.

    /**
     * Gathers a hierarchical list of labels from this suite container up to its root ancestor.
     * @returns {Array<string>} An ordered array of descriptive labels.
     */
    collectNames: function() {
      let collectedLabels = this.ancestor ? this.ancestor.collectNames() : []; // Recursively get parent labels.
      collectedLabels.push(this.specLabel); // Add this suite's label.
      return collectedLabels; // Return the full path of labels.
    } // End of collectNames method.

  }; // End of SuiteContainer prototype.

  // This class provides assertion methods for test verification.
  SpecEngine.Verifiers = function(testedVal) {
    this.testedVal = testedVal; // The actual value obtained from the test.
  }; // End of Verifiers constructor.

  // Define methods for the Verifiers prototype.
  SpecEngine.Verifiers.prototype = {

    /**
     * Asserts that the actual value is strictly equal to the expected value.
     * @param {*} targetValue - The value that is expected.
     * @throws {Error} If the values are not strictly equal.
     */
    matchesValue: function(targetValue) {
      if (!(this.testedVal === targetValue)) {
        // If the values do not match, throw an error with a detailed message.
        throw new Error("Mismatch: Expected value " + targetValue + " but received " + this.testedVal + ".");
      }
    } // End of matchesValue method.

  }; // End of Verifiers prototype.

  // This class manages the current scope of test definition, allowing nesting of suites and tests.
  SpecEngine.TestContext = function(specLabel) {
    // Initialize the root suite container for this context.
    this._activeSuite = new SpecEngine.SuiteContainer(specLabel);
  }; // End of TestContext constructor.

  // Define methods for the TestContext prototype.
  SpecEngine.TestContext.prototype = {

    /**
     * Defines a new test suite (group) within the current active suite.
     * @param {string} specLabel - A label for the new suite.
     * @param {function} specLogic - A function containing nested suite/test definitions.
     * @returns {SpecEngine.SuiteContainer} The newly created suite container.
     */
    defineSuite: function(specLabel, specLogic) {
      // Create a new suite container, linking it to the current active suite.
      let newSuite = new SpecEngine.SuiteContainer(specLabel, this._activeSuite);
      this._activeSuite = newSuite; // Set the new suite as the active one.

      // If test logic is provided, execute it within the context of the new suite.
      if (specLogic)
        specLogic.apply(newSuite);

      // Restore the parent suite as the active one after the new suite's definition is complete.
      this._activeSuite = newSuite.ancestor;
      return newSuite; // Return the created suite.
    }, // End of defineSuite method.

    /**
     * Defines a single unit test case within the current active suite.
     * @param {string} specLabel - A label for the new unit test.
     * @param {function} specLogic - The function containing the test's assertion logic.
     * @returns {SpecEngine.TestItem} The newly created test item.
     */
    unitTest: function(specLabel, specLogic) {
      // Create and return a new TestItem instance.
      return new SpecEngine.TestItem(specLabel, this._activeSuite, specLogic);
    }, // End of unitTest method.

    /**
     * Creates a Verifiers instance for a given value, allowing assertions to be chained.
     * @param {*} testedVal - The actual value to be tested.
     * @returns {SpecEngine.Verifiers} An instance of the Verifiers class.
     */
    verifyThat: function(testedVal) {
      return new SpecEngine.Verifiers(testedVal);
    }, // End of verifyThat method.

    /**
     * Initiates the execution of all tests and suites defined within this context.
     */
    execute: function() {
      // Start the execution from the root suite container.
      this._activeSuite.execute();
    } // End of execute method.

  }; // End of TestContext prototype.

  // Global function to start defining a new top-level test suite.
  SpecEngine.defineSuite = function(specLabel) {
    // Returns a new TestContext, which represents the entry point for test definitions.
    return new SpecEngine.TestContext(specLabel);
  }; // End of global defineSuite function.

  // Expose the SpecEngine object globally on the window object.
  window.SpecEngine = SpecEngine;

})(); // Immediately invoked function expression ends.