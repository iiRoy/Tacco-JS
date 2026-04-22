const VerificationSuite = {};

VerificationSuite.assignProps = function(target, ...sources) {
    return Object.assign(target, ...sources);
};

VerificationSuite.stringifyValue = function(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return `'${val}'`;
    if (Array.isArray(val)) return `[${val.map(VerificationSuite.stringifyValue).join(', ')}]`;
    if (val instanceof HTMLElement) return `<${val.tagName.toLowerCase()} id="${val.id || ''}" class="${val.className || ''}">`;
    try {
        return JSON.stringify(val);
    } catch (e) {
        return val.toString();
    }
};

VerificationSuite.retrieveElement = function(selectorOrElement) {
    if (typeof selectorOrElement === 'string') {
        return document.getElementById(selectorOrElement) || document.querySelector(selectorOrElement);
    }
    return selectorOrElement;
};

VerificationSuite.formatStr = function(template, data) {
    if (!template || typeof template !== 'string') return '';
    if (!data || typeof data !== 'object') return template;
    
    return template.replace(/#\{(\w+)\}/g, (match, key) => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            return VerificationSuite.stringifyValue(data[key]);
        }
        return match;
    });
};

VerificationSuite.escapeHtml = function(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

VerificationSuite.cleanArray = function(arr) {
    return arr.filter(item => item !== null && item !== undefined);
};

VerificationSuite.filterArrayByRegex = function(arr, regex) {
    return arr.filter(item => typeof item === 'string' && regex.test(item));
};

VerificationSuite.combineArrays = function(arr1, arr2) {
    const result = [];
    const minLength = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < minLength; i++) {
        result.push([arr1[i], arr2[i]]);
    }
    return result;
};

VerificationSuite.allMatch = function(arr, predicate) {
    return arr.every(predicate);
};

VerificationSuite.foldArray = function(arr, reducer, initialValue) {
    return arr.reduce(reducer, initialValue);
};

VerificationSuite.removeDomElement = function(element) {
    const el = VerificationSuite.retrieveElement(element);
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

VerificationSuite.getComputedStyleProperty = function(element, property) {
    const el = VerificationSuite.retrieveElement(element);
    if (el) {
        return window.getComputedStyle(el)[property];
    }
    return '';
};

VerificationSuite.matchesSelector = function(element, selector) {
    const el = VerificationSuite.retrieveElement(element);
    if (el && typeof el.matches === 'function') {
        return el.matches(selector);
    }
    return false;
};

VerificationSuite.getQueryParams = function() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

class EventWatcher {
    static attach(target, eventName, handler) {
        const el = VerificationSuite.retrieveElement(target) || window;
        el.addEventListener(eventName, handler);
    }
}

VerificationSuite.Simulate = {
    mouseAction: function(targetEl, eventKind, customConfig) {
        const fullConfig = VerificationSuite.assignProps({
            pointerX: 0,
            pointerY: 0,
            btnState: 0
        }, customConfig || {});

        const element = VerificationSuite.retrieveElement(targetEl);
        if (!element) return;

        const eventInstance = document.createEvent("MouseEvents");
        eventInstance.initMouseEvent(eventKind, true, true, document.defaultView,
            fullConfig.btnState, fullConfig.pointerX, fullConfig.pointerY, fullConfig.pointerX, fullConfig.pointerY,
            false, false, false, false, 0, element);

        if (VerificationSuite.Simulate._debugMark) {
            VerificationSuite.removeDomElement(VerificationSuite.Simulate._debugMark);
        }

        const markStyle = `position: absolute; width: 5px; height: 5px;` +
            `top: ${fullConfig.pointerY}px; left: ${fullConfig.pointerX}px;` +
            `border-top: 1px solid red; border-left: 1px solid red;`;

        const markDiv = document.createElement('div');
        markDiv.style.cssText = markStyle;
        markDiv.appendChild(document.createTextNode(" "));
        document.body.appendChild(markDiv);
        VerificationSuite.Simulate._debugMark = markDiv;

        if (VerificationSuite.Simulate._debugStep) {
            alert(`[${new Date().getTime()}] ${eventKind}/${VerificationSuite.stringifyValue(fullConfig)}`);
        }

        element.dispatchEvent(eventInstance);
    },

    keyAction: function(targetEl, eventKind, customConfig) {
        const fullConfig = VerificationSuite.assignProps({
            ctrl: false,
            alt: false,
            shft: false,
            meta: false,
            code: 0,
            char: 0
        }, customConfig || {});

        const element = VerificationSuite.retrieveElement(targetEl);
        if (!element) return;

        const eventInstance = document.createEvent("KeyEvents");
        eventInstance.initKeyEvent(eventKind, true, true, window,
            fullConfig.ctrl, fullConfig.alt, fullConfig.shft, fullConfig.meta,
            fullConfig.code, fullConfig.char);
        element.dispatchEvent(eventInstance);
    },

    typeText: function(targetEl, commandStr) {
        const element = VerificationSuite.retrieveElement(targetEl);
        if (!element) return;

        for (let i = 0; i < commandStr.length; i++) {
            VerificationSuite.Simulate.keyAction(element, 'keypress', { char: commandStr.charCodeAt(i) });
        }
    }
};

class ResultDisplay {
    constructor(displayId) {
        this.displayElement = VerificationSuite.retrieveElement(displayId);
        this.dataBody = null;
        if (this.displayElement) {
            this.initDisplay();
            this.dataBody = this.displayElement.getElementsByTagName('tbody')[0];
        }
    }

    initDisplay() {
        const markup = `<div class="outcome_summary">running...</div>` +
            `<table class="outcome_table">` +
            `<thead><tr><th>Outcome</th><th>Title</th><th>Details</th></tr></thead>` +
            `<tbody class="outcome_entries"></tbody>` +
            `</table>`;
        this.displayElement.innerHTML = markup;
    }

    beginTestEntry(testTitle) {
        if (!this.displayElement) return;
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.appendChild(document.createTextNode(testTitle));
        row.appendChild(cell1);
        row.appendChild(document.createElement('td'));
        row.appendChild(document.createElement('td'));
        this.dataBody.appendChild(row);
    }

    updateStatus(statusLabel) {
        this.getLastEntry().className = statusLabel;
        this.getLastEntry().getElementsByTagName('td')[1].innerHTML = statusLabel;
    }

    completeEntry(statusLabel, summaryText) {
        if (!this.displayElement) return;
        this.updateStatus(statusLabel);
        this.appendMessage(summaryText);
    }

    appendMessage(infoText) {
        if (!this.displayElement) return;
        this.getMsgCell().innerHTML = VerificationSuite.escapeHtml(infoText).replace(/\n/g, "<br />");
    }

    updateSummary(overallSummary) {
        if (!this.displayElement) return;
        this.displayElement.getElementsByTagName('div')[0].innerHTML = VerificationSuite.escapeHtml(overallSummary);
    }

    getLastEntry() {
        const allRows = this.displayElement.getElementsByTagName('tr');
        return allRows[allRows.length - 1];
    }

    getMsgCell() {
        return this.getLastEntry().getElementsByTagName('td')[2];
    }
}

class MsgFormatter {
    constructor(pattern) {
        this.segments = [];
        let lastIndex = 0;
        const regex = /(?=[^\\])\?|\\./g;
        let match;
        while ((match = regex.exec(pattern)) !== null) {
            if (match.index > lastIndex) {
                this.segments.push(pattern.substring(lastIndex, match.index));
            }
            this.segments.push(match[0]);
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < pattern.length) {
            this.segments.push(pattern.substring(lastIndex));
        }
    }

    render(parameters) {
        const params = [...parameters];
        return this.segments.map(segment => {
            if (segment === '?') {
                return VerificationSuite.stringifyValue(params.shift());
            } else if (segment.startsWith('\\')) {
                return segment.substring(1);
            }
            return segment;
        }).join('');
    }
}

const AssertionMethods = (function() {
    function createFormattedMessage(baseMessage, template, ...args) {
        const msg = baseMessage ? baseMessage + '\n' : '';
        return msg + new MsgFormatter(template).render(args);
    }

    function failImmediately(userMessage) {
        this.checkLogic(userMessage || 'Forced Failure', () => false);
    }

    function checkLogic(userMessage, logicBlock) {
        try {
            logicBlock.call(this) ? this.recordPass() : this.recordFail(userMessage);
        } catch (e) {
            this.recordError(e);
        }
    }

    function verifyTrue(expression, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyTrue', 'received <?>', expression);
        this.checkLogic(msg, () => expression);
    }

    function verifyEquals(expected, actual, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyEquals', 'expected: <?>, actual: <?>', expected, actual);
        this.checkLogic(msg, () => expected == actual);
    }

    function verifyNotEquals(expected, actual, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotEquals', 'expected: <?>, actual: <?>', expected, actual);
        this.checkLogic(msg, () => expected != actual);
    }

    function verifyArrayEquals(expected, actual, userMessage) {
        const expArr = Array.from(expected);
        const actArr = Array.from(actual);
        const msg = createFormattedMessage(userMessage || 'verifyArrayEquals', 'expected: <?>, actual: <?>', expArr, actArr);
        this.checkLogic(msg, () =>
            expArr.length === actArr.length &&
            VerificationSuite.allMatch(VerificationSuite.combineArrays(expArr, actArr), pair => pair[0] == pair[1])
        );
    }

    function verifyArrayNotEquals(expected, actual, userMessage) {
        const expArr = Array.from(expected);
        const actArr = Array.from(actual);
        const msg = createFormattedMessage(userMessage || 'verifyArrayNotEquals', '<?> was identical to <?>', expArr, actArr);
        this.checkLogic(msg, () =>
            expArr.length !== actArr.length ||
            !VerificationSuite.allMatch(VerificationSuite.combineArrays(expArr, actArr), pair => pair[0] == pair[1])
        );
    }

    function deepPairEquality(pair) {
        if (Array.isArray(pair[0]) && Array.isArray(pair[1])) {
            return pair[0].length === pair[1].length &&
                VerificationSuite.allMatch(VerificationSuite.combineArrays(pair[0], pair[1]), deepPairEquality);
        }
        return pair[0] == pair[1];
    }

    function verifyObjectEquals(expected, actual, userMessage) {
        const expEntries = Object.entries(expected).sort((a, b) => a[0].localeCompare(b[0]));
        const actEntries = Object.entries(actual).sort((a, b) => a[0].localeCompare(b[0]));
        const msg = createFormattedMessage(userMessage || 'verifyObjectEquals', 'expected: <?>, actual: <?>', expected, actual);
        this.checkLogic(msg, () =>
            expEntries.length === actEntries.length &&
            VerificationSuite.allMatch(VerificationSuite.combineArrays(expEntries, actEntries), deepPairEquality)
        );
    }

    function verifyObjectNotEquals(expected, actual, userMessage) {
        const expEntries = Object.entries(expected).sort((a, b) => a[0].localeCompare(b[0]));
        const actEntries = Object.entries(actual).sort((a, b) => a[0].localeCompare(b[0]));
        const msg = createFormattedMessage(userMessage || 'verifyObjectNotEquals', '<?> was identical to <?>', expected, actual);
        this.checkLogic(msg, () =>
            !(expEntries.length === actEntries.length &&
                VerificationSuite.allMatch(VerificationSuite.combineArrays(expEntries, actEntries), deepPairEquality))
        );
    }

    function verifyIdentical(expected, actual, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyIdentical', 'expected: <?>, actual: <?>', expected, actual);
        this.checkLogic(msg, () => expected === actual);
    }

    function verifyNotIdentical(expected, actual, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotIdentical', 'expected: <?>, actual: <?>', expected, actual);
        this.checkLogic(msg, () => expected !== actual);
    }

    function verifyNull(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNull', 'received <?>', obj);
        this.checkLogic(msg, () => obj === null);
    }

    function verifyNotNull(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotNull', 'received <?>', obj);
        this.checkLogic(msg, () => obj !== null);
    }

    function verifyUndefined(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyUndefined', 'received <?>', obj);
        this.checkLogic(msg, () => typeof obj === "undefined");
    }

    function verifyNotUndefined(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotUndefined', 'received <?>', obj);
        this.checkLogic(msg, () => typeof obj !== "undefined");
    }

    function verifyNullOrUndefined(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNullOrUndefined', 'received <?>', obj);
        this.checkLogic(msg, () => obj == null);
    }

    function verifyNotNullOrUndefined(obj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotNullOrUndefined', 'received <?>', obj);
        this.checkLogic(msg, () => obj != null);
    }

    function verifyRegexMatch(regexPattern, targetString, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyRegexMatch', 'regex <?> did not match <?>', regexPattern, targetString);
        this.checkLogic(msg, () => new RegExp(regexPattern).exec(targetString));
    }

    function verifyRegexNoMatch(regexPattern, targetString, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyRegexNoMatch', 'regex <?> matched <?>', regexPattern, targetString);
        this.checkLogic(msg, () => !(new RegExp(regexPattern).exec(targetString)));
    }

    function verifyHidden(element, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyHidden', '? is not hidden.', element);
        this.checkLogic(msg, () => VerificationSuite.getComputedStyleProperty(element, 'display') === 'none');
    }

    function verifyInstanceType(expectedType, actualInstance, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyInstanceType', '<?> was not an instance of the expected type', actualInstance);
        this.checkLogic(msg, () => actualInstance instanceof expectedType);
    }

    function verifyNotInstanceType(expectedType, actualInstance, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyNotInstanceType', '<?> was an instance of the expected type', actualInstance);
        this.checkLogic(msg, () => !(actualInstance instanceof expectedType));
    }

    function verifyMethodExists(methodName, targetObj, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyMethodExists', 'object does not have method <?>', methodName);
        this.checkLogic(msg, () => (methodName in targetObj && typeof targetObj[methodName] === 'function'));
    }

    function verifyThrows(exceptionName, methodToRun, userMessage) {
        const msg = createFormattedMessage(userMessage || 'verifyThrows', '<?> exception expected but none was thrown', exceptionName);
        const block = () => {
            try {
                methodToRun();
                return false;
            } catch (e) {
                if (e.name === exceptionName) return true;
                else throw e;
            }
        };
        this.checkLogic(msg, block);
    }

    function verifyNoThrow(methodToRun, userMessage) {
        try {
            methodToRun();
            this.verifyTrue(true, "Expected no exception to be thrown");
        } catch (e) {
            const msg = createFormattedMessage(userMessage || 'verifyNoThrow', '<?> was thrown when nothing was expected.', e);
            this.failImmediately(msg);
        }
    }

    function checkVisibilityRecursive(element) {
        const el = VerificationSuite.retrieveElement(element);
        if (!el) return true;
        if (el.style && VerificationSuite.getComputedStyleProperty(el, 'display') === 'none') {
            return false;
        }
        if (el.parentNode && el.parentNode !== document.body && el.parentNode !== document.documentElement) {
            return checkVisibilityRecursive(el.parentNode);
        }
        return true;
    }

    function verifyVisible(element, userMessage) {
        const msg = createFormattedMessage(userMessage, '? was not visible.', element);
        this.checkLogic(msg, () => checkVisibilityRecursive(element));
    }

    function verifyNotVisible(element, userMessage) {
        const msg = createFormattedMessage(userMessage, '? was not hidden and didn\'t have a hidden parent either.', element);
        this.checkLogic(msg, () => !checkVisibilityRecursive(element));
    }

    function verifyElementsMatchSelectors(elements, selectors, userMessage) {
        let failureMessage = userMessage;
        let success = true;

        const actualElements = Array.from(elements).map(VerificationSuite.retrieveElement).filter(Boolean);
        const expectedSelectors = Array.from(selectors);

        if (actualElements.length !== expectedSelectors.length) {
            failureMessage = createFormattedMessage('verifyElementsMatchSelectors', 'size mismatch: ? elements, ? selectors (?).', actualElements.length, expectedSelectors.length, expectedSelectors);
            this.failImmediately(failureMessage);
            success = false;
        }

        if (success) {
            VerificationSuite.combineArrays(actualElements, expectedSelectors).every((pair, index) => {
                const currentElement = pair[0];
                const currentSelector = pair[1];
                if (VerificationSuite.matchesSelector(currentElement, currentSelector)) {
                    return true;
                } else {
                    failureMessage = createFormattedMessage('verifyElementsMatchSelectors', 'At index <?>: expected <?> but got ?', index, currentSelector, currentElement);
                    this.failImmediately(failureMessage);
                    success = false;
                    return false;
                }
            });
        }

        if (success) this.verifyTrue(true, "All elements matched their selectors.");
    }

    function verifyElementMatchesSelector(element, selector, userMessage) {
        this.verifyElementsMatchSelectors([element], [selector], userMessage);
    }

    return {
        createFormattedMessage: createFormattedMessage,
        failImmediately: failImmediately,
        checkLogic: checkLogic,
        verifyTrue: verifyTrue,
        verifyEquals: verifyEquals,
        verifyNotEquals: verifyNotEquals,
        verifyArrayEquals: verifyArrayEquals,
        verifyArrayNotEquals: verifyArrayNotEquals,
        verifyObjectEquals: verifyObjectEquals,
        verifyObjectNotEquals: verifyObjectNotEquals,
        verifyIdentical: verifyIdentical,
        verifyNotIdentical: verifyNotIdentical,
        verifyNull: verifyNull,
        verifyNotNull: verifyNotNull,
        verifyUndefined: verifyUndefined,
        verifyNotUndefined: verifyNotUndefined,
        verifyNullOrUndefined: verifyNullOrUndefined,
        verifyNotNullOrUndefined: verifyNotNullOrUndefined,
        verifyRegexMatch: verifyRegexMatch,
        verifyRegexNoMatch: verifyRegexNoMatch,
        verifyHidden: verifyHidden,
        verifyInstanceType: verifyInstanceType,
        verifyNotInstanceType: verifyNotInstanceType,
        verifyMethodExists: verifyMethodExists,
        verifyThrows: verifyThrows,
        verifyNoThrow: verifyNoThrow,
        verifyVisible: verifyVisible,
        verifyNotVisible: verifyNotVisible,
        verifyElementsMatchSelectors: verifyElementsMatchSelectors,
        verifyElementMatchesSelector: verifyElementMatchesSelector
    };
})();

class TestCaseUnit {
    constructor(title, testFunc, setupFunc, teardownFunc) {
        this.testTitle = title;
        this.runFunction = testFunc;
        this.setupFunction = setupFunc;
        this.teardownFunction = teardownFunc;
        this.passCount = 0;
        this.failCount = 0;
        this.errorCount = 0;
        this.isPaused = false;
        this.pauseDuration = 0;
        this.lastOutcome = 'unknown';
        this.outcomeSummary = '';
        this.actionButtons = null;

        VerificationSuite.assignProps(this, AssertionMethods);
    }

    recordPass() {
        this.passCount++;
    }

    recordFail(message) {
        this.failCount++;
        this.outcomeSummary = message;
        this.lastOutcome = 'failed';
    }

    recordError(error) {
        this.errorCount++;
        this.outcomeSummary = `Error: ${error.message || VerificationSuite.stringifyValue(error)}`;
        this.lastOutcome = 'error';
    }

    pauseTest(durationMs) {
        this.isPaused = true;
        this.pauseDuration = durationMs;
    }

    execute() {
        this.passCount = 0;
        this.failCount = 0;
        this.errorCount = 0;
        this.isPaused = false;
        this.pauseDuration = 0;
        this.lastOutcome = 'running';
        this.outcomeSummary = '';

        try {
            if (this.setupFunction) this.setupFunction.call(this);
            this.runFunction.call(this);
        } catch (e) {
            this.recordError(e);
        } finally {
            try {
                if (this.teardownFunction) this.teardownFunction.call(this);
            } catch (e) {
                this.recordError(e);
            }
        }

        if (this.lastOutcome === 'running') {
            this.lastOutcome = (this.failCount === 0 && this.errorCount === 0) ? 'passed' : 'failed';
        }
        if (!this.outcomeSummary && this.lastOutcome === 'passed') {
            this.outcomeSummary = `${this.passCount} assertions passed.`;
        }
    }

    getOutcome() {
        return this.lastOutcome;
    }

    getBrief() {
        return this.outcomeSummary;
    }
}

VerificationSuite.activeRunners = [];
VerificationSuite.enableAutoRun = true;

class ExecutionManager {
    constructor(testCaseDefinitions) {
        this.config = VerificationSuite.assignProps({
            displayTarget: 'resultlog',
            reportUrl: null
        }, arguments[1] || {});

        this.config.reportUrl = VerificationSuite.getQueryParams().reportUrl || this.config.reportUrl;

        this.testCollection = this.prepareTests(testCaseDefinitions);
        this.currentTestIndex = 0;
        this.display = null;
        VerificationSuite.activeRunners.push(this);
    }

    prepareTests(definitions) {
        let testTitles;
        const queryParams = VerificationSuite.getQueryParams();

        if (queryParams.tests) {
            testTitles = queryParams.tests.split(',');
        } else if (this.config.tests) {
            testTitles = this.config.tests;
        } else if (this.config.test) {
            testTitles = [this.config.test];
        } else {
            testTitles = Object.keys(definitions).filter(key => key.startsWith('test'));
        }

        return VerificationSuite.cleanArray(testTitles.map(title => {
            if (definitions[title]) {
                return new TestCaseUnit(title, definitions[title], definitions.setup, definitions.teardown);
            }
            return null;
        }));
    }

    async startExecution() {
        this.display = new ResultDisplay(this.config.displayTarget);
        await this.processTestsSequentially();
    }

    async processTestsSequentially() {
        const currentTest = this.testCollection[this.currentTestIndex];

        if (!currentTest) {
            return this.finalizeRun();
        }

        if (!currentTest.isPaused) {
            this.display.beginTestEntry(currentTest.testTitle);
        }

        currentTest.execute();

        if (currentTest.isPaused) {
            this.display.appendMessage(`Pausing for ${currentTest.pauseDuration}ms`);
            await new Promise(resolve => setTimeout(resolve, currentTest.pauseDuration || 1000));
        } else {
            this.display.completeEntry(currentTest.getOutcome(), currentTest.getBrief());
            this.currentTestIndex++;
        }

        setTimeout(() => this.processTestsSequentially(), 0);
    }

    compileResults() {
        const overallResults = {
            totalTests: this.testCollection.length,
            totalAssertions: 0,
            totalFailures: 0,
            totalErrors: 0
        };

        return VerificationSuite.foldArray(this.testCollection, (acc, test) => {
            acc.totalAssertions += test.passCount + test.failCount;
            acc.totalFailures += test.failCount;
            acc.totalErrors += test.errorCount;
            return acc;
        }, overallResults);
    }

    async postResults() {
        const results = this.compileResults();
        if (window.postVerificationResults) {
            window.postVerificationResults(results);
        } else if (this.config.reportUrl) {
            const query = new URLSearchParams(results).toString();
            try {
                await fetch(`${this.config.reportUrl}?${query}`, { method: 'GET' });
            } catch (e) {
                console.error("Failed to post results:", e);
            }
        }
    }

    finalizeRun() {
        this.postResults();
        this.display.updateSummary(this.generateSummaryText());
    }

    generateSummaryText() {
        const results = this.compileResults();
        return VerificationSuite.formatStr(
            '#{totalTests} tests, #{totalAssertions} assertions, #{totalFailures} failures, #{totalErrors} errors',
            results
        );
    }
}

VerificationSuite.AutoLaunch = {
    trigger: function() {
        if (!VerificationSuite.enableAutoRun) return;
        VerificationSuite.enableAutoRun = false;
        for (const runner of VerificationSuite.activeRunners) {
            runner.startExecution();
        }
    }
};

EventWatcher.attach(window, "load", VerificationSuite.AutoLaunch.trigger);