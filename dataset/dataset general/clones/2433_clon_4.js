function createGraphManager(drawingSurface) {
    const renderContext = drawingSurface;
    const initialWidth = renderContext.canvas.width;
    const initialHeight = renderContext.canvas.height;

    // Adjust canvas for high pixel density displays
    (() => {
        const pixelRatio = window.devicePixelRatio;
        if (pixelRatio) {
            renderContext.canvas.style.width = initialWidth + "px";
            renderContext.canvas.style.height = initialHeight + "px";
            renderContext.canvas.height = initialHeight * pixelRatio;
            renderContext.canvas.width = initialWidth * pixelRatio;
            renderContext.scale(pixelRatio, pixelRatio);
        }
    })();

    // Easing functions adapted from Robert Penner's equations
    const motionInterpolators = new Map([
        ['linear', (val) => val],
        ['easeInQuad', (val) => val * val],
        ['easeOutQuad', (val) => -1 * val * (val - 2)],
        ['easeInOutQuad', (val) => {
            val /= 0.5;
            if (val < 1) return 0.5 * val * val;
            return -0.5 * ((--val) * (val - 2) - 1);
        }],
        ['easeInCubic', (val) => val * val * val],
        ['easeOutCubic', (val) => ((val = val / 1 - 1) * val * val + 1)],
        ['easeInOutCubic', (val) => {
            val /= 0.5;
            if (val < 1) return 0.5 * val * val * val;
            return 0.5 * ((val -= 2) * val * val + 2);
        }],
        ['easeInQuart', (val) => val * val * val * val],
        ['easeOutQuart', (val) => -1 * ((val = val / 1 - 1) * val * val * val - 1)],
        ['easeInOutQuart', (val) => {
            val /= 0.5;
            if (val < 1) return 0.5 * val * val * val * val;
            return -0.5 * ((val -= 2) * val * val * val - 2);
        }],
        ['easeInQuint', (val) => val * val * val * val * val],
        ['easeOutQuint', (val) => ((val = val / 1 - 1) * val * val * val * val + 1)],
        ['easeInOutQuint', (val) => {
            val /= 0.5;
            if (val < 1) return 0.5 * val * val * val * val * val;
            return 0.5 * ((val -= 2) * val * val * val * val + 2);
        }],
        ['easeInSine', (val) => -1 * Math.cos(val * (Math.PI / 2)) + 1],
        ['easeOutSine', (val) => Math.sin(val * (Math.PI / 2))],
        ['easeInOutSine', (val) => -0.5 * (Math.cos(Math.PI * val) - 1)],
        ['easeInExpo', (val) => (val === 0) ? 1 : Math.pow(2, 10 * (val - 1))],
        ['easeOutExpo', (val) => (val === 1) ? 1 : (-Math.pow(2, -10 * val) + 1)],
        ['easeInOutExpo', (val) => {
            if (val === 0) return 0;
            if (val === 1) return 1;
            val /= 0.5;
            if (val < 1) return 0.5 * Math.pow(2, 10 * (val - 1));
            return 0.5 * (-Math.pow(2, -10 * --val) + 2);
        }],
        ['easeInCirc', (val) => {
            if (val >= 1) return val;
            return -1 * (Math.sqrt(1 - val * val) - 1);
        }],
        ['easeOutCirc', (val) => Math.sqrt(1 - (val = val / 1 - 1) * val)],
        ['easeInOutCirc', (val) => {
            val /= 0.5;
            if (val < 1) return -0.5 * (Math.sqrt(1 - val * val) - 1);
            return 0.5 * (Math.sqrt(1 - (val -= 2) * val) + 1);
        }],
        ['easeInElastic', (val) => {
            let s = 1.70158;
            let p = 0;
            let a = 1;
            if (val === 0) return 0;
            if ((val /= 1) === 1) return 1;
            if (!p) p = 0.3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (val -= 1)) * Math.sin((val - s) * (2 * Math.PI) / p));
        }],
        ['easeOutElastic', (val) => {
            let s = 1.70158;
            let p = 0;
            let a = 1;
            if (val === 0) return 0;
            if ((val /= 1) === 1) return 1;
            if (!p) p = 0.3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * val) * Math.sin((val - s) * (2 * Math.PI) / p) + 1;
        }],
        ['easeInOutElastic', (val) => {
            let s = 1.70158;
            let p = 0;
            let a = 1;
            if (val === 0) return 0;
            if ((val /= 0.5) === 2) return 1;
            if (!p) p = 0.3 * 1.5;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (val < 1) return -0.5 * (a * Math.pow(2, 10 * (val -= 1)) * Math.sin((val - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (val -= 1)) * Math.sin((val - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }],
        ['easeInBack', (val) => {
            const s = 1.70158;
            return val * val * ((s + 1) * val - s);
        }],
        ['easeOutBack', (val) => {
            const s = 1.70158;
            return ((val = val / 1 - 1) * val * ((s + 1) * val + s) + 1);
        }],
        ['easeInOutBack', (val) => {
            let s = 1.70158;
            val /= 0.5;
            if (val < 1) return 0.5 * (val * val * (((s *= (1.525)) + 1) * val - s));
            return 0.5 * ((val -= 2) * val * (((s *= (1.525)) + 1) * val + s) + 2);
        }],
        ['easeOutBounce', (val) => {
            if ((val /= 1) < (1 / 2.75)) {
                return 1 * (7.5625 * val * val);
            } else if (val < (2 / 2.75)) {
                return 1 * (7.5625 * (val -= (1.5 / 2.75)) * val + 0.75);
            } else if (val < (2.5 / 2.75)) {
                return 1 * (7.5625 * (val -= (2.25 / 2.75)) * val + 0.9375);
            } else {
                return 1 * (7.5625 * (val -= (2.625 / 2.75)) * val + 0.984375);
            }
        }],
        ['easeInBounce', (val) => 1 - motionInterpolators.get('easeOutBounce')(1 - val)],
        ['easeInOutBounce', (val) => {
            if (val < 0.5) return motionInterpolators.get('easeInBounce')(val * 2) * 0.5;
            return motionInterpolators.get('easeOutBounce')(val * 2 - 1) * 0.5 + 0.5;
        }]
    ]);

    // Utility for merging options
    const combineSettings = (base, specific) => Object.assign({}, base, specific);

    // Utility for getting min/max from values
    const determineMinMax = (collection, property) => {
        let maxVal = -Infinity;
        let minVal = Infinity;
        for (const item of collection) {
            maxVal = Math.max(maxVal, item[property]);
            minVal = Math.min(minVal, item[property]);
        }
        return { maximum: maxVal, minimum: minVal };
    };

    // Utility for fallback value
    const getFallback = (primary, secondary) => (primary !== undefined && primary !== null) ? primary : secondary;

    // Helper for generating scale labels
    const createScaleLabels = (tmpl, count, start, step) => {
        const generatedLabels = [];
        for (let i = 0; i < count; i++) {
            const currentVal = start + (i * step);
            generatedLabels.push(tmpl.replace(/<%=value%>/g, currentVal.toString()));
        }
        return generatedLabels;
    };

    // Helper for "nice" numbers
    function getNiceNumber(range, round) {
        const exponent = Math.floor(Math.log10(range));
        const fraction = range / Math.pow(10, exponent);
        let niceFraction;
        if (round) {
            if (fraction < 1.5) niceFraction = 1;
            else if (fraction < 3) niceFraction = 2;
            else if (fraction < 7) niceFraction = 5;
            else niceFraction = 10;
        } else {
            if (fraction <= 1) niceFraction = 1;
            else if (fraction <= 2) niceFraction = 2;
            else if (fraction <= 5) niceFraction = 5;
            else niceFraction = 10;
        }
        return niceFraction * Math.pow(10, exponent);
    }

    // Helper for calculating scale parameters
    const deriveScaleParameters = (availablePx, actualMin, actualMax, labelFormat) => {
        const range = actualMax - actualMin;
        const approximateNumSteps = Math.floor(availablePx / (20 + 2 * (getFallback(null, 12))));
        const roughStep = range / approximateNumSteps;
        const niceStep = getNiceNumber(roughStep, false);
        const lowerBound = Math.floor(actualMin / niceStep) * niceStep;
        const upperBound = Math.ceil(actualMax / niceStep) * niceStep;
        const numSteps = Math.round((upperBound - lowerBound) / niceStep);

        const labels = [];
        for (let i = 0; i <= numSteps; i++) {
            const value = lowerBound + (i * niceStep);
            labels.push(labelFormat.replace(/<%=value%>/g, value.toString()));
        }

        return {
            steps: numSteps,
            stepValue: niceStep,
            graphMin: lowerBound,
            labels: labels
        };
    };

    // Generic animation runner
    const executeAnimation = (settings, preDrawCallback, postDrawCallback, drawCtx) => {
        if (settings.animation) {
            let currentStep = 0;
            const totalSteps = settings.animationSteps;
            const easingFunction = motionInterpolators.get(settings.animationEasing) || motionInterpolators.get('linear');

            const animateFrame = () => {
                currentStep++;
                const animationProgress = easingFunction(currentStep / totalSteps);

                drawCtx.clearRect(0, 0, initialWidth * (window.devicePixelRatio || 1), initialHeight * (window.devicePixelRatio || 1));
                preDrawCallback();
                postDrawCallback(animationProgress);

                if (currentStep < totalSteps) {
                    requestAnimationFrame(animateFrame);
                } else {
                    if (settings.onAnimationComplete) {
                        settings.onAnimationComplete();
                    }
                }
            };
            requestAnimationFrame(animateFrame);
        } else {
            drawCtx.clearRect(0, 0, initialWidth * (window.devicePixelRatio || 1), initialHeight * (window.devicePixelRatio || 1));
            preDrawCallback();
            postDrawCallback(1);
            if (settings.onAnimationComplete) {
                settings.onAnimationComplete();
            }
        }
    };


    // --- Chart Type Implementations ---

    const createRadialSectorGraph = (graphData, userSettings) => {
        const defaultRadialGraphOptions = {
            scaleOverlay: true,
            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleShowLine: true,
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabels: true,
            scaleLabel: "<%=value%>",
            scaleFontFamily: "'Arial'",
            scaleFontSize: 12,
            scaleFontStyle: "normal",
            scaleFontColor: "#666",
            scaleShowLabelBackdrop: true,
            scaleBackdropColor: "rgba(255,255,255,0.75)",
            scaleBackdropPaddingY: 2,
            scaleBackdropPaddingX: 2,
            segmentShowStroke: true,
            segmentStrokeColor: "#fff",
            segmentStrokeWidth: 2,
            animation: true,
            animationSteps: 100,
            animationEasing: "easeOutBounce",
            animateRotate: true,
            animateScale: false,
            onAnimationComplete: null
        };

        const activeSettings = combineSettings(defaultRadialGraphOptions, userSettings);

        const internalDrawing = () => {
            let maxDimension, rangeStepPx, calculatedRange, labelRenderHeight, availableRangePx, valueBoundary, labelFormatPattern;

            const setupLayoutDimensions = () => {
                maxDimension = Math.min(initialWidth, initialHeight) / 2;
                maxDimension -= Math.max(activeSettings.scaleFontSize * 0.5, activeSettings.scaleLineWidth * 0.5);

                labelRenderHeight = activeSettings.scaleFontSize * 2;
                if (activeSettings.scaleShowLabelBackdrop) {
                    labelRenderHeight += (2 * activeSettings.scaleBackdropPaddingY);
                    maxDimension -= activeSettings.scaleBackdropPaddingY * 1.5;
                }
                availableRangePx = maxDimension;
                labelRenderHeight = getFallback(labelRenderHeight, 5);
            };

            const retrieveValueExtremes = () => {
                return determineMinMax(graphData, 'value');
            };

            const drawConcentricCircles = () => {
                for (let i = 0; i < calculatedRange.steps; i++) {
                    if (activeSettings.scaleShowLine) {
                        renderContext.beginPath();
                        renderContext.arc(initialWidth / 2, initialHeight / 2, rangeStepPx * (i + 1), 0, (Math.PI * 2), true);
                        renderContext.strokeStyle = activeSettings.scaleLineColor;
                        renderContext.lineWidth = activeSettings.scaleLineWidth;
                        renderContext.stroke();
                    }

                    if (activeSettings.scaleShowLabels) {
                        renderContext.textAlign = "center";
                        renderContext.font = `${activeSettings.scaleFontStyle} ${activeSettings.scaleFontSize}px ${activeSettings.scaleFontFamily}`;
                        const currentLabelText = calculatedRange.labels[i];

                        if (activeSettings.scaleShowLabelBackdrop) {
                            const textPixelWidth = renderContext.measureText(currentLabelText).width;
                            renderContext.fillStyle = activeSettings.scaleBackdropColor;
                            renderContext.beginPath();
                            renderContext.rect(
                                Math.round(initialWidth / 2 - textPixelWidth / 2 - activeSettings.scaleBackdropPaddingX),
                                Math.round(initialHeight / 2 - (rangeStepPx * (i + 1)) - activeSettings.scaleFontSize * 0.5 - activeSettings.scaleBackdropPaddingY),
                                Math.round(textPixelWidth + (activeSettings.scaleBackdropPaddingX * 2)),
                                Math.round(activeSettings.scaleFontSize + (activeSettings.scaleBackdropPaddingY * 2))
                            );
                            renderContext.fill();
                        }
                        renderContext.textBaseline = "middle";
                        renderContext.fillStyle = activeSettings.scaleFontColor;
                        renderContext.fillText(currentLabelText, initialWidth / 2, initialHeight / 2 - (rangeStepPx * (i + 1)));
                    }
                }
            };

            const drawDataSegments = (animationRatio) => {
                let currentAngle = -Math.PI / 2;
                const segmentAngleStep = (Math.PI * 2) / graphData.length;
                let scaleFactor = 1;
                let rotationFactor = 1;

                if (activeSettings.animation) {
                    if (activeSettings.animateScale) {
                        scaleFactor = animationRatio;
                    }
                    if (activeSettings.animateRotate) {
                        rotationFactor = animationRatio;
                    }
                }

                const calculateSegmentRadius = (value, scaleInfo, maxRadius) => {
                    const valueRange = scaleInfo.stepValue * scaleInfo.steps;
                    const normalizedValue = (value - scaleInfo.graphMin) / valueRange;
                    return normalizedValue * maxRadius;
                };

                graphData.forEach(segment => {
                    renderContext.beginPath();
                    const segmentRadius = scaleFactor * calculateSegmentRadius(segment.value, calculatedRange, maxDimension);
                    renderContext.arc(initialWidth / 2, initialHeight / 2, segmentRadius, currentAngle, currentAngle + rotationFactor * segmentAngleStep, false);
                    renderContext.lineTo(initialWidth / 2, initialHeight / 2);
                    renderContext.closePath();
                    renderContext.fillStyle = segment.color;
                    renderContext.fill();

                    if (activeSettings.segmentShowStroke) {
                        renderContext.strokeStyle = activeSettings.segmentStrokeColor;
                        renderContext.lineWidth = activeSettings.segmentStrokeWidth;
                        renderContext.stroke();
                    }
                    currentAngle += rotationFactor * segmentAngleStep;
                });
            };

            setupLayoutDimensions();
            valueBoundary = retrieveValueExtremes();
            labelFormatPattern = activeSettings.scaleShowLabels ? activeSettings.scaleLabel : null;

            if (!activeSettings.scaleOverride) {
                calculatedRange = deriveScaleParameters(availableRangePx, valueBoundary.minimum, valueBoundary.maximum, labelFormatPattern);
            } else {
                calculatedRange = {
                    steps: activeSettings.scaleSteps,
                    stepValue: activeSettings.scaleStepWidth,
                    graphMin: activeSettings.scaleStartValue,
                    labels: []
                };
                calculatedRange.labels = createScaleLabels(labelFormatPattern, calculatedRange.steps, activeSettings.scaleStartValue, activeSettings.scaleStepWidth);
            }

            rangeStepPx = maxDimension / (calculatedRange.steps);

            executeAnimation(activeSettings, drawConcentricCircles, drawDataSegments, renderContext);
        };

        return {
            draw: internalDrawing
        };
    };

    const createWebGraph = (graphData, userSettings) => {
        const defaultWebGraphOptions = {
            scaleOverlay: false,
            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleShowLine: true,
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabels: false,
            scaleLabel: "<%=value%>",
            scaleFontFamily: "'Arial'",
            scaleFontSize: 12,
            scaleFontStyle: "normal",
            scaleFontColor: "#666",
            scaleShowLabelBackdrop: true,
            scaleBackdropColor: "rgba(255,255,255,0.75)",
            scaleBackdropPaddingY: 2,
            scaleBackdropPaddingX: 2,
            angleShowLineOut: true,
            angleLineColor: "rgba(0,0,0,.1)",
            angleLineWidth: 1,
            pointLabelFontFamily: "'Arial'",
            pointLabelFontStyle: "normal",
            pointLabelFontSize: 12,
            pointLabelFontColor: "#666",
            pointDot: true,
            pointDotRadius: 3,
            pointDotStrokeWidth: 1,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
            animation: true,
            animationSteps: 60,
            animationEasing: "easeOutQuart",
            onAnimationComplete: null
        };
        const activeSettings = combineSettings(defaultWebGraphOptions, userSettings);
        const internalDrawing = () => {
            renderContext.clearRect(0, 0, initialWidth, initialHeight);
            renderContext.font = "16px sans-serif";
            renderContext.fillStyle = "blue";
            renderContext.fillText("Web Graph (Radar) Placeholder", 20, 30);
        };
        return { draw: internalDrawing };
    };

    const createSectorGraph = (graphData, userSettings) => {
        const defaultSectorGraphOptions = {
            segmentShowStroke: true,
            segmentStrokeColor: "#fff",
            segmentStrokeWidth: 2,
            animation: true,
            animationSteps: 100,
            animationEasing: "easeOutBounce",
            animateRotate: true,
            animateScale: false,
            onAnimationComplete: null
        };
        const activeSettings = combineSettings(defaultSectorGraphOptions, userSettings);
        const internalDrawing = () => {
            renderContext.clearRect(0, 0, initialWidth, initialHeight);
            renderContext.font = "16px sans-serif";
            renderContext.fillStyle = "green";
            renderContext.fillText("Sector Graph (Pie) Placeholder", 20, 30);
        };
        return { draw: internalDrawing };
    };

    const createRingGraph = (graphData, userSettings) => {
        const defaultRingGraphOptions = {
            segmentShowStroke: true,
            segmentStrokeColor: "#fff",
            segmentStrokeWidth: 2,
            percentageInnerCutout: 50,
            animation: true,
            animationSteps: 100,
            animationEasing: "easeOutBounce",
            animateRotate: true,
            animateScale: false,
            onAnimationComplete: null
        };
        const activeSettings = combineSettings(defaultRingGraphOptions, userSettings);
        const internalDrawing = () => {
            renderContext.clearRect(0, 0, initialWidth, initialHeight);
            renderContext.font = "16px sans-serif";
            renderContext.fillStyle = "purple";
            renderContext.fillText("Ring Graph (Doughnut) Placeholder", 20, 30);
        };
        return { draw: internalDrawing };
    };

    const createPathGraph = (graphData, userSettings) => {
        const defaultPathGraphOptions = {
            scaleOverlay: false,
            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabels: true,
            scaleLabel: "<%=value%>",
            scaleFontFamily: "'Arial'",
            scaleFontSize: 12,
            scaleFontStyle: "normal",
            scaleFontColor: "#666",
            scaleShowGridLines: true,
            scaleGridLineColor: "rgba(0,0,0,.05)",
            scaleGridLineWidth: 1,
            bezierCurve: true,
            pointDot: true,
            pointDotRadius: 4,
            pointDotStrokeWidth: 2,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
            animation: true,
            animationSteps: 60,
            animationEasing: "easeOutQuart",
            onAnimationComplete: null
        };
        const activeSettings = combineSettings(defaultPathGraphOptions, userSettings);
        const internalDrawing = () => {
            renderContext.clearRect(0, 0, initialWidth, initialHeight);
            renderContext.font = "16px sans-serif";
            renderContext.fillStyle = "red";
            renderContext.fillText("Path Graph (Line) Placeholder", 20, 30);
        };
        return { draw: internalDrawing };
    };

    const createBarGraph = (graphData, userSettings) => {
        const defaultBarGraphOptions = {
            scaleOverlay: false,
            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabels: true,
            scaleLabel: "<%=value%>",
            scaleFontFamily: "'Arial'",
            scaleFontSize: 12,
            scaleFontStyle: "normal",
            scaleFontColor: "#666",
            scaleShowGridLines: true,
            scaleGridLineColor: "rgba(0,0,0,.05)",
            scaleGridLineWidth: 1,
            barShowStroke: true,
            barStrokeWidth: 2,
            barValueSpacing: 5,
            barDatasetSpacing: 1,
            animation: true,
            animationSteps: 60,
            animationEasing: "easeOutQuart",
            onAnimationComplete: null
        };
        const activeSettings = combineSettings(defaultBarGraphOptions, userSettings);
        const internalDrawing = () => {
            renderContext.clearRect(0, 0, initialWidth, initialHeight);
            renderContext.font = "16px sans-serif";
            renderContext.fillStyle = "orange";
            renderContext.fillText("Bar Graph Placeholder", 20, 30);
        };
        return { draw: internalDrawing };
    };


    return {
        radialSector: createRadialSectorGraph,
        web: createWebGraph,
        sector: createSectorGraph,
        ring: createRingGraph,
        path: createPathGraph,
        bar: createBarGraph
    };
}

window.GraphVisualizer = createGraphManager;