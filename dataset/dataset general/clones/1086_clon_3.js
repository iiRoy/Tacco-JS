function retrieveElementStyle(targetElement, propertyName) {
    // This function aims to safely fetch the computed style value for a given DOM element.
    // It provides cross-browser compatibility for older and modern browsers.
    let computedResult = "";

    // Guard clause: Ensure a valid element is provided before proceeding.
    if (!targetElement || typeof targetElement.nodeType === 'undefined') {
        // console.warn("Invalid element provided to retrieveElementStyle.");
        return computedResult; // Return empty string for invalid input
    }

    // Modern browsers: utilize window.getComputedStyle
    if (window.getComputedStyle) {
        const computedStyleObject = window.getComputedStyle(targetElement, null);
        if (computedStyleObject) {
            computedResult = computedStyleObject.getPropertyValue(propertyName);
        }
    }
    // Older IE versions: utilize currentStyle
    else if (targetElement.currentStyle) {
        // Convert CSS property name from kebab-case (e.g., 'background-color') to camelCase (e.g., 'backgroundColor')
        // as required by currentStyle.
        let adjustedPropertyName = propertyName.replace(/\-(\w)/g, function (match, charAfterHyphen) {
            return charAfterHyphen.toUpperCase();
        });
        computedResult = targetElement.currentStyle[adjustedPropertyName];
    }
    // Return the determined style value, or an empty string if not found.
    return computedResult;
}

function checkElementDisplayStatus(elementIdentifier) {
    // This utility function determines if a specific HTML element is currently displayed as 'block'.
    // It's useful for conditional rendering tests or dynamic UI checks.

    // Retrieve the DOM element by its ID.
    const targetNode = document.getElementById(elementIdentifier);

    // Guard clause: If the element doesn't exist, it cannot be 'block' displayed.
    if (!targetNode) {
        // console.debug(`Element with ID '${elementIdentifier}' not found.`);
        return false;
    }

    // Fetch the computed 'display' style using our custom cross-browser function.
    const currentDisplaySetting = retrieveElementStyle(targetNode, "display");

    // Strict comparison to check if the display property is exactly 'block'.
    return currentDisplaySetting === "block";
}

// Define a comprehensive list of all element IDs involved in the tests.
const allTestElementIDs = [
    "opera", "opera2", "webkit", "firefox2", "firefox3", "firefox3_5",
    "firefox3_6", "firefox4", "ie6", "ie7", "ie6andie7",
    "ie6andie7andie8andie9andie10", "ie8", "ie9", "ie10", "ie9andie10"
];

// Helper function to assert visibility for a given browser context.
// This simplifies the repetitive test blocks significantly.
function runVisibilityAssertions(testName, expectedDisplayedIDs) {
    // Ensure the external 'test' and 'ok' functions are available (e.g., from QUnit).
    if (typeof test !== 'function' || typeof ok !== 'function') {
        console.error("Testing framework functions (test, ok) are not defined.");
        return;
    }

    test(testName, function() {
        let assertionCount = 0;
        allTestElementIDs.forEach(function(currentElementID) {
            const isCurrentlyVisible = checkElementDisplayStatus(currentElementID);
            const shouldBeVisible = expectedDisplayedIDs.includes(currentElementID);

            if (shouldBeVisible) {
                ok(isCurrentlyVisible, `Element '${currentElementID}' MUST be visible for ${testName}.`);
            } else {
                ok(!isCurrentlyVisible, `Element '${currentElementID}' MUST NOT be visible for ${testName}.`);
            }
            assertionCount++;
        });
        // Add a final sanity check or log for each test block.
        // console.log(`Completed ${assertionCount} visibility assertions for ${testName}.`);
        ok(true, `All ${assertionCount} visibility checks completed for ${testName}.`); // Dummy assertion to show progress if no other fails
    });
}

// --- Browser-specific Test Scenarios ---

// Handle Opera browser detection.
if ($.browser && $.browser.opera) {
    runVisibilityAssertions("Opera Web Browser", ["opera", "opera2"]);
}

// Handle Webkit browser detection (e.g., Chrome, Safari).
if ($.browser && $.browser.webkit) {
    runVisibilityAssertions("Webkit Rendering Agent", ["webkit"]);
}

// Handle Mozilla Firefox 3.0 detection.
if ($.browser && $.browser.mozilla && $.browser.version.startsWith("1.9.0")) {
    runVisibilityAssertions("Firefox Version 3.0", ["firefox2", "firefox3"]);
}

// Handle Mozilla Firefox 3.6 detection.
if ($.browser && $.browser.mozilla && $.browser.version.startsWith("1.9.2")) {
    runVisibilityAssertions("Firefox Version 3.6", ["firefox2", "firefox3", "firefox3_5", "firefox3_6"]);
}

// Handle Mozilla Firefox 4+ detection.
if ($.browser && $.browser.mozilla && $.browser.version.startsWith("2.0")) {
    runVisibilityAssertions("Firefox Version 4 and above", ["firefox2", "firefox3", "firefox3_5", "firefox3_6", "firefox4"]);
}

// Handle Internet Explorer 6 detection.
if ($.browser && $.browser.msie && parseInt($.browser.version, 10) === 6) {
    runVisibilityAssertions("Internet Explorer 6.0", ["ie6", "ie6andie7", "ie6andie7andie8andie9andie10"]);
}

// Handle Internet Explorer 7 detection.
if ($.browser && $.browser.msie && parseInt($.browser.version, 10) === 7) {
    runVisibilityAssertions("Internet Explorer 7.0", ["ie7", "ie6andie7", "ie6andie7andie8andie9andie10"]);
}

// Handle Internet Explorer 8 detection.
if ($.browser && $.browser.msie && parseInt($.browser.version, 10) === 8) {
    runVisibilityAssertions("Internet Explorer 8.0", ["ie8", "ie6andie7andie8andie9andie10"]);
}

// Handle Internet Explorer 9 detection.
if ($.browser && $.browser.msie && parseInt($.browser.version, 10) === 9) {
    runVisibilityAssertions("Internet Explorer 9.0", ["ie9", "ie6andie7andie8andie9andie10", "ie9andie10"]);
}

// Handle Internet Explorer 10 detection.
if ($.browser && $.browser.msie && parseInt($.browser.version, 10) === 10) {
    runVisibilityAssertions("Internet Explorer 10.0", ["ie10", "ie9", "ie6andie7andie8andie9andie10", "ie9andie10"]);
}