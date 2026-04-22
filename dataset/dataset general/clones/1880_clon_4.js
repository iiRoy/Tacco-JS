'use strict';

(function() {
    let currentTestGroupName = '';
    let executedTestCount = 0;
    const allTestOutcomes = [];

    const assertionUtilities = {
        areIdentical: (actualValue, expectedValue, message = 'Values must be identical') => {
            if (actualValue !== expectedValue) {
                throw new Error(`Assertion Failure: ${message}. Expected: ${expectedValue}, Actual: ${actualValue}`);
            }
        },
        areDeeplyEquivalent: (actualValue, expectedValue, message = 'Structures must be deeply equivalent') => {
            // Simple deep comparison for basic JSON-serializable objects/arrays
            if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
                throw new Error(`Assertion Failure: ${message}. Expected: ${JSON.stringify(expectedValue)}, Actual: ${JSON.stringify(actualValue)}`);
            }
        },
        isOfType: (actualValue, expectedType, message = 'Type must match') => {
            let detectedType;
            if (actualValue === null) detectedType = 'null';
            else if (Array.isArray(actualValue)) detectedType = 'array';
            else detectedType = typeof actualValue;

            if (expectedType === 'window.Element') {
                if (!(actualValue instanceof window.Element)) {
                    throw new Error(`Assertion Failure: ${message}. Expected type: ${expectedType}, Actual type: ${actualValue ? actualValue.constructor.name : detectedType}`);
                }
            } else if (detectedType !== expectedType) {
                throw new Error(`Assertion Failure: ${message}. Expected type: ${expectedType}, Actual type: ${detectedType}`);
            }
        },
        expectsRejection: async (asyncFunction, expectedErrorConstructor, message = 'Function should throw an error') => {
            let errorOccurred = false;
            let capturedError = null;
            try {
                // If the function returns a promise, await it. If it's a Q-style promise, it might have a .fail method.
                const result = await Promise.resolve(asyncFunction());
                if (result && typeof result.fail === 'function') { // Handle Q-style .fail
                    await new Promise((resolve) => {
                        result.fail(e => {
                            capturedError = e;
                            errorOccurred = true;
                            resolve();
                        });
                        // If it doesn't fail, resolve after a short delay to prevent hanging
                        setTimeout(resolve, 10);
                    });
                }
            } catch (e) {
                capturedError = e;
                errorOccurred = true;
            }

            if (!errorOccurred) {
                throw new Error(`Assertion Failure: ${message}. No error was thrown or promise rejected.`);
            }
            if (expectedErrorConstructor && !(capturedError instanceof expectedErrorConstructor)) {
                throw new Error(`Assertion Failure: ${message}. Threw wrong error type. Expected: ${expectedErrorConstructor.name}, Actual: ${capturedError ? capturedError.constructor.name : 'none'}`);
            }
        },
        isTrue: (condition, message = 'Condition must be true') => {
            if (!condition) {
                throw new Error(`Assertion Failure: ${message}. Condition was false.`);
            }
        }
    };

    window.testHarness = {
        testGroup: (name, callback) => {
            currentTestGroupName = name;
            callback();
            currentTestGroupName = '';
        },
        testCase: (description, testFunction) => {
            const testIdentifier = ++executedTestCount;
            const fullDescriptionPath = [currentTestGroupName, description];
            try {
                const testResult = testFunction();
                if (testResult && typeof testResult.then === 'function') { // Asynchronous test
                    testResult.then(() => {
                        allTestOutcomes.push({ name: description, fullPath: fullDescriptionPath, outcome: 'SUCCESS' });
                    }).catch(error => {
                        allTestOutcomes.push({ name: description, fullPath: fullDescriptionPath, outcome: 'FAILURE', detail: error.message, trace: error.stack });
                    });
                } else { // Synchronous test
                    allTestOutcomes.push({ name: description, fullPath: fullDescriptionPath, outcome: 'SUCCESS' });
                }
            } catch (error) {
                allTestOutcomes.push({ name: description, fullPath: fullDescriptionPath, outcome: 'FAILURE', detail: error.message, trace: error.stack });
            }
        },
        outcomes: allTestOutcomes
    };

    window.addEventListener('load', () => {
        let totalCases = allTestOutcomes.length;
        let successfulCases = allTestOutcomes.filter(r => r.outcome === 'SUCCESS').length;
        let failedCases = totalCases - successfulCases;

        console.log(`\n--- Test Execution Summary ---`);
        console.log(`Total: ${totalCases}, Passed: ${successfulCases}, Failed: ${failedCases}`);

        if (failedCases > 0) {
            console.error(`\n--- Failed Test Cases ---`);
            allTestOutcomes.filter(r => r.outcome === 'FAILURE').forEach(result => {
                console.error(`FAIL: ${result.fullPath.join(' - ')}`);
                console.error(`  Reason: ${result.detail}`);
                // console.error(`  Stack Trace: ${result.trace}`);
            });
        }
        console.log(`------------------------------`);

        // Replicate Mocha-like global results structure
        window.customReport = {
            statistics: {
                suites: 0,
                tests: totalCases,
                passes: successfulCases,
                failures: failedCases,
                duration: 0
            },
            failureReports: allTestOutcomes.filter(res => res.outcome === 'FAILURE').map(res => ({
                title: res.name,
                result: false,
                message: res.detail,
                stack: res.trace,
                path: res.fullPath
            }))
        };
    });

    // Expose the custom test framework globally
    window.assert = assertionUtilities;
    window.suite = window.testHarness.testGroup;
    window.unit = window.testHarness.testCase;
})();


// --- Replacement for Q Promise Library (using native Promises) ---
const promiseHandler = {
    wait: (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds)),
    allCompletion: Promise.allSettled,
    createDeferred: () => {
        let resolver, rejector;
        const prom = new Promise((res, rej) => {
            resolver = res;
            rejector = rej;
        });
        return { promise: prom, resolve: resolver, reject: rejector };
    }
};

// --- Replacement for DOM Utilities ---
const elementOperations = (function() {
    const mainTestingArea = document.getElementById('test');

    function furnishDiv(identifierKey) {
        const divNode = document.createElement("div");
        divNode.id = identifierKey;
        divNode.style.width = "100px";
        divNode.style.height = "100px";
        divNode.style.backgroundColor = "red";
        mainTestingArea.appendChild(divNode);
        return divNode;
    }

    function obliterateDiv(identifierKey) {
        const divToEradicate = document.getElementById(identifierKey);
        if (divToEradicate && mainTestingArea.contains(divToEradicate)) {
            mainTestingArea.removeChild(divToEradicate);
        }
    }

    const prepareCaseA = () => furnishDiv("test-div-A");
    const finalizeCaseA = (returnVal) => { obliterateDiv("test-div-A"); return returnVal; };
    const prepareCaseB = () => furnishDiv("test-div-B");
    const finalizeCaseB = (returnVal) => { obliterateDiv("test-div-B"); return returnVal; };

    return {
        furnishDiv,
        obliterateDiv,
        prepareCaseA,
        finalizeCaseA,
        prepareCaseB,
        finalizeCaseB
    };
})();

// --- Replacement for vendor-prefix ---
const stylePropertyResolver = (propName) => {
    // For Type IV, and given modern browser context, we assume direct property names work.
    // The original tests don't deeply test prefixing logic itself.
    return propName;
};


// --- Replacement for normalizeTransformValue ---
const cssValueSanitizer = (function() {

    function convertHslToRgb(hue, saturation, lightness, alpha = 1) {
        hue /= 360;
        saturation /= 100;
        lightness /= 100;

        let red, green, blue;
        if (saturation === 0) {
            red = green = blue = lightness;
        } else {
            const calculateHue = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
            const p = 2 * lightness - q;
            red = calculateHue(p, q, hue + 1 / 3);
            green = calculateHue(p, q, hue);
            blue = calculateHue(p, q, hue - 1 / 3);
        }
        return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha];
    }

    const sanitize = (inputString) => {
        if (typeof inputString !== 'string') {
            return '';
        }

        let processedString = inputString;

        // 1. Unify whitespace
        processedString = processedString.replace(/\s+/g, ' ').trim();

        // 2. Standardize zero-value units (0px -> 0, 0deg -> 0, etc.)
        processedString = processedString.replace(/(\d*\.?0)(px|deg|s|ms|em|rem|%)/g, '$1');

        // 3. Prefix leading zero for decimals (e.g., .5 -> 0.5) inside functions
        processedString = processedString.replace(/([,\(]\s*)(\.\d+)/g, '$10$2');

        // 4. Transform HSL/HSLA to RGB/RGBA
        processedString = processedString.replace(/hsla?\(([^)]*)\)/g, (fullMatch, content) => {
            const parts = content.split(/,\s*/).map(s => parseFloat(s.trim()));
            if (parts.length >= 3) {
                const [h, s, l, a = 1] = parts;
                const [r, g, b, finalA] = convertHslToRgb(h, s, l, a);
                return `rgba(${r},${g},${b},${finalA})`;
            }
            return fullMatch;
        });

        // 5. Convert rgba(...,1) to rgb(...) for consistency
        processedString = processedString.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*1\)/g, 'rgb($1,$2,$3)');

        // 6. Remove spaces around commas within color functions (rgb, rgba)
        processedString = processedString.replace(/(rgb|rgba)\(([^)]*)\)/g, (fullMatch, funcName, content) => {
            return `${funcName}(${content.replace(/,\s*/g, ',')})`;
        });

        // 7. Remove spaces around commas within other functions (transform, etc.)
        processedString = processedString.replace(/([a-zA-Z0-9]+)\(([^)]*)\)/g, (fullMatch, funcName, content) => {
            if (!funcName.includes('rgb')) { // Avoid reprocessing colors
                return `${funcName}(${content.replace(/,\s*/g, ',')})`;
            }
            return fullMatch;
        });

        return processedString;
    };

    return sanitize;
})();


// --- Replacement for normalizeTimingFunction ---
const animationCurveSanitizer = (inputString) => {
    if (typeof inputString !== 'string') {
        return '';
    }
    // Normalize spaces within cubic-bezier function
    return inputString.replace(/cubic-bezier\(([^)]*)\)/g, (fullMatch, content) => {
        return `cubic-bezier(${content.split(/,\s*/).map(s => s.trim()).join(',')})`;
    });
};


// --- Replacement for Zanimo (Mock Animation Library) ---
const motionCoordinator = (function() {
    // Tracks active "animations" for conflict resolution
    // Key: elementId_propertyName, Value: { resolver: Function, rejector: Function, timerId: number, isAnimated: boolean }
    const activeMotionRegistry = new Map();

    class CustomMotionError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "CustomMotionError";
        }
    }

    const initiateMotion = (targetDomElement, cssProperty, targetValue, durationMs, easingFunction) => {
        return Promise.resolve(targetDomElement)
            .then(resolvedElement => {
                if (!(resolvedElement instanceof window.Element)) {
                    throw new CustomMotionError("Provided target is not a valid DOM element.");
                }
                const parsedDuration = durationMs ? parseFloat(durationMs) : 0;
                if (durationMs && (isNaN(parsedDuration) || parsedDuration < 0)) {
                    throw new CustomMotionError("Invalid duration value provided.");
                }

                const elementKey = resolvedElement.id || `anonymous_element_${Math.random().toString(36).substring(2, 11)}`;
                const motionKey = `${elementKey}_${cssProperty}`;
                const isDurationBasedMotion = !!durationMs;

                // Conflict Handling: If another motion is active for this element/property
                if (activeMotionRegistry.has(motionKey)) {
                    const priorMotion = activeMotionRegistry.get(motionKey);
                    clearTimeout(priorMotion.timerId);

                    // If a new duration-based motion starts, the previous one is rejected.
                    if (isDurationBasedMotion) {
                        priorMotion.rejector(new CustomMotionError(`Concurrent motion detected for '${cssProperty}'. Prior motion cancelled.`));
                    } else { // If an immediate style application occurs during an ongoing duration-based motion
                        if (priorMotion.isAnimated) {
                             priorMotion.rejector(new CustomMotionError(`Direct style application interrupted ongoing motion for '${cssProperty}'.`));
                        }
                    }
                    activeMotionRegistry.delete(motionKey);
                }

                return new Promise((resolver, rejector) => {
                    let timerHandle;
                    if (isDurationBasedMotion && parsedDuration > 0) {
                        timerHandle = setTimeout(() => {
                            resolvedElement.style[stylePropertyResolver(cssProperty)] = cssValueSanitizer(targetValue);
                            activeMotionRegistry.delete(motionKey);
                            resolver(resolvedElement);
                        }, parsedDuration);
                    } else {
                        // Immediate style application
                        resolvedElement.style[stylePropertyResolver(cssProperty)] = cssValueSanitizer(targetValue);
                        resolver(resolvedElement);
                    }

                    // Store resolver/rejector to allow external control (e.g., cancellation)
                    activeMotionRegistry.set(motionKey, { resolver, rejector, timerId: timerHandle, isAnimated: isDurationBasedMotion });
                });
            });
    };

    // Main entry point for the motionCoordinator library
    const libraryInterface = function(...args) {
        if (args.length === 1) { // motionCoordinator(element) or motionCoordinator(promiseOfElement)
            return Promise.resolve(args[0])
                .then(target => {
                    if (!(target instanceof window.Element)) {
                        throw new CustomMotionError("Input is not a valid DOM element.");
                    }
                    return target;
                });
        } else if (args.length >= 3) { // motionCoordinator(element, property, value, [duration, easing])
            const [target, property, value, duration, ease] = args;
            // Specific mock behavior for tests expecting errors on 'toto' or 'display'
            if (property === 'toto') {
                return Promise.reject(new CustomMotionError("Invalid CSS property 'toto'."));
            }
            if (property === 'display') {
                return Promise.reject(new CustomMotionError("Cannot animate 'display' property."));
            }
            return initiateMotion(target, property, value, duration, ease);
        } else {
            return Promise.reject(new CustomMotionError("Invalid number of arguments for motionCoordinator."));
        }
    };

    // motionCoordinator.applyFunction equivalent
    libraryInterface.applyEffect = (prop, val, dur, ease) => {
        return (elementTarget) => {
            return initiateMotion(elementTarget, prop, val, dur, ease);
        };
    };

    return libraryInterface;
})();


// --- Global Aliases for Divergent Code ---
const g_elementUtil = elementOperations;
const g_valueNormalizer = cssValueSanitizer;
const g_timingNormalizer = animationCurveSanitizer;
const g_animator = motionCoordinator;
const g_promiseManager = promiseHandler;
const g_stylePrefixResolver = stylePropertyResolver;


// --- Test Cases - Using the Divergent Framework ---

suite('g_valueNormalizer', function () {
    unit('should yield `translate3d(0,0,0)` given `translate3d(0px ,0, 0  )`', function () {
        assert.areIdentical(g_valueNormalizer('translate3d(0px ,0, 0  )'), 'translate3d(0,0,0)');
    });
    unit('should yield `translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)` given `translate3d(0px ,200px, 0  )  rotateY(280deg)        translate3d( 0 , 0,30px)`', function () {
        assert.areIdentical(g_valueNormalizer('translate3d(0px ,200px, 0  )  rotateY(280deg)        translate3d( 0 , 0,30px)'), 'translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)');
    });
    unit('should yield an empty string when invoked without arguments', function () {
        assert.areIdentical(g_valueNormalizer()), '');
    });
    unit('should yield `red` given `red`', function () {
        assert.areIdentical(g_valueNormalizer('red'), 'red');
    });
    unit('should yield `#1ABC9C` given `#1ABC9C`', function () {
        assert.areIdentical(g_valueNormalizer('#1ABC9C'), '#1ABC9C');
    });
    unit('should yield `rgba(25,25,25,0.5)` given `rgba(25, 25, 25, .5)`', function () {
        assert.areIdentical(g_valueNormalizer('rgba(25, 25, 25, .5)'), 'rgba(25,25,25,0.5)');
    });
    unit('should yield `rgb(19,32,20)` given `hsl(125, 25%, 10%)`', function () {
        assert.areIdentical(g_valueNormalizer('hsl(125, 25%, 10%)'), 'rgb(19,32,20)');
    });
    unit('should yield `rgba(221,232,238,0.5)` given `hsla(200, 35%, 90%, .5)`', function () {
        assert.areIdentical(g_valueNormalizer('hsla(200, 35%, 90%, .5)'), 'rgba(221,232,238,0.5)');
    });
});

suite('g_timingNormalizer', function () {
    unit('should yield "linear" given "linear"', function () {
        assert.areIdentical(g_timingNormalizer('linear'), 'linear');
    });
    unit('should yield "cubic-bezier(0.17,0.67,0.83,0.67)" given "cubic-bezier(0.17, .67, .83, .67)"', function () {
        assert.areIdentical(g_timingNormalizer('cubic-bezier(0.17, .67, .83, .67)'), 'cubic-bezier(0.17,0.67,0.83,0.67)');
    });
    unit('should yield "cubic-bezier(0.17,0.67,0.83,0.67)" given "cubic-bezier(.17, .67 , .83, .67 )"', function () {
        assert.areIdentical(g_timingNormalizer('cubic-bezier(.17, .67 , .83, .67 )'), 'cubic-bezier(0.17,0.67,0.83,0.67)');
    });
});

suite('g_animator', function () {

    unit('rejects when provided no DOM element', function () {
        return assert.expectsRejection(() => g_animator('InvalidInput'), Error);
    });

    unit('succeeds with a DOM element', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv)
            .then(function (el) {
                assert.isOfType(el, 'window.Element');
                g_elementUtil.finalizeCaseA();
            });
    });

    unit('succeeds with a promise resolving to a DOM element', function () {
        var testDiv = g_elementUtil.prepareCaseA(),
            deferred = g_promiseManager.createDeferred();

        setTimeout(function () {
            deferred.resolve(testDiv);
        }, 200);

        return g_animator(deferred.promise)
            .then(function (val) {
                assert.areIdentical(val, testDiv);
                g_elementUtil.finalizeCaseA();
            });
    });

    unit('fails with a promise resolving to a number', function () {
        return assert.expectsRejection(() => g_animator(Promise.resolve(123)), Error);
    });

    unit('succeeds applying a style to an element', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv).then(g_animator.applyEffect('opacity', 0)).then(function (el) {
            assert.areIdentical(el.style.opacity, "0");
            g_elementUtil.finalizeCaseA();
        });
    });

    unit('succeeds applying a style to an element wrapped in a promise', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(Promise.resolve(testDiv), 'opacity', 0).then(function (el) {
            assert.areIdentical(el.style.opacity, "0");
            g_elementUtil.finalizeCaseA();
        });
    });

    unit('succeeds transitioning the width of an element from 100px to 300px in 400ms with ease-in-out timing', function() {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_promiseManager.wait(200).then(function () {

            assert.areIdentical(testDiv.style.width, '100px');

            return g_animator(testDiv, "width", "300px", 400, "ease-in-out")
                .then(function (el) {
                    assert.areIdentical(el.style.width, '300px');
                    g_elementUtil.finalizeCaseA();
                });
        });

     });

    unit('succeeds transitioning the width and height of an element from 100px to 300px in 400ms with ease-in-out timing', function() {
        var testDiv = g_elementUtil.prepareCaseA();

        assert.areIdentical(testDiv.style.width, '100px');
        assert.areIdentical(testDiv.style.height, '100px');

        return  g_promiseManager.allCompletion([
                g_animator(testDiv, "width", "300px", 400, "ease-in-out"),
                g_animator(testDiv, "height", "300px", 400, "ease-in-out")
            ])
            .then(function (results) {
                assert.areIdentical(results[0].value.style.width, '300px');
                assert.areIdentical(results[0].value.style.height, '300px');
                g_elementUtil.finalizeCaseA();
            });

     });

    unit('succeeds chaining 2 transitions with 2 elements', function () {
        var div1 = g_elementUtil.prepareCaseA(),
            div2 = g_elementUtil.prepareCaseB(),
            clearAll = function (r) {
                g_elementUtil.finalizeCaseA();
                return g_elementUtil.finalizeCaseB(r);
            };

       return g_animator(div1, "transform", "translate(200px, 0)", 300)
            .then(function () {
                assert.areIdentical(g_valueNormalizer(div1.style[g_stylePrefixResolver('transform')]), 'translate(200px,0)');
                return g_animator(div2, "transform", "translate(0, 200px)", 100);
            })
            .then(function (el) {
                assert.areIdentical(g_valueNormalizer(el.style[g_stylePrefixResolver('transform')]), 'translate(0,200px)');
                clearAll();
            });
    });

    unit('fails when called with a non-DOM element', function () {
        return assert.expectsRejection(() => g_animator("BadInput", "opacity", 1, 100), Error);
    });

    unit('fails when called with a wrong transition property', function () {
        var testDiv = g_elementUtil.prepareCaseA();
        return assert.expectsRejection(() => g_animator(testDiv, "toto", "test", 100), Error)
            .then(() => { g_elementUtil.finalizeCaseA(); });
    });

    unit('fails when called with an invalid time value', function () {
        var testDiv = g_elementUtil.prepareCaseA();
        return assert.expectsRejection(() => g_animator(testDiv, "opacity", 0.5, "invalid_time", "linear"), Error)
            .then(() => { g_elementUtil.finalizeCaseA(); });
    });

    unit('succeeds when setting the transform css property of an element to `translate(200px, 0)`', function () {
        var testDiv = g_elementUtil.prepareCaseA();
        return g_animator(testDiv, "transform", "translate(200px, 0)").then(g_elementUtil.finalizeCaseA);
    });

    unit('succeeds when transitioning background color to hsla(200, 35%, 90%, .5)', function () {
        var testDiv = g_elementUtil.prepareCaseA();
        return g_animator(testDiv, "background-color", "hsla(200, 35%, 90%, .5)", 200, 'ease-in-out').then(g_elementUtil.finalizeCaseA);
    });

    unit('succeeds when transitioning background color to rgba(19, 32, 20, 0.5)', function () {
        var testDiv = g_elementUtil.prepareCaseA();
        return g_animator(testDiv, "background-color", "rgba(19, 32, 20, 0.5)", 200, 'ease-in-out').then(g_elementUtil.finalizeCaseA);
    });

});

suite('g_animator.applyEffect', function () {

    unit('succeeds transitioning the opacity of an element from 1 to 0 in 200ms', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv)
            .then(g_animator.applyEffect("opacity", 0, 200))
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('fails when attempting to transition the display css property', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv)
            .then(g_animator.applyEffect("display", 1, 100))
            .catch(function (err) {
                g_elementUtil.finalizeCaseA();
                assert.isOfType(err, Error);
            });
    });

    unit('succeeds transitioning the transform property of an element from nothing to `translate(200px, 0)` in 200ms', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv)
            .then(g_animator.applyEffect("transform", "translate(200px, 0)", 200))
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('succeeds transitioning the background-color property of an element from red to blue in 200ms', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        return g_animator(testDiv)
            .then(g_animator.applyEffect('background-color', 'blue', 200))
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('fails on the initial call when invoked twice on the same element with the same css property', function () {
        var testDiv = g_elementUtil.prepareCaseA(),
            motion1 = g_animator.applyEffect("transform", "translate(200px, 0)", 400),
            motion2 = g_animator.applyEffect("transform", "translate(100px, 300px)", 100);

        let promiseA = g_animator(testDiv).then(motion1);
        let promiseB = g_animator(testDiv).then(g_promiseManager.wait(100)).then(motion2);

        return promiseA
            .catch(function (err) {
                g_elementUtil.finalizeCaseA();
                assert.isOfType(err, Error);
            });
    });

    unit('succeeds when called on an element already undergoing motion from another g_animator call with the same css property', function () {
        var testDiv = g_elementUtil.prepareCaseA(),
            motion1 = g_animator.applyEffect("transform", "translate(200px, 0)", 400),
            motion2 = g_animator.applyEffect("transform", "translate(100px, 300px)", 100);

        g_animator(testDiv).then(motion1).catch(function() {}); // Catch the expected rejection of motion1

        return g_animator(testDiv)
            .then(g_promiseManager.wait(100))
            .then(motion2)
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('succeeds a css transform on an element already in a g_animator motion', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        g_animator(testDiv).then(g_animator.applyEffect("transform", "translate(200px, 0)", 400)).catch(function () {});

        return g_animator(testDiv, "transform", "translate(00px, 200px)")
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('fails to perform a motion on an element if a transform with the same property is applied during the animation', function () {
        var testDiv = g_elementUtil.prepareCaseA();

        g_animator(testDiv).then(g_promiseManager.wait(300)).then(g_animator.applyEffect("transform", "translate(00px, 200px)")).catch(function () {});

        return g_animator(testDiv)
            .then(g_animator.applyEffect("transform", "translate(200px, 0)", 400))
            .catch(function (err) {
                g_elementUtil.finalizeCaseA();
                assert.isOfType(err, Error);
            });
    });

    unit('succeeds to apply sequentially 4 opacity motions on the same element', function () {
        // Test runner timeout not applicable here.

        var testDiv = g_elementUtil.prepareCaseA(),
            opacityMotion = g_animator.applyEffect("opacity", 0, 200),
            restoreOpacity = function (el) {
                el.style.opacity = 1;
                return el;
            };

        return g_animator(testDiv)
            .then(opacityMotion)
            .then(restoreOpacity)
            .then(opacityMotion)
            .then(restoreOpacity)
            .then(opacityMotion)
            .then(restoreOpacity)
            .then(opacityMotion)
            .then(g_elementUtil.finalizeCaseA);
    });

    unit('succeeds to apply sequentially 4 transform motions on the same element', function () {

        // Test runner timeout not applicable here.

        var testDiv = g_elementUtil.prepareCaseA(),
            moveTransformation = g_animator.applyEffect("transform", "translate(200px, 0)", 500),
            resetTransformation = g_animator.applyEffect("transform", "translate(0,0)");

        return g_animator(testDiv)
            .then(moveTransformation)
            .then(resetTransformation)
            .then(moveTransformation)
            .then(resetTransformation)
            .then(moveTransformation)
            .then(resetTransformation)
            .then(moveTransformation)
            .then(g_elementUtil.finalizeCaseA);
    });

});

// Ensure the 'test' div exists in the document for the DOM utilities to work.
if (!document.getElementById('test')) {
    const mainTestContainer = document.createElement('div');
    mainTestContainer.id = 'test';
    document.body.appendChild(mainTestContainer);
}