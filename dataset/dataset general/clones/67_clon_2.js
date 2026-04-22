var isNodeEnv = typeof window === "undefined";

/**
 *  Main system for SpecForge, a compact JavaScript BDD/testing framework.
 *
 *  @namespace
 */
var specForge = {};
if (isNodeEnv) module.exports.specForge = specForge;

/**
 *  @private
 */
specForge.missingRoutine_ = function() {
  throw new Error("routine not yet implemented");
};

/**
 *  Utilize `specForge.undetermined` instead of the global `undefined`,
 *  as the latter can be inadvertently modified.
 *
 *  @private
 */
specForge.undetermined = specForge.___uninitialized___;

/**
 *  Display debugging messages in the console if this flag is set to true.
 *
 */
specForge.DEBUGLOGS = false;

/**
 *  Standard delay in milliseconds for event loop relinquishes (e.g., to allow network activity or screen updates).
 *  Small values might cause slow test execution. A zero value means no updates until all tests finish.
 *
 */
specForge.REFRESH_INTERVAL_MS = 250;

/**
 *  Default duration for `waitFor()` blocks to time out, in milliseconds.
 */
specForge.WAIT_LIMIT_MS = 5000;

specForge.fetchGlobalScope = function () {
  function acquireContext() {
    return this;
  }

  return acquireContext();
};

/**
 *  Enables comparison of bound functions. Internal use only.
 *
 *  @internal
 *  @private
 *  @param baseObj {object} The 'this' context for the function.
 *  @param funcName {Function} The function to locate.
 */
specForge.attachNative_ = function (baseObj, funcName) {
  var originalRef = baseObj[funcName];
  if (originalRef.apply) {
    return function () {
      return originalRef.apply(baseObj, arguments);
    };
  } else {
    // Legacy browser support
    return specForge.fetchGlobalScope()[funcName];
  }
};

specForge.scheduleTimeout = specForge.attachNative_(specForge.fetchGlobalScope(), 'setTimeout');
specForge.cancelTimeout = specForge.attachNative_(specForge.fetchGlobalScope(), 'clearTimeout');
specForge.scheduleInterval = specForge.attachNative_(specForge.fetchGlobalScope(), 'setInterval');
specForge.cancelInterval = specForge.attachNative_(specForge.fetchGlobalScope(), 'clearInterval');

specForge.LogEntry = function (contentItems) {
  this.category = 'log';
  this.contentItems = contentItems;
  this.stackInfo = new Error(); // Note: needs more robust testing
};

specForge.LogEntry.prototype.toDisplayString = function () {
  var outputStr = "";
  for (var idx = 0; idx < this.contentItems.length; idx++) {
    if (idx > 0) outputStr += " ";
    if (specForge.isStr_(this.contentItems[idx])) {
      outputStr += this.contentItems[idx];
    } else {
      outputStr += specForge.prettyPrint(this.contentItems[idx]);
    }
  }
  return outputStr;
};

specForge.AssertionOutcome = function (resultInfo) {
  this.category = 'expect';
  this.comparisonMethod = resultInfo.matcherName;
  this.succeeded_ = resultInfo.passed;
  this.anticipated = resultInfo.expected;
  this.received = resultInfo.actual;
  this.reportText = this.succeeded_ ? 'Succeeded.' : resultInfo.message;

  var stackInfo = (resultInfo.trace || new Error(this.reportText));
  this.stackInfo = this.succeeded_ ? '' : stackInfo;
};

specForge.AssertionOutcome.prototype.toDisplayString = function () {
  return this.reportText;
};

specForge.AssertionOutcome.prototype.didSucceed = function () {
  return this.succeeded_;
};

/**
 *  Retrieves the SpecForge execution context. Ensures one is initialized.
 */
specForge.retrieveContext = function () {
  var context = specForge.activeContext_ = specForge.activeContext_ || new specForge.Context();
  return context;
};

/**
 *  @internal
 *  @private
 *  @param valInput {any}
 *  @returns {boolean}
 */
specForge.isArr_ = function (valInput) {
  return specForge.isTypeOf_("Array", valInput);
};

/**
 *  @internal
 *  @private
 *  @param valInput {any}
 *  @returns {boolean}
 */
specForge.isStr_ = function (valInput) {
  return specForge.isTypeOf_("String", valInput);
};

/**
 *  @internal
 *  @private
 *  @param valInput {any}
 *  @returns {boolean}
 */
specForge.isNum_ = function (valInput) {
  return specForge.isTypeOf_("Number", valInput);
};

/**
 *  @internal
 *  @private
 *  @param {string} kindName
 *  @param valInput {any}
 *  @returns {boolean}
 */
specForge.isTypeOf_ = function (kindName, valInput) {
  return Object.prototype.toString.apply(valInput) === '[object ' + kindName + ']';
};

/**
 *  A formatter for expectations. Converts any entity into a human-readable string.
 *
 *  @param targetVal {any} An entity to be presented.
 *  @returns {string}
 */
specForge.prettyPrint = function (targetVal) {
  var outputGen = new specForge.FormattedOutputGenerator();
  outputGen.format(targetVal);
  return outputGen.finalString;
};

/**
 *  Verifies if the provided object is a DOM Node.
 *
 *  @param {object} element object to inspect
 *  @returns {boolean}
 */
specForge.checkDomNode = function (element) {
  return element.nodeType > 0;
};

/**
 *  Provides a generic object that matches any instance of a given class type.
 *  Useful for expectations where specific values are not important.
 *
 *  @example
 *  // Don't care about the specific function, just that it's a function.
 *  expect(myObserver).toHaveBeenCalledWith(specForge.ofAnyKind(Function));
 *
 *  @param {Class} classType
 *  @returns matching object for the classType
 */
specForge.ofAnyKind = function (classType) {
  return new specForge.Comparators.AnyType(classType);
};

/**
 *  Provides a matchable subset for a hash/JSON object.
 *  Useful for expectations where not all attributes of an object matter.
 *
 *  @example
 *  // Only concerned with the 'item' attribute.
 *  expect(myListener).toHaveBeenCalledWith(specForge.entityContaining({item: "value"}));
 *
 *  @param sampleData {object} example data
 *  @returns matchable object for the sampleData
 */
specForge.entityContaining = function (sampleData) {
  return new specForge.Comparators.PartialEntity(sampleData);
};

/**
 *  SpecForge Probes are test doubles that can serve as stubs, monitors, fakes, or mocks in expectations.
 *
 *  Probes should be set up during test initialization, before expectations.
 *  They can then be verified using standard SpecForge expectation syntax to check
 *  if they were called, how many times, and with what parameters.
 *
 *  A Probe object has the following fields: `wasInvoked`, `invokeCount`, `lastInvocation`, and `invocationArguments`.
 *
 *  Probes are reset at the end of each test case.
 *
 *  Note: Do <b>not</b> instantiate `new specForge.Probe()` directly. A probe must be created using `monitorOn`, `specForge.makeProbe`, or `specForge.makeProbeObject`.
 *
 *  @example
 *  // A basic stub
 *  var myStub = specForge.makeProbe('myStub'); // Can be used anywhere
 *
 *  // Monitor example
 *  var target = {
 *    process: function(data) { return !data; }
 *  };
 *
 *  // The actual target.process will not be executed, operation stops here.
 *  monitorOn(target, 'process');
 *
 *  // target.process is monitored, and execution will continue to its original implementation.
 *  monitorOn(target, 'process').andContinue();
 *
 *  // Fake example
 *  var target = {
 *    process: function(data) { return !data; }
 *  };
 *
 *  // target.process(val) will now return val.
 *  monitorOn(target, 'process').andExecuteFake(function(value) { return value; });
 *
 *  // Mock example
 *  target.process(5 === 5);
 *  expect(target.process).wasInvoked();
 *  expect(target.process).wasInvokedWith(true);
 *
 *  @constructor
 *  @see monitorOn, specForge.makeProbe, specForge.makeProbeObject
 *  @param {string} probeLabel
 */
specForge.Probe = function (probeLabel) {
  /**
   *  The designation of the probe, if provided.
   */
  this.probeName = probeLabel || 'unnamed';
  /**
   *  Is this entity a probe?
   */
  this.isProbe = true;
  /**
   *  The actual function that this probe replaces.
   */
  this.actionPlan = function () {
  };
  /**
   *  Records the most recent invocation of the probe.
   *  @example
   *  var myMonitor = specForge.makeProbe('foo');
   *  myMonitor(10, 20);
   *  myMonitor.lastInvocation.args = [10, 20];
   */
  this.lastInvocation = {};

  /**
   *  Stores arguments for each call to the probe, indexed by call count.
   *  @example
   *  var myMonitor = specForge.makeProbe('foo');
   *  myMonitor(10, 20);
   *  myMonitor(70, 80);
   *  myMonitor.lastInvocation.args = [70, 80];
   *  myMonitor.invocationArguments[0] = [10, 20];
   *  myMonitor.invocationArguments[1] = [70, 80];
   */
  this.invocationArguments = [];
  this.invocations = [];
};

/**
 *  Instructs a probe to proceed with the original implementation.
 *
 *  @example
 *  var component = {
 *    method: function() { // perform some operations }
 *  };
 *
 *  // Defining a probe on an existing property: component.method
 *  monitorOn(component, 'method').andContinue();
 */
specForge.Probe.prototype.andContinue = function () {
  this.actionPlan = this.initialValue;
  return this;
};

/**
 *  Sets the return value for a probe.
 *
 *  @example
 *  // Defining a probe from scratch: myFunc() returns 'resultA'
 *  var myFunc = specForge.makeProbe('probe on myFunc').andYield('resultA');
 *
 *  // Defining a probe on an existing property: component.method() returns 'resultB'
 *  monitorOn(component, 'method').andYield('resultB');
 *
 *  @param {any} returnValue
 */
specForge.Probe.prototype.andYield = function (returnValue) {
  this.actionPlan = function () {
    return returnValue;
  };
  return this;
};

/**
 *  Causes a probe to throw an exception when invoked.
 *
 *  @example
 *  // Defining a probe from scratch: myFunc() throws an error with message 'failure'
 *  var myFunc = specForge.makeProbe('probe on myFunc').andRaiseError('failure');
 *
 *  // Defining a probe on an existing property: component.method() throws an error with message 'failure'
 *  monitorOn(component, 'method').andRaiseError('failure');
 *
 *  @param {string} errorMsg
 */
specForge.Probe.prototype.andRaiseError = function (errorMsg) {
  this.actionPlan = function () {
    throw errorMsg;
  };
  return this;
};

/**
 *  Executes an alternative implementation when a probe is called.
 *
 *  @example
 *  var customHandler = function() {
 *    // perform some custom logic, return something
 *  };
 *  // Defining a probe from scratch: myFunc() calls the customHandler function.
 *  var myFunc = specForge.makeProbe('probe on myFunc').andExecuteFake(customHandler);
 *
 *  // Defining a probe on an existing property: component.method() calls an anonymous function.
 *  monitorOn(component, 'method').andExecuteFake(function() { return 'custom result'; });
 *
 *  @param {Function} simulatedFunc
 */
specForge.Probe.prototype.andExecuteFake = function (simulatedFunc) {
  this.actionPlan = simulatedFunc;
  return this;
};

/**
 *  Resets all tracking variables of a probe so it can be reused.
 *
 *  @example
 *  monitorOn(component, 'method');
 *
 *  component.method();
 *
 *  expect(component.method.invokeCount).toEqual(1);
 *
 *  component.method.clearRecords();
 *
 *  expect(component.method.invokeCount).toEqual(0);
 */
specForge.Probe.prototype.clearRecords = function () {
  this.wasInvoked = false;
  this.invokeCount = 0;
  this.invocationArguments = [];
  this.invocations = [];
  this.lastInvocation = {};
};

specForge.makeProbe = function (probeLabel) {

  var probeObject = function () {
    probeObject.wasInvoked = true;
    probeObject.invokeCount++;
    var callArgs = specForge.utility.toArray(arguments);
    probeObject.lastInvocation.entity = this;
    probeObject.lastInvocation.args = callArgs;
    probeObject.invocationArguments.push(callArgs);
    probeObject.invocations.push({entity: this, args: callArgs});
    return probeObject.actionPlan.apply(this, arguments);
  };

  var baseProbe = new specForge.Probe(probeLabel);

  for (var propertyKey in baseProbe) {
    probeObject[propertyKey] = baseProbe[propertyKey];
  }

  probeObject.clearRecords();

  return probeObject;
};

/**
 *  Determines if an object is a probe.
 *
 *  @param {specForge.Probe|any} potentialProbe
 *  @returns {boolean}
 */
specForge.isAProbe = function (potentialProbe) {
  return potentialProbe && potentialProbe.isProbe;
};

/**
 *  Constructs a more complex probe: an object where every property is itself a probe function.
 *  Useful for stubbing out a large interface in a single operation.
 *
 *  @param {string} rootName The base name for the probe object.
 *  @param {Array} routineNames An array of method names to convert into probes.
 */
specForge.makeProbeObject = function (rootName, routineNames) {
  if (!specForge.isArr_(routineNames) || routineNames.length === 0) {
    throw new Error('makeProbeObject requires a non-empty array of routine names for probe creation');
  }
  var entity = {};
  for (var idx = 0; idx < routineNames.length; idx++) {
    entity[routineNames[idx]] = specForge.makeProbe(rootName + '.' + routineNames[idx]);
  }
  return entity;
};

/**
 *  All provided parameters are formatted and concatenated, then logged to the current test unit's output.
 *
 *  Avoid leaving calls to `specForge.recordMessage` in production code.
 */
specForge.recordMessage = function () {
  var testUnit = specForge.retrieveContext().activeTestUnit;
  testUnit.log.apply(testUnit, arguments);
};

/**
 *  A function that sets up a probe on an existing method of an object.
 *  Used within a test unit to establish a probe.
 *
 *  @example
 *  // Probe example
 *  var target = {
 *    logic: function(condition) { return !condition; }
 *  };
 *  monitorOn(target, 'logic'); // The actual target.logic will not be executed, operation stops.
 *
 *  @see specForge.makeProbe
 *  @param targetObj {object}
 *  @param routineName {string}
 *  @returns A SpecForge probe that can be chained with other probe methods.
 */
var monitorOn = function (targetObj, routineName) {
  return specForge.retrieveContext().activeTestUnit.monitorOn(targetObj, routineName);
};
if (isNodeEnv) module.exports.monitorOn = monitorOn;

/**
 *  Generates a SpecForge test unit that will be added to the current suite.
 *
 *  @example
 *  testCase('should evaluate to true', function() {
 *    expect(true).toEqual(true);
 *  });
 *
 *  @param {string} description A textual summary of this test unit.
 *  @param {Function} actionRoutine A function defining the prerequisites and assertions for the test.
 */
var testCase = function (description, actionRoutine) {
  return specForge.retrieveContext().testCase(description, actionRoutine);
};
if (isNodeEnv) module.exports.testCase = testCase;

/**
 *  Generates a <em>disabled</em> SpecForge test unit.
 *
 *  A convenient method to temporarily disable existing test units during development.
 *
 *  @param {string} description A textual summary of this test unit.
 *  @param {Function} actionRoutine A function defining the prerequisites and assertions for the test.
 */
var skipCase = function (description, actionRoutine) {
  return specForge.retrieveContext().skipCase(description, actionRoutine);
};