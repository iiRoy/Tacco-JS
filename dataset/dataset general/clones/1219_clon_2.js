// Function curve plotter and animator
// Developed by a dedicated team of software artisans

// DOM Elements for application interface
var chartCanvas = document.getElementById("graph");
var codeEditor = ace.edit("editor");
var codeEditorContainer = document.getElementById("editor-parent");
var animDurationInput = document.getElementById("delay");
var animatedShape = document.getElementById("box");
var clearVisualizationButton = document.getElementById("remove-vis");
var syntaxIssueIndicator = document.getElementById("syntax-error-icon");
var presetLibrary = document.getElementById("library");
var infoPanel = document.getElementById("help");
var renderContext = chartCanvas.getContext("2d");

// Application-wide configuration constants
var MOTION_EFFECTS = { NO_EFFECT:0, TRANSLATION: 1, RESIZING:2, SPINNING:3, OPACITY_CHANGE:4  };
var CHART_MARGIN = 40;
var CHART_LABEL_OFFSET = 5;
var CHART_UPPER_BOUND = 10, CHART_OVERFLOW_TOP_LIMIT = 10;
var CHART_LOWER_BOUND = 0, CHART_OVERFLOW_BOTTOM_LIMIT = 10;
var CHART_TIME_END = 10, CHART_TIME_START = 0;
var CHART_TEXT_SIZE = 8;
var CHART_DRAWING_WIDTH = (chartCanvas.width - (CHART_MARGIN * 2));
var MATH_API_PROPERTIES = Object.getOwnPropertyNames(Math);

var previousSuccessfulFormula, animationStartTime, activeEffectButton;
var targetVerticalPosition = chartCanvas.height / 2 - animatedShape.clientHeight / 2;
var isAnimationRunning = false, isAnimationReversed = false;
var activeEffectType = MOTION_EFFECTS.NO_EFFECT;
var updateTimerId;
var chartExtraTopSpace = 0, chartExtraBottomSpace = 0;

var EASING_PRESETS = { definitions:[
    {label:"[Base Functions]", expression:null},
    {label:"Linear Progression", expression:"x"},
    {label:"Smooth Interpolation", expression:"x * x * (3 - 2 * x)"},
    {label:"Springy Motion", expression:"coefficient = 0.4\npow(2, -10 * x) * sin((x - coefficient / 4) * (2 * PI) / coefficient) + 1"},
    {label:"[Android Specific]", expression:null},
    {label:"AccelDecel", expression:"(cos((x + 1) * PI) / 2.0) + 0.5"},
    {label:"Bouncy Effect", expression:"// Utilize JavaScript syntax for elaborate equations\nfunction bounceFunction(param) { return param*param*8; }\n\nif (x < 0.3535)\n bounceFunction(x)\nelse if (x < 0.7408)\n bounceFunction(x - 0.54719) + 0.7\nelse if (x < 0.9644)\n bounceFunction(x - 0.8526) + 0.9\nelse\n bounceFunction(x - 1.0435) + 0.95"},
    {label:"Acceleration Curve", expression:"rate = 1.0\nif (rate == 1.0)\n x * x\nelse\n pow(x, 2 * rate)"},
    {label:"Anticipation", expression:"tension = 2.0\nx * x * ((tension + 1) * x - tension)"},
    {label:"AnticipateOvershoot", expression:"tension = 2.0 * 1.5\nfunction cubicA(t_val, s_val) { return t_val * t_val * ((s_val + 1) * t_val - s_val); }\nfunction cubicO(t_val, s_val) { return t_val * t_val * ((s_val + 1) * t_val + s_val); }\n\nif (x < 0.5)\n 0.5 * cubicA(x * 2.0, tension)\nelse\n 0.5 * (cubicO(x * 2.0 - 2.0, tension) + 2.0)"},
    {label:"Cyclic Movement", expression:"osc_cycles = 1.0\nsin(2 * osc_cycles * PI * x)"},
    {label:"Deceleration Curve", expression:"rate = 1.0\nif (rate == 1.0)\n (1.0 - (1.0 - x) * (1.0 - x))\nelse\n (1.0 - pow((1.0 - x), 2 * rate))"},
    {label:"Overshoot Effect", expression:"tension = 2.0\n\nx -= 1.0\nx * x * ((tension + 1) * x + tension) + 1.0"},
    {label:"[Advanced Techniques]", expression:null},
    {label:"CubicHermite Spline", expression:"function HermiteSpline(t_val, p_zero, p_one, m_zero, m_one){\n   t_sq = t_val*t_val;\n   t_cube = t_sq*t_val;\n   return (2*t_cube - 3*t_sq + 1)*p_zero + (t_cube-2*t_sq+t_val)*m_zero + (-2*t_cube+3*t_sq)*p_one + (t_cube-t_sq)*m_one;\n}\n\n// time, start_point, end_point, tangent_start, tangent_end\n// Adjust tangent_start and tangent_end as needed\nHermiteSpline(x, 0, 1, 4, 4)"}
]};

String.prototype.replaceEvery = function(pattern, substitute) {
    var inputString = this;
    return inputString.replace(new RegExp(pattern, 'g'), substitute);
};

// --- Initialization Block ---

// Configure the code editor component
codeEditor.setTheme("ace/theme/chrome");
codeEditor.renderer.setShowGutter(false);
codeEditor.renderer.setPadding(8);
codeEditor.renderer.setScrollMargin(4, 0, 0, 0);
codeEditor.setHighlightActiveLine(false);
codeEditor.getSession().setUseWrapMode(true);
codeEditor.getSession().setMode("ace/mode/javascript");

// Initial rendering of graphical elements
renderAllElements();
animateShape();

adjustShapePlaceholders(-1);

// Populate the preset library dropdown
EASING_PRESETS.definitions.forEach(function (item) {
    var isSectionHeader = (item.expression == null);
    var menuOption = document.createElement("option");
    menuOption.innerHTML = (!isSectionHeader ? "&nbsp;" : "") + item.label;

    presetLibrary.add(menuOption);

    if (isSectionHeader) {
        menuOption.style.color = "#8bc34a";
        menuOption.disabled = true;
    }
});

selectPresetFromLibrary(1);
refreshDisplayData();

// --- Event Listeners ---

codeEditor.addEventListener("input", function () {
    updateEditorTimer();
});

animDurationInput.addEventListener("input", function () {
    updateEditorTimer();
});

function updateEditorTimer() {
    clearTimeout(updateTimerId);
    updateTimerId = window.setTimeout(function () {
        refreshDisplayData();
    }, 50);
}

function selectPresetFromLibrary(presetIndex) {
    if (typeof presetIndex === "undefined") {
        presetIndex = presetLibrary.selectedIndex;
    } else {
        presetLibrary.options[presetIndex].selected = true;
    }

    codeEditor.getSession().setValue(EASING_PRESETS.definitions[presetIndex].expression);
}

function adjustShapePlaceholders(animationMode) {
    var mainContainer = document.getElementById("container");
    var startMarker = document.getElementById("box-placeholder-start");
    var endMarker = document.getElementById("box-placeholder-end");
    var shapeCenterPosition = (mainContainer.offsetLeft / 2 - (animatedShape.clientWidth / 2)) + "px";
    var shapeElements = document.getElementsByClassName("box");
    for (var i_idx = 0; i_idx < shapeElements.length; i_idx++) {
        shapeElements[i_idx].style.left = shapeCenterPosition;
    }
    if (animationMode == MOTION_EFFECTS.OPACITY_CHANGE) {
        startMarker.style.display = "none";
    } else {
        startMarker.style.display = "block";
    }

    if (animationMode == MOTION_EFFECTS.TRANSLATION) {
        endMarker.style.top = (targetVerticalPosition + animatedShape.clientHeight) + "px";
        endMarker.style.display = "block";
    } else {
        endMarker.style.display = "none";
    }
}

function refreshDisplayData() {
    renderAllElements();
    animationStartTime = Date.now();
    animateShape();
}

function renderAllElements() {
    renderContext.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    resetTextStyling(); // Restore default font styles

    drawBackgroundGrid();
    drawCoordinateAxes();
    plotFunctionCurve();
}

function resetTextStyling() {
    renderContext.fillStyle = "black";
    renderContext.font = CHART_TEXT_SIZE + "pt verdana";
}

function getCanvasZeroY() {
    // Calculates the Y-coordinate for the chart's zero line
    return chartCanvas.height - CHART_MARGIN - (chartExtraBottomSpace * getVerticalUnitScale())
}

function getVerticalUnitScale() {
    // Determines the pixel height of one unit on the Y-axis
    return (chartCanvas.height - CHART_MARGIN * 2) / (CHART_UPPER_BOUND + chartExtraTopSpace + chartExtraBottomSpace);
}

function drawBackgroundGrid() {
    renderContext.lineWidth = 1;
    renderContext.textAlign = "left";
    renderContext.strokeStyle = "#e0e0e0";

    var VERTICAL_UNIT_PIXELS = getVerticalUnitScale();
    var HORIZONTAL_UNIT_PIXELS = (chartCanvas.height - CHART_MARGIN * 2) / (CHART_UPPER_BOUND);

    renderContext.beginPath();
    for (var y_unit = CHART_LOWER_BOUND - chartExtraBottomSpace; y_unit <= CHART_UPPER_BOUND + chartExtraTopSpace; y_unit++) {
        var isOutsideTimeBounds =  y_unit < CHART_TIME_START || y_unit > CHART_TIME_END;

        // Draw horizontal grid lines
        var y_coord = getCanvasZeroY() - (y_unit * VERTICAL_UNIT_PIXELS);
        renderContext.moveTo(CHART_MARGIN, y_coord);
        renderContext.lineTo(chartCanvas.width - CHART_MARGIN, y_coord);

        // Draw vertical grid lines
        var x_coord = (y_unit * HORIZONTAL_UNIT_PIXELS) - 1 + CHART_MARGIN;
        if (!isOutsideTimeBounds) {
            renderContext.moveTo(x_coord, chartCanvas.height - CHART_MARGIN);
            renderContext.lineTo(x_coord, CHART_MARGIN);
        }

        // Apply distinct styling for overflow labels
        if ((chartExtraTopSpace > 0 && y_unit > CHART_UPPER_BOUND) || (chartExtraBottomSpace > 0 && y_unit < CHART_LOWER_BOUND)) {
            renderContext.fillStyle = "red";
        } else {
            renderContext.fillStyle = "black";
        }

        // Highlight key axis labels
        if (y_unit == CHART_UPPER_BOUND || y_unit == 0) {
            renderContext.font = "bold " + CHART_TEXT_SIZE + "pt verdana";
        } else {
            renderContext.font = CHART_TEXT_SIZE + "pt verdana";
        }

        // Render axis labels
        var axisLabel = (y_unit / 10).toFixed(1);
        var labelWidth = renderContext.measureText(axisLabel).width;
        var halfLabelWidth = labelWidth / 2;
        if (!(y_unit == 0 && chartExtraBottomSpace == 0)) { // Skip drawing zero if no bottom overflow
            renderContext.fillText(axisLabel.toString(), CHART_MARGIN - CHART_LABEL_OFFSET - labelWidth, y_coord + (CHART_TEXT_SIZE / 2));
        }
        if (!isOutsideTimeBounds && y_unit != 0) {
            renderContext.fillStyle = "black";
            renderContext.fillText(axisLabel.toString(), x_coord - halfLabelWidth, chartCanvas.height - CHART_MARGIN + CHART_TEXT_SIZE + CHART_LABEL_OFFSET);
        }
    }
    renderContext.stroke();
}

function drawCoordinateAxes() {
    resetTextStyling();
    renderContext.lineWidth = 2;
    renderContext.strokeStyle = "black";
    renderContext.textAlign = "center";
    renderContext.fillStyle = "silver";

    renderContext.beginPath();
    renderContext.moveTo(CHART_MARGIN, CHART_MARGIN);
    renderContext.lineTo(CHART_MARGIN, chartCanvas.height - CHART_MARGIN);
    renderContext.moveTo(CHART_MARGIN, getCanvasZeroY());
    renderContext.lineTo(chartCanvas.width - CHART_MARGIN, getCanvasZeroY());
    renderContext.fillText("time (x)", CHART_MARGIN + CHART_DRAWING_WIDTH / 2, CHART_DRAWING_WIDTH + CHART_MARGIN + CHART_LABEL_OFFSET + CHART_TEXT_SIZE*3);

    renderContext.stroke();
}

function getPlottingAreaHeight() {
    var additionalTopSpace = (getVerticalUnitScale() * chartExtraTopSpace);
    var additionalBottomSpace = (getVerticalUnitScale() * chartExtraBottomSpace);

    return CHART_DRAWING_WIDTH - additionalTopSpace - additionalBottomSpace;
}

function plotFunctionCurve() {
    renderContext.lineWidth = 3;
    renderContext.strokeStyle = "#e51c23"; // Distinct color for the curve

    renderContext.beginPath();

    var maxAllowedTopOverflow = CHART_OVERFLOW_TOP_LIMIT / 10;
    var maxAllowedBottomOverflow = CHART_OVERFLOW_BOTTOM_LIMIT / 10;
    var maxPlotValue = CHART_UPPER_BOUND / 10;
    var currentTopOverflow = 1, currentBottomOverflow = 0;

    for (var x_val = 0; x_val < CHART_DRAWING_WIDTH; x_val++) {
        var evaluatedValue = (evaluateFunction(x_val / CHART_DRAWING_WIDTH));
        var verticalCoord = -evaluatedValue * getPlottingAreaHeight();
        renderContext.lineTo(x_val + CHART_MARGIN + 1, getCanvasZeroY() + verticalCoord - 2);

        // Check if the curve extends beyond current visible bounds
        if (evaluatedValue > maxPlotValue && evaluatedValue <= (maxPlotValue + maxAllowedTopOverflow) && evaluatedValue > currentTopOverflow) {
            currentTopOverflow = evaluatedValue;
        } else if (evaluatedValue < CHART_LOWER_BOUND && evaluatedValue >= CHART_LOWER_BOUND - maxAllowedBottomOverflow && evaluatedValue < currentBottomOverflow) {
            currentBottomOverflow = evaluatedValue;
        }
    }

    // Adjust grid/chart if the curve overflows
    var calculatedTopOverflow = Math.ceil(Math.abs((maxPlotValue - currentTopOverflow) * 10));
    var calculatedBottomOverflow = Math.ceil(Math.abs((CHART_LOWER_BOUND - currentBottomOverflow) * 10));

    if (calculatedTopOverflow != chartExtraTopSpace || calculatedBottomOverflow != chartExtraBottomSpace) {
        chartExtraTopSpace = calculatedTopOverflow;
        chartExtraBottomSpace = calculatedBottomOverflow;
        renderAllElements();
        return; // Redraw completely
    }

    renderContext.stroke();
}

function wrapMathFunctions(inputCode) {
    if (inputCode.length == 0) return inputCode;

    for(var propIndex in MATH_API_PROPERTIES){
        inputCode = inputCode.replaceEvery(MATH_API_PROPERTIES[propIndex], "Math." + MATH_API_PROPERTIES[propIndex]);
    }
    return inputCode;
}

// Ignore unused parameter warning for 'x'
// noinspection JSUnusedLocalSymbols
function evaluateFunction(x) {
    var animationDelayValue = animDurationInput.value; // Renamed 'd' to 'animationDelayValue'
    try {
        var formulaCode = wrapMathFunctions(codeEditor.getSession().getValue());
        var evaluatedResult = eval(formulaCode);
        previousSuccessfulFormula = formulaCode;
        codeEditorContainer.classList.remove("has-error");
        codeEditorContainer.classList.add("has-success");
        syntaxIssueIndicator.style.display = "none";

        return evaluatedResult;
    } catch (errorObject) {
        syntaxIssueIndicator.title = errorObject.message;
        syntaxIssueIndicator.style.display = "inline";
        codeEditorContainer.classList.remove("has-success");
        codeEditorContainer.classList.add("has-error");

        return eval(previousSuccessfulFormula); // Fallback to last known good formula
    }
}

function markCurrentPoint(progress) {
    renderContext.fillStyle = "yellow"; // Highlight color for current point
    var y_val = -(evaluateFunction(progress) * getPlottingAreaHeight());
    var xPosition = (progress * CHART_DRAWING_WIDTH ) + CHART_MARGIN + 1;
    var yPosition = getCanvasZeroY() + y_val - 2;
    renderContext.fillRect(xPosition - 1, yPosition - 1, 2, 2);
}

function toggleAnimationState(isEnabled) {
    isAnimationRunning = isEnabled;
    if (isEnabled) {
        resetAnimatedShape(); // Prepare for new animation
        animateShape();
    }
    renderAllElements(); // Refresh the chart
}

function animateShape() {
    var animationDelayValue = parseFloat(animDurationInput.value);
    if (animationDelayValue <= 0.0 || !isAnimationRunning) {
        return; // Stop if no delay or animation is off
    }

    var progress = (Date.now() - animationStartTime) / animationDelayValue;
    progress = isAnimationReversed ? 1.0 - progress : progress;

    if (progress > 1.0 || progress < 0) {
        refreshDisplayData(); // Reset after animation cycle
    } else {
        requestAnimationFramePolyfill(animateShape); // Continue animation
        markCurrentPoint(progress);

        switch (activeEffectType) {
            case MOTION_EFFECTS.TRANSLATION:
                var translationAmount = linearInterpolate(0, targetVerticalPosition, progress);
                applyShapeTransformation("translate(0, " + translationAmount + "px)");
                break;
            case MOTION_EFFECTS.RESIZING:
                var scalingFactor = linearInterpolate(0, 1, progress);
                applyShapeTransformation("scale(" + scalingFactor + ", " + scalingFactor + ")");
                break;
            case MOTION_EFFECTS.SPINNING:
                var rotationDegrees = linearInterpolate(0, 360, progress);
                applyShapeTransformation("rotate(" + rotationDegrees + "deg)");
                break;
            case MOTION_EFFECTS.OPACITY_CHANGE:
                var alphaValue = linearInterpolate(0, 1, progress);
                animatedShape.style.opacity = alphaValue;
                break;
            default: // No specific effect, do nothing
        }
    }
}

function linearInterpolate(startValue, endValue, progress) {
    // Simple linear interpolation, modified by easing function
    return (startValue + (endValue - startValue)) * evaluateFunction(progress);
}

function reversePlayback() {
    isAnimationReversed = !isAnimationReversed;
    refreshDisplayData(); // Restart animation with reversed state
}

function applyShapeTransformation(cssTransformString) {
    animatedShape.style.webkitTransform = cssTransformString;
    animatedShape.style.transform = cssTransformString;
    animatedShape.style.msTransform = cssTransformString;
}

function configureShapeAnimation(buttonElement) {
    if (activeEffectButton) {
        activeEffectButton.classList.remove("active");
        activeEffectButton.classList.remove("btn-primary");
    }

    if (typeof buttonElement.value === "undefined") {
        toggleAnimationState(false);
        resetAnimatedShape();
        isAnimationReversed = false;
        clearVisualizationButton.style.display = "none";
        adjustShapePlaceholders(0); // Reset placeholders
    } else {
        activeEffectType = parseInt(buttonElement.value);
        buttonElement.classList.add("active");
        buttonElement.classList.add("btn-primary");
        activeEffectButton = buttonElement;
        clearVisualizationButton.style.display = "inline";
        toggleAnimationState(true);
        adjustShapePlaceholders(activeEffectType);
    }
}

function resetAnimatedShape() {
    animationStartTime = Date.now(); // Reset animation timer
    animatedShape.style.opacity = "1";
    applyShapeTransformation("none"); // Clear all transformations
}

function toggleInfoPanel() {
    if (infoPanel.style.display != "" && infoPanel.style.display != "none") {
        infoPanel.style.display = "none";
    } else {
        // Display help panel over the chart canvas
        infoPanel.style.height = chartCanvas.height + "px";
        infoPanel.style.left = chartCanvas.getBoundingClientRect().left + "px";
        infoPanel.style.display = "inline";
    }
}

window.requestAnimationFramePolyfill = function(){
    return (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* callbackFunction */ animationCallback){
        window.setTimeout(animationCallback, 1000 / 60);
    }
    );
}();