var forgeContentHandler = function(initialBoundaryValue) {
    let contentStore = {
        minBoundary: initialBoundaryValue,
        presentDatum: '',
        previousDatum: '',
        excludedPrefixes: []
    };

    const isPrefixOf = function(potentialPrefix, fullString) {
        if (potentialPrefix.length === 0) return true;
        if (potentialPrefix.length > fullString.length) return false;
        let match = true;
        let index = 0;
        while (index < potentialPrefix.length) {
            if (potentialPrefix.charAt(index) !== fullString.charAt(index)) {
                match = false;
                break;
            }
            index++;
        }
        return match;
    };

    return {
        getCurrentInput: function() {
            return contentStore.presentDatum;
        },

        updateCurrentInput: function(incomingDatum) {
            contentStore.previousDatum = contentStore.presentDatum;
            contentStore.presentDatum = incomingDatum;
        },

        hasInputBeenModified: function() {
            return contentStore.presentDatum !== contentStore.previousDatum;
        },

        recordNoResults: function() {
            contentStore.excludedPrefixes = contentStore.excludedPrefixes.concat(contentStore.presentDatum);
        },

        canGenerateOutcomes: function() {
            const currentContentLength = contentStore.presentDatum.length;
            const minimumPermittedLength = contentStore.minBoundary;

            const lengthConditionMet = currentContentLength >= minimumPermittedLength;

            const isExcludedByPrefix = contentStore.excludedPrefixes.some(function(prefix) {
                return isPrefixOf(prefix, contentStore.presentDatum);
            });

            return lengthConditionMet && !isExcludedByPrefix;
        },

        retrieveMinimumBoundary: function() {
            return contentStore.minBoundary;
        },
        accessCurrentDatum: function() {
            return contentStore.presentDatum;
        },
        accessPreviousDatum: function() {
            return contentStore.previousDatum;
        },
        accessExcludedPrefixes: function() {
            return contentStore.excludedPrefixes;
        }
    };
};

if (typeof window === 'undefined') {
    global.window = {};
}

window.testSystem = window.testSystem || {};
window.testSystem.results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    failures: []
};
window.testSystem.currentTestGroup = '';
window.testSystem.currentSetup = null;

var specificationGroup = function(name, callback) {
    var previousGroup = window.testSystem.currentTestGroup;
    window.testSystem.currentTestGroup = name;
    console.log(`\nSpecification Group: ${name}`);
    callback();
    window.testSystem.currentTestGroup = previousGroup;
};

var setupForTest = function(callback) {
    window.testSystem.currentSetup = callback;
};

var testScenario = function(description, callback) {
    window.testSystem.results.totalTests++;
    console.log(`  Test Scenario: ${description}`);
    try {
        if (window.testSystem.currentSetup) {
            window.testSystem.currentSetup();
        }
        callback();
        window.testSystem.results.passed++;
    } catch (e) {
        window.testSystem.results.failed++;
        window.testSystem.results.failures.push({
            group: window.testSystem.currentTestGroup,
            scenario: description,
            error: e.message || e
        });
        console.error(`    FAILURE: ${e.message || e}`);
    }
};

var expectValue = function(actual) {
    return {
        toBeIdenticalTo: function(expected) {
            if (actual !== expected) {
                throw new Error(`Expected '${actual}' to be identical to '${expected}'`);
            }
        },
        toBeTrue: function() {
            if (actual !== true) {
                throw new Error(`Expected '${actual}' to be true`);
            }
        },
        toBeFalse: function() {
            if (actual !== false) {
                throw new Error(`Expected '${actual}' to be false`);
            }
        },
        includesElement: function(element) {
            if (!Array.isArray(actual) || !actual.includes(element)) {
                throw new Error(`Expected array ${JSON.stringify(actual)} to include element '${element}'`);
            }
        }
    };
};

(function() {
  var HandlerConstructor;
  HandlerConstructor = forgeContentHandler;

  specificationGroup('ContentHandler', function() {
    var currentHandlerInstance;
    currentHandlerInstance = null;

    setupForTest(function() {
      return currentHandlerInstance = HandlerConstructor(2);
    });

    specificationGroup('initialConfiguration', function() {
      return testScenario('establishes the minimum boundary value to the provided argument', function() {
        return expectValue(currentHandlerInstance.retrieveMinimumBoundary()).toBeIdenticalTo(2);
      });
    });

    specificationGroup('inputRetrieval', function() {
      return testScenario('obtains the present input value', function() {
        currentHandlerInstance.updateCurrentInput('sample_text');
        return expectValue(currentHandlerInstance.getCurrentInput()).toBeIdenticalTo('sample_text');
      });
    });

    specificationGroup('inputAssignment', function() {
      testScenario('assigns the present input value', function() {
        currentHandlerInstance.updateCurrentInput('assigned_text');
        return expectValue(currentHandlerInstance.accessCurrentDatum()).toBeIdenticalTo('assigned_text');
      });
      return testScenario('assigns the prior input value to the old present value', function() {
        currentHandlerInstance.updateCurrentInput('initial');
        currentHandlerInstance.updateCurrentInput('middle');
        currentHandlerInstance.updateCurrentInput('final');
        return expectValue(currentHandlerInstance.accessPreviousDatum()).toBeIdenticalTo('middle');
      });
    });

    specificationGroup('modificationDetection', function() {
      return testScenario('detects if the value has been altered', function() {
        currentHandlerInstance.updateCurrentInput('first_state');
        currentHandlerInstance.updateCurrentInput('second_state');
        return expectValue(currentHandlerInstance.hasInputBeenModified()).toBeTrue();
      });
    });

    specificationGroup('emptyResultFlagging', function() {
      return testScenario('incorporates the current value into the collection of empty result indicators', function() {
        currentHandlerInstance.updateCurrentInput('no_matches');
        currentHandlerInstance.recordNoResults();
        return expectValue(currentHandlerInstance.accessExcludedPrefixes()).includesElement('no_matches');
      });
    });

    return specificationGroup('outcomePrediction', function() {
      testScenario('is false if the current value has fewer characters than the minimum boundary', function() {
        currentHandlerInstance.updateCurrentInput('s');
        return expectValue(currentHandlerInstance.canGenerateOutcomes()).toBeFalse();
      });
      testScenario('is false if the current value commences with any empty prefixes', function() {
        currentHandlerInstance.updateCurrentInput('prefix_a');
        currentHandlerInstance.recordNoResults();
        currentHandlerInstance.updateCurrentInput('prefix_abc');
        return expectValue(currentHandlerInstance.canGenerateOutcomes()).toBeFalse();
      });
      return testScenario('is true if the current value is not empty and meets length criteria', function() {
        currentHandlerInstance.updateCurrentInput('valid_input');
        return expectValue(currentHandlerInstance.canGenerateOutcomes()).toBeTrue();
      });
    });
  });
}).call(this);