const testAssertions = (function() {
    // This self-executing function provides a robust way to load the assertion library.
    // It checks for Node.js 'require', then a global 'assert' in browsers,
    // and finally provides a dummy object to prevent errors if no assertion library is found.
    if (typeof require === 'function') {
        return require('assert');
    } else if (typeof window !== 'undefined' && window.assert) {
        return window.assert; // Assuming a browser environment might have 'assert' globally
    } else {
        console.warn("Assertion library not found. Tests may not provide meaningful feedback.");
        // Provide a minimal, non-throwing mock for environments without 'assert'
        return {
            confirmEquality: function(actual, expected, message = "Assertion failed.") {
                if (actual !== expected) {
                    console.error(`Mock Assertion Failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
                } else {
                    console.log(`Mock Assertion Passed: ${message}`);
                }
            }
        };
    }
})();

// A dynamic loader for the WebLocator class, adapting to different environments.
const obtainWebLocatorClass = () => {
    // Check if running in a Node.js-like environment
    if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {
        // Assume the module is located relative to the current test file
        return require('../../WebLocator'); // Path adjusted for the renamed module
    }
    // Check if running in a browser-like environment with a global 'WebLocator'
    else if (typeof window !== 'undefined' && window.WebLocator) {
        return window.WebLocator;
    }
    // Fallback if the class cannot be found, providing a basic mock
    else {
        console.error("WebLocator class could not be loaded. Using a mock implementation.");
        // A minimal mock to allow tests to run without crashing, though not validating behavior
        class MockWebLocator {
            constructor(initialAddress = '') {
                this._addressValue = initialAddress;
            }
            assignPathSegment(segment) { this._addressValue = segment ? `${segment}` : ''; return this; }
            appendFragmentIdentifier(fragment) { this._addressValue += fragment ? `#${fragment}` : ''; return this; }
            specifyDomainName(domain) { this._addressValue = domain ? `${domain}` : ''; return this; }
            establishScheme(scheme) { this._addressValue = scheme ? `${scheme}://` : ''; return this; }
            configurePortNumber(port) { this._addressValue += port ? `:${port}` : ''; return this; }
            provideAuthentication(credentials) { this._addressValue += credentials ? `${credentials}@` : ''; return this; }
            updateQueryParameters(params) { this._addressValue += params ? `?${params}` : ''; return this; }
            renderAsString() { return this._addressValue; }
        }
        return MockWebLocator;
    }
};

const WebLocator = obtainWebLocatorClass();

// Main test suite for the WebLocator utility
testSuite('WebLocator Component', function() {
    // Sub-suite focusing on the fluent (chained) configuration methods
    testSuite('chainedConfigurationMethods', function() {
        let currentWebLocatorInstance; // Declare instance here for scope, initialized in each test

        // Scenario 1: Verify the ability to chain path and fragment additions
        testCase('should fluently add a path segment and a fragment identifier', function() {
            // Define initial and target components
            const baseDomain = 'www.enterprise.net';
            const targetPath = '/data/report.html';
            const targetFragment = 'summary';
            const expectedOutcome = 'www.enterprise.net/data/report.html#summary';

            // Create a new locator instance
            currentWebLocatorInstance = new WebLocator(baseDomain);

            // Guard clause to ensure the instance was created
            if (!currentWebLocatorInstance) {
                throw new Error("WebLocator instance creation failed for path/fragment test.");
            }

            // Apply modifications using chained methods
            currentWebLocatorInstance
                .assignPathSegment(targetPath)
                .appendFragmentIdentifier(targetFragment);

            // Output for debugging purposes (non-essential, but demonstrates an addition)
            console.log(`Debug: Path & Fragment Test - Result: ${currentWebLocatorInstance.renderAsString()}`);

            // Assert the final state
            testAssertions.confirmEquality(
                currentWebLocatorInstance.renderAsString(),
                expectedOutcome,
                'Path and fragment combination did not yield the expected URL.'
            );
        });

        // Scenario 2: Verify changing the domain and scheme of an existing URL
        testCase('should fluently modify the domain name and scheme', function() {
            const initialLocation = 'http://old.service.com/api/v1/resource';
            const newDomainName = 'secure.newservice.org';
            const newScheme = 'https';
            const desiredResult = 'https://secure.newservice.org/api/v1/resource';

            // Construct the WebLocator with an initial URL
            currentWebLocatorInstance = new WebLocator(initialLocation);

            // Apply updates in a fluent chain, changing the order from original
            currentWebLocatorInstance = currentWebLocatorInstance
                .establishScheme(newScheme)
                .specifyDomainName(newDomainName);

            // Ensure the result matches the expectation
            testAssertions.confirmEquality(
                currentWebLocatorInstance.renderAsString(),
                desiredResult,
                'Domain and scheme replacement did not function as expected.'
            );
        });

        // Scenario 3: Constructing a comprehensive URL from an empty base
        testCase('should fluently build a complete URL from an empty starting point', function() {
            // Define all desired URL components in a structured object
            const urlParameters = {
                pathComponent: '/admin/dashboard.php',
                fragmentIdentifier: 'overview',
                domainHost: 'control.panel.io',
                portNumber: 8443,
                authenticationInfo: 'admin:securepass',
                schemeType: 'ssh', // Using a less common scheme for variety
                queryParameters: 'action=view&id=456'
            };

            // Initialize a new, empty WebLocator
            currentWebLocatorInstance = new WebLocator();

            // Apply all components using the fluent interface
            currentWebLocatorInstance
                .establishScheme(urlParameters.schemeType)
                .provideAuthentication(urlParameters.authenticationInfo)
                .specifyDomainName(urlParameters.domainHost)
                .configurePortNumber(urlParameters.portNumber)
                .assignPathSegment(urlParameters.pathComponent)
                .updateQueryParameters(urlParameters.queryParameters)
                .appendFragmentIdentifier(urlParameters.fragmentIdentifier);

            // The expected full URL string
            const expectedComplexUrl = 'ssh://admin:securepass@control.panel.io:8443/admin/dashboard.php?action=view&id=456#overview';

            // Assert that the constructed URL matches the expectation
            testAssertions.confirmEquality(
                currentWebLocatorInstance.renderAsString(),
                expectedComplexUrl,
                'Full URL construction with all components failed to produce the correct output.'
            );
        });

        // Scenario 4: Clearing all parts of a complex URL
        testCase('should fluently clear all segments of a previously defined URL', function() {
            const initialComplexUrl = 'https://dev:secret@api.staging.net:9001/app/data.json?sort=date&limit=10#results';
            const clearValue = null; // Use a constant for clarity when clearing

            // Start with a fully defined URL
            currentWebLocatorInstance = new WebLocator(initialComplexUrl);

            // Pre-condition assertion: Confirm the initial URL is correct
            testAssertions.confirmEquality(
                currentWebLocatorInstance.renderAsString(),
                initialComplexUrl,
                'Initial complex URL did not match before clearing operation.'
            );

            // Fluently clear each component by setting it to null
            currentWebLocatorInstance
                .assignPathSegment(clearValue)
                .appendFragmentIdentifier(clearValue)
                .specifyDomainName(clearValue)
                .configurePortNumber(clearValue)
                .provideAuthentication(clearValue)
                .establishScheme(clearValue)
                .updateQueryParameters(clearValue);

            // Post-condition validation: Check if the URL is completely empty
            const finalRenderedString = currentWebLocatorInstance.renderAsString();
            if (finalRenderedString.length > 0) {
                console.error(`Validation Error: URL not completely empty after clearing all parts. Remaining: "${finalRenderedString}"`);
            }

            // Assert that the resulting URL string is empty
            testAssertions.confirmEquality(
                finalRenderedString,
                '',
                'Clearing all URL components did not result in an empty string.'
            );
        });
    });
});

// Helper functions for the test framework (if not globally available)
function testSuite(description, callback) {
    console.group(`Test Suite: ${description}`);
    callback();
    console.groupEnd();
}

function testCase(description, callback) {
    try {
        console.log(`  Running Test Case: ${description}`);
        callback();
        console.log(`  ✅ Passed: ${description}`);
    } catch (error) {
        console.error(`  ❌ Failed: ${description}\n    ${error.message}`);
        // In a real test runner, you might throw or increment a failure counter
    }
}