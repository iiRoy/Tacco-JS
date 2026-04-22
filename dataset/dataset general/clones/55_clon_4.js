const testHarness = (() => {
    const reportCollection = [];
    let currentModuleIdentifier = '';
    let moduleLifecycleHooks = {
        startup: null,
        shutdown: null
    };

    const executeVerification = (description, verificationFunction) => {
        try {
            if (moduleLifecycleHooks.startup) {
                moduleLifecycleHooks.startup();
            }
            verificationFunction();
            reportCollection.push({ module: currentModuleIdentifier, description, status: 'PASSED' });
        } catch (error) {
            reportCollection.push({ module: currentModuleIdentifier, description, status: 'FAILED', message: error.message });
        } finally {
            if (moduleLifecycleHooks.shutdown) {
                moduleLifecycleHooks.shutdown();
            }
        }
    };

    const confirmMatch = (actualValue, expectedValue, message = 'Values should be equivalent') => {
        if (actualValue !== expectedValue) {
            throw new Error(`Assertion failed: Expected "${expectedValue}", Got "${actualValue}". ${message}`);
        }
    };

    const defineModule = (moduleName, config) => {
        currentModuleIdentifier = moduleName;
        moduleLifecycleHooks.startup = config && config.startup ? config.startup : null;
        moduleLifecycleHooks.shutdown = config && config.preamble ? config.preamble : null;
    };

    return {
        defineModule,
        verifyBehavior: executeVerification,
        confirmMatch
    };
})();

const defineModule = testHarness.defineModule;
const verifyBehavior = testHarness.verifyBehavior;
const confirmMatch = testHarness.confirmMatch;

const dynamicStylist = (() => {
    const _designRegistry = new Map(); // Map<elementPath, Map<kebabCaseProperty, value>>
    const _elementPropertyTracker = new WeakMap(); // Map<HTMLElement, Set<kebabCaseProperty>>

    const convertToKebabCase = (str) => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

    const applyStylesToSingleElement = (targetElement, designRulesMap) => {
        let trackedProps = _elementPropertyTracker.get(targetElement);
        if (!trackedProps) {
            trackedProps = new Set();
            _elementPropertyTracker.set(targetElement, trackedProps);
        }

        designRulesMap.forEach((val, propKebab) => {
            const isImportant = val.includes('!important');
            const cleanVal = isImportant ? val.replace('!important', '').trim() : val;
            targetElement.style.setProperty(propKebab, cleanVal, isImportant ? 'important' : '');
            trackedProps.add(propKebab);
        });
    };

    const removeStylesFromSingleElement = (targetElement, designRulesMap) => {
        const trackedProps = _elementPropertyTracker.get(targetElement);
        if (!trackedProps) return;

        designRulesMap.forEach((_, propKebab) => {
            if (trackedProps.has(propKebab)) {
                targetElement.style.removeProperty(propKebab);
                trackedProps.delete(propKebab);
            }
        });

        if (trackedProps.size === 0) {
            _elementPropertyTracker.delete(targetElement);
        }
    };

    return {
        configure: (elementPath, designRules) => {
            const designRulesMap = new Map();
            for (const propName in designRules) {
                if (Object.prototype.hasOwnProperty.call(designRules, propName)) {
                    designRulesMap.set(convertToKebabCase(propName), designRules[propName]);
                }
            }
            _designRegistry.set(elementPath, designRulesMap);

            document.querySelectorAll(elementPath).forEach(el => {
                applyStylesToSingleElement(el, designRulesMap);
            });
        },

        retrieve: (elementPath) => {
            if (!elementPath) {
                const allRegisteredStyles = {};
                _designRegistry.forEach((propMap, path) => {
                    allRegisteredStyles[path] = {};
                    propMap.forEach((val, propKebab) => {
                        allRegisteredStyles[path][propKebab] = val;
                    });
                });
                return allRegisteredStyles;
            }

            const storedSpecificStyles = _designRegistry.get(elementPath);
            if (!storedSpecificStyles) {
                return {};
            }
            const specificResult = {};
            storedSpecificStyles.forEach((val, propKebab) => {
                specificResult[propKebab] = val;
            });
            return specificResult;
        },

        collectAll: (elementPath) => {
            const targetElement = document.querySelector(elementPath);
            if (!targetElement) return {};

            const computed = getComputedStyle(targetElement);
            const combinedProperties = {};

            for (let i = 0; i < computed.length; i++) {
                const propKebab = computed[i];
                combinedProperties[propKebab] = computed.getPropertyValue(propKebab);
            }

            const registeredSpecific = _designRegistry.get(elementPath);
            if (registeredSpecific) {
                registeredSpecific.forEach((val, propKebab) => {
                    combinedProperties[propKebab] = val;
                });
            }
            return combinedProperties;
        },

        clear: (elementPath) => {
            if (!elementPath) {
                _designRegistry.forEach((propMap, path) => {
                    document.querySelectorAll(path).forEach(el => {
                        removeStylesFromSingleElement(el, propMap);
                    });
                });
                _designRegistry.clear();
            } else {
                const propMapToClear = _designRegistry.get(elementPath);
                if (propMapToClear) {
                    document.querySelectorAll(elementPath).forEach(el => {
                        removeStylesFromSingleElement(el, propMapToClear);
                    });
                    _designRegistry.delete(elementPath);
                }
            }
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const testingArea = document.createElement('div');
    testingArea.id = 'testing-area';
    document.body.appendChild(testingArea);

    const mainTestNode = document.createElement('div');
    mainTestNode.id = 'target-element';
    testingArea.appendChild(mainTestNode);

    const secondaryTestNode = document.createElement('div');
    secondaryTestNode.id = 'alternate-target';
    testingArea.appendChild(secondaryTestNode);
});

const resetTargetElements = () => {
    const mainTestNode = document.getElementById('target-element');
    const secondaryTestNode = document.getElementById('alternate-target');
    if (mainTestNode) {
        mainTestNode.style.cssText = 'display: none;';
    }
    if (secondaryTestNode) {
        secondaryTestNode.style.cssText = '';
    }
};

defineModule('style-management-basics', {
    startup: () => {
        resetTargetElements();
    },
    preamble: () => {
        dynamicStylist.clear();
    }
});

verifyBehavior('retrieval of styles from design registry', function() {
    let outcome = dynamicStylist.retrieve();
    confirmMatch(Object.keys(outcome).length, 0);

    dynamicStylist.configure('#target-element', { 'color': 'red', 'font-size': '20px' });
    outcome = dynamicStylist.retrieve();
    confirmMatch(Object.keys(outcome).length, 1);
    confirmMatch(Object.keys(outcome['#target-element']).length, 2);

    dynamicStylist.configure('#target-element .child-element', { 'color': 'blue' });
    outcome = dynamicStylist.retrieve();
    confirmMatch(Object.keys(outcome).length, 2);
    confirmMatch(Object.keys(outcome['#target-element']).length, 2);
    confirmMatch(outcome['#target-element']['color'], 'red');
    confirmMatch(outcome['#target-element']['font-size'], '20px');
    confirmMatch(Object.keys(outcome['#target-element .child-element']).length, 1);
    confirmMatch(outcome['#target-element .child-element']['color'], 'blue');
});

verifyBehavior('retrieval for specific element path', function() {
    let outcome = dynamicStylist.retrieve('#target-element');
    confirmMatch(Object.keys(outcome).length, 0);

    dynamicStylist.configure('#target-element', { 'color': 'red', 'font-size': '20px' });
    outcome = dynamicStylist.retrieve('#target-element');
    confirmMatch(Object.keys(outcome).length, 2);
    confirmMatch(outcome['color'], 'red');
    confirmMatch(outcome['font-size'], '20px');
});

verifyBehavior('collection of all styles including non-managed', function() {
    let outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 1);
    confirmMatch(outcome['display'], 'none');

    dynamicStylist.configure('#target-element', { 'color': 'red', 'font-size': '20px' });
    outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 3);
    confirmMatch(outcome['color'], 'red');
    confirmMatch(outcome['font-size'], '20px');
    confirmMatch(outcome['display'], 'none');
});

verifyBehavior('removal of all managed styles', function() {
    dynamicStylist.configure('#target-element', { 'color': 'red', 'font-size': '20px' });
    let outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 3);

    dynamicStylist.clear();
    outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 1);
    confirmMatch(outcome['display'], 'none');
});

verifyBehavior('removal of managed styles for a specific element path', function() {
    dynamicStylist.configure('#target-element', { 'color': 'red', 'font-size': '20px' });
    let outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 3);

    dynamicStylist.clear('#target-element');
    outcome = dynamicStylist.collectAll('#target-element');
    confirmMatch(Object.keys(outcome).length, 1);
    confirmMatch(outcome['display'], 'none');
});

verifyBehavior('removal for a specific element path leaves others untouched', function() {
    dynamicStylist.configure('#target-element', { 'color': 'red' });
    dynamicStylist.configure('#alternate-target', { 'color': 'blue' });
    confirmMatch(dynamicStylist.retrieve('#target-element')['color'], 'red');
    confirmMatch(dynamicStylist.retrieve('#alternate-target')['color'], 'blue');

    dynamicStylist.clear('#target-element');
    confirmMatch(Object.keys(dynamicStylist.retrieve('#target-element')).length, 0);
    confirmMatch(dynamicStylist.retrieve('#alternate-target')['color'], 'blue');
});

verifyBehavior('setting style without important modifier', function() {
    dynamicStylist.configure('#target-element', { 'color': 'blue' });
    dynamicStylist.configure('div', { 'color': 'red' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['color'], 'rgb(0, 0, 255)');
});

verifyBehavior('setting style with important modifier', function() {
    dynamicStylist.configure('#target-element', { 'background-color': 'blue' });
    dynamicStylist.configure('div', { 'background-color': 'red !important' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['backgroundColor'], 'rgb(255, 0, 0)');

    dynamicStylist.configure('#target-element', { 'background-color': 'blue !important' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['backgroundColor'], 'rgb(0, 0, 255)');
});

verifyBehavior('setting a different style with important modifier', function() {
    dynamicStylist.configure('#target-element', { 'color': 'blue' });
    dynamicStylist.configure('div', { 'color': 'red !important' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['color'], 'rgb(255, 0, 0)');

    dynamicStylist.configure('#target-element', { 'color': 'blue !important' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['color'], 'rgb(0, 0, 255)');
});

verifyBehavior('subsequent configurations for same property override previous', function() {
    dynamicStylist.configure('#target-element', { 'background-color': 'red' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['backgroundColor'], 'rgb(255, 0, 0)');

    dynamicStylist.configure('#target-element', { 'background-color': 'blue' });
    confirmMatch(getComputedStyle(document.getElementById('target-element'))['backgroundColor'], 'rgb(0, 0, 255)');
});

verifyBehavior('configuration accepts properties in camel-case', function() {
    dynamicStylist.configure('#target-element', { 'backgroundColor': 'red' });
    confirmMatch(dynamicStylist.retrieve('#target-element')['background-color'], 'red');
});