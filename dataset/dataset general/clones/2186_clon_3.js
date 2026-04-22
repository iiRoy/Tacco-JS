testSuite("Device Identifier Service Verification", function () {
    // This variable will hold the instantiated device detection service for each test.
    let currentDeviceService;

    /**
     * Helper function to configure the environment and load the device detection service.
     * It mocks the browser's navigator.userAgent property for consistent testing.
     * @param {string} userAgentString - The user agent string to set for the test.
     * @returns {void}
     */
    function setupServiceEnvironment(userAgentString) {
        // Ensure the user agent string is valid before proceeding.
        if (typeof userAgentString !== 'string') {
            console.warn("Invalid userAgentString provided to setupServiceEnvironment. Expected a string.");
            userAgentString = ''; // Default to empty string to prevent errors.
        }

        // Load the Angular module for device detection.
        loadAngularModule("ng.deviceDetector");

        // Inject the $window service to manipulate the navigator object.
        retrieveAngularService(["$window", function (browserWindowObject) {
            // Store the original navigator to restore it later if needed (though not strictly necessary in these tests).
            const originalNavigatorRef = browserWindowObject.navigator;

            // Create a new empty object for navigator to ensure clean state.
            browserWindowObject.navigator = {};

            // Conditionally set the prototype to mimic the original navigator's behavior,
            // but ensure we're not overwriting native read-only properties directly.
            // Using Object.setPrototypeOf is a more modern and robust way than __proto__.
            if (originalNavigatorRef && browserWindowObject.navigator !== originalNavigatorRef) {
                Object.setPrototypeOf(browserWindowObject.navigator, originalNavigatorRef);
            }

            // Define a getter for 'userAgent' property on the mocked navigator.
            // This ensures that the device detector service reads our provided UA string.
            Object.defineProperty(browserWindowObject.navigator, 'userAgent', {
                get: () => userAgentString,
                configurable: true // Allow redefining the property if needed.
            });

            // Optional: Log the user agent being set for debugging purposes.
            // console.log(`[DEBUG] User Agent set to: '${userAgentString}'`);
        }]);

        // Inject the actual deviceDetector service and assign it to our test variable.
        retrieveAngularService(["deviceDetector", function (injectedDetector) {
            currentDeviceService = injectedDetector;
        }]);
    }

    // Initial test case: Verify that the service can be loaded successfully.
    testCase("Service should be loadable", function () {
        setupServiceEnvironment(""); // Load with an empty user agent.
        expect(currentDeviceService).not.toBeNull();
        expect(typeof currentDeviceService).toBe("object");
    });

    // Test group for scenarios with an empty user agent string.
    testSuite("When user agent string is empty", function () {
        beforeTestRun(function () {
            setupServiceEnvironment("");
        });

        testCase("Should report an empty raw user agent", function () {
            expect(currentDeviceService.raw.userAgent).toBe("");
        });

        // Add a new validation: check if basic properties are 'unknown' or default for empty UA.
        testCase("Should default to 'unknown' for OS and browser", function () {
            expect(currentDeviceService.os).toBe("unknown");
            expect(currentDeviceService.browser).toBe("unknown");
        });
    });

    // Test group for scenarios with a simple, non-standard user agent string.
    testSuite("With a placeholder user agent", function () {
        beforeTestRun(function () {
            setupServiceEnvironment("some_generic_ua_string_here");
        });

        testCase("Should accurately reflect the provided raw user agent", function () {
            expect(currentDeviceService.raw.userAgent).toBe("some_generic_ua_string_here");
        });
    });

    // Main test group for various specific user agent strings.
    testSuite("Comprehensive User Agent String Tests", function () {

        /**
         * A reusable function to define a complete set of tests for a given user agent string.
         * This streamlines the test definition process.
         * @param {string} uaString - The user agent string to test.
         * @param {object} expectedProps - An object containing all expected properties for this UA.
         * @param {string} expectedProps.os - Expected operating system.
         * @param {string} expectedProps.os_version - Expected operating system version.
         * @param {string} expectedProps.browser - Expected browser name.
         * @param {string} expectedProps.browser_version - Expected browser version.
         * @param {string} expectedProps.device - Expected device type.
         * @param {boolean} expectedProps.isMobile - Expected mobile flag.
         * @param {boolean} expectedProps.isTablet - Expected tablet flag.
         * @param {boolean} expectedProps.isDesktop - Expected desktop flag.
         * @returns {void}
         */
        const defineUserAgentTestScenario = (uaString, expectedProps) => {
            // Validate input parameters with a guard clause.
            if (!uaString || typeof uaString !== 'string' || !expectedProps || typeof expectedProps !== 'object') {
                console.error(`Invalid parameters for defineUserAgentTestScenario. UA: ${uaString}, Props: ${JSON.stringify(expectedProps)}`);
                // Skip creating the test suite if parameters are invalid.
                return;
            }

            testSuite(`UA: ${uaString.substring(0, 70)}...`, function () {
                beforeTestRun(function () {
                    setupServiceEnvironment(uaString);
                });

                // A single test case to verify all properties for a given user agent.
                // This reduces boilerplate compared to separate 'it' blocks for each property.
                testCase("Should correctly identify all device properties", function () {
                    // Introduce a helper variable for clarity.
                    const detectedDetails = currentDeviceService;

                    expect(detectedDetails.os).toBe(expectedProps.os, `OS mismatch for ${uaString}`);
                    expect(detectedDetails.os_version).toBe(expectedProps.os_version, `OS Version mismatch for ${uaString}`);
                    expect(detectedDetails.browser).toBe(expectedProps.browser, `Browser mismatch for ${uaString}`);
                    expect(detectedDetails.browser_version).toBe(expectedProps.browser_version, `Browser Version mismatch for ${uaString}`);
                    expect(detectedDetails.device).toBe(expectedProps.device, `Device mismatch for ${uaString}`);
                    expect(detectedDetails.isMobile()).toBe(expectedProps.isMobile, `isMobile mismatch for ${uaString}`);
                    expect(detectedDetails.isTablet()).toBe(expectedProps.isTablet, `isTablet mismatch for ${uaString}`);
                    expect(detectedDetails.isDesktop()).toBe(expectedProps.isDesktop, `isDesktop mismatch for ${uaString}`);

                    // Add a new, non-essential assertion: check that raw.userAgent matches.
                    expect(detectedDetails.raw.userAgent).toBe(uaString, `Raw user agent should match input for ${uaString}`);
                });
            });
        };

        // --- Chrome User Agent Strings ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
            { os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1664.3 Safari/537.36",
            { os: "mac", os_version: "unknown", browser: "chrome", browser_version: "32.0.1664.3", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21",
            { os: "linux", os_version: "unknown", browser: "chrome", browser_version: "19.0.1042.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );

        // --- Firefox User Agent Strings ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0",
            { os: "windows", os_version: "windows-xp", browser: "firefox", browser_version: "31.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0",
            { os: "mac", os_version: "unknown", browser: "firefox", browser_version: "25.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0",
            { os: "linux", os_version: "unknown", browser: "firefox", browser_version: "24.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );

        // --- Safari User Agent Strings ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
            { os: "ios", os_version: "unknown", browser: "safari", browser_version: "6.0", device: "ipad", isMobile: true, isTablet: true, isDesktop: false }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
            { os: "mac", os_version: "unknown", browser: "safari", browser_version: "5.1.7", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (X11; U; Linux x86_64; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/531.2+",
            { os: "linux", os_version: "unknown", browser: "safari", browser_version: "5.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );

        // --- Issue #10 (Chrome on iPad) ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (iPad; CPU OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/38.0.2125.59 Mobile/12A405 Safari/600.1.4 (000767)",
            { os: "ios", os_version: "unknown", browser: "chrome", browser_version: "0", device: "ipad", isMobile: true, isTablet: true, isDesktop: false }
        );

        // --- Issue #14 (Windows Phone IE) ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)",
            { os: "windows-phone", os_version: "unknown", browser: "ie", browser_version: "9.0", device: "windows-phone", isMobile: true, isTablet: false, isDesktop: false }
        );

        // --- Issue #15 (Gaming Consoles) ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (PlayStation 4 1.52) AppleWebKit/536.26 (KHTML, like Gecko)",
            { os: "ps4", os_version: "unknown", browser: "ps4", browser_version: "0", device: "ps4", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Playstation Vita 1.61) AppleWebKit/531.22.8 (KHTML, like Gecko) Silk/3.2",
            { os: "vita", os_version: "unknown", browser: "vita", browser_version: "0", device: "vita", isMobile: true, isTablet: false, isDesktop: false }
        );

        // --- Issue #18 (Various Windows OS versions) ---
        // Grouping similar UAs to showcase different OS version detection.
        const windowsChromeUA = (osFragment) => `Mozilla/5.0 (${osFragment}; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36`;

        defineUserAgentTestScenario(windowsChromeUA("Win16"), { os: "windows", os_version: "windows-3-11", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 95"), { os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Win95"), { os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows_95"), { os: "windows", os_version: "windows-95", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Win 9x 4.90"), { os: "windows", os_version: "windows-me", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows ME"), { os: "windows", os_version: "windows-me", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 98"), { os: "windows", os_version: "windows-98", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Win98"), { os: "windows", os_version: "windows-98", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows CE"), { os: "windows", os_version: "windows-ce", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 5.0"), { os: "windows", os_version: "windows-2000", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 2000"), { os: "windows", os_version: "windows-2000", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 5.1"), { os: "windows", os_version: "windows-xp", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows XP"), { os: "windows", os_version: "windows-xp", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 5.2"), { os: "windows", os_version: "windows-server-2003", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 6.0"), { os: "windows", os_version: "windows-vista", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 6.1"), { os: "windows", os_version: "windows-7", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 7"), { os: "windows", os_version: "windows-7", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 6.3"), { os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 8.1"), { os: "windows", os_version: "windows-8-1", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 6.2"), { os: "windows", os_version: "windows-8", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows 8"), { os: "windows", os_version: "windows-8", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT 4.0"), { os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("WinNT4.0"), { os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("WinNT"), { os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsChromeUA("Windows NT"), { os: "windows", os_version: "windows-nt-4-0", browser: "chrome", browser_version: "37.0.2049.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });

        // Older IE versions on Windows NT 4.0
        const windowsIEUA = (ieVersion) => `Mozilla/4.0 (compatible; MSIE ${ieVersion}; Windows NT 4.0)`;
        defineUserAgentTestScenario(windowsIEUA("6.0"), { os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "6.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsIEUA("6.0b"), { os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "6.0b", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsIEUA("7.0"), { os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "7.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsIEUA("10.0"), { os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "10.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });
        defineUserAgentTestScenario(windowsIEUA("11"), { os: "windows", os_version: "windows-nt-4-0", browser: "ie", browser_version: "11", device: "unknown", isMobile: false, isTablet: false, isDesktop: true });

        // --- Issue 21 (IE 11 on modern Windows) ---
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko",
            { os: "windows", os_version: "windows-8-1", browser: "ie", browser_version: "11.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; rv:11.0) like Gecko",
            { os: "windows", os_version: "windows-7", browser: "ie", browser_version: "11.0", device: "unknown", isMobile: false, isTablet: false, isDesktop: true }
        );

        // Add a new, slightly different test case that wasn't in the original.
        // Example: Android Phone Chrome
        defineUserAgentTestScenario(
            "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36",
            { os: "android", os_version: "android-10", browser: "chrome", browser_version: "91.0.4472.114", device: "android", isMobile: true, isTablet: false, isDesktop: false }
        );
    });

    // Renamed `module` to `loadAngularModule` for Type II change.
    // Renamed `inject` to `retrieveAngularService` for Type II change.
    // These functions would typically be provided by a testing framework like Jasmine/Mocha.
    // Assuming they are globally available or imported.
    function loadAngularModule(moduleName) {
        // This is a placeholder for the actual `module` function from Angular testing utilities.
        // In a real scenario, this would call `angular.mock.module(moduleName);`
        // For the purpose of cloning, we assume its existence.
        if (typeof module !== 'undefined' && typeof module === 'function') {
            module(moduleName);
        } else {
            console.error(`'module' function not found. Cannot load Angular module '${moduleName}'.`);
        }
    }

    function retrieveAngularService(dependencies) {
        // This is a placeholder for the actual `inject` function from Angular testing utilities.
        // In a real scenario, this would call `angular.mock.inject(dependencies);`
        // For the purpose of cloning, we assume its existence.
        if (typeof inject !== 'undefined' && typeof inject === 'function') {
            inject(dependencies);
        } else {
            console.error(`'inject' function not found. Cannot retrieve Angular service for '${dependencies}'.`);
            // Attempt to call the function directly if it's the last dependency, simulating inject behavior.
            if (Array.isArray(dependencies) && typeof dependencies[dependencies.length - 1] === 'function') {
                dependencies[dependencies.length - 1]({}); // Pass an empty object as a mock $window or other service.
            }
        }
    }

    // Renamed `describe` to `testSuite` and `it` to `testCase` for Type II change.
    // Renamed `beforeEach` to `beforeTestRun` for Type II change.
    // Assuming these are globally available from a test framework.
    const testSuite = typeof describe !== 'undefined' ? describe : (name, fn) => {
        console.log(`Simulating testSuite: ${name}`);
        fn();
    };
    const testCase = typeof it !== 'undefined' ? it : (name, fn) => {
        console.log(`Simulating testCase: ${name}`);
        try {
            fn();
            console.log(`  ✓ ${name}`);
        } catch (e) {
            console.error(`  ✗ ${name} - ${e.message}`);
        }
    };
    const beforeTestRun = typeof beforeEach !== 'undefined' ? beforeEach : (fn) => {
        console.log("Simulating beforeEach setup...");
        fn();
    };
    const expect = typeof expect !== 'undefined' ? expect : (value) => ({
        toBe: (expected, message = "") => {
            if (value !== expected) {
                throw new Error(`Expected ${JSON.stringify(value)} to be ${JSON.stringify(expected)}. ${message}`);
            }
        },
        not: {
            toBeNull: (message = "") => {
                if (value === null) {
                    throw new Error(`Expected ${JSON.stringify(value)} not to be null. ${message}`);
                }
            }
        },
        toBeNull: (message = "") => {
            if (value !== null) {
                throw new Error(`Expected ${JSON.stringify(value)} to be null. ${message}`);
            }
        }
        // Add more basic expect matchers as needed for simulation if actual framework is absent.
    });
});