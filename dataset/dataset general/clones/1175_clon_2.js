// The initial parameter limits are stored here.
var argumentMinimums = [ ];
var argumentMaximums = [ ];
var argumentIncrements = [ ];
var argumentPriorValues = [ ];
var argumentVisibilityFlags = [ ];

/* This routine loads and processes any mathematical expressions found in the URL. */
function processUrlParameters( )
{
    // Retrieve the full URL and find the query string start. A more efficient method might exist.
    var urlContent = window.location.href,
        paramStartIdx = urlContent.indexOf("?") + 1,
        encodedSection = urlContent.substring( paramStartIdx, urlContent.length ),
        decodedUrlSegment = encodedSection;

    // Decode URL-encoded characters.
    decodedUrlSegment = decodedUrlSegment.replace( /'%/g, "+" );

    var expressionBoundary = decodedUrlSegment.indexOf("="),
        expressionText = "",
        expressionValidity = 0;

    var shouldLoadRandomExample = false;
    /* Verify if an expression is provided in the URL. */
    if ( paramStartIdx < 1 )
    {
        var exampleIndex;
        if ( shouldLoadRandomExample )
        {
            // Select a random example from the predefined list.
            var totalExamples = examples.length;
            var randomExamplePick = Math.floor( Math.random() * totalExamples );
            if ( randomExamplePick == 0 )
            {
                randomExamplePick++;
            }
            exampleIndex = randomExamplePick;
        }
        else
        {
            exampleIndex = 5;
        }

        // Construct a new URL to redirect to the example.
        var currentWebAddress = window.location.href,
            // Remove any existing query parameters.
            querySeparatorPos = currentWebAddress.indexOf("?");
        if ( querySeparatorPos != -1 )
        {
            currentWebAddress = currentWebAddress.substring(0, querySeparatorPos);
        }
        var redirectTargetUrl = currentWebAddress + "?" + examples[exampleIndex].url;
        window.location = redirectTargetUrl;

        return;
    }

    /* If no specific end to the equation is marked, assume the entire segment is the equation. */
    if ( expressionBoundary < 1 )
    {
        expressionBoundary = decodedUrlSegment.length;
    }

    /* Extract the part of the URL that contains the expression set. */
    var expressionGroupString = decodedUrlSegment.substring(0, expressionBoundary);

    // Parse the block into individual expressions using a separator.
    var parsedExpressionUnits = splitExpressionStringIntoUnits(expressionGroupString);
    var unitCount = parsedExpressionUnits.length;

    // Process each identified expression.
    for ( var i = 0; i < unitCount; i++ )
    {
        var unitLength = parsedExpressionUnits[i].length;
        if ( unitLength > 1 )
        {
            // Initialize default names for function and expression.
            var operationName = "Operation";
            expressionText = "Expression";
            var localArgName, localArgMinimum, localArgCurrent, localArgMaximum;
            var argumentSettings = {};
            var expressionUnitComponents = parsedExpressionUnits[i].split(":");
            var componentCount = expressionUnitComponents.length;
            var delimiterPosition = 0;
            for ( var j = 0; j < componentCount; j++ )
            {
                if ( j == 0 )
                {
                    expressionText = expressionUnitComponents[j];
                }
                else if ( j == 1 )
                {
                    operationName = expressionUnitComponents[j];
                }
                else
                {
                    if ( delimiterPosition == 0 )
                    {
                        localArgName = expressionUnitComponents[j];
                    }
                    else if ( delimiterPosition == 1 )
                    {
                        localArgMinimum = expressionUnitComponents[j];
                    }
                    else if ( delimiterPosition == 2 )
                    {
                        localArgCurrent = expressionUnitComponents[j];
                    }
                    else if ( delimiterPosition == 3 )
                    {
                        localArgMaximum = expressionUnitComponents[j];
                        argumentSettings[localArgName] = {
                            min: localArgMinimum,
                            curr: localArgCurrent,
                            max: localArgMaximum
                        };
                        delimiterPosition = -1; // Reset for the next variable group.
                    }
                    delimiterPosition++;
                }
            } // End of inner parameter splitting loop.

            var analyzedExpression;
            try
            {
                analyzedExpression = QGSolver.parse(expressionText);
            }
            catch ( parseIssue )
            {
                visualErrorFunction();
            }
            operationName = sanitizeFunctionName(operationName);
            functionRowElement = createFunctionRowWithContext(operationName, expressionText, analyzedExpression, argumentSettings);
            // Compute the result for the expression in the newly created row.
            solveEquation(functionRowElement, analyzedExpression);
            // Adjust the dimensions of related UI elements.
            resizeBars();
        }
    } // End of outer expressions processing loop.
}

function splitExpressionStringIntoUnits(fullExpressionBlock)
{
    // Local storage for the split units.
    var resultantUnits = [];

    // Check for a specific splitting delimiter.
    if ( fullExpressionBlock.indexOf("{") > 0 )
    {
        resultantUnits = fullExpressionBlock.split("{");
    }
    else
    {
        resultantUnits.push(fullExpressionBlock);
    }
    return resultantUnits;
}

/* This function tokenizes a string based on a delimiter and stores the tokens in a collection. */
function segmentStringAndStore(inputSegment, segmentSeparator, targetCollection)
{

    /* Flag to control the continuation of parsing. */
    var continueSegmentation = true;

    /* A working copy of the string for splitting. */
    var remainingBlock = inputSegment;

    /* Iterate through the string, splitting at each delimiter occurrence. */
    while ( continueSegmentation )
    {
        /* Find the next occurrence of the delimiter. */
        var separatorIndex = remainingBlock.indexOf(segmentSeparator);
        if ( separatorIndex > -1 )
        {
            var extractedValue = remainingBlock.substring(0, separatorIndex);
            remainingBlock = remainingBlock.substring(separatorIndex + 1, remainingBlock.length);
            targetCollection.push(extractedValue);
        }
        else
        {
            continueSegmentation = false;
        }
    }
}

/* This routine updates the displayed value of a slider and triggers a re-calculation of the expression. */
function updateSliderDisplayAndRecalculate(currentSliderSetting, controlIdentifier)
{
    var baseElementName = controlIdentifier.substring(0, controlIdentifier.indexOf("_")),
        displayLabel = $("#" + baseElementName + "_slider_value"),
        incrementValue = parseFloat($("#" + baseElementName + "_step").val()),
        realtimeRecalculationFlag = $("#dynamic_update");

    displayLabel.empty();
    displayLabel.append(processNumericInput(currentSliderSetting, incrementValue));

    var shouldRecalculate = realtimeRecalculationFlag.is(":checked");
    if ( shouldRecalculate )
    {
        solveEquation();
    }
}

/* This function clears the main expression input and all dynamic UI elements. */
function resetAllExpressionsAndInterface()
{
    // Clear the primary equation and its associated name.
    $("#mainEquation").val("");
    $("#equationName").val("Function");

    // Clear all dynamically generated elements.
    resetInterfaceElements();
}

/* This function removes all dynamically generated interface components. */
function resetInterfaceElements()
{

    var graphContainerElement = $("#graph_container"),
        parameterControlContainer = $("#variables");

    // Remove any existing graph visuals.
    graphContainerElement.empty();

    // Hide the display for solved results.
    $("#result").hide();

    // Hide the legend title if present.
    //$("#legendTitle").hide();

    // Remove all parameter slider rows.
    $("tr.variable").empty();
    $("tr.variable").remove();

    // Clear the parameter list area.
    $("#variable_list").empty();

    // Clear all global stores for parameter properties.
    argumentMinimums = [];
    argumentMaximums = [];
    argumentIncrements = [];
    argumentPriorValues = [];
    argumentVisibilityFlags = [];

    // Remove all function-specific display rows.
    $('.fxn_row').remove();

}

function processNumericInput(rawInputValue, step)
{
    var floatValue = parseFloat(rawInputValue),
        precisionFactor = floatValue / step,
        stringRepresentation = precisionFactor + "",
        decimalPointIndex,
        nearestInteger = Math.round(parseFloat(stringRepresentation)),
        finalProcessedValue = floatValue;

    if ( step < 1 )
    {
        stringRepresentation = nearestInteger + "";
        decimalPointIndex = stringRepresentation.indexOf(".");

        if ( decimalPointIndex != -1 )
        {
            finalProcessedValue = parseInt(stringRepresentation.substring(0, decimalPointIndex)) * step;
        }
        else
        {
            finalProcessedValue = parseInt(stringRepresentation) * step;
        }

        // Perform a final check for rounding errors.
        stringRepresentation = finalProcessedValue + "";
        var stringLength = stringRepresentation.length;
        decimalPointIndex = stringRepresentation.indexOf(".");
        // If a decimal point exists and the length indicates potential rounding error.
        if ( decimalPointIndex != -1 && stringLength > decimalPointIndex + 3 )
        {
            // Scan backwards for non-zero characters.
            var charIndex;
            for ( charIndex = stringLength - 2; charIndex > -1; charIndex-- )
            {
                if ( stringRepresentation.charAt(charIndex) != "0" )
                {
                    charIndex++;
                    break;
                }
            }
            // If a chain of zeros was found at the end.
            if ( charIndex != stringLength - 2 )
            {
                finalProcessedValue = parseFloat(stringRepresentation.substring(0, charIndex));
            }
        }
    }

    return finalProcessedValue;
}

function exportGraphAsImage()
{
    var graphCanvasElement = $("#subgraph_graph")[0];
    if ( typeof graphCanvasElement != "undefined" )
    {
        var imageDataUri = graphCanvasElement.toDataURL("image/png");
        window.open(imageDataUri);
        // The following works in Firefox, but doesn't allow naming the file.
        //var pngDataFile = imageDataUri.replace("image/png","image/octet-stream");
        //document.location.href = pngDataFile;
    }
    else
    {
        alert("Please generate a graph first!");
    }
}

function setActiveCalculationVariable(operationLabel, variableToSelect)
{
    // Designate the currently active variable for the equation.
    var functionRowReference = $("#row_" + operationLabel)[0],
        cleanOperationLabel = sanitizeFunctionName(operationLabel);
    var equationObject = functionRowReference.fxnData.eq,
        functionDetails = functionRowReference.fxnData.fxn;
    equationObject.setVariable(variableToSelect);

    // Re-evaluate the equation using the newly selected variable.
    updateFunction(cleanOperationLabel, functionDetails, equationObject);
}

// id = '"+fxnName+"_" + variableName + "_slider'"
function handleParameterChange(operationLabel, parameterName)
{
    var rangeInputControl = $("#" + operationLabel + "_" + parameterName + "_slider"),
        parameterDisplay = $("#" + operationLabel + "_" + parameterName + "_curr"),
        incrementStep = parseFloat(rangeInputControl.attr("step")),
        chosenParameterValue = processNumericInput(rangeInputControl.val(), incrementStep);

    parameterDisplay.empty();
    parameterDisplay.append(chosenParameterValue);

    var performUpdate = true; // dynamicUpdate.is(":checked");
    if ( performUpdate )
    {
        var equationElement = $("#row_" + operationLabel)[0],
            equationInstance = equationElement.fxnData.eq;
        var variableContext = equationElement.fxnData.context;

        // Update the context with the new parameter value.
        variableContext[parameterName].curr = chosenParameterValue;

        solveEquation(equationElement, equationInstance);
        //updateSolution(operationLabel, equationInstance, variableContext, solution);
    }
}

/**
 *
 * ParameterSettings: {
 *    min: minimum value,
 *    curr: current value,
 *    max: maximum value
 * }
 *
 */
function generateCurrentValueDisplay(htmlFragment, functionIdentifier, parameterIdentifier, parameterSettings)
{
    htmlFragment += "<div style='height: 100%; padding: 5px 10px 3px 10px; font-size: 26pt; background-color: rgb(255,255,255); color: rgb(0,0,0); float: left; width: 180px;'>";
    htmlFragment += "<font style='font-size: 18pt; font-weight: bold;'>" + parameterIdentifier + " = </font>";
    htmlFragment += "<font id='" + functionIdentifier + "_" + parameterIdentifier + "_curr'>" + parameterSettings.curr + "</font>";
    htmlFragment += "</div>";

    return htmlFragment;
}

function generateSliderControlHtml(htmlOutput, functionDesignation, parameterDesignation, parameterConfiguration)
{
    htmlOutput += "<div style='height: 100%; padding: 2px 5px 1px 5px; color: rgb(255,255,255); background: none; float: left; font-size: 20px;'>";
    // Minimum value label.
    htmlOutput += "<font style='margin: auto;'>";
    htmlOutput += parameterConfiguration.min;
    htmlOutput += "</font>";
    // Slider input element.
    var minimumValue = parameterConfiguration.min,
        maximumValue = parameterConfiguration.max;
    htmlOutput += "<input id='" + functionDesignation + "_" + parameterDesignation + "_slider'";
    htmlOutput += " type='range' alt='Adjust " + parameterDesignation + "' title='Adjust " + parameterDesignation + "'";
    htmlOutput += " min='" + minimumValue + "' max='" + maximumValue + "' step='" + ((maximumValue - minimumValue) / 1000) + "' value='" + parameterConfiguration.curr + "'";
    htmlOutput += " onchange=\"handleParameterChange('" + functionDesignation + "','" + parameterDesignation + "')\"";
    htmlOutput += " style='width: 440px; margin: 5px 10px 0px 10px;'/>";

    // Original code snippet for comparison:
    // inp = document.createElement("input");
    //     inp.id = v + "_slider";
    //     inp.setAttribute("type", "range");
    //     inp.setAttribute("min", minValue); //variableMinHash[i]);
    //     inp.setAttribute("max", maxValue); //variableMaxHash[i]);
    //     inp.setAttribute("step", stepValue); //variableStepHash[i]);
    //     inp.setAttribute("value", lastValue);
    //     inp.setAttribute("alt", "Adjust " + v);
    //     inp.setAttribute("title", "Adjust " + v);
    //     el.append(inp);
    //     first.append(el);
    //     inp = $(inp);
    //     // Set initial value
    //     inp.val(lastValue);
    //     // Add change listener
    //     inp[0].setAttribute("onchange", "showValue(this.value, this.id)");

    // Maximum value label.
    htmlOutput += "<font style='margin: auto;'>";
    htmlOutput += parameterConfiguration.max;
    htmlOutput += "</font>";
    htmlOutput += "</div>";

    return htmlOutput;
}

function fillParameterValueDropdown(targetDropdown, functionContext, functionLabel, parameterLabel, equationModel)
{
    var availableParameters = equationModel.variables(),
        parameterCount = availableParameters.length,
        htmlFragment = "";

    // Clear existing dropdown content.
    targetDropdown.empty();

    // Get the current settings for this specific parameter.
    var currentParameterContext = functionContext[parameterLabel];

    // Generate the HTML for displaying the current value.
    htmlFragment = generateCurrentValueDisplay(htmlFragment, functionLabel, parameterLabel, currentParameterContext);

    htmlFragment = generateSliderControlHtml(htmlFragment, functionLabel, parameterLabel, currentParameterContext);

    // Close the parameter list (if such a function existed).
    // htmlFragment = closeVariableList(htmlFragment);

    targetDropdown.html(htmlFragment);
}

// Note: This implementation might be simplified by using actual DOM manipulation
// instead of string concatenation, but for now, it remains as is.
function populateParameterSelectionDropdown(targetMenu, functionDesignator, expressionObject)
{
    var allVariables = expressionObject.variables(),
        variableTotal = allVariables.length,
        singleVariableName,
        activeVariable = expressionObject.variable.varName,
        htmlContent = "";

    // Clear the target dropdown menu.
    targetMenu.empty();

    // Start the form structure for the variable list.
    htmlContent = beginParameterListForm(htmlContent, "parameters");

    // Add each variable as a radio button option.
    var variableDomElement;
    for ( var i = 0; i < variableTotal; i++ )
    {
        singleVariableName = allVariables[i];
        variableDomElement = "<label><input type='radio' name='variable'";
        if ( singleVariableName == activeVariable )
        {
            variableDomElement += " checked='checked'";
        }
        variableDomElement += " onchange='setActiveCalculationVariable(\"" + functionDesignator + "\",\"" + singleVariableName + "\")'>" + singleVariableName + "</label>";
        htmlContent += variableDomElement;
    }

    // End the form structure for the variable list.
    htmlContent = closeVariableList(htmlContent); // Assuming closeVariableList exists elsewhere or will be added.

    targetMenu.html(htmlContent);
}

function beginParameterListForm(htmlContent, formLabel)
{
    htmlContent += "<form>";
    return htmlContent;
}

// The 'closeVariableList' function definition was not provided in the original code,
// but its call site has been renamed for consistency. If it were provided,
// it would be cloned here. For this exercise, it is assumed to be an external
// or implicitly defined function.
function closeVariableList(htmlContent) {
    htmlContent += "</form>";
    return htmlContent;
}