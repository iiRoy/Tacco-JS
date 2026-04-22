// Curve Animator Utility
// Refactored by a dedicated developer

// DOM Elements Collection
const canvasDisplay = document.getElementById("graph");
const codeEditor = ace.edit("editor");
const editorWrapper = document.getElementById("editor-parent");
const animationDurationInput = document.getElementById("delay");
const animatedBox = document.getElementById("box");
const visualizationResetButton = document.getElementById("remove-vis");
const errorIndicator = document.getElementById("syntax-error-icon");
const curvePresetSelector = document.getElementById("library");
const infoOverlay = document.getElementById("help");
const renderContext = canvasDisplay.getContext("2d");

// Configuration Constants
const VIZ_TYPES = Object.freeze({ NO_ANIM: 0, TRANSLATION: 1, SCALING: 2, ROTATION: 3, OPACITY: 4 });
const PLOT_PADDING_X = 45; // Horizontal padding for the plot area
const LABEL_SPACING_Y = 6; // Vertical spacing for axis labels
const PLOT_MAX_Y_VAL = 12; // Max Y value for the plot grid
const PLOT_Y_OVERFLOW_TOP = 12; // Max units the Y axis can extend upwards
const PLOT_MIN_Y_VAL = -2; // Min Y value for the plot grid
const PLOT_Y_OVERFLOW_BOTTOM = 12; // Max units the Y axis can extend downwards
const PLOT_MAX_X_TIME = 10; // Max X value for time axis
const PLOT_MIN_X_TIME = 0; // Min X value for time axis
const FONT_SIZE_PX = 9; // Font size for plot labels
const PLOT_DRAW_WIDTH = (canvasDisplay.width - (PLOT_PADDING_X * 2));
const MATH_GLOBAL_PROPS = Object.getOwnPropertyNames(Math);

// Application State Variables
let lastSuccessfulCurveExpression;
let animationStartTime;
let currentlyActiveButton; // Stores the last active animation button
let nextBoxPosition = canvasDisplay.height / 2 - animatedBox.clientHeight / 2;
let isAnimationActive = false;
let isAnimationReversed = false;
let currentAnimationMode = VIZ_TYPES.NO_ANIM;
let debounceTimerId; // For delaying updates
let currentYOverflowTop = 0;
let currentYOverflowBottom = 0;

// Predefined Curve Expressions
const PRESET_CURVES = {
    definitions: [
        { label: "[Basic Functions]", formula: null },
        { label: "Linear", formula: "x" },
        { label: "Smoothstep", formula: "x * x * (3 - 2 * x)" },
        { label: "Spring Motion", formula: "const factor = 0.4; Math.pow(2, -10 * x) * Math.sin((x - factor / 4) * (2 * Math.PI) / factor) + 1" },
        { label: "[Android Interpolators]", formula: null },
        { label: "AccelerateDecelerate", formula: "(Math.cos((x + 1) * Math.PI) / 2.0) + 0.5" },
        {
            label: "Bounce Effect", formula: `
// Implement a bounce function
function bounceCalc(t) { return t * t * 8; }

if (x < 0.3535) {
  bounceCalc(x);
} else if (x < 0.7408) {
  bounceCalc(x - 0.54719) + 0.7;
} else if (x < 0.9644) {
  bounceCalc(x - 0.8526) + 0.9;
} else {
  bounceCalc(x - 1.0435) + 0.95;
}` },
        {
            label: "Accelerate Curve", formula: `
const accelFactor = 1.0;
if (accelFactor === 1.0) {
  x * x;
} else {
  Math.pow(x, 2 * accelFactor);
}` },
        { label: "Anticipate Curve", formula: "const tension = 2.0; x * x * ((tension + 1) * x - tension)" },
        {
            label: "AnticipateOvershoot", formula: `
const curveTension = 2.0 * 1.5;
function anticipateHelper(t, s) { return t * t * ((s + 1) * t - s); }
function overshootHelper(t, s) { return t * t * ((s + 1) * t + s); }

if (x < 0.5) {
  0.5 * anticipateHelper(x * 2.0, curveTension);
} else {
  0.5 * (overshootHelper(x * 2.0 - 2.0, curveTension) + 2.0);
}` },
        { label: "Cycle Motion", formula: "const numCycles = 1.0; Math.sin(2 * numCycles * Math.PI * x)" },
        {
            label: "Decelerate Curve", formula: `
const decelFactor = 1.0;
if (decelFactor === 1.0) {
  (1.0 - (1.0 - x) * (1.0 - x));
} else {
  (1.0 - Math.pow((1.0 - x), 2 * decelFactor));
}` },
        { label: "Overshoot Curve", formula: "const overshootTension = 2.0; x -= 1.0; x * x * ((overshootTension + 1) * x + overshootTension) + 1.0" },
        { label: "[Advanced Curves]", formula: null },
        {
            label: "Cubic Hermite", formula: `
function calcCubicHermite(t_val, p_start, p_end, m_start, m_end){
   const t_squared = t_val * t_val;
   const t_cubed = t_squared * t_val;
   return (2 * t_cubed - 3 * t_squared + 1) * p_start + (t_cubed - 2 * t_squared + t_val) * m_start + (-2 * t_cubed + 3 * t_squared) * p_end + (t_cubed - t_squared) * m_end;
}

// time (x), start_value, end_value, tangent_at_start, tangent_at_end
// Adjust tangent_at_start and tangent_at_end for different curve shapes
calcCubicHermite(x, 0, 1, 4, 4)` }
    ]
};

// Polyfill for global string replacement if not natively available
if (!String.prototype.customGlobalReplace) {
    String.prototype.customGlobalReplace = function (searchStr, replaceStr) {
        let currentTarget = this;
        // Use a function for the replacement to handle potential special chars in replaceStr
        return currentTarget.replace(new RegExp(searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replaceStr);
    };
}

// --------------------------- //

// Initialize the code editor
codeEditor.setTheme("ace/theme/chrome"); // Visual theme
codeEditor.renderer.setShowGutter(false); // Hide line numbers
codeEditor.renderer.setPadding(8); // Internal padding
codeEditor.renderer.setScrollMargin(6, 0, 0, 0); // Scroll margin
codeEditor.setHighlightActiveLine(false); // No active line highlight
codeEditor.getSession().setUseWrapMode(true); // Enable word wrap
codeEditor.getSession().setMode("ace/mode/javascript"); // Set syntax highlighting to JavaScript

// Initial drawing sequence
renderAllPlotElements();
drawAnimatedObject();
updatePlaceholderVisuals(-1); // Initialize placeholders as hidden

// Populate the curve preset dropdown
PRESET_CURVES.definitions.forEach((curveEntry) => {
    const isSectionHeader = (curveEntry.formula === null);
    const dropdownOption = document.createElement("option");
    dropdownOption.textContent = (isSectionHeader ? "" : "\u00A0\u00A0") + curveEntry.label; // Add non-breaking space for indentation

    curvePresetSelector.appendChild(dropdownOption);

    if (isSectionHeader) {
        dropdownOption.style.color = "#8bc34a"; // Green color for headers
        dropdownOption.disabled = true; // Make headers unselectable
    }
});

// Set the initial curve from the library (e.g., "Linear")
setCurveFromPreset(1);
// Perform an initial data update and redraw
refreshDisplayData();

// --------------------------- //

// Event listeners for user input
codeEditor.on("change", () => { // Using Ace editor's 'change' event
    debounceUpdate();
});

animationDurationInput.addEventListener("input", () => {
    debounceUpdate();
});

// Helper to debounce updates triggered by user input
function debounceUpdate() {
    clearTimeout(debounceTimerId);
    debounceTimerId = window.setTimeout(() => {
        refreshDisplayData();
    }, 75); // Slightly increased debounce time
}

// Sets the editor content from a predefined curve preset
function setCurveFromPreset(presetIndex) {
    // Ensure index is valid and handle default selection
    const selectedIdx = (typeof presetIndex === "number" && presetIndex >= 0 && presetIndex < PRESET_CURVES.definitions.length)
        ? presetIndex
        : curvePresetSelector.selectedIndex;

    // Update dropdown selection if an index was provided explicitly
    if (typeof presetIndex === "number") {
        curvePresetSelector.options[selectedIdx].selected = true;
    }

    const formulaText = PRESET_CURVES.definitions[selectedIdx].formula;
    if (formulaText) {
        codeEditor.getSession().setValue(formulaText);
    } else {
        // If it's a section header, clear editor or set a comment
        codeEditor.getSession().setValue("// Select an actual curve from the list above!");
    }
}

// Updates visibility and position of animation placeholders
function updatePlaceholderVisuals(animationType) {
    const mainContainer = document.getElementById("container");
    const startPlaceholder = document.getElementById("box-placeholder-start");
    const endPlaceholder = document.getElementById("box-placeholder-end");

    // Center the placeholders horizontally with the animated box
    const boxHorizontalCenter = (mainContainer.offsetLeft + mainContainer.clientWidth / 2 - (animatedBox.clientWidth / 2)) + "px";
    const boxElements = document.getElementsByClassName("box");
    for (let i = 0; i < boxElements.length; i++) {
        boxElements[i].style.left = boxHorizontalCenter;
    }

    // Handle visibility based on animation type
    if (animationType === VIZ_TYPES.OPACITY) {
        startPlaceholder.style.display = "none";
    } else {
        startPlaceholder.style.display = "block";
    }

    if (animationType === VIZ_TYPES.TRANSLATION) {
        endPlaceholder.style.top = (nextBoxPosition + animatedBox.clientHeight) + "px";
        endPlaceholder.style.display = "block";
    } else {
        endPlaceholder.style.display = "none";
    }
}

// Refreshes all data, redraws the graph, and resets animation time
function refreshDisplayData() {
    renderAllPlotElements();
    animationStartTime = Date.now(); // Reset animation timer
    drawAnimatedObject(); // Redraw the animated box at its initial state
}

// Clears the canvas and redraws all static graph elements
function renderAllPlotElements() {
    renderContext.clearRect(0, 0, canvasDisplay.width, canvasDisplay.height);
    resetPlotTextStyling();

    drawPlotGrid();
    drawPlotAxes();
    plotCurve();
}

// Resets the font and color for canvas text
function resetPlotTextStyling() {
    renderContext.fillStyle = "black";
    renderContext.font = `${FONT_SIZE_PX}pt Verdana`; // Using template literal for font size
}

// Calculates the Y-coordinate for the zero line on the graph
function getZeroLineYCoordinate() {
    const totalHeightUnits = PLOT_MAX_Y_VAL + currentYOverflowTop + currentYOverflowBottom;
    const unitHeight = (canvasDisplay.height - PLOT_PADDING_X * 2) / totalHeightUnits;
    const zeroOffsetFromBottom = currentYOverflowBottom * unitHeight;
    return canvasDisplay.height - PLOT_PADDING_X - zeroOffsetFromBottom;
}

// Calculates the vertical space occupied by one unit on the graph
function getPlotUnitHeight() {
    const totalVerticalRange = PLOT_MAX_Y_VAL + currentYOverflowTop + currentYOverflowBottom;
    return (canvasDisplay.height - PLOT_PADDING_X * 2) / totalVerticalRange;
}

// Draws the background grid lines and labels on the canvas
function drawPlotGrid() {
    renderContext.lineWidth = 1;
    renderContext.textAlign = "left";
    renderContext.strokeStyle = "#e0e0e0"; // Light gray grid lines

    const verticalUnitSpace = getPlotUnitHeight();
    const horizontalUnitSpace = (canvasDisplay.height - PLOT_PADDING_X * 2) / (PLOT_MAX_Y_VAL - PLOT_MIN_Y_VAL); // For X-axis grid lines

    renderContext.beginPath();
    // Iterate through Y-axis values to draw horizontal lines and labels
    for (let i = PLOT_MIN_Y_VAL - currentYOverflowBottom; i <= PLOT_MAX_Y_VAL + currentYOverflowTop; i++) {
        const isOutsideTimeRange = i < PLOT_MIN_X_TIME || i > PLOT_MAX_X_TIME;

        // Draw horizontal grid lines (rows)
        const currentY = getZeroLineYCoordinate() - (i * verticalUnitSpace);
        renderContext.moveTo(PLOT_PADDING_X, currentY);
        renderContext.lineTo(canvasDisplay.width - PLOT_PADDING_X, currentY);

        // Draw vertical grid lines (columns) - reusing the loop counter for convenience
        const currentX = (i * horizontalUnitSpace) + PLOT_PADDING_X;
        if (!isOutsideTimeRange) {
            renderContext.moveTo(currentX, canvasDisplay.height - PLOT_PADDING_X);
            renderContext.lineTo(currentX, PLOT_PADDING_X);
        }

        // Apply distinct styling for overflow labels
        if ((currentYOverflowTop > 0 && i > PLOT_MAX_Y_VAL) || (currentYOverflowBottom > 0 && i < PLOT_MIN_Y_VAL)) {
            renderContext.fillStyle = "darkred"; // Red for overflow values
        } else {
            renderContext.fillStyle = "black";
        }

        // Bold text for specific Y-axis labels
        if (i === PLOT_MAX_Y_VAL || i === 0) {
            renderContext.font = `bold ${FONT_SIZE_PX}pt Verdana`;
        } else {
            renderContext.font = `${FONT_SIZE_PX}pt Verdana`;
        }

        // Draw Y-axis legend (values)
        const yAxisLabel = (i / 10).toFixed(1); // Format label for display
        const labelWidth = renderContext.measureText(yAxisLabel).width;
        if (!(i === 0 && currentYOverflowBottom === 0)) { // Don't draw '0' if no bottom overflow
            renderContext.fillText(yAxisLabel, PLOT_PADDING_X - LABEL_SPACING_Y - labelWidth, currentY + (FONT_SIZE_PX / 2));
        }

        // Draw X-axis legend (time)
        if (!isOutsideTimeRange && i !== 0) {
            renderContext.fillStyle = "black";
            renderContext.fillText(yAxisLabel, currentX - (labelWidth / 2), canvasDisplay.height - PLOT_PADDING_X + FONT_SIZE_PX + LABEL_SPACING_Y);
        }
    }
    renderContext.stroke(); // Render all paths
}

// Draws the main X and Y axes
function drawPlotAxes() {
    resetPlotTextStyling();
    renderContext.lineWidth = 2; // Thicker lines for axes
    renderContext.strokeStyle = "darkgray";
    renderContext.textAlign = "center";
    renderContext.fillStyle = "dimgray";

    renderContext.beginPath();
    // Y-axis line
    renderContext.moveTo(PLOT_PADDING_X, PLOT_PADDING_X);
    renderContext.lineTo(PLOT_PADDING_X, canvasDisplay.height - PLOT_PADDING_X);
    // X-axis line (at Y=0)
    renderContext.moveTo(PLOT_PADDING_X, getZeroLineYCoordinate());
    renderContext.lineTo(canvasDisplay.width - PLOT_PADDING_X, getZeroLineYCoordinate());

    // X-axis label
    const xLabelYOffset = PLOT_DRAW_WIDTH + PLOT_PADDING_X + LABEL_SPACING_Y + FONT_SIZE_PX * 3;
    renderContext.fillText("Normalized Time (x)", PLOT_PADDING_X + PLOT_DRAW_WIDTH / 2, xLabelYOffset);

    renderContext.stroke();
}

// Calculates the effective height available for the graph curve
function getEffectivePlotHeight() {
    const topExtension = (getPlotUnitHeight() * currentYOverflowTop);
    const bottomExtension = (getPlotUnitHeight() * currentYOverflowBottom);

    return PLOT_DRAW_WIDTH - topExtension - bottomExtension;
}

// Plots the curve defined in the editor on the canvas
function plotCurve() {
    renderContext.lineWidth = 3;
    renderContext.strokeStyle = "#e51c23"; // Red curve color

    renderContext.beginPath();

    const maxPlotTopThreshold = PLOT_MAX_Y_VAL / 10; // Normalized max Y for curve checking
    const maxPlotBottomThreshold = PLOT_MIN_Y_VAL / 10; // Normalized min Y for curve checking
    const maxAllowedTopOverflow = PLOT_Y_OVERFLOW_TOP / 10;
    const maxAllowedBottomOverflow = PLOT_Y_OVERFLOW_BOTTOM / 10;

    let highestCurvePoint = 1; // Track highest Y value encountered
    let lowestCurvePoint = 0; // Track lowest Y value encountered

    // Loop through the X-axis (time) to draw the curve
    for (let xCoord = 0; xCoord < PLOT_DRAW_WIDTH; xCoord++) {
        const normalizedTime = xCoord / PLOT_DRAW_WIDTH; // X value from 0 to 1
        const curveOutput = evaluateCurvePoint(normalizedTime); // Evaluate the curve at this point

        const yCoord = -curveOutput * getEffectivePlotHeight(); // Convert curve output to canvas Y coordinate
        const plotX = xCoord + PLOT_PADDING_X + 1; // Canvas X position
        const plotY = getZeroLineYCoordinate() + yCoord - 2; // Canvas Y position

        if (xCoord === 0) {
            renderContext.moveTo(plotX, plotY); // Start drawing path
        } else {
            renderContext.lineTo(plotX, plotY); // Continue drawing path
        }

        // Check for Y-axis overflow
        if (curveOutput > highestCurvePoint) {
            highestCurvePoint = curveOutput;
        }
        if (curveOutput < lowestCurvePoint) {
            lowestCurvePoint = curveOutput;
        }
    }

    // Calculate required overflow based on curve extremities
    const neededTopOverflow = Math.ceil(Math.max(0, (highestCurvePoint - maxPlotTopThreshold) * 10));
    const neededBottomOverflow = Math.ceil(Math.min(0, (lowestCurvePoint - maxPlotBottomThreshold) * 10));

    // Adjust grid/graph if overflow detected and within limits
    if (neededTopOverflow !== currentYOverflowTop || neededBottomOverflow !== currentYOverflowBottom) {
        currentYOverflowTop = Math.min(neededTopOverflow, PLOT_Y_OVERFLOW_TOP);
        currentYOverflowBottom = Math.max(neededBottomOverflow, -PLOT_Y_OVERFLOW_BOTTOM); // Overflow bottom is negative

        // Redraw everything with new overflow settings
        renderAllPlotElements();
        return; // Exit to prevent drawing an incorrect curve
    }

    renderContext.stroke(); // Finalize drawing the curve
}

// Injects 'Math.' prefix for standard Math functions within the code
function prefixMathFunctions(inputCode) {
    if (!inputCode || inputCode.length === 0) return inputCode;

    let processedCode = inputCode;
    for (const mathProp of MATH_GLOBAL_PROPS) {
        // Ensure whole word replacement to avoid replacing "sin" in "console.log(sin)"
        processedCode = processedCode.customGlobalReplace(`\\b${mathProp}\\b`, `Math.${mathProp}`);
    }
    return processedCode;
}

// Evaluates the user-defined curve expression for a given normalized time (x)
function evaluateCurvePoint(normalizedTime) {
    const animationDuration = parseFloat(animationDurationInput.value); // 'd' variable in the equation
    const x = normalizedTime; // 'x' variable in the equation

    try {
        let curveExpression = codeEditor.getSession().getValue();
        // Add 'use strict' to prevent accidental global variable creation
        curveExpression = `'use strict';\n${curveExpression}`;
        const safeCurveExpression = prefixMathFunctions(curveExpression);

        // Create a function dynamically to evaluate the expression
        // This provides a sandboxed environment for 'x' and 'd'
        const curveFunction = new Function('x', 'd', `
            ${safeCurveExpression};
            // Ensure the last statement is returned if no explicit return
            const lastStatement = ${safeCurveExpression.split('\n').pop().trim()};
            if (typeof lastStatement !== 'undefined' && typeof lastStatement !== 'function' && !lastStatement.startsWith('const') && !lastStatement.startsWith('let') && !lastStatement.startsWith('var')) {
                return lastStatement;
            }
            // Fallback if no clear return or value
            return 0;
        `);
        const calculatedValue = curveFunction(x, animationDuration);
        
        // Basic validation for the output
        if (typeof calculatedValue !== 'number' || isNaN(calculatedValue)) {
            throw new Error("Curve expression must return a single numeric value.");
        }

        lastSuccessfulCurveExpression = safeCurveExpression; // Store for error recovery
        editorWrapper.classList.remove("has-error");
        editorWrapper.classList.add("has-success");
        errorIndicator.style.display = "none";

        return calculatedValue;
    } catch (err) {
        errorIndicator.title = `Syntax Error: ${err.message}`;
        errorIndicator.style.display = "inline";
        editorWrapper.classList.remove("has-success");
        editorWrapper.classList.add("has-error");

        // Attempt to evaluate the last known good expression
        try {
            if (lastSuccessfulCurveExpression) {
                const fallbackFunction = new Function('x', 'd', `'use strict';\n${lastSuccessfulCurveExpression}; return ${lastSuccessfulCurveExpression.split('\n').pop().trim()};`);
                return fallbackFunction(x, animationDuration);
            }
        } catch (fallbackErr) {
            console.error("Fallback curve evaluation failed:", fallbackErr);
        }
        return 0; // Default to 0 on persistent error
    }
}

// Draws a small indicator on the graph showing the current animation point
function plotCurrentAnimationPoint(timeRatio) {
    renderContext.fillStyle = "orange"; // Distinct color for the animation point
    const curveYValue = -evaluateCurvePoint(timeRatio) * getEffectivePlotHeight();
    const pointX = (timeRatio * PLOT_DRAW_WIDTH) + PLOT_PADDING_X + 1;
    const pointY = getZeroLineYCoordinate() + curveYValue - 2;
    renderContext.fillRect(pointX - 1.5, pointY - 1.5, 3, 3); // Slightly larger square
}

// Enables or disables the animation loop
function setAnimationActiveState(active) {
    isAnimationActive = active;
    if (active) {
        resetAnimatedObject(); // Prepare box for new animation
        drawAnimatedObject(); // Start immediate drawing
    }
    renderAllPlotElements(); // Redraw graph to clear previous animation point
}

// Main animation loop for the animated box
function drawAnimatedObject() {
    const animationDuration = parseFloat(animationDurationInput.value);

    // Guard clause: if animation is not active or duration is invalid, stop
    if (!isAnimationActive || isNaN(animationDuration) || animationDuration <= 0) {
        return;
    }

    let currentAnimationTime = Date.now() - animationStartTime;
    let progressRatio = currentAnimationTime / animationDuration;

    // Apply reverse logic
    progressRatio = isAnimationReversed ? 1.0 - progressRatio : progressRatio;

    // Loop animation if within bounds, otherwise reset or stop
    if (progressRatio > 1.0 || progressRatio < 0) {
        // Animation cycle completed or went out of bounds, reset and restart
        refreshDisplayData();
    } else {
        // Continue animation
        requestNextAnimationFrame(drawAnimatedObject);
        plotCurrentAnimationPoint(progressRatio); // Update point on graph

        // Apply transformations based on current animation mode
        switch (currentAnimationMode) {
            case VIZ_TYPES.TRANSLATION:
                const verticalMove = interpolateValue(0, nextBoxPosition, progressRatio);
                applyBoxTransform("translate(0, " + verticalMove + "px)");
                break;
            case VIZ_TYPES.SCALING:
                const scaleFactor = interpolateValue(0, 1, progressRatio);
                applyBoxTransform("scale(" + scaleFactor + ", " + scaleFactor + ")");
                break;
            case VIZ_TYPES.ROTATION:
                const rotationDegrees = interpolateValue(0, 360, progressRatio);
                applyBoxTransform("rotate(" + rotationDegrees + "deg)");
                break;
            case VIZ_TYPES.OPACITY:
                const alphaValue = interpolateValue(0, 1, progressRatio);
                animatedBox.style.opacity = alphaValue.toString();
                break;
            default:
                // No specific visualization active, ensure default state
                applyBoxTransform("none");
                animatedBox.style.opacity = "1";
                break;
        }
    }
}

// Performs a curve-based interpolation between two values
function interpolateValue(startVal, endVal, ratio) {
    // The original code used fEval(t) which means the interpolation itself is non-linear
    // This maintains that behavior.
    const curvedRatio = evaluateCurvePoint(ratio);
    return startVal + (endVal - startVal) * curvedRatio;
}

// Toggles the direction of the animation
function toggleAnimationDirection() {
    isAnimationReversed = !isAnimationReversed;
    refreshDisplayData(); // Restart animation from beginning with new direction
}

// Applies CSS transform properties to the animated box
function applyBoxTransform(transformString) {
    animatedBox.style.webkitTransform = transformString; // For older Webkit browsers
    animatedBox.style.transform = transformString; // Standard property
    animatedBox.style.msTransform = transformString; // For IE/Edge
}

// Handles changes in the selected animation type (movement, scale, etc.)
function handleAnimationTypeChange(triggeringElement) {
    // Clear previous active button styling
    if (currentlyActiveButton) {
        currentlyActiveButton.classList.remove("active", "btn-primary");
    }

    if (!triggeringElement || typeof triggeringElement.value === "undefined") {
        // If no specific animation type is selected (e.g., "Remove Visualization" clicked)
        setAnimationActiveState(false);
        resetAnimatedObject();
        isAnimationReversed = false;
        visualizationResetButton.style.display = "none";
        updatePlaceholderVisuals(VIZ_TYPES.NO_ANIM);
        currentAnimationMode = VIZ_TYPES.NO_ANIM; // Explicitly set to no animation
    } else {
        // Set new animation type
        currentAnimationMode = parseInt(triggeringElement.value, 10);
        triggeringElement.classList.add("active", "btn-primary");
        currentlyActiveButton = triggeringElement;
        visualizationResetButton.style.display = "inline"; // Show reset button
        setAnimationActiveState(true);
        updatePlaceholderVisuals(currentAnimationMode);
    }
}

// Resets the animated box to its initial state
function resetAnimatedObject() {
    animationStartTime = Date.now(); // Reset timer for new animation cycle
    animatedBox.style.opacity = "1"; // Full opacity
    applyBoxTransform("none"); // No transformations
}

// Toggles the visibility of the help/info overlay
function toggleInfoPanel() {
    // Check current display style, handling both empty string and "none"
    if (infoOverlay.style.display && infoOverlay.style.display !== "none") {
        infoOverlay.style.display = "none";
    } else {
        // Position and show the help panel over the canvas
        infoOverlay.style.height = canvasDisplay.height + "px";
        infoOverlay.style.left = canvasDisplay.getBoundingClientRect().left + "px";
        infoOverlay.style.display = "inline"; // Or "block" depending on desired layout
    }
}

// Cross-browser requestAnimationFrame polyfill
const requestNextAnimationFrame = (() => {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callbackFunction) {
            window.setTimeout(callbackFunction, 1000 / 60); // Fallback to setTimeout
        }
    );
})();