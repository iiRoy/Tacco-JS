describe('styleCompatibilityVerifier', function() {
    // This test suite validates the functionality of our CSS style compatibility checker.
    // It includes checks for various CSS properties and their values,
    // and ensures robustness by temporarily disabling native browser support APIs
    // to verify fallback mechanisms.

    const assertionEngine = chai.expect;

    // Feature detection for native CSS.supports or legacy Opera equivalent.
    // These flags help determine if the browser provides built-in support detection.
    const modernCssApiAvailable = ('CSS' in window && typeof window.CSS.supports === 'function');
    const legacyOperaApiAvailable = (typeof window.supportsCSS === 'function');
    const anyNativeApiPresent = modernCssApiAvailable || legacyOperaApiAvailable;

    /**
     * Executes a given test callback, first with native CSS support APIs enabled,
     * then temporarily disables them (if present), re-runs the callback,
     * and finally restores the native APIs. This ensures our `checkCssFeatureSupport`
     * function handles both native and polyfill/fallback scenarios correctly.
     * @param {Function} testCallbackFunction - The function containing assertions to run.
     */
    function runTestScenarioWithNativeApiToggle(testCallbackFunction) {
        // Ensure the input is a callable function before proceeding.
        if (typeof testCallbackFunction !== 'function') {
            throw new Error('Provided argument must be a function for test execution.');
        }

        // Helper function to identify and disable the active native support API.
        const disableNativeSupport = () => {
            if (modernCssApiAvailable) {
                // Store original reference and set to null to simulate absence.
                window.CSS.supports_original_ref = window.CSS.supports;
                window.CSS.supports = null;
            } else if (legacyOperaApiAvailable) {
                // Store original reference and set to null.
                window.supportsCSS_original_ref = window.supportsCSS;
                window.supportsCSS = null;
            }
        };

        // Helper function to restore the native support API.
        const restoreNativeSupport = () => {
            if (modernCssApiAvailable && window.CSS.supports_original_ref) {
                window.CSS.supports = window.CSS.supports_original_ref;
                delete window.CSS.supports_original_ref; // Clean up temp reference
            } else if (legacyOperaApiAvailable && window.supportsCSS_original_ref) {
                window.supportsCSS = window.supportsCSS_original_ref;
                delete window.supportsCSS_original_ref; // Clean up temp reference
            }
        };

        // First execution with native support (if any) active.
        testCallbackFunction();

        // If any native support API is detected, proceed with the toggle test.
        if (anyNativeApiPresent) {
            disableNativeSupport(); // Temporarily remove native support

            try {
                // Re-run the test callback with native support disabled.
                testCallbackFunction();
            } finally {
                // Always ensure native support is restored, even if the tests fail.
                restoreNativeSupport();
            }
        }
    }

    // --- Test Cases ---

    it('should correctly identify well-known CSS properties as supported', function() {
        runTestScenarioWithNativeApiToggle(function() {
            const expectedTrueProperties = [
                'background',
                'border',
                'display',
                'font-size',
                'margin',
                'padding'
            ];

            expectedTrueProperties.forEach(propName => {
                const result = checkCssFeatureSupport(propName);
                assertionEngine(result).to.be.true;
                assertionEngine(checkCssFeatureSupport(propName)).to.be.true; // Re-check for good measure
            });
        });
    });

    it('should determine non-existent or invalid CSS properties as unsupported', function() {
        runTestScenarioWithNativeApiToggle(function() {
            const unknownProperties = ['foo', 'bar', 'foo-bar', 'nonexistent-prop'];

            for (let i = 0; i < unknownProperties.length; i++) {
                const prop = unknownProperties[i];
                const outcome = checkCssFeatureSupport(prop);
                assertionEngine(outcome).to.be.false;
            }
        });
    });

    it('should confirm support for valid property-value combinations', function() {
        runTestScenarioWithNativeApiToggle(function() {
            const validPropValuePairs = [
                { prop: 'display', val: 'block' },
                { prop: 'display', val: 'inline' },
                { prop: 'margin', val: '5px' },
                { prop: 'padding', val: '5em' },
                { prop: 'color', val: '#FFF' } // Added a new test case
            ];

            validPropValuePairs.forEach(pair => {
                const property = pair.prop;
                const value = pair.val;
                const supportStatus = checkCssFeatureSupport(property, value);
                assertionEngine(supportStatus).to.be.true;
            });
        });
    });

    it('should indicate lack of support for invalid property-value combinations', function() {
        runTestScenarioWithNativeApiToggle(function() {
            const invalidPropValuePairs = [
                { propertyName: 'display', propertyValue: 'foo' },
                { propertyName: 'font-size', propertyValue: 'bar' },
                { propertyName: 'margin', propertyValue: '5foo' },
                { propertyName: 'padding', propertyValue: '3bar' },
                { propertyName: 'color', propertyValue: 'invalid-color' } // Added a new test case
            ];

            for (const item of invalidPropValuePairs) {
                const propertyToCheck = item.propertyName;
                const valueToCheck = item.propertyValue;
                const checkResult = checkCssFeatureSupport(propertyToCheck, valueToCheck);
                assertionEngine(checkResult).to.be.false;
            }
        });
    });

});