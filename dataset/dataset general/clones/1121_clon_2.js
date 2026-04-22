// Test suite for flow orchestration components.
// Utilizes Node.js testing framework for assertions.


var orchestrators = require('../lib/assemblers')
  , Element = orchestrators.Element
  , unitTester = require('nodeunit')
  , AsyncHelper = require('q')
  , Catalog = orchestrators.Catalog
  , Context = orchestrators.Context
  , testSuite = unitTester.testCase
  , flowMonitor = require('../lib/flow_monitor');


var DISPLAY_DIAGRAMS = false; // Flag to enable visualization of process diagrams.


var componentCatalog;
var currentContext;


// Helper function to define a new component within the catalog.
function defineElement() {
  return componentCatalog.defineElement();
}


// Initiates and executes a data flow graph.
function executeAssembly(identifier) {
  var processFlow = currentContext.establishFlow(identifier);
  return processFlow.beginExecution(DISPLAY_DIAGRAMS).then(function (resultVal) {
    renderDiagram(processFlow); // Show the graph if enabled.
    return resultVal;
  }, function (issue) {
    renderDiagram(processFlow); // Show graph even on error.
    throw issue;
  });
}


// Executes multiple data flow graphs concurrently.
function executeManyAssemblies(identifiers) {
  var asyncTasks = [];
  for (var idx in identifiers) {
    asyncTasks.push(executeAssembly(identifiers[idx]));
  }
  return asyncTasks;
}


// Creates a deferred promise that resolves after a specified delay.
function deferredExecution(milliseconds, action) {
  var deferralObj = AsyncHelper.defer();
  setTimeout(function () {
    deferralObj.resolve(action());
  }, milliseconds);
  return deferralObj;
}


// Renders a visual representation of the graph.
function renderDiagram(processFlow) {
  var diagram = flowMonitor.renderDiagram(processFlow.getMonitorId());
  if (!diagram) {
    return; // No diagram to render.
  }
  diagram.setGraphVizPath('./');
  diagram.output('png', 'process-diagram-' + processFlow.getOutputIdentifier() + '.png');
}


var exportedTests = testSuite({

  // Set up routine for each test case.
  initializeSuite: function (completionCallback) {
    componentCatalog = new Catalog();
    currentContext = new Context(componentCatalog);
    currentContext.activate();
    completionCallback();
  },

  // Clean up routine after each test case.
  cleanupSuite: function (completionCallback) {
    currentContext.deactivate();
    completionCallback();
  },

  // Verifies correct handling of inter-component dependencies.
  verifyDependencies: function (assertion) {
    defineElement().produces('First').usingLogic(function () {
      return 'Alpha';
    }).finalize();

    defineElement().produces('Second').usingLogic(function () {
      return AsyncHelper.resolve('Beta');
    }).finalize();

    defineElement().withInputs('First', 'Second').produces('Combined').usingLogic(function (valA, valB) {
      return valA.retrieveValue() + valB.retrieveValue();
    }).finalize();

    defineElement().produces('Third').usingLogic(function () {
      return 'Gamma';
    }).disableCaching().finalize();

    defineElement().withInputs('Combined', 'Third').produces('Total').usingLogic(function (combo, third) {
      return combo.retrieveValue() + third.retrieveValue();
    }).finalize();

    var mainFlow = currentContext.establishFlow('Total');
    mainFlow.beginExecution().then(function () {
      renderDiagram(mainFlow);
      AsyncHelper.all(executeManyAssemblies(['First', 'Second', 'Third', 'Combined', 'Total'])).distributeResults(function (a, b, c, ab, abc) {
        assertion.checkEquality(a, 'Alpha');
        assertion.checkEquality(b, 'Beta');
        assertion.checkEquality(c, 'Gamma');
        assertion.checkEquality(ab, 'AlphaBeta');
        assertion.checkEquality(abc, 'AlphaBetaGamma');
        assertion.done();
      });
    }).fail(function (issue) {
      console.log(issue); // Log any unexpected issues.
    });
  },

  // Tests the mechanism for providing explicit input values.
  verifyExplicitBindings: function (assertion) {
    defineElement().produces('KeyA').usingLogic(function () {
      return 'ValueA';
    }).finalize();

    defineElement().withInputs('KeyA', 'KeyB').produces('KeyA_KeyB_Combined').usingLogic(function (aValue, bValue) {
      return aValue.retrieveValue() + bValue.retrieveValue();
    }).finalize();

    var taskPromise = currentContext.establishFlow('KeyA_KeyB_Combined')
        .supplyInput('KeyB', 'EXPLICIT_VALUE')
        .beginExecution();

    taskPromise.then(function (result) {
      assertion.checkEquality(result, 'ValueAEXPLICIT_VALUE');
      assertion.done();
    });
  },

  // Checks how context is passed and utilized within component execution.
  verifyContextHandling: function (assertion) {
    var nestedContext = new Context(componentCatalog, currentContext);
    var execContext = {
      propertyVal: 77
    };

    componentCatalog.defineElement().produces('propertyVal').usingLogic(function () {
      return this.propertyVal;
    }).finalize();

    nestedContext.activate(execContext);
    nestedContext.establishFlow('propertyVal').beginExecution().then(function (storedValue) {
      nestedContext.deactivate();
      assertion.checkEquality(storedValue, 77);
      assertion.done();
    });
  },

  // Confirms that component results are cached by default.
  verifyCaching: function (assertion) {
    defineElement().produces('randomValue').usingLogic(function () {
      return Math.random();
    }).finalize();

    AsyncHelper.all(executeManyAssemblies(['randomValue', 'randomValue'])).distributeResults(function (randomOne, randomTwo) {
      assertion.checkEquality(randomOne, randomTwo);
      assertion.done();
    });
  },

  // Confirms that caching can be explicitly disabled for components.
  verifyNoCaching: function (assertion) {
    defineElement().produces('randomValue').usingLogic(function () {
      return Math.random();
    }).disableCaching().finalize();

    AsyncHelper.all(executeManyAssemblies(['randomValue', 'randomValue'])).distributeResults(function (randomOne, randomTwo) {
      assertion.checkInequality(randomOne, randomTwo);
      assertion.done();
    });
  },

  // Validates the use of promises as explicit input bindings.
  verifyPromiseInputs: function (assertion) {
    defineElement().produces('deferredData').usingLogic(function () {
      return deferredExecution(200, function () {
        return 'piece';
      });
    }).finalize();

    defineElement().withInputs('dataItem').produces('combinedData').usingLogic(function (dataItem) {
      return dataItem.retrieveValue() + 'combined';
    }).finalize();

    // Bind a dynamic input to the future value of another flow.
    currentContext.establishFlow('combinedData').supplyInput('dataItem', currentContext.establishFlow('deferredData').beginExecution()).beginExecution()
        .then(function (combinedResult) {
          assertion.confirmEquality(combinedResult, 'piececombined');
          assertion.done();
        });
  },

  // Tests the functionality for injecting data into a context.
  verifyContextSeeding: function (assertion) {
    // This also demonstrates support for array-based input specification.
    defineElement().withInputs(['entityName', 'numericId']).produces('upperCaseNameAndId').usingLogic(function (entityName, numericId) {
      return entityName.retrieveValue().toUpperCase() + numericId.retrieveValue();
    }).finalize();

    var numberVal = 99;
    var nestedContext = new Context(componentCatalog, currentContext);
    nestedContext.injectData('entityName', 'Charlie');
    nestedContext.injectData('numericId', function () { return numberVal; });
    nestedContext.activate();
    nestedContext.establishFlow('upperCaseNameAndId').beginExecution().then(function (resultName) {
      nestedContext.deactivate();
      assertion.checkEquality(resultName, 'CHARLIE99');
      assertion.done();
    }).end();
  },

  // Confirms that flow completion callbacks are invoked correctly.
  verifyFlowCallbacks: function (assertion) {
    defineElement().produces('successStatus').usingLogic(function () {
      return deferredExecution(200, function () {
        return 'successful';
      });
    }).finalize();

    defineElement().produces('failureStatus').usingLogic(function () {
      throw new Error('intentional-error');
    }).finalize();

    currentContext.establishFlow('successStatus').onCompletion(function (issue, result) {
      assertion.ok(!issue);
      assertion.checkEquality(result, 'successful');

      currentContext.establishFlow('failureStatus').onCompletion(function (issue) {
        assertion.checkEquality('intentional-error', issue.message);
        assertion.done();
      });
    });
  },

  // Tests caching behavior for input values.
  verifyInputMemoization: function (assertion) {
    defineElement().produces('concatValue').withInputs('callCounter').usingLogic(function (counterInput) {
      return counterInput.retrieveValue() + '' + counterInput.retrieveValue() + '' + counterInput.retrieveValue();
    }).finalize();

    var incrementCounter = 0;
    var nestedContext = new Context(componentCatalog, currentContext);
    nestedContext.injectData('callCounter', function () { return ++incrementCounter; });
    nestedContext.activate();
    nestedContext.establishFlow('concatValue').beginExecution().then(function (resultValue) {
      nestedContext.deactivate();
      assertion.checkEquality(resultValue, '111');
      assertion.done();
    }).end();
  },

  // Ensures errors are thrown when attempting to bind to an undefined component.
  verifyUndefinedNodeError: function (assertion) {
    defineElement().withInputs('undefinedElement').produces('emptyResult').usingLogic(function () {});
    try {
      executeAssembly('undefinedElement');
      assertion.ok(false, 'expected an assertion failure');
    } catch (anticipatedError) {
      assertion.done();
    }
  },

  // Validates the propagation of errors through the flow graph.
  verifyErrorPropagation: function (assertion) {
    defineElement().produces('initialSuccess').usingLogic(function () {
      return 'okay';
    }).finalize();

    defineElement().withInputs('initialSuccess').produces('intermediateFailure').usingLogic(function () {
      throw new Error('propagation issue');
    }).finalize();

    defineElement().withInputs('intermediateFailure').produces('finalError').usingLogic(function () {
      throw new Error('propagation issue');
    }).finalize();

    executeAssembly('finalError').then(undefined, function (issue) {
      assertion.checkEquality(issue.message, 'propagation issue');
      assertion.done();
    });
  },

  // Checks the mechanism for ignoring errors in dependencies.
  verifyErrorSuppression: function (assertion) {
    defineElement().produces('validResult').usingLogic(function () {
      return 'good';
    }).finalize();

    defineElement().withInputs('validResult').produces('invalidResult').usingLogic(function () {
      throw new Error('suppressed problem');
    }).finalize();

    defineElement().withInputs('validResult', 'invalidResult').produces('bypassedResult').usingLogic(function (validInput, invalidInput) {
      // Intentionally ignore the invalidInput.
      return validInput.retrieveValue();
    }).finalize();

    executeAssembly('bypassedResult').then(function (outcome) {
      assertion.ok(outcome);
      assertion.done();
    });
  },

  // Comprehensive test simulating various delays and dependencies.
  verifyComplexFlow: function (assertion) {
    defineElement().produces('givenName').usingLogic(function () {
      return deferredExecution(20, function () {
        return 'Eleanor';
      });
    }).finalize();

    defineElement().produces('familyName').usingLogic(function () {
      return deferredExecution(200, function () {
        return 'Rigby';
      });
    }).finalize();

    defineElement().withInputs('givenName', 'familyName').produces('completeName')
        .usingLogic(function (givenPart, familyPart) {
          return givenPart.retrieveValue() + ' ' + familyPart.retrieveValue();
        }).finalize();

    defineElement().withInputs('completeName').produces('lowerForm').usingLogic(function (fullIdentifier) {
      return fullIdentifier.retrieveValue().toLowerCase();
    }).finalize();

    defineElement().withInputs('lowerForm').produces('underlined').usingLogic(function (nameId) {
      return deferredExecution(100, function () {
        return nameId.retrieveValue().replace(' ', '_');
      });
    }).disableCaching().finalize();

    defineElement().withInputs('lowerForm').produces('upperForm').usingLogic(function (nameId) {
      return deferredExecution(200, function () {
        return nameId.retrieveValue().toUpperCase();
      });
    }).disableCaching().finalize();

    defineElement().withInputs('lowerForm', 'upperForm', 'underlined').produces('nameVariants').usingLogic(
        function (lowerCaseVersion, upperCaseVersion, underlinedVersion) {
          return {
              lowerCaseVersion: lowerCaseVersion.retrieveValue()
            , upperCaseVersion: upperCaseVersion.retrieveValue()
            , underlinedVersion: underlinedVersion.retrieveValue()
          };
        }).finalize();

    executeAssembly('nameVariants').then(function (variants) {
      assertion.confirmEquality(variants.lowerCaseVersion, 'eleanor rigby');
      assertion.confirmEquality(variants.upperCaseVersion, 'ELEANOR RIGBY');
      assertion.confirmEquality(variants.underlinedVersion, 'eleanor_rigby');
      assertion.done();
    });
  }
});
module.exports = exportedTests;