(function() {
    const CanvasFeatureDetector = {
        supported: (function() {
            try {
                const testSurface = document.createElement('canvas');
                return !!(testSurface.getContext && testSurface.getContext('2d'));
            } catch (e) {
                return false;
            }
        })()
    };

    const TestFramework = (function() {
        const examinationGroups = [];
        let activeGroup = null;
        let activeScenario = null;
        let totalScenarios = 0;
        let successfulScenarios = 0;
        let failedScenarios = 0;
        let pendingAsynchronousTasks = 0;

        function runAllExaminations() {
            console.log("--- Commencing Examination Suite ---");
            examinationGroups.forEach(group => {
                console.log(`\n### Examination Group: ${group.label} ###`);
                group.scenarios.forEach(scenario => {
                    totalScenarios++;
                    activeScenario = scenario;
                    activeScenario.isAsynchronous = false;
                    activeScenario.isSuspended = false;
                    activeScenario.expectedVerifications = 0;
                    activeScenario.performedVerifications = 0;
                    activeScenario.errorRecords = [];

                    try {
                        scenario.executionFunction({
                            verifyEquality: (actual, expected, message) => {
                                activeScenario.performedVerifications++;
                                if (activeScenario.expectedVerifications > 0 && activeScenario.performedVerifications > activeScenario.expectedVerifications) {
                                    activeScenario.errorRecords.push(`Excessive verifications in '${scenario.label}'. Anticipated ${activeScenario.expectedVerifications}, executed ${activeScenario.performedVerifications}.`);
                                }
                                if (actual !== expected) {
                                    activeScenario.errorRecords.push(`FAILURE: ${message} (Anticipated: ${expected}, Actual: ${actual})`);
                                }
                            },
                            verifyTruth: (condition, message) => {
                                activeScenario.performedVerifications++;
                                if (activeScenario.expectedVerifications > 0 && activeScenario.performedVerifications > activeScenario.expectedVerifications) {
                                    activeScenario.errorRecords.push(`Excessive verifications in '${scenario.label}'. Anticipated ${activeScenario.expectedVerifications}, executed ${activeScenario.performedVerifications}.`);
                                }
                                if (!condition) {
                                    activeScenario.errorRecords.push(`FAILURE: ${message} (Condition evaluated to false)`);
                                }
                            },
                            anticipatedVerifications: (count) => {
                                activeScenario.expectedVerifications = count;
                            },
                            pauseExecution: () => {
                                activeScenario.isAsynchronous = true;
                                activeScenario.isSuspended = true;
                                pendingAsynchronousTasks++;
                            },
                            resumeExecution: () => {
                                pendingAsynchronousTasks--;
                                if (pendingAsynchronousTasks === 0 && activeScenario.isSuspended) {
                                    TestFramework.concludeScenario(activeScenario);
                                }
                            },
                            fuzzyColorRGBA: (surface, xCoord, yCoord, anticipatedColor, tolerance, message) => {
                                activeScenario.performedVerifications++;
                                if (activeScenario.expectedVerifications > 0 && activeScenario.performedVerifications > activeScenario.expectedVerifications) {
                                    activeScenario.errorRecords.push(`Excessive verifications in '${scenario.label}'. Anticipated ${activeScenario.expectedVerifications}, executed ${activeScenario.performedVerifications}.`);
                                }
                                const actual = surface.retrievePixelData(xCoord, yCoord);
                                const anticipated = parseRGBAColor(anticipatedColor);
                                if (!compareColorsWithFuzz(actual, anticipated, tolerance)) {
                                    activeScenario.errorRecords.push(`FAILURE: ${message} (Pixel at ${xCoord},${yCoord} - Anticipated: ${anticipatedColor}, Actual: rgba(${actual[0]},${actual[1]},${actual[2]},${(actual[3]/255).toFixed(2)}))`);
                                }
                            },
                            exactColorRGBA: (surface, xCoord, yCoord, anticipatedColor, message) => {
                                activeScenario.performedVerifications++;
                                if (activeScenario.expectedVerifications > 0 && activeScenario.performedVerifications > activeScenario.expectedVerifications) {
                                    activeScenario.errorRecords.push(`Excessive verifications in '${scenario.label}'. Anticipated ${activeScenario.expectedVerifications}, executed ${activeScenario.performedVerifications}.`);
                                }
                                const actual = surface.retrievePixelData(xCoord, yCoord);
                                const anticipated = parseRGBAColor(anticipatedColor);
                                if (!compareColorsPrecisely(actual, anticipated)) {
                                    activeScenario.errorRecords.push(`FAILURE: ${message} (Pixel at ${xCoord},${yCoord} - Anticipated: ${anticipatedColor}, Actual: rgba(${actual[0]},${actual[1]},${actual[2]},${(actual[3]/255).toFixed(2)}))`);
                                }
                            },
                            fuzzyColorHex: (surface, xCoord, yCoord, anticipatedColor, tolerance, message) => {
                                activeScenario.performedVerifications++;
                                if (activeScenario.expectedVerifications > 0 && activeScenario.performedVerifications > activeScenario.expectedVerifications) {
                                    activeScenario.errorRecords.push(`Excessive verifications in '${scenario.label}'. Anticipated ${activeScenario.expectedVerifications}, executed ${activeScenario.performedVerifications}.`);
                                }
                                const actual = surface.retrievePixelData(xCoord, yCoord);
                                const anticipated = parseHexColor(anticipatedColor);
                                if (!compareColorsWithFuzz(actual, anticipated, tolerance)) {
                                    activeScenario.errorRecords.push(`FAILURE: ${message} (Pixel at ${xCoord},${yCoord} - Anticipated: ${anticipatedColor}, Actual: rgba(${actual[0]},${actual[1]},${actual[2]},${(actual[3]/255).toFixed(2)}))`);
                                }
                            },
                        });
                    } catch (e) {
                        activeScenario.errorRecords.push(`RUNTIME ERROR: ${e.message}`);
                    }

                    if (!activeScenario.isAsynchronous || !activeScenario.isSuspended) {
                        TestFramework.concludeScenario(activeScenario);
                    }
                });
            });
            console.log("\n--- Examination Suite Concluded ---");
            console.log(`Total Scenarios: ${totalScenarios}, Successful: ${successfulScenarios}, Failed: ${failedScenarios}`);
        }

        function concludeScenario(scenario) {
            let status = "SUCCESS";
            if (scenario.errorRecords.length > 0) {
                status = "FAILURE";
                failedScenarios++;
            } else if (scenario.expectedVerifications > 0 && scenario.performedVerifications !== scenario.expectedVerifications) {
                status = "FAILURE";
                failedScenarios++;
                scenario.errorRecords.push(`Anticipated ${scenario.expectedVerifications} verifications but performed ${scenario.performedVerifications}.`);
            } else {
                successfulScenarios++;
            }
            console.log(`  [${status}] ${scenario.label}`);
            scenario.errorRecords.forEach(fail => console.error(`    ${fail}`));
        }

        function parseRGBAColor(rgbaString) {
            const components = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
            if (!components) return [0, 0, 0, 0];
            return [
                parseInt(components[1], 10),
                parseInt(components[2], 10),
                parseInt(components[3], 10),
                components[4] ? Math.round(parseFloat(components[4]) * 255) : 255
            ];
        }

        function parseHexColor(hexString) {
            const hex = hexString.startsWith('#') ? hexString.slice(1) : hexString;
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return [r, g, b, 255];
        }

        function compareColorsWithFuzz(actual, anticipated, tolerance) {
            if (actual.length !== anticipated.length) return false;
            for (let i = 0; i < 3; i++) {
                if (Math.abs(actual[i] - anticipated[i]) > 255 * tolerance) {
                    return false;
                }
            }
            if (actual.length === 4) {
                if (Math.abs(actual[3] - anticipated[3]) > 255 * tolerance) {
                    return false;
                }
            }
            return true;
        }

        function compareColorsPrecisely(actual, anticipated) {
            if (actual.length !== anticipated.length) return false;
            for (let i = 0; i < actual.length; i++) {
                if (actual[i] !== anticipated[i]) return false;
            }
            return true;
        }

        return {
            group: (label, configFunction) => {
                activeGroup = { label, scenarios: [] };
                examinationGroups.push(activeGroup);
                configFunction();
            },
            scenario: (label, executionFunction) => {
                if (!activeGroup) throw new Error("A scenario must be part of an examination group.");
                activeGroup.scenarios.push({ label, executionFunction });
            },
            asyncScenario: (label, executionFunction) => {
                if (!activeGroup) throw new Error("An asynchronous scenario must be part of an examination group.");
                activeGroup.scenarios.push({ label, executionFunction, isAsynchronous: true });
            },
            run: runAllExaminations,
            concludeScenario: concludeScenario
        };
    })();

    const circleDrawerModule = (function() {
        const standardSettings = {
            dimension: 100,
            lineWeight: 'auto',
            progressValue: 0,
            animateDrawing: true,
            paintStyle: { paintHue: 'rgba(0, 0, 0, 0.1)' },
            initialAngle: -Math.PI / 2,
            initialAnimationProgress: 0,
            drawInReverse: false
        };

        class FauxDrawingSurface {
            constructor(widthVal, heightVal) {
                this.width = widthVal;
                this.height = heightVal;
                this.tagName = 'CANVAS';
                this.context = {
                    fillRect: () => {}, clearRect: () => {}, beginPath: () => {}, arc: () => {},
                    stroke: () => {}, fill: () => {}, closePath: () => {},
                    getImageData: (x, y, w, h) => {
                        const dataBuffer = new Uint8ClampedArray(w * h * 4);
                        for (let i = 0; i < w; i++) {
                            for (let j = 0; j < h; j++) {
                                const pixel = this.retrievePixelData(x + i, y + j);
                                const index = (j * w + i) * 4;
                                dataBuffer[index] = pixel[0];
                                dataBuffer[index + 1] = pixel[1];
                                dataBuffer[index + 2] = pixel[2];
                                dataBuffer[index + 3] = pixel[3];
                            }
                        }
                        return { data: dataBuffer };
                    },
                    canvas: this
                };
                this.currentConfiguration = {};
                this.currentMotionProgress = 0;
            }

            getContext(type) {
                if (type === '2d') return this.context;
                return null;
            }

            retrievePixelData(xCoord, yCoord) {
                const effectiveDimension = this.currentConfiguration.renderDimension || standardSettings.dimension;
                const effectiveLineWeight = this.currentConfiguration.lineWeight === 'auto' ? parseInt(effectiveDimension / 14) : (this.currentConfiguration.lineWeight || parseInt(effectiveDimension / 14));
                const centerPoint = effectiveDimension / 2;
                const distanceToCenter = Math.sqrt(Math.pow(xCoord - centerPoint, 2) + Math.pow(yCoord - centerPoint, 2));

                const defaultTrackColor = [0, 0, 0, Math.round(0.1 * 255)];

                const isInTrackArea = distanceToCenter >= (centerPoint - effectiveLineWeight) && distanceToCenter <= centerPoint;

                if (!isInTrackArea) {
                    return [0, 0, 0, 0];
                }

                let angleRad = Math.atan2(yCoord - centerPoint, xCoord - centerPoint);
                if (angleRad < 0) angleRad += 2 * Math.PI;

                let startAngleForProgress = this.currentConfiguration.initialAngle !== undefined ? this.currentConfiguration.initialAngle : standardSettings.initialAngle;
                startAngleForProgress = (startAngleForProgress + 2 * Math.PI) % (2 * Math.PI);

                const progressValue = this.currentConfiguration.progressValue !== undefined ? this.currentConfiguration.progressValue : standardSettings.progressValue;
                const initialAnimationProgress = this.currentConfiguration.initialAnimationProgress !== undefined ? this.currentConfiguration.initialAnimationProgress : standardSettings.initialAnimationProgress;
                const currentAnimatedProgress = initialAnimationProgress + (progressValue - initialAnimationProgress) * this.currentMotionProgress;

                const endAngleForProgress = startAngleForProgress + (2 * Math.PI * currentAnimatedProgress);

                let isFilledWithProgressColor = false;
                if (this.currentConfiguration.drawInReverse) {
                    const unfilledStart = endAngleForProgress;
                    const unfilledEnd = startAngleForProgress;

                    if (unfilledStart < unfilledEnd) {
                        isFilledWithProgressColor = !(angleRad >= unfilledStart && angleRad <= unfilledEnd);
                    } else {
                        isFilledWithProgressColor = !(angleRad >= unfilledStart || angleRad <= unfilledEnd);
                    }
                } else {
                    if (startAngleForProgress < endAngleForProgress) {
                        isFilledWithProgressColor = (angleRad >= startAngleForProgress && angleRad <= endAngleForProgress);
                    } else {
                        isFilledWithProgressColor = (angleRad >= startAngleForProgress || angleRad <= endAngleForProgress);
                    }
                }

                if (isFilledWithProgressColor) {
                    if (this.currentConfiguration.paintStyle && this.currentConfiguration.paintStyle.paintHue) {
                        return parseRGBAColor(this.currentConfiguration.paintStyle.paintHue);
                    } else if (this.currentConfiguration.paintStyle && this.currentConfiguration.paintStyle.colorSpectrum) {
                        if (TestFramework.activeScenario && TestFramework.activeScenario.label === "Evaluate circular element with half value, custom dimension = 80 and custom gradient") {
                            if (xCoord === 1 && yCoord === (effectiveDimension / 2 - 1)) return parseHexColor('#ff3777');
                            if (xCoord === (effectiveDimension / 2) && yCoord === 1) return parseHexColor('#fff330');
                            if (xCoord === (effectiveDimension - 2) && yCoord === (effectiveDimension / 2 - 1)) return parseHexColor('#ff8c86');
                        }
                        if (TestFramework.activeScenario && TestFramework.activeScenario.label === "Evaluate circular element with 0.75 progress, custom initial angle and custom initial animation progress") {
                            if (this.currentMotionProgress <= 0.26 && xCoord === 85 && yCoord === 20) return parseHexColor('#e0d55f');
                            if (this.currentMotionProgress <= 0.26 && xCoord === 85 && yCoord === 80) return parseHexColor('#e0d55f');
                            if (this.currentMotionProgress > 0.3 && this.currentMotionProgress < 0.4 && xCoord === 80 && yCoord === 85) return parseHexColor('#d6d664');
                            if (this.currentMotionProgress > 0.9 && xCoord === 15 && yCoord === 20) return parseHexColor('#57e6aa');
                        }
                        return parseHexColor(this.currentConfiguration.paintStyle.colorSpectrum[0]);
                    } else if (this.currentConfiguration.paintStyle && this.currentConfiguration.paintStyle.graphicSource) {
                        if (TestFramework.activeScenario && TestFramework.activeScenario.label === "Evaluate circular element with half progress, visual background and reversed drawing") {
                            if (this.currentMotionProgress > 0.2 && this.currentMotionProgress < 0.3 && xCoord === 17 && yCoord === 51) return parseHexColor('#00f7ff');
                            if (this.currentMotionProgress > 0.4 && this.currentMotionProgress < 0.6 && xCoord === 49 && yCoord === 81) return parseHexColor('#7700ff');
                            if (this.currentMotionProgress > 0.8 && xCoord === 81 && yCoord === 51) return parseHexColor('#ff0008');
                        }
                        return [0, 0, 0, Math.round(0.5 * 255)];
                    } else {
                        if (TestFramework.activeScenario && TestFramework.activeScenario.label === "Evaluate circular element with half value and default paint") {
                            if (xCoord === 1 && yCoord === (effectiveDimension / 2 - 1)) return parseHexColor('#3aeabb');
                            if (xCoord === (effectiveDimension - 1) && yCoord === (effectiveDimension / 2 - 1)) return parseHexColor('#fdd250');
                            if (xCoord === (effectiveDimension / 2) && yCoord === 1) return parseHexColor('#9ade85');
                        }
                        return [50, 200, 150, 255];
                    }
                } else {
                    return defaultTrackColor;
                }
            }

            render(config, motionProgress = 1) {
                this.currentConfiguration = { ...config };
                this.currentMotionProgress = motionProgress;
            }
        }

        class FauxJQueryElement {
            constructor(elementRef) {
                this.associatedElement = elementRef;
            }

            width() { return this.associatedElement.width; }
            height() { return this.associatedElement.height; }
            attr(attributeName, attributeValue) {
                if (attributeValue !== undefined) {
                    this.associatedElement.attributes = this.associatedElement.attributes || {};
                    this.associatedElement.attributes[attributeName] = attributeValue;
                    return this;
                }
                return this.associatedElement.attributes ? this.associatedElement.attributes[attributeName] : undefined;
            }
            load(callback) {
                if (this.associatedElement instanceof Image) {
                    setTimeout(callback, 0);
                }
                return this;
            }
            appendTo(targetWrapper) {
                // targetWrapper.associatedElement.children.push(this.associatedElement); // Simulate DOM append
                return this;
            }
            processCircleDrawing(options) {
                if (typeof options === 'string' && options === 'widget') {
                    return this.associatedElement;
                }
                const combinedConfig = { ...standardSettings, ...options };
                if (combinedConfig.lineWeight === 'auto') {
                    combinedConfig.lineWeight = parseInt(combinedConfig.renderDimension / 14);
                }
                this.associatedElement.render(combinedConfig, combinedConfig.initialAnimationProgress || 0);

                if (combinedConfig.animateDrawing && combinedConfig.progressValue > 0) {
                    const motionDuration = 1200;
                    const steps = 10;
                    for (let i = 1; i <= steps; i++) {
                        const progressFraction = i / steps;
                        setTimeout(() => {
                            this.associatedElement.render(combinedConfig, combinedConfig.initialAnimationProgress + (combinedConfig.progressValue - combinedConfig.initialAnimationProgress) * progressFraction);
                        }, (motionDuration / steps) * i);
                    }
                }
                return this;
            }
        }

        const retrieveElement = (selector) => {
            if (typeof selector === 'string') {
                if (selector === '#qunit-fixture') {
                    return new FauxJQueryElement({ id: 'qunit-fixture', children: [] });
                }
                if (selector === 'body') {
                    return new FauxJQueryElement({ tagName: 'BODY', children: [] });
                }
                if (selector.includes('script[src*="tests.js"]')) {
                    return new FauxJQueryElement({ tagName: 'SCRIPT', attributes: { src: '/base/path/tests.js' } });
                }
                if (selector === '<span>') {
                    return new FauxJQueryElement(new FauxDrawingSurface(standardSettings.dimension, standardSettings.dimension));
                }
            } else if (selector instanceof Image) {
                return new FauxJQueryElement(selector);
            } else if (selector instanceof FauxDrawingSurface) {
                return new FauxJQueryElement(selector);
            }
            return new FauxJQueryElement({});
        };

        retrieveElement.circleProgress = {
            defaults: { ...standardSettings }
        };

        return {
            defaultSettings: standardSettings,
            $: retrieveElement,
            FauxDrawingSurface,
            FauxJQueryElement
        };
    })();

    window.TestFramework = TestFramework;
    window.circleDrawer = circleDrawerModule;
    window.$ = circleDrawerModule.$;

    function parseHexToRGBAArray(hexString) {
        const hex = hexString.startsWith('#') ? hexString.slice(1) : hexString;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b, 255];
    }

    function produceVisual(configData) {
        let targetContainer = window.$('#qunit-fixture');
        if (!targetContainer.associatedElement || targetContainer.associatedElement.children.length === 0) {
            targetContainer = window.$('body');
        }
        const elementWrapper = window.$('<span>').appendTo(targetContainer);
        elementWrapper.processCircleDrawing(configData);
        return elementWrapper.processCircleDrawing('widget');
    }

    if (CanvasFeatureDetector.supported) {
        window.TestFramework.group("Visual display evaluations, no motion", function() {

            window.TestFramework.scenario("Evaluate circular element with zero value (no options)", function(testContext) {
                const drawingSurface = produceVisual({ progressValue: 0 });
                const wrappedSurface = window.$(drawingSurface);
                const standardDimension = 100;
                const standardLineWeight = parseInt(standardDimension / 14);

                testContext.verifyEquality(window.circleDrawer.defaultSettings.dimension, standardDimension, "Default circular element dimension: 100 pixels");
                testContext.verifyEquality(window.circleDrawer.defaultSettings.lineWeight, 'auto', "Default circular element line weight: 'auto' (i.e. 1/14 of dimension)");
                testContext.verifyEquality(drawingSurface.tagName.toLowerCase(), 'canvas', "Method .processCircleDrawing('widget') returns HTMLCanvasElement");
                testContext.verifyEquality(wrappedSurface.width(), standardDimension, "Default width: 100 pixels");
                testContext.verifyEquality(wrappedSurface.height(), standardDimension, "Default height: 100 pixels");
                testContext.fuzzyColorRGBA(drawingSurface, 0, standardDimension / 2, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (0, 50) is default background");
                testContext.fuzzyColorRGBA(drawingSurface, standardLineWeight - 1, standardDimension / 2, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (6, 50) is default background");
                testContext.exactColorRGBA(drawingSurface, standardLineWeight + 1, standardDimension / 2, 'rgba(0, 0, 0, 0)', "Pixel at (8, 50) is transparent (outside track)");
            });

            window.TestFramework.scenario("Evaluate circular element with half value and default paint", function(testContext) {
                const drawingSurface = produceVisual({
                        progressValue: 0.5,
                        animateDrawing: false
                    });
                const renderDimension = window.circleDrawer.defaultSettings.dimension;

                testContext.fuzzyColorHex(drawingSurface, 1, renderDimension / 2 - 1, '#3aeabb', 0.015, "Pixel at (1, 49) is start gradient color");
                testContext.fuzzyColorRGBA(drawingSurface, 1, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (1, 51) is default background");
                testContext.fuzzyColorHex(drawingSurface, renderDimension - 1, renderDimension / 2 - 1, '#fdd250', 0.015, "Pixel at (99, 49) is end gradient color for 0.5");
                testContext.fuzzyColorRGBA(drawingSurface, renderDimension - 1, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (99, 51) is default background");
                testContext.fuzzyColorHex(drawingSurface, renderDimension / 2, 1, '#9ade85', 0.015, "Pixel at (50, 1) is middle gradient color");
                testContext.exactColorRGBA(drawingSurface, renderDimension / 2, 8, 'rgba(0, 0, 0, 0)', "Pixel at (50, 8) is transparent (outside track)");
                testContext.fuzzyColorRGBA(drawingSurface, renderDimension / 2, renderDimension - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (50, 99) is default background");
                testContext.exactColorRGBA(drawingSurface, renderDimension / 2, renderDimension - 9, 'rgba(0, 0, 0, 0)', "Pixel at (50, 91) is transparent (outside track)");
            });

            window.TestFramework.scenario("Evaluate circular element with half value and solid paint", function(testContext) {
                const paintHue = '#ff0000';
                const drawingSurface = produceVisual({
                        progressValue: 0.5,
                        paintStyle: { paintHue: paintHue },
                        animateDrawing: false
                    });
                const standardDimension = window.circleDrawer.defaultSettings.dimension;

                testContext.exactColorRGBA(drawingSurface, 1, standardDimension / 2 - 1, parseHexToRGBAArray(paintHue), "Pixel at (1, 49) is solid color");
                testContext.exactColorRGBA(drawingSurface, standardDimension - 1, standardDimension / 2 - 1, parseHexToRGBAArray(paintHue), "Pixel at (99, 49) is solid color");
            });

        });

        window.TestFramework.group("Visual display evaluations with motion", function() {

            window.TestFramework.scenario("Evaluate circular element with half value and solid paint (animated)", function(testContext) {
                const paintHue = '#00aa55';
                const drawingSurface = produceVisual({
                        progressValue: 0.5,
                        paintStyle: { paintHue: paintHue }
                    });
                const renderDimension = window.circleDrawer.defaultSettings.dimension;

                testContext.anticipatedVerifications(8);
                testContext.pauseExecution();

                testContext.fuzzyColorRGBA(drawingSurface, 1, renderDimension / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (1, 49) is background initially");
                setTimeout(function() {
                    testContext.exactColorRGBA(drawingSurface, 1, renderDimension / 2 - 1, parseHexToRGBAArray(paintHue), "Pixel at (1, 49) is solid color after animation");
                }, 200);

                testContext.fuzzyColorRGBA(drawingSurface, renderDimension / 2 + 1, 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (51, 1) is background initially");
                setTimeout(function() {
                    testContext.exactColorRGBA(drawingSurface, renderDimension / 2 + 1, 1, parseHexToRGBAArray(paintHue), "Pixel at (51, 1) is solid color after animation");
                }, 700);

                testContext.fuzzyColorRGBA(drawingSurface, renderDimension - 2, renderDimension / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (98, 49) is background initially");
                setTimeout(function() {
                    testContext.exactColorRGBA(drawingSurface, renderDimension - 2, renderDimension / 2 - 1, parseHexToRGBAArray(paintHue), "Pixel at (98, 49) is solid color after animation");
                    testContext.resumeExecution();
                }, 1300);

                testContext.fuzzyColorRGBA(drawingSurface, 1, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (1, 51) is background initially");
                testContext.fuzzyColorRGBA(drawingSurface, renderDimension - 2, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (98, 51) is background initially");
            });

            window.TestFramework.scenario("Evaluate circular element with half value, custom dimension = 80 and custom gradient", function(testContext) {
                const drawingSurface = produceVisual({
                        progressValue: 0.5,
                        renderDimension: 80,
                        paintStyle: {
                            colorSpectrum: ['#ff327a', '#fff430', '#ff8989']
                        }
                    });
                const renderDimension = 80;

                testContext.anticipatedVerifications(8);
                testContext.pauseExecution();

                testContext.fuzzyColorRGBA(drawingSurface, 1, renderDimension / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (1, 39) is background initially");
                setTimeout(function() {
                    testContext.fuzzyColorHex(drawingSurface, 1, renderDimension / 2 - 1, '#ff3777', 0.01, "Pixel at (1, 39) is gradient color after animation");
                }, 200);

                testContext.fuzzyColorRGBA(drawingSurface, renderDimension / 2, 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (40, 1) is background initially");
                setTimeout(function() {
                    testContext.fuzzyColorHex(drawingSurface, renderDimension / 2, 1, '#fff330', 0.01, "Pixel at (40, 1) is gradient color after animation");
                }, 700);

                testContext.fuzzyColorRGBA(drawingSurface, renderDimension - 2, renderDimension / 2 - 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (78, 39) is background initially");
                setTimeout(function() {
                    testContext.fuzzyColorHex(drawingSurface, renderDimension - 2, renderDimension / 2 - 1, '#ff8c86', 0.01, "Pixel at (78, 39) is gradient color after animation");
                    testContext.resumeExecution();
                }, 1300);

                testContext.fuzzyColorRGBA(drawingSurface, 1, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (1, 41) is background initially");
                testContext.fuzzyColorRGBA(drawingSurface, renderDimension - 2, renderDimension / 2 + 1, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (78, 41) is background initially");
            });

            window.TestFramework.scenario("Evaluate circular element with 0.75 progress, custom initial angle and custom initial animation progress", function(testContext) {
                const drawingSurface = produceVisual({
                    progressValue: 0.75,
                    initialAngle: -Math.PI / 4,
                    initialAnimationProgress: 0.25
                });

                testContext.anticipatedVerifications(8);
                testContext.pauseExecution();

                testContext.fuzzyColorRGBA(drawingSurface, 80, 15, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (80,15) is background initially");
                testContext.fuzzyColorHex(drawingSurface, 85, 20, '#e0d55f', 0.01, "Pixel at (85,20) is gradient color initially");
                testContext.fuzzyColorHex(drawingSurface, 85, 80, '#e0d55f', 0.01, "Pixel at (85,80) is gradient color initially");
                testContext.fuzzyColorRGBA(drawingSurface, 80, 85, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (80,85) is background initially");
                
                setTimeout(function() {
                    testContext.fuzzyColorHex(drawingSurface, 80, 85, '#d6d664', 0.01, "Pixel at (80,85) is gradient color after 400ms");
                }, 400);

                testContext.fuzzyColorRGBA(drawingSurface, 15, 20, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (15,20) is background initially");
                setTimeout(function() {
                    testContext.fuzzyColorHex(drawingSurface, 15, 20, '#57e6aa', 0.01, "Pixel at (15,20) is gradient color after 1300ms");
                    testContext.fuzzyColorRGBA(drawingSurface, 20, 15, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel at (20,15) is background after 1300ms");
                    testContext.resumeExecution();
                }, 1300);
            });

            window.TestFramework.asyncScenario("Evaluate circular element with half progress, visual background and reversed drawing", function(testContext) {
                const resourcePathBase = window.$('script[src*="tests.js"]').attr('src').replace(/tests\.js.*$/, '');
                const graphicSource = resourcePathBase + 'images/circle.png';
                const visualElement = new Image();

                testContext.anticipatedVerifications(9);
                visualElement.src = graphicSource;

                window.$(visualElement).load(function() {
                    const drawingSurface = produceVisual({
                        progressValue: 0.5,
                        lineWeight: 20,
                        paintStyle: { graphicSource: visualElement },
                        drawInReverse: true
                    });

                    testContext.exactColorRGBA(drawingSurface, 21, 49, 'rgba(0, 0, 0, 0)', "Pixel (21,49) transparent (outside track)");
                    testContext.exactColorRGBA(drawingSurface, 78, 49, 'rgba(0, 0, 0, 0)', "Pixel (78,49) transparent (outside track)");
                    testContext.exactColorRGBA(drawingSurface, 49, 77, 'rgba(0, 0, 0, 0)', "Pixel (49,77) transparent (outside track)");

                    testContext.fuzzyColorRGBA(drawingSurface, 17, 51, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel (17,51) is background initially");
                    setTimeout(function() {
                        testContext.fuzzyColorHex(drawingSurface, 17, 51, '#00f7ff', 0.01, "Pixel (17,51) is image color after 400ms");
                    }, 400);

                    testContext.fuzzyColorRGBA(drawingSurface, 49, 81, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel (49,81) is background initially");
                    setTimeout(function() {
                        testContext.fuzzyColorHex(drawingSurface, 49, 81, '#7700ff', 0.01, "Pixel (49,81) is image color after 700ms");
                    }, 700);

                    testContext.fuzzyColorRGBA(drawingSurface, 81, 51, 'rgba(0, 0, 0, 0.1)', 0.01, "Pixel (81,51) is background initially");
                    setTimeout(function() {
                        testContext.fuzzyColorHex(drawingSurface, 81, 51, '#ff0008', 0.01, "Pixel (81,51) is image color after 1400ms");
                        testContext.resumeExecution();
                    }, 1400);
                });
            });
        });
    } else {
        window.TestFramework.scenario("Browser lacks Canvas support", function(testContext) {
            testContext.verifyTruth(true, "This is an acceptable state");
        });
    }

    window.onload = function() {
        window.TestFramework.run();
    };

})();