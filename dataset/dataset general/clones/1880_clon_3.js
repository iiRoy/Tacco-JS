/*
 * test_suite_for_animation_library.js
 */

'use strict'; // Enforce stricter parsing and error handling for the entire script.

// Import necessary modules for animation utilities, promise handling, vendor prefixing, and assertion.
const transformNormalizer = require('../src/normalize-transform-value'); // Renamed module for clarity.
const easingNormalizer = require('../src/normalize-timing-function');   // Renamed module.
const MotionEngine = require('..');                                   // Main animation library, renamed Zanimo.
const AsyncPromise = require('q');                                    // Promise library, renamed Q.
const vendorPrefixer = require('vendor-prefix');                      // CSS vendor prefix utility.
const assert = require('expect.js');                                  // Assertion library, renamed expect.js.

// Retrieve the primary DOM element for test rendering.
const testContainerDiv = document.getElementById('test');

// Configure the promise library for enhanced debugging (long stack traces).
AsyncPromise.longStackSupport = true;

/**
 * Creates a visual square element for testing purposes.
 * @param {string} elementId - The unique identifier for the new element.
 * @returns {HTMLElement} The newly created DOM element.
 */
function makeVisualBox(elementId) {
    if (!testContainerDiv) {
        console.error("Test container div not found. Cannot create visual box.");
        throw new Error("Test container div with ID 'test' is missing.");
    }
    const domElement = document.createElement("div"); // Use const for elements that won't be reassigned.
    domElement.id = elementId;
    domElement.style.width = "110px"; // Slightly altered dimensions.
    domElement.style.height = "110px";
    domElement.style.backgroundColor = "orange"; // Changed color.
    domElement.style.margin = "5px"; // Added margin for visual separation.
    testContainerDiv.appendChild(domElement);
    console.log(`Created test element: #${elementId}`); // Added a log.
    return domElement;
};

/**
 * Removes a visual square element from the DOM.
 * @param {string} elementId - The unique identifier of the element to remove.
 */
function discardVisualBox(elementId) {
    const elementToRemove = document.getElementById(elementId);
    if (elementToRemove && testContainerDiv) {
        testContainerDiv.removeChild(elementToRemove);
        console.log(`Removed test element: #${elementId}`); // Added a log.
    } else {
        console.warn(`Attempted to remove non-existent element or missing container: #${elementId}`);
    }
};

// Helper functions for setting up and tearing down test elements.
const prepareTestBoxA = () => makeVisualBox("test-element-alpha");
const cleanupTestBoxA = (returnValue) => {
    discardVisualBox("test-element-alpha");
    return returnValue; // Ensure the original return value is passed through.
};

const prepareTestBoxB = () => makeVisualBox("test-element-beta");
const cleanupTestBoxB = (returnValue) => {
    discardVisualBox("test-element-beta");
    return returnValue;
};

// Test suite for the transformation value normalization utility.
describe('Transformation Value Normalization Utility', () => {
    it('should correctly format `translate3d(0,0,0)` from varied input', () => {
        const inputString = 'translate3d(0.0px ,0, 0.0  )'; // Slightly changed input.
        const expectedOutput = 'translate3d(0,0,0)';
        assert(transformNormalizer(inputString)).to.deep.equal(expectedOutput); // Using deep.equal.
    });

    it('should handle complex transform strings with multiple functions', () => {
        const complexInput = 'translate3d(0px ,200px, 0.0  )  rotateY(280deg)        translate3d( 0 , 0,30px)';
        const expectedComplexOutput = 'translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)';
        assert(transformNormalizer(complexInput)).to.deep.equal(expectedComplexOutput);
    });

    it('should return an empty string when no arguments are provided', () => {
        assert(transformNormalizer()).to.be.empty(); // Using be.empty().
    });

    it('should pass through non-transform strings like simple colors', () => {
        const simpleColor = 'green'; // Changed color.
        assert(transformNormalizer(simpleColor)).to.equal(simpleColor);
    });

    it('should return hexadecimal color codes unchanged', () => {
        const hexColor = '#2ECC71'; // Changed hex color.
        assert(transformNormalizer(hexColor)).to.equal(hexColor);
    });

    it('should normalize `rgba` color values', () => {
        const rgbaInput = 'rgba(25, 25, 25, .5)';
        const expectedRgbaOutput = 'rgba(25,25,25,0.5)';
        assert(transformNormalizer(rgbaInput)).to.equal(expectedRgbaOutput);
    });

    it('should convert `hsl` to `rgb` format', () => {
        const hslInput = 'hsl(125, 25%, 10%)';
        const expectedRgbOutput = 'rgb(19,32,20)';
        assert(transformNormalizer(hslInput)).to.equal(expectedRgbOutput);
    });

    it('should convert `hsla` to `rgba` format', () => {
        const hslaInput = 'hsla(200, 35%, 90%, .5)';
        const expectedHslaOutput = 'rgba(221,232,238,0.5)';
        assert(transformNormalizer(hslaInput)).to.equal(expectedHslaOutput);
    });
});

// Test suite for the timing function normalization utility.
describe('Easing Function Normalization Utility', () => {
    it('should return "linear" when given "linear"', () => {
        assert(easingNormalizer('linear')).to.equal('linear');
    });

    it('should normalize cubic-bezier values with varied spacing', () => {
        const bezierInput = 'cubic-bezier(0.17, .67, .83, .67)';
        const expectedBezierOutput = 'cubic-bezier(0.17,0.67,0.83,0.67)';
        assert(easingNormalizer(bezierInput)).to.equal(expectedBezierOutput);
    });

    it('should handle cubic-bezier with leading zeros and extra spaces', () => {
        const bezierSpacedInput = 'cubic-bezier(.17, .67 , .83, .67 )';
        const expectedSpacedBezierOutput = 'cubic-bezier(0.17,0.67,0.83,0.67)';
        assert(easingNormalizer(bezierSpacedInput)).to.equal(expectedSpacedBezierOutput);
    });
});

// Main test suite for the MotionEngine (Zanimo) library.
describe('MotionEngine Core Functionality', () => {

    it('should reject if initialized with a non-DOM element value', () => {
        const invalidInput = 'This is not a DOM element';
        return MotionEngine(invalidInput)
            .catch((error) => { // Using catch for promise rejection.
                assert(error).to.be.an(Error);
                console.log(`Successfully caught expected error: ${error.message}`); // Added a log.
            });
    });

    it('should resolve with a valid DOM element', () => {
        const testElement = prepareTestBoxA();
        return MotionEngine(testElement)
            .then((resultElement) => {
                assert(resultElement).to.be.an(HTMLElement); // More specific type check.
                cleanupTestBoxA();
            });
    });

    it('should resolve with a promise that eventually provides a DOM element', () => {
        const testElement = prepareTestBoxA();
        const deferredOperation = AsyncPromise.defer(); // Using the renamed Q.defer().

        // Simulate an asynchronous element retrieval.
        setTimeout(() => {
            deferredOperation.resolve(testElement);
        }, 250); // Slightly different delay.

        return MotionEngine(deferredOperation.promise)
            .then((resolvedValue) => {
                assert(resolvedValue).to.equal(testElement);
                cleanupTestBoxA();
            });
    });

    it('should fail if a promise resolves to a non-DOM element type', () => {
        const numericPromise = AsyncPromise.resolve(123); // Promise resolving to a number.
        return MotionEngine(numericPromise)
            .catch((error) => {
                assert(error).to.be.an(Error);
                console.log(`Caught error for numeric promise input: ${error.message}`);
            });
    });

    it('should successfully apply a specific style property to an element', () => {
        const targetElement = prepareTestBoxA();
        const propertyToSet = 'opacity';
        const targetValue = 0.1; // Changed opacity value.

        return MotionEngine(targetElement).then(MotionEngine.f(propertyToSet, targetValue)).then((modifiedElement) => {
            assert(modifiedElement.style[propertyToSet]).to.equal(String(targetValue)); // Asserting string value.
            cleanupTestBoxA();
        });
    });

    it('should apply a style to an element wrapped in a resolved promise', () => {
        const targetElement = prepareTestBoxA();
        const styleProperty = 'opacity';
        const finalStyleValue = 0.2; // Changed opacity value.

        return MotionEngine(AsyncPromise.resolve(targetElement), styleProperty, finalStyleValue).then((updatedElement) => {
            assert(updatedElement.style[styleProperty]).to.equal(String(finalStyleValue));
            cleanupTestBoxA();
        });
    });

    it('should smoothly transition an element\'s width over time with a custom easing', function() {
        this.timeout(1000); // Increased timeout for potentially longer animation.
        const targetElement = prepareTestBoxA();

        return AsyncPromise.delay(220).then(() => { // Slightly different delay.
            assert(targetElement.style.width).to.equal('110px'); // Initial width check.

            return MotionEngine(targetElement, "width", "250px", 450, "ease-in-out") // Changed target width and duration.
                .then((animatedElement) => {
                    assert(animatedElement.style.width).to.equal('250px');
                    cleanupTestBoxA();
                });
        });
    });

    it('should concurrently transition multiple properties of an element', function() {
        this.timeout(1000);
        const targetElement = prepareTestBoxA();

        assert(targetElement.style.width).to.equal('110px');
        assert(targetElement.style.height).to.equal('110px');

        const widthTransition = MotionEngine(targetElement, "width", "280px", 420, "ease-in-out"); // Changed values.
        const heightTransition = MotionEngine(targetElement, "height", "280px", 420, "ease-in-out");

        return AsyncPromise.all([widthTransition, heightTransition]) // Use AsyncPromise.all.
            .then((resolvedElements) => {
                // resolvedElements is an array of the results from each promise.
                // In Zanimo, each promise resolves with the element itself.
                assert(resolvedElements[0].style.width).to.equal('280px');
                assert(resolvedElements[0].style.height).to.equal('280px'); // Both promises resolve with the same element.
                cleanupTestBoxA();
            });
    });

    it('should support sequential chaining of transitions across multiple elements', () => {
        const elementOne = prepareTestBoxA();
        const elementTwo = prepareTestBoxB();

        // Helper for combined cleanup.
        const performCombinedCleanup = (result) => {
            cleanupTestBoxA();
            return cleanupTestBoxB(result);
        };

        return MotionEngine(elementOne, "transform", "translate(220px, 0)", 320) // Changed values.
            .then(() => {
                const transformedStyle = elementOne.style[vendorPrefixer('transform')]; // Use renamed prefixer.
                assert(transformNormalizer(transformedStyle)).to.be.equal('translate(220px,0)');
                return MotionEngine(elementTwo, "transform", "translate(0, 220px)", 120); // Changed values.
            })
            .then((finalElement) => {
                const transformedStyle = finalElement.style[vendorPrefixer('transform')];
                assert(transformNormalizer(transformedStyle)).to.be.equal('translate(0,220px)');
                performCombinedCleanup();
            });
    });

    it('should reject when provided with an invalid initial input type', () => {
        const badInput = {}; // An empty object is not a DOM element.
        return MotionEngine(badInput, "opacity", 1, 100)
            .catch((err) => {
                assert(err).to.be.an(Error);
                assert(err.message).to.include('Expected a DOM element or a promise'); // More specific error message check.
            });
    });

    it('should reject for an unsupported transition property', () => {
        const targetElement = prepareTestBoxA();
        const badProperty = "non-existent-property";

        return MotionEngine(targetElement, badProperty, "test", 100)
            .catch((err) => {
                cleanupTestBoxA();
                assert(err).to.be.an(Error);
                assert(err.message).to.include('Unsupported CSS property'); // Specific error message check.
            });
    });

    it('should reject if the duration value is invalid', () => {
        const targetElement = prepareTestBoxA();
        const invalidDuration = "slow"; // String instead of number.

        return MotionEngine(targetElement, "opacity", 0.5, invalidDuration, "linear")
            .catch((err) => {
                cleanupTestBoxA();
                assert(err).to.be.an(Error);
                assert(err.message).to.include('duration must be a number'); // Specific error message check.
            });
    });

    it('should set a CSS transform property without animation', () => {
        const targetElement = prepareTestBoxA();
        const targetTransform = "translate(210px, 10px)"; // Slightly altered transform.
        return MotionEngine(targetElement, "transform", targetTransform)
            .then((el) => {
                assert(transformNormalizer(el.style.transform)).to.equal('translate(210px,10px)');
                cleanupTestBoxA();
            });
    });

    it('should animate background color to an HSLA value', () => {
        const targetElement = prepareTestBoxA();
        const targetColor = "hsla(210, 40%, 85%, .6)"; // Slightly altered HSLA.
        return MotionEngine(targetElement, "background-color", targetColor, 250, 'ease-in-out') // Slightly altered duration.
            .then(cleanupTestBoxA);
    });

    it('should animate background color to an RGBA value', () => {
        const targetElement = prepareTestBoxA();
        const targetColor = "rgba(25, 40, 30, 0.6)"; // Slightly altered RGBA.
        return MotionEngine(targetElement, "background-color", targetColor, 250, 'ease-in-out')
            .then(cleanupTestBoxA);
    });

});

// Test suite for the MotionEngine.f (functional transition creator) method.
describe('MotionEngine.f - Functional Transition Creator', () => {

    it('should successfully transition opacity from 1 to 0.1 over 220ms', () => {
        const targetElement = prepareTestBoxA();
        const initialOpacity = 1;
        targetElement.style.opacity = initialOpacity; // Explicitly set initial opacity.

        return MotionEngine(targetElement)
            .then(MotionEngine.f("opacity", 0.1, 220)) // Changed opacity and duration.
            .then(cleanupTestBoxA);
    });

    it('should fail when attempting to transition a non-animatable CSS property like "display"', () => {
        const targetElement = prepareTestBoxA();

        return MotionEngine(targetElement)
            .then(MotionEngine.f("display", 'none', 150)) // Changed value and duration.
            .catch((err) => {
                cleanupTestBoxA();
                assert(err).to.be.an(Error);
                assert(err.message).to.include('Unsupported CSS property');
            });
    });

    it('should smoothly transition a transform property from initial to `translate(180px, 10px)`', () => {
        const targetElement = prepareTestBoxA();
        const targetTransform = "translate(180px, 10px)"; // Changed transform.

        return MotionEngine(targetElement)
            .then(MotionEngine.f("transform", targetTransform, 220)) // Changed duration.
            .then(cleanupTestBoxA);
    });

    it('should animate background-color from orange to purple over 220ms', () => {
        const targetElement = prepareTestBoxA();
        targetElement.style.backgroundColor = 'orange'; // Ensure initial state.
        const targetColor = 'purple'; // Changed target color.

        return MotionEngine(targetElement)
            .then(MotionEngine.f('background-color', targetColor, 220))
            .then(cleanupTestBoxA);
    });

    it('should fail the first call if two transitions on the same property are initiated too closely', () => {
        const targetElement = prepareTestBoxA();
        const firstTransition = MotionEngine.f("transform", "translate(200px, 0)", 400);
        const secondTransition = MotionEngine.f("transform", "translate(100px, 300px)", 100);

        // Intentionally start the second transition shortly after the first, expected to cause a conflict for the *first* promise.
        // The original logic here is a bit tricky, it starts the second transition, catches its error, and then starts the first.
        // Let's re-interpret: If two transitions on the *same element and property* are initiated *almost simultaneously*,
        // one of them usually gets cancelled or overridden, leading to a rejection for the *earlier* one if it's still active.
        // The test implies the *first* call fails, meaning the second one successfully takes over.

        // This pattern suggests the *first* transition started will be rejected if another one on the same property interrupts it.
        // The original code starts transition2 after a delay and lets it fail silently, then starts transition1 and expects it to fail.
        // This implies transition2 is the "interrupter". Let's preserve that intent.

        MotionEngine(targetElement).delay(100).then(secondTransition).catch(() => { /* suppress error for interrupter */ });

        return MotionEngine(targetElement)
            .then(firstTransition) // This is the one expected to fail.
            .catch((err) => {
                cleanupTestBoxA();
                assert(err).to.be.an(Error);
                assert(err.message).to.include('Transition interrupted'); // More specific error message.
            });
    });

    it('succeeded when called on an element already in transition from another MotionEngine call with the same css property', () => {
        // This test case is a bit contradictory to the previous one. It suggests that
        // *if* the library handles concurrent transitions by allowing the later one to
        // take over, the later one should succeed, and the earlier one might fail
        // (which is implicitly handled by the `.fail` on the first call).
        const targetElement = prepareTestBoxA();
        const initialTransition = MotionEngine.f("transform", "translate(200px, 0)", 400);
        const interruptingTransition = MotionEngine.f("transform", "translate(100px, 300px)", 100);

        // Start the initial transition, and suppress any potential rejection if it gets interrupted.
        MotionEngine(targetElement).then(initialTransition).catch(() => { /* Expected potential interruption, suppress error */ });

        // Start the interrupting transition after a short delay. This one is expected to succeed.
        return MotionEngine(targetElement)
            .delay(100) // Start the second transition after a delay.
            .then(interruptingTransition)
            .then(cleanupTestBoxA);
    });

    it('should successfully apply a direct CSS transform on an element already undergoing a MotionEngine transition', () => {
        const targetElement = prepareTestBoxA();

        // Start a long-running transition.
        MotionEngine(targetElement).then(MotionEngine.f("transform", "translate(200px, 0)", 400)).catch(() => { /* suppress error */ });

        // Immediately apply a direct CSS transform. This should override the ongoing transition.
        return MotionEngine(targetElement, "transform", "translate(0px, 200px)")
            .then(cleanupTestBoxA);
    });

    it('should fail a transition if a direct transform with the same property is applied during its animation', () => {
        const targetElement = prepareTestBoxA();

        // Schedule a direct transform to happen *during* the transition.
        // This direct application should interrupt the ongoing animation.
        MotionEngine(targetElement).delay(200).then(MotionEngine.f("transform", "translate(0px, 200px)")).catch(() => { /* suppress error for the interrupter */ });

        // This transition is expected to be interrupted and fail.
        return MotionEngine(targetElement)
            .then(MotionEngine.f("transform", "translate(200px, 0)", 400))
            .catch((err) => {
                cleanupTestBoxA();
                assert(err).to.be.an(Error);
                assert(err.message).to.include('Transition interrupted');
            });
    });

    it('should successfully execute four sequential opacity transitions on the same element', function () {
        this.timeout(5500); // Increased timeout for multiple sequential transitions.

        const targetElement = prepareTestBoxA();
        const fadeOutTransition = MotionEngine.f("opacity", 0.05, 200); // Changed target opacity.
        const resetOpacity = (el) => {
            el.style.opacity = 1;
            return el;
        };

        // Chain multiple fade out and reset operations.
        return MotionEngine(targetElement)
            .then(fadeOutTransition)
            .then(resetOpacity)
            .then(fadeOutTransition)
            .then(resetOpacity)
            .then(fadeOutTransition)
            .then(resetOpacity)
            .then(fadeOutTransition)
            .then(cleanupTestBoxA);
    });

    it('should successfully execute four sequential transform transitions on the same element', function () {
        this.timeout(5500);

        const targetElement = prepareTestBoxA();
        const moveRightTransition = MotionEngine.f("transform", "translate(210px, 0)", 520); // Changed values.
        const resetPositionTransition = MotionEngine.f("transform", "translate(0,0)", 50); // Added a short duration to reset for clarity.

        // Chain multiple transform and reset operations.
        return MotionEngine(targetElement)
            .then(moveRightTransition)
            .then(resetPositionTransition)
            .then(moveRightTransition)
            .then(resetPositionTransition)
            .then(moveRightTransition)
            .then(resetPositionTransition)
            .then(moveRightTransition)
            .then(cleanupTestBoxA);
    });
});

// Setup for Mocha test runner.
window.addEventListener('load', function () {
    if (typeof mocha === 'undefined') {
        console.error("Mocha test framework not found. Skipping test runner setup.");
        return;
    }

    const testRunner = mocha.run();
    const failedTestRecords = [];

    // Store test results globally once all tests have finished.
    testRunner.on('end', function () {
        window.testResultsSummary = testRunner.stats;
        window.testResultsSummary.failureDetails = failedTestRecords;
        console.log("Mocha test run completed. Results available in window.testResultsSummary.");
    });

    // Capture details of failed tests.
    testRunner.on('fail', captureFailureDetails);

    /**
     * Records detailed information about a failed test.
     * @param {object} testCase - The Mocha test object.
     * @param {Error} failureError - The error object from the failed test.
     */
    function captureFailureDetails(testCase, failureError) {
        /**
         * Recursively retrieves the full title hierarchy of a test.
         * @param {object} currentTest - The test object to flatten titles for.
         * @returns {string[]} An array of parent titles, from outermost to current.
         */
        const extractFullTestPath = (currentTest) => {
            const pathSegments = [];
            let current = currentTest;
            while (current && current.parent && current.parent.title) {
                pathSegments.push(current.parent.title);
                current = current.parent;
            }
            return pathSegments.reverse();
        };

        failedTestRecords.push({
            testName: testCase.title,
            outcome: false,
            errorMessage: failureError.message,
            errorStack: failureError.stack,
            testPath: extractFullTestPath(testCase)
        });
    }
});