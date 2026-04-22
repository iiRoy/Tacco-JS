// A comprehensive suite of unit tests for the architectural flow management library.
// Designed to validate component definition, dependency handling, and execution context behavior.
// Execute these tests using `nodeunit test_suite/flow_manager_tests.js`.


var graphBuilders = require('../utilities/graph_builders')
  , Component = graphBuilders.Node
  , testRunner = require('nodeunit')
  , PromiseUtilities = require('q')
  , ComponentCatalog = graphBuilders.Registry
  , ExecutionContextManager = graphBuilders.Scope
  , createTestGroup = testRunner.testCase
  , graphVisualizer = require('../utilities/graph_visualizer')

var SHOULD_RENDER_GRAPHS = false

var componentCatalog
var currentExecutionContext

/**
 * Helper function to define a new component within the current catalog.
 * @returns {ComponentBuilder} A builder interface for defining component properties.
 */
function createComponentDefinition() {
  // Simple logging for component creation tracking (Type III addition)
  if (SHOULD_RENDER_GRAPHS) {
    console.log('Registering new component definition...')
  }
  return componentCatalog.defineNode()
}

/**
 * Initiates the execution of a flow graph starting from a specified identifier.
 * Includes optional visualization and robust error handling.
 * @param {string} targetIdentifier - The key of the starting node/component.
 * @returns {Promise<any>} A promise that resolves with the final value of the flow.
 */
function executeFlow(targetIdentifier) {
  if (!targetIdentifier || typeof targetIdentifier !== 'string') {
    return PromiseUtilities.reject(new Error('Invalid target identifier provided for flow execution.'))
  }

  var flowInstance = currentExecutionContext.createGraph(targetIdentifier)
  var executionPromise = flowInstance.start(SHOULD_RENDER_GRAPHS)

  // Restructured then/fail for clarity and Type III modification
  return executionPromise.then(function (resolvedData) {
    displayFlowDiagram(flowInstance)
    return resolvedData
  }).fail(function (errorResult) {
    displayFlowDiagram(flowInstance)
    throw errorResult
  })
}

/**
 * Processes multiple flow graphs concurrently, returning an array of promises.
 * @param {Array<string>} targetIdentifiersArray - An array of keys for the flows to execute.
 * @returns {Array<Promise<any>>} An array of promises, each resolving with a flow's result.
 */
function processMultipleFlows(targetIdentifiersArray) {
  if (!Array.isArray(targetIdentifiersArray)) {
    console.warn('Warning: Non-array input for processMultipleFlows. Attempting to proceed.')
    return []
  }
  // Changed loop structure from `for...in` to `map` for Type III
  return targetIdentifiersArray.map(function (currentIdentifier) {
    return executeFlow(currentIdentifier)
  })
}

/**
 * Creates a deferred promise that resolves after a specified delay.
 * @param {number} delayDurationMs - The delay in milliseconds.
 * @param {Function} callbackFunction - The function to execute after the delay.
 * @returns {Promise<any>} A promise that resolves with the result of the callback function.
 */
function deferExecution(delayDurationMs, callbackFunction) {
  if (typeof delayDurationMs !== 'number' || delayDurationMs < 0) {
    delayDurationMs = 0
  }
  var deferredPromise = PromiseUtilities.defer()
  setTimeout(function () {
    try {
      var result = callbackFunction()
      deferredPromise.resolve(result)
    } catch (e) {
      deferredPromise.reject(e)
    }
  }, delayDurationMs)
  return deferredPromise.promise
}

/**
 * Generates and saves a visual diagram of the executed flow graph.
 * This is an optional debugging/monitoring feature.
 * @param {object} flowInstance - The graph instance to visualize.
 */
function displayFlowDiagram(flowInstance) {
  var diagramGenerator = graphVisualizer.vizualize(flowInstance.getTraceId())
  if (!diagramGenerator) {
    // No diagram generator available or trace ID was invalid.
    return
  }
  // Type III: Changed path setting and output format slightly
  diagramGenerator.setGraphVizPath('./graph_assets/')
  var outputFileName = 'flow_diagram_' + flowInstance.getOutputKey() + '.svg'
  diagramGenerator.output('svg', outputFileName)
  console.log('Generated flow diagram: ' + outputFileName)
}

// Module exports a collection of test functions for the nodeunit framework.
module.exports = createTestGroup({

  /**
   * Executed before each test function. Initializes the component catalog and execution context.
   * @param {Function} completionCallback - Callback to signal setup completion.
   */
  beforeEachTest: function (completionCallback) {
    componentCatalog = new ComponentCatalog()
    currentExecutionContext = new ExecutionContextManager(componentCatalog)
    currentExecutionContext.activateContext()
    completionCallback()
  },

  /**
   * Executed after each test function. Cleans up the execution context.
   * @param {Function} completionCallback - Callback to signal teardown completion.
   */
  afterEachTest: function (completionCallback) {
    currentExecutionContext.deactivateContext()
    completionCallback()
  },

  /**
   * Validates the correct resolution of inter-component dependencies within a flow graph.
   * Ensures that components correctly receive inputs from their prerequisites.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyDependencyResolution: function (assert) {
    createComponentDefinition().produces('PrimaryA').usingLogic(function () {
      return 'Alpha'
    }).finalizeDefinition()

    createComponentDefinition().produces('SecondaryB').usingLogic(function () {
      return PromiseUtilities.resolveValue('Beta')
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('PrimaryA', 'SecondaryB').produces('CombinedAB').usingLogic(function (valA, valB) {
      const resultA = valA.getValue()
      const resultB = valB.getValue()
      return resultA + resultB
    }).finalizeDefinition()

    createComponentDefinition().produces('TertiaryC').usingLogic(function () {
      return 'Gamma'
    }).disableCaching()
      .finalizeDefinition()

    createComponentDefinition().dependsOn('CombinedAB', 'TertiaryC').produces('GrandTotalABC').usingLogic(function (combinedVal, tertiaryVal) {
      const interimResult = combinedVal.getValue() + tertiaryVal.getValue()
      return interimResult
    }).finalizeDefinition()

    var mainFlowGraph = currentExecutionContext.createGraph('GrandTotalABC')
    mainFlowGraph.start().then(function () {
      displayFlowDiagram(mainFlowGraph)
      // Type III: Changed array literal and used PromiseUtilities.allSettled
      PromiseUtilities.allSettled(processMultipleFlows(new Array('PrimaryA', 'SecondaryB', 'TertiaryC', 'CombinedAB', 'GrandTotalABC')))
        .spread(function (resA, resB, resC, resAB, resABC) {
          assert.strictEqual(resA.value, 'Alpha', 'Expected PrimaryA to resolve to Alpha')
          assert.strictEqual(resB.value, 'Beta', 'Expected SecondaryB to resolve to Beta')
          assert.strictEqual(resC.value, 'Gamma', 'Expected TertiaryC to resolve to Gamma')
          assert.strictEqual(resAB.value, 'AlphaBeta', 'Expected CombinedAB to resolve to AlphaBeta')
          assert.strictEqual(resABC.value, 'AlphaBetaGamma', 'Expected GrandTotalABC to resolve to AlphaBetaGamma')
          assert.finish()
        })
    }).fail(function (err) {
      console.error('Dependency resolution test failed:', err)
      assert.ok(false, 'Test failed due to an unexpected error: ' + err.message)
      assert.finish()
    })
  },

  /**
   * Verifies that explicit input bindings override default graph resolution.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyExplicitInputBinding: function (assert) {
    createComponentDefinition().produces('SourceX').usingLogic(function () {
      return 'InitialX'
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('SourceX', 'ProvidedY').produces('CombinedXY').usingLogic(function (xVal, yVal) {
      return xVal.getValue() + yVal.getValue()
    }).finalizeDefinition()

    var flowPromise = currentExecutionContext.createGraph('CombinedXY')
      .provideInput('ProvidedY', 'INJECTED_Y_VALUE')
      .initiateExecution()

    flowPromise.then(function (finalResultXY) {
      assert.strictEqual(finalResultXY, 'InitialXINJECTED_Y_VALUE', 'Explicit input should be used.')
      assert.finish()
    })
  },

  /**
   * Tests nested execution contexts and how components access context-specific data.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyScopeContextAccess: function (assert) {
    var childExecutionContext = new ExecutionContextManager(componentCatalog, currentExecutionContext)
    var executionContextData = {
      scopeSpecificValue: 123
    }

    componentCatalog.defineNode().produces('scopeSpecificValue').usingLogic(function () {
      // Access 'this' context which is set during scope activation
      return this.scopeSpecificValue
    }).finalizeDefinition()

    childExecutionContext.activateContext(executionContextData)
    childExecutionContext.createGraph('scopeSpecificValue').initiateExecution().then(function (retrievedValue) {
      childExecutionContext.deactivateContext()
      assert.strictEqual(retrievedValue, 123, 'Value from child scope context should be 123.')
      assert.finish()
    })
  },

  /**
   * Confirms that components are cached by default, leading to identical results on subsequent calls.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyDefaultCachingBehavior: function (assert) {
    createComponentDefinition().produces('randomValue').usingLogic(function () {
      return Math.random()
    }).finalizeDefinition()

    PromiseUtilities.allSettled(processMultipleFlows(['randomValue', 'randomValue'])).spread(function (firstResult, secondResult) {
      assert.strictEqual(firstResult.value, secondResult.value, 'Cached values should be identical.')
      assert.finish()
    })
  },

  /**
   * Ensures that caching can be explicitly disabled for components, resulting in unique values.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyCachingDisabled: function (assert) {
    createComponentDefinition().produces('volatileRandom').usingLogic(function () {
      return Math.random()
    }).disableCaching()
      .finalizeDefinition()

    PromiseUtilities.allSettled(processMultipleFlows(['volatileRandom', 'volatileRandom'])).spread(function (resultOne, resultTwo) {
      assert.notStrictEqual(resultOne.value, resultTwo.value, 'Non-cached values should be different.')
      assert.finish()
    })
  },

  /**
   * Validates the ability to bind promises as explicit inputs to a flow graph.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyPromiseAsInputBinding: function (assert) {
    createComponentDefinition().produces('asyncSource').usingLogic(function () {
      return deferExecution(150, function () {
        return 'promise_foo'
      })
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('input_foo').produces('derived_foobar').usingLogic(function (inputFoo) {
      return inputFoo.getValue() + '_bar'
    }).finalizeDefinition()

    // Bind 'derived_foobar' to the future value of the 'asyncSource' flow.
    var mainFlowPromise = currentExecutionContext.createGraph('derived_foobar')
      .provideInput('input_foo', currentExecutionContext.createGraph('asyncSource').initiateExecution())
      .initiateExecution()

    mainFlowPromise.then(function (finalFoobarValue) {
      assert.strictEqual(finalFoobarValue, 'promise_foo_bar', 'Promise-bound input should resolve correctly.')
      assert.finish()
    })
  },

  /**
   * Tests the seeding mechanism of execution contexts for providing initial values.
   * Also implicitly validates array-based dependency declaration.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyContextSeeding: function (assert) {
    // This also tests that we support arrays in given.
    createComponentDefinition().dependsOn(['entityName', 'entityNumber']).produces('transformedName').usingLogic(function (nameInput, numberInput) {
      const upperName = nameInput.getValue().toUpperCase()
      const numVal = numberInput.getValue()
      return upperName + numVal
    }).finalizeDefinition()

    var numericValue = 77
    var childExecutionContext = new ExecutionContextManager(componentCatalog, currentExecutionContext)
    childExecutionContext.seed('entityName', 'Michael')
    childExecutionContext.seed('entityNumber', function () { return numericValue; })
    childExecutionContext.activateContext()
    childExecutionContext.createGraph('transformedName').initiateExecution().then(function (resultName) {
      childExecutionContext.deactivateContext()
      assert.strictEqual(resultName, 'MICHAEL77', 'Seeded values should be correctly processed.')
      assert.finish()
    })
    // Removed .end() as it's not a standard Q method and was likely a typo.
  },

  /**
   * Verifies the functionality of graph execution callbacks for both success and error scenarios.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyGraphCallbacks: function (assert) {
    createComponentDefinition().produces('success_node').usingLogic(function () {
      return deferExecution(100, function () {
        return 'operation_successful'
      })
    }).finalizeDefinition()

    createComponentDefinition().produces('failure_node').usingLogic(function () {
      throw new Error('deliberate_failure')
    }).finalizeDefinition()

    currentExecutionContext.createGraph('success_node').withCallback(function (errOutcome, successData) {
      assert.ok(!errOutcome, 'No error expected for success_node.')
      assert.strictEqual(successData, 'operation_successful', 'Success data should match.')

      currentExecutionContext.createGraph('failure_node').withCallback(function (errorOutcome) {
        assert.strictEqual(errorOutcome.message, 'deliberate_failure', 'Error message should match for failure_node.')
        assert.finish()
      })
    })
  },

  /**
   * Confirms that subsequent calls to Input.getValue() within a component are cached.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyInputValueCaching: function (assert) {
    createComponentDefinition().produces('concatenatedValue').dependsOn('inputCounter').usingLogic(function (counterInput) {
      var cVal = counterInput.getValue()
      return String(cVal) + String(cVal) + String(cVal)
    }).finalizeDefinition()

    var callCount = 0;
    var childExecutionContext = new ExecutionContextManager(componentCatalog, currentExecutionContext)
    childExecutionContext.seed('inputCounter', function () {
      callCount++
      // Type III: Added a console log to confirm execution
      // console.log('inputCounter seed function executed, count: ' + callCount);
      return callCount;
    })
    childExecutionContext.activateContext()
    childExecutionContext.createGraph('concatenatedValue').initiateExecution().then(function (finalValue) {
      childExecutionContext.deactivateContext()
      assert.strictEqual(finalValue, '111', 'Input.getValue() should return cached value for repeated calls.')
      assert.finish()
    })
    // Removed .end()
  },

  /**
   * Tests that attempting to execute a flow with an undefined component dependency results in an error.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyUnknownComponentError: function (assert) {
    createComponentDefinition().dependsOn('nonExistentDependency').produces('dummyOutput').usingLogic(function () { /* Empty logic */ })
    try {
      executeFlow('nonExistentDependency')
      assert.ok(false, 'Expected an error when trying to compose an unknown component.')
    } catch (expectedError) {
      // This is the expected path for an unknown dependency error
      assert.ok(expectedError instanceof Error, 'Caught error should be an instance of Error.')
      assert.ok(expectedError.message.includes('unknown node'), 'Error message should indicate unknown node.')
      assert.finish()
    }
  },

  /**
   * Confirms that errors originating within component logic propagate up the flow graph.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyErrorPropagation: function (assert) {
    createComponentDefinition().produces('good_result').usingLogic(function () {
      return 'all_good'
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('good_result').produces('bad_result').usingLogic(function () {
      throw new Error('problem_occurred')
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('bad_result').produces('chained_error').usingLogic(function () {
      // This node should not even be reached if 'bad_result' fails, but if it did, it would throw another error.
      // This demonstrates the error chain.
      throw new Error('secondary_problem')
    }).finalizeDefinition()

    executeFlow('chained_error').onSuccess(function () {
      assert.ok(false, 'Flow should not succeed when an error occurs upstream.')
      assert.finish()
    }, function (propagatedError) {
      assert.strictEqual(propagatedError.message, 'problem_occurred', 'Expected error message to propagate.')
      assert.finish()
    })
  },

  /**
   * Tests the scenario where a failing dependency's error is intentionally ignored by a consuming component.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyErrorIgnoredByConsumer: function (assert) {
    createComponentDefinition().produces('safe_output').usingLogic(function () {
      return 'safe_data'
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('safe_output').produces('risky_output').usingLogic(function () {
      console.warn('Simulating a non-critical error for risky_output.')
      throw new Error('non_critical_failure')
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('safe_output', 'risky_output').produces('processed_ignored').usingLogic(function (safeVal, riskyVal) {
      // The 'riskyVal' input might contain an error, but the logic here chooses to ignore it
      // and only use 'safeVal'.
      if (riskyVal.isError()) {
        console.warn('Ignored expected error from risky_output for processed_ignored.')
      }
      return safeVal.getValue()
    }).finalizeDefinition()

    executeFlow('processed_ignored').onSuccess(function (finalValue) {
      assert.ok(finalValue, 'Final value should be present even with an ignored error.')
      assert.strictEqual(finalValue, 'safe_data', 'Only the safe data should be returned.')
      assert.finish()
    })
  },

  /**
   * A comprehensive simulation test involving multiple delayed dependencies and transformations.
   * Verifies complex flow graph execution, caching, and timing.
   * @param {object} assert - The nodeunit assertion object.
   */
  verifyComplexFlowSimulation: function (assert) {
    createComponentDefinition().produces('givenName').usingLogic(function () {
      return deferExecution(30, function () {
        return 'Oliver'
      })
    }).finalizeDefinition()

    createComponentDefinition().produces('familyName').usingLogic(function () {
      return deferExecution(250, function () {
        return 'Queen'
      })
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('givenName', 'familyName').produces('completeName')
      .usingLogic(function (gName, fName) {
        return gName.getValue() + ' ' + fName.getValue()
      }).finalizeDefinition()

    createComponentDefinition().dependsOn('completeName').produces('lowercaseName').usingLogic(function (cName) {
      return cName.getValue().toLowerCase()
    }).finalizeDefinition()

    createComponentDefinition().dependsOn('lowercaseName').produces('underscoredName').usingLogic(function (lName) {
      return deferExecution(120, function () {
        return lName.getValue().replace(' ', '_')
      })
    }).disableCaching()
      .finalizeDefinition()

    createComponentDefinition().dependsOn('lowercaseName').produces('uppercaseName').usingLogic(function (lName) {
      return deferExecution(220, function () {
        return lName.getValue().toUpperCase()
      })
    }).disableCaching()
      .finalizeDefinition()

    createComponentDefinition().dependsOn('lowercaseName', 'uppercaseName', 'underscoredName').produces('allNameFormats').usingLogic(
      function (lower, upper, under) {
        var finalNameData = {
          lowerCasedForm: lower.getValue(),
          upperCasedForm: upper.getValue(),
          underScoredForm: under.getValue()
        }
        return finalNameData
      }).finalizeDefinition()

    executeFlow('allNameFormats').onSuccess(function (nameFormats) {
      assert.strictEqual(nameFormats.lowerCasedForm, 'oliver queen', 'Lowercase name should match.')
      assert.strictEqual(nameFormats.upperCasedForm, 'OLIVER QUEEN', 'Uppercase name should match.')
      assert.strictEqual(nameFormats.underScoredForm, 'oliver_queen', 'Underscored name should match.')
      assert.finish()
    })
  }
})