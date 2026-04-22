// Helper function to safely obtain a DOM element by its ID.
const obtainDomElement = (elementIdentifier) => {
    // Add a guard clause for invalid input types or empty identifiers.
    if (typeof elementIdentifier !== 'string' || elementIdentifier.trim() === '') {
        console.warn('StyleManager: Invalid or empty element identifier provided:', elementIdentifier);
        return null;
    }
    const targetElement = document.getElementById(elementIdentifier);
    // A simple log for debugging purposes, can be removed in production.
    // if (!targetElement) {
    //     console.info(`StyleManager: Element with ID '${elementIdentifier}' not found.`);
    // }
    return targetElement;
};

// Helper function to extract a specific computed style value from an element.
const extractComputedStyleValue = (targetElement, propertyName) => {
    if (!targetElement || typeof propertyName !== 'string' || propertyName.trim() === '') {
        console.error('StyleManager: Cannot extract computed style; element or property name is invalid.');
        return undefined;
    }
    const computedStyles = window.getComputedStyle(targetElement);
    // For bracket notation, the CSS property name (kebab-case) is typically used.
    return computedStyles[propertyName];
};

// Helper function to create and append a test element, ensuring a clean state.
const createAndAppendTestElement = (idString, initialStyles = {}) => {
    const existingElement = obtainDomElement(idString);
    if (existingElement && existingElement.parentNode) {
        // Remove any pre-existing element with the same ID to ensure test isolation.
        existingElement.parentNode.removeChild(existingElement);
    }
    const newElement = document.createElement('div');
    newElement.id = idString;
    // Apply any initial styles directly to the element for simulating external CSS.
    for (const propKey in initialStyles) {
        if (Object.prototype.hasOwnProperty.call(initialStyles, propKey)) {
            newElement.style[propKey] = initialStyles[propKey];
        }
    }
    document.body.appendChild(newElement);
    // console.log(`Test environment: Created element #${idString}`);
    return newElement;
};

// Custom assertion utility to replace 'equal' for Type III changes.
const assertDeepMatch = (actualValue, expectedValue, assertionMessage = 'Values should be deeply equivalent') => {
    // Using JSON.stringify for a simple deep comparison suitable for primitives and basic objects.
    const actualSerialized = JSON.stringify(actualValue);
    const expectedSerialized = JSON.stringify(expectedValue);

    if (actualSerialized === expectedSerialized) {
        // console.log(`✔️  ${assertionMessage}`);
    } else {
        console.error(`❌  Assertion Failed: ${assertionMessage}`);
        console.error(`    Expected: ${expectedSerialized}`);
        console.error(`    Actual:   ${actualSerialized}`);
        throw new Error(`Assertion failure: ${assertionMessage}`); // Halt test on failure
    }
};

// Emulating a test framework's module/test structure.
const globalTestContext = {}; // Stores global test state, like cleanup routines.

const defineStyleTestSet = (suiteTitle, optionsObject) => {
    console.group(`➡️  Test Suite: ${suiteTitle}`);
    if (optionsObject && typeof optionsObject.cleanupRoutine === 'function') {
        globalTestContext.cleanupRoutine = optionsObject.cleanupRoutine;
    }
};

const executeTestSequence = (sequenceDescription, testRoutine) => {
    console.groupCollapsed(`📝 Test Scenario: ${sequenceDescription}`);
    try {
        testRoutine();
        console.log(`✅ Passed: ${sequenceDescription}`);
    } catch (error) {
        console.error(`❌ Failed: ${sequenceDescription}`, error);
    } finally {
        // Execute cleanup after each test scenario.
        if (globalTestContext.cleanupRoutine) {
            globalTestContext.cleanupRoutine();
        }
        console.groupEnd(); // Close collapsed group for this test.
    }
};

// The central style management system, extensively refactored and renamed.
const styleRegistry = (() => {
    // Internal state uses a Map for efficient storage and retrieval of style rules.
    let registeredStyleRules = new Map();

    // Internal helper to process individual style properties.
    const processStyleProperty = (propKey, propVal) => {
        // Type III: Add a basic validation for property values.
        if (typeof propVal !== 'string' && typeof propVal !== 'number') {
            console.warn(`StyleRegistry: Encountered invalid style value for property '${propKey}':`, propVal);
            return null; // Discard invalid values.
        }
        // Additional processing could go here, e.g., unit conversion, vendor prefixing.
        return propVal.toString().trim(); // Ensure value is a trimmed string.
    };

    // Renamed from 'set' to 'configureStyles'.
    const configureStyles = (selectorIdentifier, styleDefinition) => {
        // Type III: Add a guard clause for invalid selector input.
        if (typeof selectorIdentifier !== 'string' || selectorIdentifier.trim() === '') {
            console.error('StyleRegistry: Attempted to configure styles with an invalid selector identifier.');
            return;
        }

        // Retrieve existing styles or initialize an empty object for the selector.
        let currentStyleSet = registeredStyleRules.has(selectorIdentifier)
            ? { ...registeredStyleRules.get(selectorIdentifier) } // Clone to avoid direct mutation of stored object.
            : {};

        // Iterate through the provided style definition.
        for (const [property, value] of Object.entries(styleDefinition)) {
            const processedValue = processStyleProperty(property, value);
            if (processedValue !== null) {
                // Type III: Convert camelCase property names to kebab-case for CSS consistency.
                const cssPropertyName = property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
                currentStyleSet[cssPropertyName] = processedValue;
            }
        }
        registeredStyleRules.set(selectorIdentifier, currentStyleSet);
        // console.log(`StyleRegistry: Configured rules for selector: '${selectorIdentifier}'`);
    };

    // Renamed from 'get' to 'retrieveConfiguredStyles'.
    const retrieveConfiguredStyles = (selectorIdentifier = null) => {
        // If no selector is provided, return a copy of all registered rules.
        if (selectorIdentifier === null) {
            return Object.fromEntries(registeredStyleRules);
        }
        // Type III: Guard clause for specific selector retrieval.
        if (typeof selectorIdentifier !== 'string' || selectorIdentifier.trim() === '') {
            console.warn('StyleRegistry: Invalid selector identifier provided for style retrieval.');
            return {};
        }
        // Return a cloned object to prevent external modification of internal state.
        return registeredStyleRules.has(selectorIdentifier)
            ? { ...registeredStyleRules.get(selectorIdentifier) }
            : {};
    };

    // Renamed from 'getAll' to 'gatherAllEffectiveStyles'.
    const gatherAllEffectiveStyles = (selectorIdentifier) => {
        // Type III: Guard clause for selector validation.
        if (typeof selectorIdentifier !== 'string' || selectorIdentifier.trim() === '') {
            console.warn('StyleRegistry: Invalid selector identifier for gathering effective styles.');
            return {};
        }

        // Attempt to get the actual DOM element, removing '#' for getElementById.
        const elementIdToFetch = selectorIdentifier.startsWith('#') ? selectorIdentifier.substring(1) : selectorIdentifier;
        const targetElement = obtainDomElement(elementIdToFetch);
        let effectiveStyles = {};

        // If an element is found, collect its computed styles.
        if (targetElement) {
            const computed = window.getComputedStyle(targetElement);
            // Iterate over all computed styles (many more than just JSS-managed ones).
            for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                effectiveStyles[prop] = computed.getPropertyValue(prop);
            }
        }

        // Merge with our internally registered styles, giving precedence to JSS rules.
        const registered = retrieveConfiguredStyles(selectorIdentifier);
        // This merge order ensures JSS styles override browser defaults/external CSS for properties they define.
        return { ...effectiveStyles, ...registered };
    };

    // Renamed from 'remove' to 'purgeStyles'.
    const purgeStyles = (selectorIdentifier = null) => {
        if (selectorIdentifier === null) {
            // If no selector, clear all registered rules.
            registeredStyleRules.clear();
            // console.log('StyleRegistry: All registered styles have been purged.');
        } else {
            // Type III: Guard clause for specific selector purging.
            if (typeof selectorIdentifier !== 'string' || selectorIdentifier.trim() === '') {
                console.warn('StyleRegistry: Invalid selector identifier provided for style purging.');
                return;
            }
            const deletionSuccessful = registeredStyleRules.delete(selectorIdentifier);
            // if (deletionSuccessful) {
            //     console.log(`StyleRegistry: Styles for selector '${selectorIdentifier}' purged.`);
            // } else {
            //     console.info(`StyleRegistry: No styles found for selector '${selectorIdentifier}' to purge.`);
            // }
        }
    };

    // Public API of the style management system.
    return {
        configureStyles,
        retrieveConfiguredStyles,
        gatherAllEffectiveStyles,
        purgeStyles
    };
})();

// Type III: Define constants for common selectors and CSS properties for better readability and maintainability.
const primaryTestSelector = '#jss-test';
const nestedChildSelector = '#jss-test .child-element';
const alternativeElementIdentifier = '#alternative-element';
const cssColorProperty = 'color';
const cssFontSizeProperty = 'font-size';
const cssDisplayProperty = 'display';
const cssBackgroundColorProperty = 'background-color';

// Start of the test suite definition, using the new framework emulation.
defineStyleTestSet('core-style-management-features', {
    // Type III: Enhanced cleanup routine to ensure test isolation.
    cleanupRoutine: function() {
        styleRegistry.purgeStyles(); // Clear all styles managed by our registry.
        // Remove all known dynamically created test elements from the DOM.
        const identifiersOfTestElements = ['jss-test', 'test-div-element', 'alternative-element'];
        identifiersOfTestElements.forEach(elementId => {
            const elementToRemove = obtainDomElement(elementId);
            if (elementToRemove && elementToRemove.parentNode) {
                elementToRemove.parentNode.removeChild(elementToRemove);
            }
        });
        // console.log('Test cleanup routine completed.');
    }
});

executeTestSequence('retrieveConfiguredStyles fetches rules from the styleRegistry', function() {
    // Type III: Use 'let' for reassignable variables, and introduce intermediate variables for clarity.
    let currentStyleMap = styleRegistry.retrieveConfiguredStyles();
    const initialRuleCount = Object.keys(currentStyleMap).length;
    assertDeepMatch(initialRuleCount, 0, 'Initially, the style configuration map should be empty.');

    // Define a set of base styles for the primary selector.
    const baseStyleDefinition = { [cssColorProperty]: 'red', [cssFontSizeProperty]: '20px' };
    styleRegistry.configureStyles(primaryTestSelector, baseStyleDefinition);

    // Re-fetch the style map and verify its updated state.
    currentStyleMap = styleRegistry.retrieveConfiguredStyles();
    const updatedRuleCount = Object.keys(currentStyleMap).length;
    assertDeepMatch(updatedRuleCount, 1, 'After one configuration, the map should contain one entry.');

    const primarySelectorRules = currentStyleMap[primaryTestSelector];
    assertDeepMatch(Object.keys(primarySelectorRules).length, 2, 'The primary selector should have two style properties.');

    // Configure styles for a nested child element.
    const childStyleDefinition = { [cssColorProperty]: 'blue' };
    styleRegistry.configureStyles(nestedChildSelector, childStyleDefinition);

    // Fetch again and perform comprehensive checks for both selectors.
    currentStyleMap = styleRegistry.retrieveConfiguredStyles();
    const finalRuleCount = Object.keys(currentStyleMap).length;
    assertDeepMatch(finalRuleCount, 2, 'After two configurations, the map should contain two entries.');

    const retrievedPrimaryRules = currentStyleMap[primaryTestSelector];
    assertDeepMatch(Object.keys(retrievedPrimaryRules).length, 2, 'Primary selector rules should still have two properties.');
    assertDeepMatch(retrievedPrimaryRules[cssColorProperty], 'red', 'Primary selector color property is correctly retrieved.');
    assertDeepMatch(retrievedPrimaryRules[cssFontSizeProperty], '20px', 'Primary selector font-size property is correctly retrieved.');

    const retrievedChildRules = currentStyleMap[nestedChildSelector];
    assertDeepMatch(Object.keys(retrievedChildRules).length, 1, 'Child selector rules should have one property.');
    assertDeepMatch(retrievedChildRules[cssColorProperty], 'blue', 'Child selector color property is correctly retrieved.');
});

executeTestSequence('calling retrieveConfiguredStyles with a specific selector fetches only rules for that selector', function() {
    let specificRuleData = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(Object.keys(specificRuleData).length, 0, 'Initially, no rules should exist for this specific selector.');

    const newRuleSet = { [cssColorProperty]: 'red', [cssFontSizeProperty]: '20px' };
    styleRegistry.configureStyles(primaryTestSelector, newRuleSet);

    specificRuleData = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(Object.keys(specificRuleData).length, 2, 'After configuration, two rules should exist for the specific selector.');
    assertDeepMatch(specificRuleData[cssColorProperty], 'red', 'Specific selector color property is correct.');
    assertDeepMatch(specificRuleData[cssFontSizeProperty], '20px', 'Specific selector font-size property is correct.');
});

executeTestSequence('gatherAllEffectiveStyles also retrieves styles not managed by the styleRegistry', function() {
    // Type III: Dynamically create the test element and set an initial style to simulate external CSS.
    const testElementId = 'jss-test';
    const dynamicElement = createAndAppendTestElement(testElementId, { [cssDisplayProperty]: 'none' }); // Simulates 'display: none' from external stylesheet.

    let effectiveStyleResult = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    // Type III: Assert specific properties instead of a generic key count, as computed styles have many properties.
    assertDeepMatch(effectiveStyleResult[cssDisplayProperty], 'none', 'External display property is present in effective styles.');
    assertDeepMatch(effectiveStyleResult[cssColorProperty], '', 'Initial color property is empty/default before JSS configuration.');

    const initialRuleSet = { [cssColorProperty]: 'red', [cssFontSizeProperty]: '20px' };
    styleRegistry.configureStyles(primaryTestSelector, initialRuleSet);

    effectiveStyleResult = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    assertDeepMatch(effectiveStyleResult[cssColorProperty], 'red', 'JSS-configured color property is effective.');
    assertDeepMatch(effectiveStyleResult[cssFontSizeProperty], '20px', 'JSS-configured font-size property is effective.');
    assertDeepMatch(effectiveStyleResult[cssDisplayProperty], 'none', 'External display property remains effective and is not overridden by JSS.');
});

executeTestSequence('purgeStyles only removes styles managed by the styleRegistry (full purge)', function() {
    const testElementId = 'jss-test';
    const dynamicElement = createAndAppendTestElement(testElementId, { [cssDisplayProperty]: 'none' }); // External style.

    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: 'red', [cssFontSizeProperty]: '20px' });
    let effectiveStylesBeforePurge = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    assertDeepMatch(effectiveStylesBeforePurge[cssColorProperty], 'red', 'Color property is present from registry before purge.');
    assertDeepMatch(effectiveStylesBeforePurge[cssFontSizeProperty], '20px', 'Font size property is present from registry before purge.');
    assertDeepMatch(effectiveStylesBeforePurge[cssDisplayProperty], 'none', 'Display property is present from external source.');

    styleRegistry.purgeStyles(); // Perform a full purge of all registered styles.

    // Type III: Verify that the internal registry for the selector is now empty.
    const registryStylesAfterPurge = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(Object.keys(registryStylesAfterPurge).length, 0, 'No JSS-managed styles for selector after full purge in registry.');

    // Re-gather effective styles to confirm that external styles persist and JSS styles are gone.
    effectiveStylesAfterPurge = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    assertDeepMatch(effectiveStylesAfterPurge[cssDisplayProperty], 'none', 'External display property remains after full purge.');
    // Assert that JSS-managed properties have reverted to their default computed values.
    const defaultComputedColor = extractComputedStyleValue(dynamicElement, cssColorProperty);
    assertDeepMatch(effectiveStylesAfterPurge[cssColorProperty], defaultComputedColor, 'Color property reverts to default after full purge.');
    const defaultComputedFontSize = extractComputedStyleValue(dynamicElement, cssFontSizeProperty);
    assertDeepMatch(effectiveStylesAfterPurge[cssFontSizeProperty], defaultComputedFontSize, 'Font size property reverts to default after full purge.');
});

executeTestSequence('calling purgeStyles with a selector only removes styles managed by the styleRegistry for that specific selector', function() {
    const testElementId = 'jss-test';
    const dynamicElement = createAndAppendTestElement(testElementId, { [cssDisplayProperty]: 'none' }); // External style.

    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: 'red', [cssFontSizeProperty]: '20px' });
    let effectiveStylesBeforeSpecificPurge = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    assertDeepMatch(effectiveStylesBeforeSpecificPurge[cssColorProperty], 'red', 'Color property is present from registry before specific purge.');

    styleRegistry.purgeStyles(primaryTestSelector); // Purge styles only for the primary selector.

    // Type III: Verify the internal registry for the specific selector is empty.
    const registryStylesAfterSpecificPurge = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(Object.keys(registryStylesAfterSpecificPurge).length, 0, 'No JSS-managed styles for specific selector after targeted purge in registry.');

    // Re-gather effective styles to confirm external styles remain and JSS styles are gone for this selector.
    let effectiveStylesAfterSpecificPurge = styleRegistry.gatherAllEffectiveStyles(primaryTestSelector);
    assertDeepMatch(effectiveStylesAfterSpecificPurge[cssDisplayProperty], 'none', 'External display property remains after specific purge.');
    const defaultComputedColor = extractComputedStyleValue(dynamicElement, cssColorProperty);
    assertDeepMatch(effectiveStylesAfterSpecificPurge[cssColorProperty], defaultComputedColor, 'Color property reverts to default after specific purge.');
});

executeTestSequence('calling purgeStyles with a selector only removes styles for that particular selector, leaving others untouched', function() {
    const specificColorValue = 'red';
    const alternativeColorValue = 'blue';

    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: specificColorValue });
    styleRegistry.configureStyles(alternativeElementIdentifier, { [cssColorProperty]: alternativeColorValue });

    const primaryElementRulesBeforePurge = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(primaryElementRulesBeforePurge[cssColorProperty], specificColorValue, 'Primary element color is red before purge.');

    const alternativeElementRulesBeforePurge = styleRegistry.retrieveConfiguredStyles(alternativeElementIdentifier);
    assertDeepMatch(alternativeElementRulesBeforePurge[cssColorProperty], alternativeColorValue, 'Alternative element color is blue before purge.');

    styleRegistry.purgeStyles(primaryTestSelector); // Purge only the primary selector's styles.

    const primaryElementRulesAfterPurge = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);
    assertDeepMatch(Object.keys(primaryElementRulesAfterPurge).length, 0, 'Primary element styles are cleared after targeted purge.');

    const alternativeElementRulesAfterPurge = styleRegistry.retrieveConfiguredStyles(alternativeElementIdentifier);
    assertDeepMatch(alternativeElementRulesAfterPurge[cssColorProperty], alternativeColorValue, 'Alternative element color remains blue after primary selector purge.');
});

executeTestSequence('configureStyles without !important modifier respects CSS specificity', function() {
    const primaryElementId = 'jss-test';
    const genericDivElementId = 'test-div-element';

    // Type III: Create test elements dynamically.
    const primaryElement = createAndAppendTestElement(primaryElementId);
    const genericDivElement = createAndAppendTestElement(genericDivElementId);

    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: 'blue' });
    styleRegistry.configureStyles('div', { [cssColorProperty]: 'red' }); // A less specific rule.

    // Verify computed style. The more specific ID selector should win.
    const computedPrimaryColor = extractComputedStyleValue(primaryElement, cssColorProperty);
    assertDeepMatch(computedPrimaryColor, 'rgb(0, 0, 255)', 'Element color should be blue due to higher specificity of ID selector.');
});

executeTestSequence('configureStyles with !important modifier overrides normal rules', function() {
    const primaryElementId = 'jss-test';
    const genericDivElementId = 'test-div-element';

    // Type III: Create test elements dynamically.
    const primaryElement = createAndAppendTestElement(primaryElementId);
    const genericDivElement = createAndAppendTestElement(genericDivElementId);

    styleRegistry.configureStyles(primaryTestSelector, { [cssBackgroundColorProperty]: 'blue' });
    styleRegistry.configureStyles('div', { [cssBackgroundColorProperty]: 'red !important' }); // Important rule for all divs.

    let computedPrimaryBgColor = extractComputedStyleValue(primaryElement, cssBackgroundColorProperty);
    assertDeepMatch(computedPrimaryBgColor, 'rgb(255, 0, 0)', 'Element background color should be red due to !important rule on generic div.');

    // Now, apply an !important rule specifically to the primary element.
    styleRegistry.configureStyles(primaryTestSelector, { [cssBackgroundColorProperty]: 'blue !important' });
    computedPrimaryBgColor = extractComputedStyleValue(primaryElement, cssBackgroundColorProperty);
    assertDeepMatch(computedPrimaryBgColor, 'rgb(0, 0, 255)', 'Element background color should now be blue due to !important on specific ID.');
});

executeTestSequence('configure a different style with !important modifier demonstrates precedence', function() {
    const primaryElementId = 'jss-test';
    const genericDivElementId = 'test-div-element';

    // Type III: Create test elements dynamically.
    const primaryElement = createAndAppendTestElement(primaryElementId);
    const genericDivElement = createAndAppendTestElement(genericDivElementId);

    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: 'blue' });
    styleRegistry.configureStyles('div', { [cssColorProperty]: 'red !important' });

    let computedPrimaryTextColor = extractComputedStyleValue(primaryElement, cssColorProperty);
    assertDeepMatch(computedPrimaryTextColor, 'rgb(255, 0, 0)', 'Element text color should be red (important div rule has precedence).');

    // Override with an even more specific !important rule.
    styleRegistry.configureStyles(primaryTestSelector, { [cssColorProperty]: 'blue !important' });
    computedPrimaryTextColor = extractComputedStyleValue(primaryElement, cssColorProperty);
    assertDeepMatch(computedPrimaryTextColor, 'rgb(0, 0, 255)', 'Element text color should be blue (important specific rule has precedence).');
});

executeTestSequence('subsequent calls to configureStyles that modify the same property will override previous settings', function() {
    const primaryElementId = 'jss-test';

    // Type III: Create test element dynamically.
    const primaryElement = createAndAppendTestElement(primaryElementId);

    styleRegistry.configureStyles(primaryTestSelector, { [cssBackgroundColorProperty]: 'red' });
    let computedBgColorFirst = extractComputedStyleValue(primaryElement, cssBackgroundColorProperty);
    assertDeepMatch(computedBgColorFirst, 'rgb(255, 0, 0)', 'Background color is red after initial configuration.');

    styleRegistry.configureStyles(primaryTestSelector, { [cssBackgroundColorProperty]: 'blue' });
    let computedBgColorSecond = extractComputedStyleValue(primaryElement, cssBackgroundColorProperty);
    assertDeepMatch(computedBgColorSecond, 'rgb(0, 0, 255)', 'Background color is blue after subsequent overriding configuration.');
});

executeTestSequence('configureStyles accepts properties in camelCase and internally converts them to kebab-case', function() {
    const camelCaseProperty = 'backgroundColor'; // Input property name.
    const kebabCaseProperty = 'background-color'; // Expected internal/output property name.

    styleRegistry.configureStyles(primaryTestSelector, { [camelCaseProperty]: 'green' });
    const configuredStyles = styleRegistry.retrieveConfiguredStyles(primaryTestSelector);

    // Type III: Verify the style is stored in kebab-case, not the original camelCase.
    assertDeepMatch(configuredStyles[kebabCaseProperty], 'green', 'CamelCase property was correctly converted and stored as kebab-case.');
    assertDeepMatch(configuredStyles[camelCaseProperty], undefined, 'Original camelCase property is not directly stored.');
});

// Type III: Add a global cleanup hook for the entire script execution environment.
window.addEventListener('beforeunload', () => {
    styleRegistry.purgeStyles(); // Ensure all styles are cleared even if tests don't run fully.
    console.log('Global environment cleanup: All styles purged on page unload.');
});