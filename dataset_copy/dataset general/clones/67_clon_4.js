const isModuleEnv = typeof module !== "undefined" && module.exports;

const veritas = {};
if (isModuleEnv) module.exports.veritas = veritas;

veritas.UNIMPLEMENTED_ACTION = () => { throw new Error("Action not implemented"); };
veritas.UNDEFINED_VALUE = void 0;

veritas.DIAGNOSTIC_OUTPUT = false;
veritas.EVENT_LOOP_PAUSE = 250;
veritas.WAIT_LIMIT_MS = 5000;

const obtainGlobalContext = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  return (function() { return this; })();
};
const globalRef = obtainGlobalContext();

const wrapGlobalFn = (key) => {
  const original = globalRef[key];
  if (typeof original === 'function') {
    return original.bind(globalRef);
  }
  return globalRef[key];
};

veritas.setDelay = wrapGlobalFn('setTimeout');
veritas.clearDelay = wrapGlobalFn('clearTimeout');
veritas.setCycle = wrapGlobalFn('setInterval');
veritas.clearCycle = wrapGlobalFn('clearInterval');

const checkType = (expectedTypeName, value) => Object.prototype.toString.call(value) === `[object ${expectedTypeName}]`;

veritas.checkIfArray = (val) => checkType("Array", val);
veritas.checkIfString = (val) => checkType("String", val);
veritas.checkIfNumber = (val) => checkType("Number", val);
veritas.checkIfNode = (val) => val && typeof val.nodeType === 'number' && val.nodeType > 0;

veritas.formatValue = (item, visited = new Set()) => {
  if (visited.has(item)) {
    return '[Circular]';
  }
  visited.add(item);

  if (veritas.checkIfString(item)) {
    return `'${item}'`;
  }
  if (veritas.checkIfNumber(item) || typeof item === 'boolean' || item === null || item === veritas.UNDEFINED_VALUE) {
    return String(item);
  }
  if (typeof item === 'function') {
      return `Function<${item.name || 'anonymous'}>`;
  }
  if (item && typeof item === 'object') {
    if (veritas.checkIfArray(item)) {
      const elements = item.map(el => veritas.formatValue(el, new Set(visited)));
      visited.delete(item);
      return `[${elements.join(', ')}]`;
    }
    const keys = Object.keys(item);
    if (keys.length === 0) return '{}';
    const parts = keys.map(key => `${key}: ${veritas.formatValue(item[key], new Set(visited))}`);
    visited.delete(item);
    return `{ ${parts.join(', ')} }`;
  }
  visited.delete(item);
  return String(item);
};

class ReportEntry {
  constructor(data) {
    this.kind = 'record';
    this.payload = data;
    this.stackTrace = new Error();
  }

  toString() {
    return this.payload.map(veritas.formatValue).join(' ');
  }
}

class AssertionOutcome {
  constructor(props) {
    this.kind = 'assert';
    this.matchMethod = props.matchMethod;
    this.passedResult = props.outcome;
    this.anticipated = props.anticipated;
    this.actualValue = props.actualValue;
    this.explanation = this.passedResult ? 'Success.' : props.explanation;

    const traceInfo = (props.traceInfo || new Error(this.explanation));
    this.originTrace = this.passedResult ? '' : traceInfo;
  }

  toString() {
    return this.explanation;
  }

  isSuccessful() {
    return this.passedResult;
  }
}

class TypeMatcher {
  constructor(targetType) {
    this.desiredType = targetType;
  }
  matches(value) {
    return value instanceof this.desiredType;
  }
  toString() {
    return `<Any ${this.desiredType.name}>`;
  }
}

class PartialObjectMatcher {
  constructor(sampleData) {
    this.template = sampleData;
  }
  matches(value) {
    if (!value || typeof value !== 'object' || veritas.checkIfArray(value)) return false;
    return Object.keys(this.template).every(key => {
      const templateValue = this.template[key];
      const actualValue = value[key];

      if (templateValue instanceof TypeMatcher) {
        return templateValue.matches(actualValue);
      }
      if (templateValue instanceof PartialObjectMatcher) {
        return templateValue.matches(actualValue);
      }
      if (typeof templateValue === 'object' && templateValue !== null &&
          typeof actualValue === 'object' && actualValue !== null &&
          !veritas.checkIfArray(templateValue) && !veritas.checkIfArray(actualValue)) {
        return new PartialObjectMatcher(templateValue).matches(actualValue);
      }
      return actualValue === templateValue;
    });
  }
  toString() {
    return `<Object containing ${veritas.formatValue(this.template)}>`;
  }
}

veritas.anyType = (targetClass) => new TypeMatcher(targetClass);
veritas.containsObject = (sample) => new PartialObjectMatcher(sample);

const monitorFactory = (idName) => {
  let wasInvoked = false;
  let invokeCount = 0;
  let recordedArgs = [];
  let fullRecords = [];
  let lastInvocation = {};
  let executionPlan = () => veritas.UNDEFINED_VALUE;
  let originalMethod = veritas.UNDEFINED_VALUE;

  const invocationMonitor = function(...args) {
    wasInvoked = true;
    invokeCount++;
    const currentArgs = Array.from(args);
    const currentHost = this;
    recordedArgs.push(currentArgs);
    lastInvocation = { host: currentHost, params: currentArgs };
    fullRecords.push(lastInvocation);

    return executionPlan.apply(currentHost, args);
  };

  Object.assign(invocationMonitor, {
    monitorId: idName || 'unnamed_monitor',
    isMonitor: true,
    get wasCalled() { return wasInvoked; },
    get callCount() { return invokeCount; },
    get allArgs() { return recordedArgs; },
    get recentCall() { return lastInvocation; },
    get allCalls() { return fullRecords; },

    andExecuteOriginal: function() {
      if (typeof originalMethod !== 'function') {
        throw new Error(`Cannot execute original: no original method set for monitor '${this.monitorId}'`);
      }
      executionPlan = originalMethod;
      return this;
    },
    andYield: function(val) {
      executionPlan = () => val;
      return this;
    },
    andErr: function(errMsg) {
      executionPlan = () => { throw errMsg; };
      return this;
    },
    andMimic: function(mimicFn) {
      if (typeof mimicFn !== 'function') {
        throw new Error(`andMimic requires a function, got ${typeof mimicFn}`);
      }
      executionPlan = mimicFn;
      return this;
    },
    resetState: function() {
      wasInvoked = false;
      invokeCount = 0;
      recordedArgs = [];
      fullRecords = [];
      lastInvocation = {};
      executionPlan = () => veritas.UNDEFINED_VALUE;
    },
    setOriginal: function(fn) {
      originalMethod = fn;
    }
  });

  invocationMonitor.resetState();

  return invocationMonitor;
};

veritas.createMonitor = (label) => monitorFactory(label);

veritas.isMonitor = (potentialMonitor) => potentialMonitor && potentialMonitor.isMonitor === true;

veritas.createMonitorBatch = (baseLabel, methodLabels) => {
  if (!veritas.checkIfArray(methodLabels) || methodLabels.length === 0) {
    throw new Error('createMonitorBatch needs a non-empty array of method names.');
  }
  return methodLabels.reduce((acc, currentLabel) => {
    acc[currentLabel] = veritas.createMonitor(`${baseLabel}.${currentLabel}`);
    return acc;
  }, {});
};

class TestContext {
  constructor() {
    this.activeSubject = null;
    this.testSuites = [];
  }

  installMonitor(targetObj, methodKey) {
    if (typeof targetObj[methodKey] !== 'function') {
      throw new Error(`Cannot monitor non-function property: '${String(methodKey)}' on object.`);
    }
    const existingMethod = targetObj[methodKey];
    const newMonitor = veritas.createMonitor(`${methodKey} monitor`);
    newMonitor.setOriginal(existingMethod);
    targetObj[methodKey] = newMonitor;
    return newMonitor;
  }

  defineScenario(description, testFn) {
    const specPlaceholder = {
      description: description,
      fn: testFn,
      log: (...args) => {
        console.log(`[${description} Log]:`, ...args.map(veritas.formatValue));
      }
    };
    this.activeSubject = specPlaceholder;
    try {
      if (veritas.DIAGNOSTIC_OUTPUT) {
          console.log(`Running Scenario: "${description}"`);
      }
      testFn();
    } catch (e) {
      console.error(`Scenario "${description}" failed:`, e);
      if (e.stack) console.error(e.stack);
    } finally {
      this.activeSubject = null;
    }
  }

  defineDisabledScenario(description, testFn) {
    if (veritas.DIAGNOSTIC_OUTPUT) {
      console.log(`Disabled Scenario: "${description}" (skipped)`);
    }
  }
}

let globalTestContext = null;

veritas.obtainContext = () => {
  if (!globalTestContext) {
    globalTestContext = new TestContext();
  }
  return globalTestContext;
};

const reportMessage = (...messages) => {
  const currentSubject = veritas.obtainContext().activeSubject;
  if (currentSubject && typeof currentSubject.log === 'function') {
    currentSubject.log(...messages);
  } else {
    console.warn('reportMessage called outside of an active scenario. Outputting to console:', ...messages.map(veritas.formatValue));
  }
};

const setupMonitor = (target, method) => {
  return veritas.obtainContext().installMonitor(target, method);
};
if (isModuleEnv) module.exports.setupMonitor = setupMonitor;

const testCase = (desc, fn) => {
  return veritas.obtainContext().defineScenario(desc, fn);
};
if (isModuleEnv) module.exports.testCase = testCase;

const skipCase = (desc, fn) => {
  return veritas.obtainContext().defineDisabledScenario(desc, fn);
};
if (isModuleEnv) module.exports.skipCase = skipCase;