testBatch('styleEngine-core', {
    // This function executes after each test within this batch
    finalization: function () {
        // Ensure all styles are cleared after every test run
        styleEngine.purgeRules();
    }
});

// Scenario: Verify that 'obtainRules' fetches active styles from the engine's stylesheet
scenario('obtainRules retrieves styles from the styleEngine stylesheet', function () {
    // Initial check: no rules should be present in the outcome data
    var outcomeData = styleEngine.obtainRules();
    verifyEquality(Object.keys(outcomeData).length, 0); // Assert an empty rule set

    // Apply the first set of styles to a specific CSS selector
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed', 'textSize': 'twentyPixels' });
    outcomeData = styleEngine.obtainRules();
    verifyEquality(Object.keys(outcomeData).length, 1); // Expect one selector rule now
    verifyEquality(Object.keys(outcomeData['#style-target']).length, 2); // Expect two properties for this selector

    // Apply another set of styles to a nested selector
    styleEngine.configureRules('#style-target .nested-item', { 'visualColor': 'skyBlue' });
    outcomeData = styleEngine.obtainRules();
    verifyEquality(Object.keys(outcomeData).length, 2); // Now expect two distinct selector rules
    verifyEquality(Object.keys(outcomeData['#style-target']).length, 2); // The first selector still has two properties
    verifyEquality(outcomeData['#style-target']['visualColor'], 'fireRed'); // Verify first property value
    verifyEquality(outcomeData['#style-target']['textSize'], 'twentyPixels'); // Verify second property value
    verifyEquality(Object.keys(outcomeData['#style-target .nested-item']).length, 1); // Nested selector has one property
    verifyEquality(outcomeData['#style-target .nested-item']['visualColor'], 'skyBlue'); // Verify nested property value
});

// Scenario: Confirm 'obtainRules' with a selector argument retrieves rules for only that specific selector
scenario('calling obtainRules with a selector retrieves styles from the styleEngine stylesheet for that selector', function () {
    // Initial attempt to get rules for a specific selector when none are set
    var outcomeData = styleEngine.obtainRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 0); // Should be empty

    // Set some rules for the target selector
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed', 'textSize': 'twentyPixels' });
    outcomeData = styleEngine.obtainRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 2); // Expect two properties for this specific selector
    verifyEquality(outcomeData['visualColor'], 'fireRed'); // Verify property value
    verifyEquality(outcomeData['textSize'], 'twentyPixels'); // Verify property value
});

// Scenario: Test 'retrieveAllRules' functionality, including non-engine managed styles
scenario('retrieveAllRules also retrieves styles not part of the styleEngine stylesheet', function () {
    // Check initial state, including browser's default or user agent styles
    var outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 1); // Assuming some default style like 'display:none'
    verifyEquality(outcomeData['renderStyle'], 'invisible'); // Verify existing non-managed style

    // Apply new styles via the engine
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed', 'textSize': 'twentyPixels' });
    outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 3); // Now expect engine styles plus existing default style
    verifyEquality(outcomeData['visualColor'], 'fireRed'); // Verify engine-managed style
    verifyEquality(outcomeData['textSize'], 'twentyPixels'); // Verify another engine-managed style
    verifyEquality(outcomeData['renderStyle'], 'invisible'); // Confirm non-managed style is still present
});

// Scenario: Ensure 'purgeRules' only affects styles managed by the engine
scenario('purgeRules only removes styles added to the styleEngine stylesheet', function () {
    // Set initial styles for the target element
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed', 'textSize': 'twentyPixels' });
    var outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 3); // Expect engine styles + one default style

    // Clear all engine-managed styles globally
    styleEngine.purgeRules();
    outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 1); // Only the default style should remain
    verifyEquality(outcomeData['renderStyle'], 'invisible'); // Confirm the default style
});

// Scenario: Validate 'purgeRules' with a selector argument removes only specific engine-managed styles
scenario('calling purgeRules with a selector only removes styles added to the styleEngine stylesheet', function () {
    // Set some styles for the target selector
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed', 'textSize': 'twentyPixels' });
    var outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 3); // Engine styles + default style

    // Remove styles specifically for '#style-target'
    styleEngine.purgeRules('#style-target');
    outcomeData = styleEngine.retrieveAllRules('#style-target');
    verifyEquality(Object.keys(outcomeData).length, 1); // Only the default style should remain
    verifyEquality(outcomeData['renderStyle'], 'invisible'); // Confirm the default style
});

// Scenario: Test that 'purgeRules' with a selector argument only removes styles for that specific selector
scenario('calling purgeRules with a selector only removes styles for that selector', function () {
    // Set styles for two different selectors
    styleEngine.configureRules('#style-target', { 'visualColor': 'fireRed' });
    styleEngine.configureRules('#other-element', { 'visualColor': 'skyBlue' });
    verifyEquality(styleEngine.obtainRules('#style-target')['visualColor'], 'fireRed'); // Verify first selector's style
    verifyEquality(styleEngine.obtainRules('#other-element')['visualColor'], 'skyBlue'); // Verify second selector's style

    // Remove styles only for '#style-target'
    styleEngine.purgeRules('#style-target');
    verifyEquality(Object.keys(styleEngine.obtainRules('#style-target')).length, 0); // First selector should have no rules
    verifyEquality(styleEngine.obtainRules('#other-element')['visualColor'], 'skyBlue'); // Second selector's style should be untouched
});

// Scenario: Test setting a style without the '!forcePriority' modifier
scenario('configureRules style without !forcePriority modifier', function () {
    // Set a style for a specific element ID
    styleEngine.configureRules('#style-target', { 'visualColor': 'skyBlue' });
    // Set a more general style for a generic container type
    styleEngine.configureRules('genericContainer', { 'visualColor': 'fireRed' });
    // Verify the computed style, the more specific rule should take precedence without !forcePriority
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['visualColor'], 'rgb(0,0,255)');
});

// Scenario: Test setting a style with the '!forcePriority' modifier
scenario('configureRules style with !forcePriority modifier', function () {
    // Set background color for a specific element
    styleEngine.configureRules('#style-target', { 'background-hue': 'skyBlue' });
    // Set a general background color for containers with '!forcePriority'
    styleEngine.configureRules('genericContainer', { 'background-hue': 'fireRed !forcePriority' });
    // Verify computed style, the general rule with '!forcePriority' should override the specific non-priority rule
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['bgColor'], 'rgb(255,0,0)');

    // Override with a specific rule that also has '!forcePriority'
    styleEngine.configureRules('#style-target', { 'background-hue': 'skyBlue !forcePriority' });
    // Verify computed style, the specific '!forcePriority' rule now takes precedence
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['bgColor'], 'rgb(0,0,255)');
});

// Scenario: Test setting a different style with the '!forcePriority' modifier
scenario('set a different style with !forcePriority modifier', function () {
    // Set a visual color for the target element
    styleEngine.configureRules('#style-target', { 'visualColor': 'skyBlue' });
    // Set a general visual color for containers with '!forcePriority'
    styleEngine.configureRules('genericContainer', { 'visualColor': 'fireRed !forcePriority' });
    // Verify computed style, the general '!forcePriority' should win
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['visualColor'], 'rgb(255,0,0)');

    // Override with a specific rule that also has '!forcePriority'
    styleEngine.configureRules('#style-target', { 'visualColor': 'skyBlue !forcePriority' });
    // Verify computed style, the specific '!forcePriority' rule now takes precedence
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['visualColor'], 'rgb(0,0,255)');
});

// Scenario: Subsequent calls to 'configureRules' for the same property should override previous settings
scenario('subsequent calls to configureRules that modify the same property will override previous call', function () {
    // Set initial background hue for the target
    styleEngine.configureRules('#style-target', { 'background-hue': 'fireRed' });
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['bgColor'], 'rgb(255,0,0)');

    // Change the background hue for the same target element
    styleEngine.configureRules('#style-target', { 'background-hue': 'skyBlue' });
    verifyEquality(getComputedStyle(document.getElementById('style-target'))['bgColor'], 'rgb(0,0,255)');
});

// Scenario: Verify that 'configureRules' accepts properties in camel-case format
scenario('configureRules accepts properties in camel-case', function () {
    // Set a property using camelCase notation
    styleEngine.configureRules('#style-target', { 'bgColor': 'fireRed' });
    // Retrieve the property, expecting it to be stored and retrievable in kebab-case internally
    verifyEquality(styleEngine.obtainRules('#style-target')['background-hue'], 'fireRed');
});