const utilUtilities = {
    isPlainObject: (val) => {
        return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.getPrototypeOf(val) === Object.prototype;
    },
    mergeInto: (target, source) => {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    },
    pluckOne: (arr, val) => {
        const idx = arr.indexOf(val);
        if (idx > -1) {
            arr.splice(idx, 1);
            return true;
        }
        return false;
    }
};

const baselineAesthetics = require('./default-aesthetics');
const DetailedFault = require('./parsed-fault');
const systemExclusions = require('./runtime-locations');
const Visualizer = require('renderkid');

let activeProcessor = null;

const internalState = new WeakMap();

function createFaultFormatter() {
    const formatterInstance = {};

    const state = {
        limitCount: 50,
        packageBans: [],
        locationBans: [],
        exclusionTests: [],
        transformationHooks: [],
        faultPreprocessors: [],
        pathSubstitutions: [],
        displayVisualizer: new Visualizer(),
        currentAesthetics: null,
        originalStackPrep: null,
    };
    internalState.set(formatterInstance, state);

    state.currentAesthetics = baselineAesthetics();
    state.displayVisualizer.style(state.currentAesthetics);

    formatterInstance.engage = function() {
        if (state.originalStackPrep !== null) {
            return this;
        }
        state.originalStackPrep = Error.prepareStackTrace;

        Error.prepareStackTrace = (errorObject, callFrames) => {
            const preparedStack = state.originalStackPrep || ((exc, frames) => {
                const base = exc.toString();
                const frameStrings = frames.map(frame => `  at ${frame.toString()}`);
                return `${base}\n${frameStrings.join('\n')}`;
            });

            const rawStack = preparedStack.apply(null, [errorObject, callFrames]);

            const errorDetails = {
                stack: rawStack,
                message: errorObject.toString().replace(/^.*: /, '')
            };
            return formatterInstance.formatAndPresent(errorDetails, false);
        };
        return this;
    };

    formatterInstance.disengage = function() {
        if (state.originalStackPrep) {
            Error.prepareStackTrace = state.originalStackPrep;
            state.originalStackPrep = null;
        }
        return this;
    };

    formatterInstance.configure = function(settings) {
        if (settings.packageBans !== undefined) {
            if (settings.packageBans === false) {
                formatterInstance.clearPackageBans();
            } else {
                settings.packageBans.forEach(pkg => formatterInstance.banPackage(pkg));
            }
        }
        if (settings.locationBans !== undefined) {
            if (settings.locationBans === false) {
                formatterInstance.clearLocationBans();
            } else {
                settings.locationBans.forEach(loc => formatterInstance.banLocation(loc));
            }
        }
        if (settings.exclusionTests !== undefined) {
            if (settings.exclusionTests === false) {
                formatterInstance.clearExclusionTests();
            } else {
                settings.exclusionTests.forEach(test => formatterInstance.addExclusionTest(test));
            }
        }
        if (settings.limitCount !== undefined) {
            formatterInstance.setLimitCount(settings.limitCount);
        }
        if (settings.banSystemFiles === true) {
            formatterInstance.banSystemFiles();
        } else if (settings.banSystemFiles === false) {
            formatterInstance.unbanSystemFiles();
        }
        if (settings.transformationHooks !== undefined) {
            if (settings.transformationHooks === false) {
                formatterInstance.clearTransformationHooks();
            } else {
                settings.transformationHooks.forEach(hook => formatterInstance.addTransformationHook(hook));
            }
        }
        if (settings.faultPreprocessors !== undefined) {
            if (settings.faultPreprocessors === false) {
                formatterInstance.clearFaultPreprocessors();
            } else {
                settings.faultPreprocessors.forEach(proc => formatterInstance.addFaultPreprocessor(proc));
            }
        }
        if (settings.pathSubstitutions !== undefined) {
            if (utilUtilities.isPlainObject(settings.pathSubstitutions)) {
                for (const path in settings.pathSubstitutions) {
                    formatterInstance.addPathSubstitution(path, settings.pathSubstitutions[path]);
                }
            } else if (settings.pathSubstitutions === false) {
                formatterInstance.clearPathSubstitutions();
            }
        }
        return this;
    };

    formatterInstance.banPackage = function(...packages) {
        packages.forEach(pkg => state.packageBans.push(String(pkg)));
        return this;
    };
    formatterInstance.unbanPackage = function(...packages) {
        packages.forEach(pkg => utilUtilities.pluckOne(state.packageBans, pkg));
        return this;
    };
    formatterInstance.clearPackageBans = function() {
        state.packageBans.length = 0;
        return this;
    };

    formatterInstance.banLocation = function(...paths) {
        paths.forEach(path => state.locationBans.push(path));
        return this;
    };
    formatterInstance.unbanLocation = function(...paths) {
        paths.forEach(path => utilUtilities.pluckOne(state.locationBans, path));
        return this;
    };
    formatterInstance.clearLocationBans = function() {
        state.locationBans.length = 0;
        return this;
    };

    formatterInstance.addExclusionTest = function(...callbacks) {
        callbacks.forEach(cb => state.exclusionTests.push(cb));
        return this;
    };
    formatterInstance.removeExclusionTest = function(...callbacks) {
        callbacks.forEach(cb => utilUtilities.pluckOne(state.exclusionTests, cb));
        return this;
    };
    formatterInstance.clearExclusionTests = function() {
        state.exclusionTests.length = 0;
        return this;
    };

    formatterInstance.banSystemFiles = function() {
        formatterInstance.banLocation(...systemExclusions);
        return this;
    };
    formatterInstance.unbanSystemFiles = function() {
        formatterInstance.unbanLocation(...systemExclusions);
        return this;
    };

    formatterInstance.addTransformationHook = function(...callbacks) {
        callbacks.forEach(cb => state.transformationHooks.push(cb));
        return this;
    };
    formatterInstance.removeTransformationHook = function(...callbacks) {
        callbacks.forEach(cb => utilUtilities.pluckOne(state.transformationHooks, cb));
        return this;
    };
    formatterInstance.clearTransformationHooks = function() {
        state.transformationHooks.length = 0;
        return this;
    };

    formatterInstance.addFaultPreprocessor = function(...callbacks) {
        callbacks.forEach(cb => state.faultPreprocessors.push(cb));
        return this;
    };
    formatterInstance.removeFaultPreprocessor = function(...callbacks) {
        callbacks.forEach(cb => utilUtilities.pluckOne(state.faultPreprocessors, cb));
        return this;
    };
    formatterInstance.clearFaultPreprocessors = function() {
        state.faultPreprocessors.length = 0;
        return this;
    };

    formatterInstance.setLimitCount = function(newLimit) {
        if (newLimit === undefined || newLimit === 0) {
            newLimit = 50;
        }
        state.limitCount = newLimit | 0;
        return this;
    };

    formatterInstance.addPathSubstitution = function(pattern, replacement) {
        state.pathSubstitutions.push({ pattern, replacement });
        return this;
    };
    formatterInstance.removePathSubstitution = function(pattern) {
        state.pathSubstitutions = state.pathSubstitutions.filter(sub => sub.pattern !== pattern);
        return this;
    };
    formatterInstance.clearPathSubstitutions = function() {
        state.pathSubstitutions.length = 0;
        return this;
    };

    formatterInstance.retrieveAesthetics = function() {
        return state.currentAesthetics;
    };

    formatterInstance.updateAesthetics = function(newAesthetics) {
        utilUtilities.mergeInto(state.currentAesthetics, newAesthetics);
        state.displayVisualizer.style(newAesthetics);
        return this;
    };

    formatterInstance.retrieveVisualizer = function() {
        return state.displayVisualizer;
    };

    formatterInstance.formatAndPresent = function(err, doLog = false) {
        const displayData = formatterInstance.deriveDisplayData(err);
        const formattedOutput = state.displayVisualizer.render(displayData);
        if (doLog === true) {
            console.error(formattedOutput);
        }
        return formattedOutput;
    };

    formatterInstance.deriveDisplayData = function(errInput) {
        let actualFault = errInput;
        if (!(actualFault instanceof DetailedFault)) {
            actualFault = new DetailedFault(errInput);
        }

        state.faultPreprocessors.forEach(processor => processor(actualFault));

        const headerSection = {
            mainTitle: (() => {
                const titleParts = {};
                if (actualFault.wrapper !== '') {
                    titleParts.wrapper = `${actualFault.wrapper}`;
                }
                titleParts.category = actualFault.kind;
                return titleParts;
            })(),
            separator: ':',
            summary: String(actualFault.message).trim()
        };

        const processedTraceItems = [];
        let itemsCount = 0;

        for (let i = 0; i < actualFault.trace.length; i++) {
            const currentItem = actualFault.trace[i];

            if (currentItem === null || currentItem === undefined) {
                continue;
            }

            let shouldSkip = false;
            if (typeof currentItem === 'object') {
                if (state.packageBans.includes(currentItem.modName)) {
                    shouldSkip = true;
                }
                if (state.locationBans.includes(currentItem.path)) {
                    shouldSkip = true;
                }
                if (currentItem.packages && currentItem.packages.some(pkg => state.packageBans.includes(pkg))) {
                    shouldSkip = true;
                }
            }
            if (!shouldSkip) {
                for (const test of state.exclusionTests) {
                    if (test(currentItem, i) === true) {
                        shouldSkip = true;
                        break;
                    }
                }
            }

            if (shouldSkip) {
                continue;
            }

            if (typeof currentItem === 'object' && typeof currentItem.shortenedAddr === 'string') {
                for (const sub of state.pathSubstitutions) {
                    currentItem.shortenedAddr = currentItem.shortenedAddr.replace(sub.pattern, sub.replacement);
                }
            }
            for (const hook of state.transformationHooks) {
                hook(currentItem, i);
            }

            if (itemsCount >= state.limitCount) {
                break;
            }

            if (typeof currentItem === 'object') {
                processedTraceItems.push({
                    segment: {
                        top: {
                            indicator: (() => {
                                if (currentItem.file === undefined || currentItem.file === null) {
                                    return '';
                                }
                                return {
                                    filePath: currentItem.file,
                                    delimiter: ':',
                                    lineNumber: currentItem.line
                                };
                            })(),
                            action: currentItem.what
                        },
                        bottom: (() => {
                            const detailInfo = {
                                address: currentItem.shortenedAddr
                            };
                            if (currentItem.extra !== undefined && currentItem.extra !== null) {
                                detailInfo.additional = currentItem.extra;
                            }
                            return detailInfo;
                        })()
                    }
                });
                itemsCount++;
            } else if (typeof currentItem === 'string') {
                processedTraceItems.push({
                    segment: {
                        freeform: currentItem
                    }
                });
                itemsCount++;
            }
        }

        const finalOutputStructure = {
            'display-fault': {
                head: headerSection
            }
        };
        if (processedTraceItems.length > 0) {
            finalOutputStructure['display-fault'].traceList = processedTraceItems;
        }
        return finalOutputStructure;
    };

    Object.defineProperty(formatterInstance, 'displayVisualizer', {
        get: formatterInstance.retrieveVisualizer,
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(formatterInstance, 'currentAesthetics', {
        get: formatterInstance.retrieveAesthetics,
        enumerable: true,
        configurable: true
    });

    return formatterInstance;
}

if (!activeProcessor) {
    activeProcessor = createFaultFormatter();
}

module.exports = activeProcessor;