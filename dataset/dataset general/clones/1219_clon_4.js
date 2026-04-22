(function() {
    // Application configuration settings
    const appConfig = {
        canvasBorderMargin: 40,
        labelOffset: 5,
        verticalRange: { min: 0, max: 10, overflowTopLimit: 10, overflowBottomLimit: 10 },
        temporalRange: { min: 0, max: 10 },
        textRenderSize: 8,
        animationModes: { NONE: 'none', SHIFT: 'shift', RESIZE: 'resize', TWIRL: 'twirl', FADE: 'fade' },
        defaultEditorTheme: "ace/theme/chrome",
        defaultEditorMode: "ace/mode/javascript",
        updateThrottleMs: 50,
        initialPresetIndex: 1
    };

    // Cached references to essential DOM elements
    const domElements = {
        mainCanvas: document.getElementById("graph"),
        codeEditorContainer: document.getElementById("editor-parent"),
        animationDurationInput: document.getElementById("delay"),
        animatedTargetShape: document.getElementById("box"),
        clearAnimationButton: document.getElementById("remove-vis"),
        syntaxIssueIndicator: document.getElementById("syntax-error-icon"),
        formulaPresetSelector: document.getElementById("library"),
        infoPanel: document.getElementById("help"),
        mainContentContainer: document.getElementById("container"), // Used for box centering
        startPlaceholder: document.getElementById("box-placeholder-start"),
        endPlaceholder: document.getElementById("box-placeholder-end"),
        reverseToggleButton: document.getElementById('reverse-anim-btn'),
        helpToggleButton: document.getElementById('help-toggle-btn')
    };

    // Global state management variables
    let codeEditorInstance;
    let canvas2DContext;
    let successfulFormulaSnapshot = '';
    let currentAnimationStartTime = 0;
    let currentlyActiveModeButton = null;
    let targetShapeVerticalPosition; // Specific to SHIFT animation
    let isAnimationActive = false;
    let isAnimationDirectionReversed = false;
    let currentAnimationType = appConfig.animationModes.NONE;
    let scheduledUpdateTimer;
    let canvasVerticalOverflow = { top: 0, bottom: 0 }; // Dynamic overflow for graph

    // Utility for mathematical function prefixing
    const mathFunctionNames = Object.getOwnPropertyNames(Math);
    const transformCodeForEvaluation = (rawCode) => {
        if (!rawCode || rawCode.length === 0) return '';
        let processedCode = rawCode;
        for (const funcName of mathFunctionNames) {
            processedCode = processedCode.replace(new RegExp(funcName + '\\b', 'g'), 'Math.' + funcName);
        }
        return processedCode;
    };

    // Predefined formula data
    const predefinedFormulas = [
        { label: "[Basic]", code: null, isGroup: true },
        { label: "Linear", code: "x" },
        { label: "Smoothstep", code: "x * x * (3 - 2 * x)" },
        { label: "Spring", code: "factor = 0.4;\nMath.pow(2, -10 * x) * Math.sin((x - factor / 4) * (2 * Math.PI) / factor) + 1" },
        { label: "[Android]", code: null, isGroup: true },
        { label: "AccelerateDecelerate", code: "(Math.cos((x + 1) * Math.PI) / 2.0) + 0.5" },
        { label: "Bounce", code: "//Use javascript syntax to create complex equations\nfunction bounce(t) { return t*t*8; }\n\nif (x < 0.3535)\n bounce(x)\nelse if (x < 0.7408)\n bounce(x - 0.54719) + 0.7\nelse if (x < 0.9644)\n bounce(x - 0.8526) + 0.9\nelse\n bounce(x - 1.0435) + 0.95" },
        { label: "Accelerate", code: "factor = 1.0;\nif (factor == 1.0)\n x * x;\nelse\n Math.pow(x, 2 * factor)" },
        { label: "Anticipate", code: "tension = 2.0;\nx * x * ((tension + 1) * x - tension)" },
        { label: "AnticipateOvershoot", code: "tension = 2.0 * 1.5;\nfunction a(t,s) { return t * t * ((s + 1) * t - s); }\nfunction o(t,s) { return t * t * ((s + 1) * t + s); }\n\nif (x < 0.5)\n 0.5 * a(x * 2.0, tension);\nelse\n 0.5 * (o(x * 2.0 - 2.0, tension) + 2.0)" },
        { label: "Cycle", code: "cycles = 1.0;\nMath.sin(2 * cycles * Math.PI * x)" },
        { label: "Decelerate", code: "factor = 1.0;\nif (factor == 1.0)\n (1.0 - (1.0 - x) * (1.0 - x));\nelse\n (1.0 - Math.pow((1.0 - x), 2 * factor))" },
        { label: "Overshoot", code: "tension = 2.0;\n\nx -= 1.0;\nx * x * ((tension + 1) * x + tension) + 1.0" },
        { label: "[Advanced]", code: null, isGroup: true },
        { label: "CubicHermite", code: "function CubicHermite(t, p0, p1, m0, m1){\n   t2 = t*t;\n   t3 = t2*t;\n   return (2*t3 - 3*t2 + 1)*p0 + (t3-2*t2+t)*m0 + (-2*t3+3*t2)*p1 + (t3-t2)*m1;\n}\n\n//time, start, end, tangent0, tangent1\n//modify tangent0 and tangent1\nCubicHermite(x, 0, 1, 4, 4)" }
    ];

    // Non-standard linear interpolation (mimics original's unique behavior: p2 * f(t))
    const computeInterpolatedValue = (startVal, endVal, progress) => (startVal + (endVal - startVal)) * evaluateUserFormula(progress);

    // Evaluates the user-defined formula string
    const evaluateUserFormula = (xInput) => {
        // Original code had 'd' variable in fEval, though not directly used in equation.
        // Keeping for strict behavior clone, even if unused.
        const currentDelayFactor = parseFloat(domElements.animationDurationInput.value);
        try {
            const processedCode = transformCodeForEvaluation(codeEditorInstance.getSession().getValue());
            const evaluationResult = eval(processedCode);
            successfulFormulaSnapshot = processedCode;
            domElements.codeEditorContainer.classList.remove("has-error");
            domElements.codeEditorContainer.classList.add("has-success");
            domElements.syntaxIssueIndicator.style.display = "none";
            return evaluationResult;
        } catch (err) {
            domElements.syntaxIssueIndicator.title = err.message;
            domElements.syntaxIssueIndicator.style.display = "inline";
            domElements.codeEditorContainer.classList.remove("has-success");
            domElements.codeEditorContainer.classList.add("has-error");
            // Fallback to the last successfully evaluated formula
            return eval(successfulFormulaSnapshot);
        }
    };

    // Canvas drawing helper functions
    const applyDefaultTextStyling = () => {
        canvas2DContext.fillStyle = "black";
        canvas2DContext.font = `${appConfig.textRenderSize}pt verdana`;
    };

    const getCanvasZeroYCoord = () =>
        domElements.mainCanvas.height - appConfig.canvasBorderMargin - (canvasVerticalOverflow.bottom * calculateVerticalUnitSpacing());

    const calculateVerticalUnitSpacing = () =>
        (domElements.mainCanvas.height - (appConfig.canvasBorderMargin * 2)) / (appConfig.verticalRange.max + canvasVerticalOverflow.top + canvasVerticalOverflow.bottom);

    const getPlottingRegionHeight = () => {
        const drawableWidth = domElements.mainCanvas.width - (appConfig.canvasBorderMargin * 2);
        const extraTopSpace = (calculateVerticalUnitSpacing() * canvasVerticalOverflow.top);
        const extraBottomSpace = (calculateVerticalUnitSpacing() * canvasVerticalOverflow.bottom);
        return drawableWidth - extraTopSpace - extraBottomSpace;
    };

    // Canvas rendering functions
    const drawBackgroundGrid = () => {
        canvas2DContext.lineWidth = 1;
        canvas2DContext.textAlign = "left";
        canvas2DContext.strokeStyle = "#e0e0e0";

        const verticalUnitSpacing = calculateVerticalUnitSpacing();
        const horizontalUnitSpacing = (domElements.mainCanvas.height - (appConfig.canvasBorderMargin * 2)) / (appConfig.verticalRange.max);

        canvas2DContext.beginPath();
        for (let i = appConfig.verticalRange.min - canvasVerticalOverflow.bottom; i <= appConfig.verticalRange.max + canvasVerticalOverflow.top; i++) {
            const isTimeBoundary = i < appConfig.temporalRange.min || i > appConfig.temporalRange.max;

            // Horizontal grid lines (rows)
            const yPosition = getCanvasZeroYCoord() - (i * verticalUnitSpacing);
            canvas2DContext.moveTo(appConfig.canvasBorderMargin, yPosition);
            canvas2DContext.lineTo(domElements.mainCanvas.width - appConfig.canvasBorderMargin, yPosition);

            // Vertical grid lines (columns)
            const xPosition = (i * horizontalUnitSpacing) - 1 + appConfig.canvasBorderMargin;
            if (!isTimeBoundary) {
                canvas2DContext.moveTo(xPosition, domElements.mainCanvas.height - appConfig.canvasBorderMargin);
                canvas2DContext.lineTo(xPosition, appConfig.canvasBorderMargin);
            }

            // Label styling based on overflow
            canvas2DContext.fillStyle = ((canvasVerticalOverflow.top > 0 && i > appConfig.verticalRange.max) || (canvasVerticalOverflow.bottom > 0 && i < appConfig.verticalRange.min)) ? "red" : "black";
            canvas2DContext.font = (i === appConfig.verticalRange.max || i === 0) ? `bold ${appConfig.textRenderSize}pt verdana` : `${appConfig.textRenderSize}pt verdana`;

            // Y-axis value labels
            const yAxisLabel = (i / 10).toFixed(1);
            const yLabelWidth = canvas2DContext.measureText(yAxisLabel).width;
            if (!(i === 0 && canvasVerticalOverflow.bottom === 0)) {
                canvas2DContext.fillText(yAxisLabel.toString(), appConfig.canvasBorderMargin - appConfig.labelOffset - yLabelWidth, yPosition + (appConfig.textRenderSize / 2));
            }
            // X-axis value labels
            if (!isTimeBoundary && i !== 0) {
                canvas2DContext.fillStyle = "black";
                canvas2DContext.fillText(yAxisLabel.toString(), xPosition - (yLabelWidth / 2), domElements.mainCanvas.height - appConfig.canvasBorderMargin + appConfig.textRenderSize + appConfig.labelOffset);
            }
        }
        canvas2DContext.stroke();
    };

    const drawCoordinateAxes = () => {
        applyDefaultTextStyling();
        canvas2DContext.lineWidth = 2;
        canvas2DContext.strokeStyle = "black";
        canvas2DContext.textAlign = "center";
        canvas2DContext.fillStyle = "silver";

        canvas2DContext.beginPath();
        canvas2DContext.moveTo(appConfig.canvasBorderMargin, appConfig.canvasBorderMargin);
        canvas2DContext.lineTo(appConfig.canvasBorderMargin, domElements.mainCanvas.height - appConfig.canvasBorderMargin);
        canvas2DContext.moveTo(appConfig.canvasBorderMargin, getCanvasZeroYCoord());
        canvas2DContext.lineTo(domElements.mainCanvas.width - appConfig.canvasBorderMargin, getCanvasZeroYCoord());
        
        // X-axis label, replicating original calculation including the unusual Y coordinate logic
        const drawableAreaWidth = domElements.mainCanvas.width - (appConfig.canvasBorderMargin * 2);
        canvas2DContext.fillText("temporal (x)", appConfig.canvasBorderMargin + drawableAreaWidth / 2, drawableAreaWidth + appConfig.canvasBorderMargin + appConfig.labelOffset + appConfig.textRenderSize * 3);
        canvas2DContext.stroke();
    };

    const plotEquationPath = () => {
        canvas2DContext.lineWidth = 3;
        canvas2DContext.strokeStyle = "#e51c23";
        canvas2DContext.beginPath();

        const maxAllowedOverflowTop = appConfig.verticalRange.overflowTopLimit / 10;
        const maxAllowedOverflowBottom = appConfig.verticalRange.overflowBottomLimit / 10;
        const maxPlottingValue = appConfig.verticalRange.max / 10;

        let highestValueEncountered = 1;
        let lowestValueEncountered = 0;

        const plottingWidth = domElements.mainCanvas.width - (appConfig.canvasBorderMargin * 2);

        for (let xCoord = 0; xCoord < plottingWidth; xCoord++) {
            const normalizedTime = (xCoord / plottingWidth);
            const evaluatedY = evaluateUserFormula(normalizedTime);
            const yCanvasPosition = -evaluatedY * getPlottingRegionHeight();
            canvas2DContext.lineTo(xCoord + appConfig.canvasBorderMargin + 1, getCanvasZeroYCoord() + yCanvasPosition - 2);

            // Check for and track overflow
            if (evaluatedY > maxPlottingValue && evaluatedY <= (maxPlottingValue + maxAllowedOverflowTop) && evaluatedY > highestValueEncountered) {
                highestValueEncountered = evaluatedY;
            } else if (evaluatedY < appConfig.verticalRange.min && evaluatedY >= appConfig.verticalRange.min - maxAllowedOverflowBottom && evaluatedY < lowestValueEncountered) {
                lowestValueEncountered = evaluatedY;
            }
        }

        // Re-adjust grid if overflow is detected
        const newOverflowTopExtent = Math.ceil(Math.abs((maxPlottingValue - highestValueEncountered) * 10));
        const newOverflowBottomExtent = Math.ceil(Math.abs((appConfig.verticalRange.min - lowestValueEncountered) * 10));

        if (newOverflowTopExtent !== canvasVerticalOverflow.top || newOverflowBottomExtent !== canvasVerticalOverflow.bottom) {
            canvasVerticalOverflow.top = newOverflowTopExtent;
            canvasVerticalOverflow.bottom = newOverflowBottomExtent;
            renderAllCanvasElements(); // Re-render with updated overflow
            return;
        }

        canvas2DContext.stroke();
    };

    const highlightCurrentAnimationPoint = (progress) => {
        canvas2DContext.fillStyle = "yellow";
        const evaluatedY = evaluateUserFormula(progress);
        const yCanvasPosition = -(evaluatedY * getPlottingRegionHeight());
        const plottingWidth = domElements.mainCanvas.width - (appConfig.canvasBorderMargin * 2);
        const xCanvasPosition = (progress * plottingWidth) + appConfig.canvasBorderMargin + 1;
        const finalY = getCanvasZeroYCoord() + yCanvasPosition - 2;
        canvas2DContext.fillRect(xCanvasPosition - 1, finalY - 1, 2, 2);
    };

    const renderAllCanvasElements = () => {
        canvas2DContext.clearRect(0, 0, domElements.mainCanvas.width, domElements.mainCanvas.height);
        applyDefaultTextStyling();
        drawBackgroundGrid();
        drawCoordinateAxes();
        plotEquationPath();
    };

    // Animation control functions
    const applyShapeTransformations = (transformStyle) => {
        domElements.animatedTargetShape.style.webkitTransform = transformStyle;
        domElements.animatedTargetShape.style.transform = transformStyle;
        domElements.animatedTargetShape.style.msTransform = transformStyle;
    };

    const resetTargetShapeAppearance = () => {
        currentAnimationStartTime = Date.now();
        domElements.animatedTargetShape.style.opacity = "1";
        applyShapeTransformations("none");
    };

    const configurePlaceholderVisibility = (modeIdentifier) => {
        // Original `boxCenterPos` calculation was a bit ambiguous,
        // replicating it assuming `container.offsetLeft` is relevant to horizontal centering.
        const boxCenterPositionVal = (domElements.mainContentContainer.offsetLeft / 2 - (domElements.animatedTargetShape.clientWidth / 2));
        const elementsWithClassNameBox = document.getElementsByClassName("box");
        Array.from(elementsWithClassNameBox).forEach(el => {
            el.style.left = boxCenterPositionVal + "px";
        });

        if (modeIdentifier === appConfig.animationModes.FADE) {
            domElements.startPlaceholder.style.display = "none";
        } else {
            domElements.startPlaceholder.style.display = "block";
        }

        if (modeIdentifier === appConfig.animationModes.SHIFT) {
            domElements.endPlaceholder.style.top = (targetShapeVerticalPosition + domElements.animatedTargetShape.clientHeight) + "px";
            domElements.endPlaceholder.style.display = "block";
        } else {
            domElements.endPlaceholder.style.display = "none";
        }
    };

    const activateAnimationState = (enable) => {
        isAnimationActive = enable;
        if (enable) {
            resetTargetShapeAppearance();
            initiateAnimationFrame();
        }
        renderAllCanvasElements();
    };

    // Dispatch map for different animation types
    const animationActionDispatch = {
        [appConfig.animationModes.SHIFT]: (progress) => {
            const movement = computeInterpolatedValue(0, targetShapeVerticalPosition, progress);
            applyShapeTransformations(`translate(0, ${movement}px)`);
        },
        [appConfig.animationModes.RESIZE]: (progress) => {
            const scale = computeInterpolatedValue(0, 1, progress);
            applyShapeTransformations(`scale(${scale}, ${scale})`);
        },
        [appConfig.animationModes.TWIRL]: (progress) => {
            const rotationDeg = computeInterpolatedValue(0, 360, progress);
            applyShapeTransformations(`rotate(${rotationDeg}deg)`);
        },
        [appConfig.animationModes.FADE]: (progress) => {
            const opacityVal = computeInterpolatedValue(0, 1, progress);
            domElements.animatedTargetShape.style.opacity = opacityVal;
        },
        [appConfig.animationModes.NONE]: () => { /* No specific transformation */ }
    };

    const initiateAnimationFrame = () => {
        const currentDuration = parseFloat(domElements.animationDurationInput.value);
        if (currentDuration <= 0.0 || !isAnimationActive) {
            return;
        }

        let animationProgress = (Date.now() - currentAnimationStartTime) / currentDuration;
        animationProgress = isAnimationDirectionReversed ? (1.0 - animationProgress) : animationProgress;

        if (animationProgress > 1.0 || animationProgress < 0) {
            refreshDisplayAndAnimation(); // Restart or update state
        } else {
            requestNextAnimationFrame(initiateAnimationFrame);
            highlightCurrentAnimationPoint(animationProgress);
            // Execute the specific animation based on current type
            (animationActionDispatch[currentAnimationType] || animationActionDispatch[appConfig.animationModes.NONE])(animationProgress);
        }
    };

    const reverseAnimationDirection = () => {
        isAnimationDirectionReversed = !isAnimationDirectionReversed;
        refreshDisplayAndAnimation();
    };

    const selectAnimationDisplayMode = (triggeredElement) => {
        if (currentlyActiveModeButton) {
            currentlyActiveModeButton.classList.remove("active", "btn-primary");
        }

        const selectedModeValue = typeof triggeredElement.value === "undefined" ? null : triggeredElement.value;

        if (selectedModeValue === null || selectedModeValue === false) { // Handle `setBoxAnim(false)` call from original
            activateAnimationState(false);
            resetTargetShapeAppearance();
            isAnimationDirectionReversed = false;
            domElements.clearAnimationButton.style.display = "none";
            configurePlaceholderVisibility(appConfig.animationModes.NONE);
        } else {
            currentAnimationType = selectedModeValue;
            triggeredElement.classList.add("active", "btn-primary");
            currentlyActiveModeButton = triggeredElement;
            domElements.clearAnimationButton.style.display = "inline";
            activateAnimationState(true);
            configurePlaceholderVisibility(currentAnimationType);
        }
    };

    const toggleInfoPanelVisibility = () => {
        if (domElements.infoPanel.style.display !== "" && domElements.infoPanel.style.display !== "none") {
            domElements.infoPanel.style.display = "none";
        } else {
            domElements.infoPanel.style.height = domElements.mainCanvas.height + "px";
            domElements.infoPanel.style.left = domElements.mainCanvas.getBoundingClientRect().left + "px";
            domElements.infoPanel.style.display = "inline";
        }
    };

    // Core update mechanism
    const refreshDisplayAndAnimation = () => {
        renderAllCanvasElements();
        currentAnimationStartTime = Date.now();
        initiateAnimationFrame();
    };

    const throttleDisplayUpdate = () => {
        clearTimeout(scheduledUpdateTimer);
        scheduledUpdateTimer = window.setTimeout(refreshDisplayAndAnimation, appConfig.updateThrottleMs);
    };

    const loadPresetFormula = (indexToLoad) => {
        let actualIndex = indexToLoad;
        if (typeof actualIndex === "undefined") {
            actualIndex = domElements.formulaPresetSelector.selectedIndex;
        } else {
            domElements.formulaPresetSelector.options[actualIndex].selected = true;
        }
        codeEditorInstance.getSession().setValue(predefinedFormulas[actualIndex].code);
    };

    // Cross-browser requestAnimationFrame polyfill (matches original implementation)
    const requestNextAnimationFrame = (() => {
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            }
        );
    })();

    // Application startup sequence
    const initializeApplication = () => {
        canvas2DContext = domElements.mainCanvas.getContext("2d");
        targetShapeVerticalPosition = domElements.mainCanvas.height / 2 - domElements.animatedTargetShape.clientHeight / 2;

        // Ace editor setup
        codeEditorInstance = ace.edit("editor");
        codeEditorInstance.setTheme(appConfig.defaultEditorTheme);
        codeEditorInstance.renderer.setShowGutter(false);
        codeEditorInstance.renderer.setPadding(8);
        codeEditorInstance.renderer.setScrollMargin(4, 0, 0, 0);
        codeEditorInstance.setHighlightActiveLine(false);
        codeEditorInstance.getSession().setUseWrapMode(true);
        codeEditorInstance.getSession().setMode(appConfig.defaultEditorMode);

        // Initial rendering and state setup
        renderAllCanvasElements();
        initiateAnimationFrame(); // Call once to set initial state
        configurePlaceholderVisibility(-1); // No specific animation type initially

        // Populate the preset selector dropdown
        predefinedFormulas.forEach((entry) => {
            const optionElement = document.createElement("option");
            optionElement.innerHTML = (entry.isGroup ? "" : "&nbsp;") + entry.label;
            domElements.formulaPresetSelector.add(optionElement);
            if (entry.isGroup) {
                optionElement.style.color = "#8bc34a";
                optionElement.disabled = true;
            }
        });

        // Load an initial formula and refresh display
        loadPresetFormula(appConfig.initialPresetIndex);
        refreshDisplayAndAnimation();

        // Attach event handlers
        codeEditorInstance.addEventListener("input", throttleDisplayUpdate);
        domElements.animationDurationInput.addEventListener("input", throttleDisplayUpdate);
        domElements.formulaPresetSelector.addEventListener("change", () => {
            loadPresetFormula();
            refreshDisplayAndAnimation();
        });

        // Assuming animation control buttons are wired up externally via `onclick="selectAnimationDisplayMode(this)"`
        // The `removeVis` button is explicitly handled by an event listener in the original,
        // calling `setBoxAnim(false)`.
        domElements.clearAnimationButton.addEventListener('click', () => { selectAnimationDisplayMode(false); });
        domElements.reverseToggleButton.addEventListener('click', reverseAnimationDirection);
        domElements.helpToggleButton.addEventListener('click', toggleInfoPanelVisibility);
    };

    // Execute the initialization function when the script loads
    initializeApplication();

})();