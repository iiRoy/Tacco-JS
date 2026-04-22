(function() {
    // --- Global Test Environment Setup ---
    // This section defines a basic feature detection utility and
    // abstracts the QUnit framework for more flexible testing.

    /**
     * @namespace FeatureDetect
     * Provides capabilities to check for browser features.
     */
    const FeatureDetect = {
        /**
         * Checks if the HTML5 Canvas API is supported by the current browser.
         * @returns {boolean} True if Canvas is supported, false otherwise.
         */
        hasCanvas: (function() {
            try {
                const tempCanvasElement = document.createElement('canvas');
                // Verify both the element creation and the ability to get a 2D rendering context.
                return !!(tempCanvasElement.getContext && tempCanvasElement.getContext('2d'));
            } catch (e) {
                // Log any errors during feature detection for debugging.
                console.error("Canvas feature detection encountered an error:", e);
                return false; // Assume no support if an error occurs.
            }
        })()
    };

    /**
     * @namespace QTest
     * An abstraction layer over QUnit for test organization.
     * This allows for renaming test constructs (modules, tests, assertions)
     * without directly modifying QUnit calls.
     */
    const QTest = window.QTest || {};
    if (!window.QTest) {
        window.QTest = QTest;
        /** Registers a new module (group) of tests. */
        QTest.group = function(groupName, options) {
            QUnit.module(groupName, options);
        };
        /** Defines a standard synchronous test scenario. */
        QTest.scenario = function(scenarioName, testCallback) {
            QUnit.test(scenarioName, testCallback);
        };
        /** Defines an asynchronous test scenario, requiring manual start/stop. */
        QTest.deferredScenario = function(scenarioName, testCallback) {
            QUnit.asyncTest(scenarioName, testCallback);
        };
        /** Pauses the QUnit test runner. */
        QTest.pause = function() { QUnit.stop(); };
        /** Resumes the QUnit test runner. */
        QTest.resume = function() { QUnit.start(); };
    }

    // Reference to global jQuery object for consistency.
    const jQueryObj = window.jQuery;

    // Helper for scheduling delayed execution, replacing direct setTimeout calls.
    function scheduleDelayedExecution(actionFunction, delayMillis) {
        // Added a guard clause for robustness.
        if (typeof actionFunction !== 'function') {
            console.error("scheduleDelayedExecution: Provided callback is not a function.");
            return;
        }
        setTimeout(actionFunction, delayMillis);
    }

    // --- Main Test Suite Execution ---

    // Only proceed with visual tests if Canvas is supported.
    if (FeatureDetect.hasCanvas) {
        console.info("Canvas API detected. Proceeding with visual rendering tests.");

        // --- Test Group: Static Rendering Checks (No Animation) ---
        QTest.group("Static Rendering Verification", {
            // Ensures the test harness is clear before each scenario.
            beforeEach: function() {
                jQueryObj('#test-harness').empty();
            }
        });

        QTest.scenario("Validate ring at zero progress (default options)", function(verifier) {
            const drawingSurface = generateTestRing({ completionLevel: 0 }),
                  jqWrappedSurface = jQueryObj(drawingSurface),
                  standardDimension = 100,
                  nominalLineThickness = Math.floor(standardDimension / 14); // Roughly 7 pixels.

            // Ensure the generated element is indeed a canvas.
            verifier.equal(drawingSurface.nodeName.toLowerCase(), 'canvas', "The widget should be an HTMLCanvasElement.");
            // Confirm default dimensions.
            verifier.equal(jqWrappedSurface.width(), standardDimension, "Default width must be 100px.");
            verifier.equal(jqWrappedSurface.height(), standardDimension, "Default height must be 100px.");

            // Pixel-level checks for the initial, un-progressed state.
            // These points should show the default background color or be transparent.
            verifier.pixelCloseRGBA(drawingSurface, 0, standardDimension / 2, 'rgba(0, 0, 0, 0.1)', 0.01, "Outer edge at 0 degrees should be background.");
            verifier.pixelCloseRGBA(drawingSurface, nominalLineThickness - 1, standardDimension / 2, 'rgba(0, 0, 0, 0.1)', 0.01, "Inner edge at 0 degrees should be background.");
            verifier.pixelRGBA(drawingSurface, nominalLineThickness + 1, standardDimension / 2, 'rgba(0, 0, 0, 0)', "Pixel just outside ring path should be transparent.");
        });

        QTest.scenario("Validate half-progress with standard gradient fill", function(verifier) {
            const drawingSurface = generateTestRing({
                completionLevel: 0.5,
                animateDrawing: false // Crucial for static pixel checks.
            });
            const widgetSize = jQueryObj.ringProgress.baseSettings.widgetSize;
            const halfSizePoint = widgetSize / 2;

            // Verify gradient colors at specific points for 50% completion.
            verifier.pixelCloseHex(drawingSurface, 1, halfSizePoint - 1, '#3aeabb', 0.015, "Top-left quadrant should show start of gradient.");
            verifier.pixelCloseRGBA(drawingSurface, 1, halfSizePoint + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Bottom-left quadrant should be background.");
            verifier.pixelCloseHex(drawingSurface, widgetSize - 1, halfSizePoint - 1, '#fdd250', 0.015, "Top-right quadrant should show end of gradient.");
            verifier.pixelCloseRGBA(drawingSurface, widgetSize - 1, halfSizePoint + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Bottom-right quadrant should be background.");
            verifier.pixelCloseHex(drawingSurface, halfSizePoint, 1, '#9ade85', 0.015, "Top-center should show middle gradient color.");
            verifier.pixelRGBA(drawingSurface, halfSizePoint, 8, 'rgba(0, 0, 0, 0)', "Pixel outside top ring path should be transparent.");
            verifier.pixelCloseRGBA(drawingSurface, halfSizePoint, widgetSize - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Bottom-center should be background.");
            verifier.pixelRGBA(drawingSurface, halfSizePoint, widgetSize - 9, 'rgba(0, 0, 0, 0)', "Pixel outside bottom ring path should be transparent.");
        });

        QTest.scenario("Validate half-progress with a single solid fill color", function(verifier) {
            const desiredPaintHue = '#ff0000';
            const drawingSurface = generateTestRing({
                completionLevel: 0.5,
                drawingPattern: { paintHue: desiredPaintHue },
                animateDrawing: false
            });
            const defaultWidgetSize = jQueryObj.ringProgress.baseSettings.widgetSize;
            const halfWidgetSize = defaultWidgetSize / 2;

            // Confirm that the filled portion uses the specified solid color.
            verifier.pixelHex(drawingSurface, 1, halfWidgetSize - 1, desiredPaintHue, "Top-left quadrant should be solid red.");
            verifier.pixelHex(drawingSurface, defaultWidgetSize - 1, halfWidgetSize - 1, desiredPaintHue, "Top-right quadrant should be solid red.");
            // Confirm the non-filled portion remains background.
            verifier.pixelCloseRGBA(drawingSurface, 1, halfWidgetSize + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Bottom-left quadrant should be default background.");
        });

        // --- Test Group: Animated Rendering Checks ---
        QTest.group("Animated Rendering Verification", {
            beforeEach: function() {
                jQueryObj('#test-harness').empty();
            }
        });

        QTest.scenario("Validate animated half-progress with solid fill", function(verifier) {
            const desiredPaintHue = '#00aa55';
            const drawingSurface = generateTestRing({
                completionLevel: 0.5,
                drawingPattern: { paintHue: desiredPaintHue }
                // Animation is enabled by default here.
            });
            const widgetDimension = jQueryObj.ringProgress.baseSettings.widgetSize;
            const halfDimension = widgetDimension / 2;

            const shortAnimDelay = 200;
            const mediumAnimDelay = 700;
            const fullAnimDelay = 1300;

            verifier.expect(6); // Total assertions expected for this async scenario.
            verifier.pause(); // Pause QUnit until all async checks are complete.

            // Initial state check: areas that *will* be filled should start as background.
            verifier.pixelCloseRGBA(drawingSurface, 1, halfDimension - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: top-left area is background.");

            // Check after animation has partially progressed.
            scheduleDelayedExecution(function() {
                verifier.pixelHex(drawingSurface, 1, halfDimension - 1, desiredPaintHue, "Animated: top-left area is now filled.");
            }, shortAnimDelay);

            scheduleDelayedExecution(function() {
                verifier.pixelHex(drawingSurface, halfDimension + 1, 1, desiredPaintHue, "Animated: top-center area is now filled.");
            }, mediumAnimDelay);

            // Final check after animation should be well advanced.
            scheduleDelayedExecution(function() {
                verifier.pixelHex(drawingSurface, widgetDimension - 2, halfDimension - 1, desiredPaintHue, "Animated: top-right area is now filled.");
                verifier.resume(); // Resume QUnit after the final animated check.
            }, fullAnimDelay);

            // Additional checks for areas that should remain background.
            verifier.pixelCloseRGBA(drawingSurface, 1, halfDimension + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: bottom-left area remains background.");
            verifier.pixelCloseRGBA(drawingSurface, widgetDimension - 2, halfDimension + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: bottom-right area remains background.");
        });

        QTest.scenario("Validate animated progress with custom size and gradient", function(verifier) {
            const customWidgetSize = 80;
            const drawingSurface = generateTestRing({
                completionLevel: 0.5,
                widgetSize: customWidgetSize,
                drawingPattern: {
                    gradient: ['#ff327a', '#fff430', '#ff8989']
                }
            });
            const halfCustomSize = customWidgetSize / 2;

            verifier.expect(6);
            verifier.pause();

            verifier.pixelCloseRGBA(drawingSurface, 1, halfCustomSize - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: top-left background for custom size.");
            scheduleDelayedExecution(function() {
                verifier.pixelCloseHex(drawingSurface, 1, halfCustomSize - 1, '#ff3777', 0.01, "Animated: top-left gradient color.");
            }, 200);

            verifier.pixelCloseRGBA(drawingSurface, halfCustomSize, 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: top-center background for custom size.");
            scheduleDelayedExecution(function() {
                verifier.pixelCloseHex(drawingSurface, halfCustomSize, 1, '#fff330', 0.01, "Animated: top-center gradient color.");
            }, 700);

            scheduleDelayedExecution(function() {
                verifier.pixelCloseHex(drawingSurface, customWidgetSize - 2, halfCustomSize - 1, '#ff8c86', 0.01, "Animated: top-right gradient color.");
                verifier.resume();
            }, 1300);

            verifier.pixelCloseRGBA(drawingSurface, 1, halfCustomSize + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial: bottom-left background for custom size.");
        });

        QTest.scenario("Validate animated progress with custom start angle and animation start value", function(verifier) {
            const fourthOfPi = Math.PI / 4; // Helper variable for readability.
            const drawingSurface = generateTestRing({
                completionLevel: 0.75,
                initialSweepAngle: -fourthOfPi, // -45 degrees
                startProgressValue: 0.25 // Animation starts from 25% progress.
            });

            verifier.expect(7);
            verifier.pause();

            // Initial checks. Some areas might already be filled due to `startProgressValue`.
            verifier.pixelCloseRGBA(drawingSurface, 80, 15, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial background check point 1.");
            verifier.pixelCloseHex(drawingSurface, 85, 20, '#e0d55f', 0.01, "Initial filled check point 2 (due to start value).");
            verifier.pixelCloseHex(drawingSurface, 85, 80, '#e0d55f', 0.01, "Initial filled check point 3 (due to start value).");
            verifier.pixelCloseRGBA(drawingSurface, 80, 85, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial background check point 4.");

            scheduleDelayedExecution(function() {
                verifier.pixelCloseHex(drawingSurface, 80, 85, '#d6d664', 0.01, "Animated fill check point 4 after delay.");
            }, 400);

            verifier.pixelCloseRGBA(drawingSurface, 15, 20, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial background check point 5.");

            scheduleDelayedExecution(function() {
                verifier.pixelCloseHex(drawingSurface, 15, 20, '#57e6aa', 0.01, "Animated fill check point 5 after delay.");
                verifier.resume();
            }, 1300);
        });

        QTest.deferredScenario("Validate animated progress with image background and reversed direction", function(verifier) {
            const scriptElements = jQueryObj('script[src*="test_suite.js"]');
            let assetPathBase = '';

            if (scriptElements.length > 0) {
                assetPathBase = scriptElements.attr('src').replace(/test_suite\.js.*$/, '');
            } else {
                console.warn("Could not determine script base path. Image assets might not load correctly.");
                // Fallback or error handling for asset path.
                assetPathBase = './'; // Default to current directory.
            }

            const imageAssetLink = assetPathBase + 'assets/ring_bg.png'; // Updated asset path and filename.
            const graphicObject = new Image();

            verifier.expect(9);
            graphicObject.src = imageAssetLink;

            jQueryObj(graphicObject).on('load', function() {
                console.log("Test image loaded successfully:", imageAssetLink);
                const drawingSurface = generateTestRing({
                    completionLevel: 0.5,
                    strokeThickness: 20, // Renamed thickness option.
                    drawingPattern: { image: graphicObject },
                    inverseProgress: true // Renamed reverse option.
                });

                // Pixels that should always remain transparent (outside the ring path).
                verifier.pixelRGBA(drawingSurface, 21, 49, 'rgba(0, 0, 0, 0)', "Outer pixel should be transparent (left).");
                verifier.pixelRGBA(drawingSurface, 78, 49, 'rgba(0, 0, 0, 0)', "Outer pixel should be transparent (right).");
                verifier.pixelRGBA(drawingSurface, 49, 77, 'rgba(0, 0, 0, 0)', "Outer pixel should be transparent (bottom).");

                // Animated checks for image fill with reversed progress.
                verifier.pixelCloseRGBA(drawingSurface, 17, 51, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial state: top-left quadrant is background.");
                scheduleDelayedExecution(function() {
                    verifier.pixelCloseHex(drawingSurface, 17, 51, '#00f7ff', 0.01, "Animated image fill: top-left quadrant.");
                }, 400);

                verifier.pixelCloseRGBA(drawingSurface, 49, 81, 'rgba(0, 0, 0, 0.1)', 0.01, "Initial state: bottom-center quadrant is background.");
                scheduleDelayedExecution(function() {
                    verifier.pixelCloseHex(drawingSurface, 49, 81, '#7700ff', 0.01, "Animated image fill: bottom-center quadrant.");
                }, 700);

                scheduleDelayedExecution(function() {
                    verifier.pixelCloseHex(drawingSurface, 81, 51, '#ff0008', 0.01, "Animated image fill: right-center quadrant.");
                    verifier.resume();
                }, 1400);
            }).on('error', function() {
                // If the image fails to load, mark the test as failed.
                verifier.ok(false, "Failed to load test image: " + imageAssetLink);
                verifier.resume();
            });
        });

    } else {
        // --- Fallback Test for No Canvas Support ---
        console.warn("Canvas API not detected. Skipping visual tests.");
        QTest.scenario("Browser lacks Canvas API support", function(verifier) {
            verifier.ok(true, "Canvas is not available, visual tests are appropriately skipped.");
        });
    }

    // --- Core Utility Function for Test Setup ---

    /**
     * Creates and initializes a ring progress widget for testing purposes.
     * This function abstracts the DOM manipulation and plugin instantiation.
     * @param {object} configOptions - Configuration object for the ring progress plugin.
     * @returns {HTMLCanvasElement} The raw HTMLCanvasElement created by the plugin.
     */
    function generateTestRing(configOptions) {
        // Guard clause for invalid configuration.
        if (typeof configOptions !== 'object' || configOptions === null) {
            console.error("Invalid configuration provided to generateTestRing. Using an empty object as fallback.");
            configOptions = {};
        }

        let testContainer = jQueryObj('#test-harness');
        // If a dedicated test harness isn't found, append to the body.
        if (testContainer.length === 0) {
            testContainer = jQueryObj('body');
            console.warn("Test harness element '#test-harness' not found, appending widget to 'body'.");
        }

        const createdControl = jQueryObj('<div>'); // Use a generic div as the plugin target.
        createdControl.appendTo(testContainer);

        // Initialize the ring progress plugin.
        createdControl.ringProgress(configOptions);

        // Retrieve the actual canvas element for direct pixel assertions.
        const canvasWidget = createdControl.ringProgress('getWidget');

        // Post-creation validation.
        if (!canvasWidget || canvasWidget.nodeName.toLowerCase() !== 'canvas') {
            console.error("The 'getWidget' method did not return a valid canvas element. Test setup may be flawed.");
            // Depending on strictness, could throw an error here.
        }

        return canvasWidget;
    }

})();