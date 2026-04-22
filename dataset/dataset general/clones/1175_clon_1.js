// Global variable to store parsed equation (currently unused, consider refactoring)
// var parsedEquation = undefined;

// These arrays hold details for variables: min, max, step, last value, and visibility state.
// Future refactoring might involve moving these into a more structured object.
var variableMinHash = [];
var variableMaxHash = [];
var variableStepHash = [];
var variableLastHash = [];
var variableVisHash = [];


/*
 * Function: loadTitleBarHash
 * Description: Initializes the application by parsing equation data from the URL's hash.
 * This function handles URL parameters for equation loading and example selection.
 */
function loadTitleBarHash()
{
    // Retrieve the full URL and extract relevant parts for equation parsing.
    var encodedBar = window.location.href,
        equationStart = encodedBar.indexOf("?") + 1, // Find the start of the query string.
        encodedString = encodedBar.substring(equationStart, encodedBar.length),
        addressBar = encodedString;

    // Decode URL-encoded characters (e.g., replace '%2B' with '+').
    addressBar = addressBar.replace(/'%/g, "+");


    // Initialize variables for equation parsing.
    var equationEnd = addressBar.indexOf("="),
        equationString = "", // Holds the final equation string.
        equationValid = 0;   // Flag to indicate if an equation was successfully parsed.


    var loadRandom = false; // Configuration flag: whether to load a random example if no equation is found.

    /*
     * Check if an equation was provided in the URL.
     * If not, load a default or random example.
     */
    if (equationStart < 1)
    {
        var exNumber; // Variable to store the index of the example to load.

        if (loadRandom) // If random example loading is enabled.
        {
            // Select a random example from the 'examples' array.
            var exLen = examples.length;
            var exRand = Math.floor(Math.random() * exLen);
            if (exRand == 0) // Ensure a non-zero index.
            {
                exRand++;
            }
            exNumber = exRand; // Assign the chosen example index.
        }
        else // Load a predefined default example.
        {
            exNumber = 5; // Default example index.
        }

        // Construct the new URL with the selected example.
        var URL = window.location.href;
        var end = URL.indexOf("?"); // Look for existing URI parameters.
        if (end != -1) // If parameters exist, strip them off.
        {
            URL = URL.substring(0, end);
        }
        var newURL = URL + "?" + examples[exNumber].url; // Append the example's URL.
        window.location = newURL; // Redirect to the new URL.


        return; // Exit the function after redirection.
    }

    /*
     * If no specific equation end delimiter is found, assume the entire
     * address bar content (after '?' and before any other hash) is the equation.
     * This supports direct linking or API usage.
     */
    if (equationEnd < 1)
    {
        equationEnd = addressBar.length; // Use the full length of the address bar string.
    }

    /* Extract the primary equation set string from the address bar. */
    var equationArrayString = addressBar.substring(0, equationEnd);

    // Split the main equation string into individual equations based on a separator.
    var equationStringArray = returnArrayOfEquations(equationArrayString);
    var esaLength = equationStringArray.length; // Get the number of equations.

    // Iterate through each extracted equation string.
    for (var i = 0; i < esaLength; i++)
    {
        var eqLength = equationStringArray[i].length;
        if (eqLength > 1) // Process only non-empty equation strings.
        {
            // Initialize default values for function name and equation string.
            var functionName = "Function";
            equationString = "Equation";

            // Variables to hold parsed local context for each equation.
            var localVarName, localVarMin, localVarCurr, localVarMax;
            var localContext = {}; // Object to store variable contexts.

            // Split the equation string by ':' to separate equation, function name, and variable contexts.
            var equationStringSplit = equationStringArray[i].split(":");
            var innerSplitLength = equationStringSplit.length;
            var semicolonCounter = 0; // Counter for parsing variable context parts.

            // Process each part of the split equation string.
            for (var j = 0; j < innerSplitLength; j++)
            {
                if (j == 0) // The first part is the equation itself.
                {
                    equationString = equationStringSplit[j];
                }
                else if (j == 1) // The second part is the custom function name.
                {
                    functionName = equationStringSplit[j];
                }
                else // Subsequent parts define variable contexts (name, min, current, max).
                {
                    if (semicolonCounter == 0) // Variable name.
                    {
                        localVarName = equationStringSplit[j];
                    }
                    else if (semicolonCounter == 1) // Minimum value.
                    {
                        localVarMin = equationStringSplit[j];
                    }
                    else if (semicolonCounter == 2) // Current value.
                    {
                        localVarCurr = equationStringSplit[j];
                    }
                    else if (semicolonCounter == 3) // Maximum value.
                    {
                        localVarMax = equationStringSplit[j];
                        // Store the variable's context.
                        localContext[localVarName] = {
                            min: localVarMin,
                            curr: localVarCurr,
                            max: localVarMax
                        };
                        semicolonCounter = -1; // Reset counter for the next variable.
                    }
                    semicolonCounter++; // Increment counter for the next context part.
                }
            } // end of inner vars split loop

            // Attempt to parse the equation string using QGSolver.
            var parsed;
            try
            {
                parsed = QGSolver.parse(equationString);
            }
            catch (exception)
            {
                visualErrorFunction(); // Display an error if parsing fails.
            }
            functionName = sanitizeFunctionName(functionName); // Clean up the function name.
            // Create a new row in the UI for this function and its context.
            row = createFunctionRowWithContext(functionName, equationString, parsed, localContext);
            // Solve the equation for the newly created row.
            solveEquation(row, parsed);
            // Adjust the size of UI bar elements.
            resizeBars();
        }
    } // end of outer equations loop
}


// returnArrayOfEquations: Splits a string into an array of individual equation strings.
function returnArrayOfEquations(equationArrayString)
{
    // Initialize a local array to store equation strings.
    var localArray = new Array();

    // Check if the string contains a '{' delimiter, indicating multiple equations.
    if (equationArrayString.indexOf("{") > 0)
    {
        localArray = equationArrayString.split("{"); // Split by '{'.
    }
    else
    {
        localArray.push(equationArrayString); // If no delimiter, add the whole string as one equation.
    }
    return localArray; // Return the array of equations.
}


/*
 * Function: parseAndAddToHash
 * Description: Parses a given string using a specified delimiter and adds the resulting
 *              parts to a provided hash (array).
 */
function parseAndAddToHash(stringToParse, delimiter, hashToGrow)
{
    /* Flag to control the parsing loop. */
    var stillParsing = true;

    /* A temporary variable to hold the block of string currently being parsed. */
    var parseBlock = stringToParse;

    /* Loop iterates as long as there are parts to parse. */
    while (stillParsing)
    {
        /* Find the next occurrence of the delimiter within the current parseBlock. */
        var nextDelimiter = parseBlock.indexOf(delimiter);
        if (nextDelimiter > -1) // If a delimiter is found.
        {
            // Extract the value before the delimiter.
            var hashValue = parseBlock.substring(0, nextDelimiter);
            // Update parseBlock to start after the found delimiter.
            parseBlock = parseBlock.substring(nextDelimiter + 1, parseBlock.length);
            hashToGrow.push(hashValue); // Add the extracted value to the hash array.
        }
        else // No more delimiters found, end parsing.
        {
            stillParsing = false;
        }
    }
}


/*
 * Function: showValue
 * Description: Updates the displayed value for a slider and, if dynamic update is enabled,
 *              recalculates the equation based on the new slider value.
 */
function showValue(sliderValue, sliderId)
{
    // Extract the variable name from the slider ID.
    var v = sliderId.substring(0, sliderId.indexOf("_")),
        sliderLabel = $("#" + v + "_slider_value"), // Get the label element for the slider's value.
        step = parseFloat($("#" + v + "_step").val()), // Get the step value for the variable.
        dynamicUpdate = $("#dynamic_update"); // Check the dynamic update checkbox state.

    sliderLabel.empty(); // Clear the current text of the slider label.
    sliderLabel.append(parseInput(sliderValue, step)); // Display the parsed slider value.

    var update = dynamicUpdate.is(":checked"); // Determine if dynamic update is active.
    if (update) // If dynamic updates are enabled.
    {
        solveEquation(); // Re-solve the main equation.
    }
}


/*
 * Function: clearEqAndScreen
 * Description: Clears the main equation input field, its function name, and all
 *              dynamically generated UI elements on the screen.
 */
function clearEqAndScreen()
{
    // Clear the main equation input box and reset the function name.
    $("#mainEquation").val("");
    $("#equationName").val("Function");

    // Call clearScreen to remove all other UI elements.
    clearScreen();
}


/*
 * Function: clearScreen
 * Description: Removes all dynamic UI elements related to variables, graphs, and results
 *              from the display, and resets global hash arrays.
 */
function clearScreen()
{
    // Select parent containers for graph and slider elements.
    var graphParent = $("#graph_container"),
        sliderParent = $("#variables"); // This variable is declared but not used.

    // Clear any existing graph content.
    graphParent.empty();

    // Hide the solved result display area.
    $("#result").hide();

    // The legend title is currently commented out, but if it were active, it would be hidden here.
    //$("#legendTitle").hide();

    // Remove all variable slider rows.
    $("tr.variable").empty();
    $("tr.variable").remove();

    // Clear the list of variables displayed.
    $("#variable_list").empty();

    // Reset all global hash arrays that store variable properties.
    variableMinHash = [];
    variableMaxHash = [];
    variableStepHash = [];
    variableLastHash = [];
    variableVisHash = [];

    // Remove all function-specific rows from the display.
    $('.fxn_row').remove();
}


/*
 * Function: parseInput
 * Description: Parses a raw input value, rounds it according to a specified step,
 *              and handles potential floating-point precision issues.
 */
function parseInput(input, step)
{
    var val = parseFloat(input), // Convert input to a float.
        prec = val / step,       // Calculate precision based on the step.
        str = prec + "",         // Convert precision to string for decimal checking.
        decimal,                 // Variable to store decimal point position.
        rounded = Math.round(parseFloat(str)), // Round the precision value.
        result = val;            // Initialize result with the original value.

    if (step < 1) // If the step is a fractional value (e.g., 0.1, 0.01).
    {
        str = rounded + "";      // Use the rounded precision as a string.
        decimal = str.indexOf("."); // Find the decimal point.


        if (decimal != -1) // If a decimal point exists in the rounded precision.
        {
            // Parse the integer part before the decimal, then multiply by step.
            result = parseInt(str.substring(0, decimal)) * step;
        }
        else // If no decimal point (it's a whole number).
        {
            result = parseInt(str) * step; // Multiply the whole number by step.
        }

        // Perform a final check for rounding errors in the result.
        str = result + "";          // Convert the result back to a string.
        var len = str.length;       // Get the length of the string.
        decimal = str.indexOf("."); // Find the decimal point again.
        // If there's a decimal and the number has more than 3 digits after it (potential rounding error).
        if (decimal != -1 && len > decimal + 3)
        {
            // Search for a chain of zeros at the end.
            var i;
            for (i = len - 2; i > -1; i--)
            {
                if (str.charAt(i) != "0")
                {
                    i++;
                    break;
                }
            }
            // If a zero chain was found at the end (i.e., not the last two digits).
            if (i != len - 2)
            {
                result = parseFloat(str.substring(0, i)); // Truncate the string to remove trailing zeros.
            }
        }
    }

    return result; // Return the adjusted and rounded result.
}


/*
 * Function: convertToPNG
 * Description: Captures the content of the subgraph canvas as a PNG image
 *              and opens it in a new window.
 */
function convertToPNG()
{
    var parentElement = $("#subgraph_graph")[0]; // Get the canvas element.
    if (typeof parentElement != "undefined") // Check if the canvas element exists.
    {
        var pngDataURL = parentElement.toDataURL("image/png"); // Get the data URL of the PNG image.
        window.open(pngDataURL); // Open the PNG in a new browser window/tab.
        // The following lines are commented out as they were for different download methods.
        // var pngDataFile = pngDataURL.replace("image/png","image/octet-stream");
        // document.location.href = pngDataFile;
    }
    else // If the graph canvas is not found.
    {
        alert("Please Graph Something First, Thanks!"); // Inform the user to generate a graph.
    }
}


/*
 * Function: selectVariable
 * Description: Sets the active variable for a given equation and triggers
 *              a re-calculation and update of the function's display.
 */
function selectVariable(equationName, varName)
{
    // Retrieve the row element associated with the equation.
    var row = $("#row_" + equationName)[0],
        sanitizedName = sanitizeFunctionName(equationName); // Sanitize the equation name.

    // Get the equation and function objects from the row's data.
    var eq = row.fxnData.eq,
        fxn = row.fxnData.fxn;

    eq.setVariable(varName); // Set the active variable within the equation object.

    // Re-solve and update the function's display using the new active variable.
    updateFunction(sanitizedName, fxn, eq);
}


/*
 * Function: selectValue
 * Description: Updates the displayed current value of a variable based on slider input
 *              and triggers an equation re-evaluation.
 */
function selectValue(fxnName, varName)
{
    var slider = $("#" + fxnName + "_" + varName + "_slider"), // Get the slider element.
        variableLabel = $("#" + fxnName + "_" + varName + "_curr"), // Get the label displaying the current value.
        step = parseFloat(slider.attr("step")), // Retrieve the step value from the slider.
        sliderValue = parseInput(slider.val(), step); // Get and parse the slider's current value.

    variableLabel.empty(); // Clear the existing label text.
    variableLabel.append(sliderValue); // Display the new slider value.

    // This update flag is hardcoded to true, meaning updates always occur.
    var update = true; // dynamicUpdate.is(":checked");
    if (update)
    {
        var eqEl = $("#row_" + fxnName)[0], // Get the equation row element.
            eq = eqEl.fxnData.eq; // Get the equation object.
        var context = eqEl.fxnData.context; // Get the context object for the equation.

        // Update the 'curr' (current) value for the specific variable in the context.
        context[varName].curr = sliderValue;

        solveEquation(eqEl, eq); // Re-solve the equation with the updated context.
        // The updateSolution function is commented out, indicating it's not currently used here.
        // updateSolution(fxnName, eq, context, solution);
    }
}


/**
 * CurrentContext: {
 *    min: minimum value,
 *    curr: current value,
 *    max: maximum value
 * }
 * This function generates the HTML for displaying the current value of a variable.
 */
function currentValueTemplate(template, fxnName, variableName, currentContext)
{
    template += "<div style='height: 100%; padding: 5px 10px 3px 10px; font-size: 26pt; background-color: rgb(255,255,255); color: rgb(0,0,0); float: left; width: 180px;'>";
    template += "<font style='font-size: 18pt; font-weight: bold;'>" + variableName + " = </font>";
    template += "<font id='" + fxnName + "_" + variableName + "_curr'>" + currentContext.curr + "</font>";
    template += "</div>";

    return template;
}


/*
 * Function: sliderValueTemplate
 * Description: Generates the HTML for a slider input element, including min/max labels,
 *              based on the provided variable context.
 */
function sliderValueTemplate(template, fxnName, variableName, currentContext)
{
    template += "<div style='height: 100%; padding: 2px 5px 1px 5px; color: rgb(255,255,255); background: none; float: left; font-size: 20px;'>";
    // Display the minimum value for the slider.
    template += "<font style='margin: auto;'>";
    template += currentContext.min;
    template += "</font>";

    // HTML for the range slider input.
    var mn = currentContext.min,
        mx = currentContext.max;
    template += "<input id='" + fxnName + "_" + variableName + "_slider'";
    template += " type='range' alt='Adjust " + variableName + "' title='Adjust " + variableName + "'";
    template += " min='" + mn + "' max='" + mx + "' step='" + ((mx - mn) / 1000) + "' value='" + currentContext.curr + "'";
    template += " onchange=\"selectValue('" + fxnName + "','" + variableName + "')\"";
    template += " style='width: 440px; margin: 5px 10px 0px 10px;'/>";


    // A large block of commented-out code that might have been used for dynamic element creation previously.
    /*
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
    */


    // Display the maximum value for the slider.
    template += "<font style='margin: auto;'>";
    template += currentContext.max;
    template += "</font>";
    template += "</div>";

    return template;
}


/*
 * Function: populateDropDownValue
 * Description: Populates a dropdown (or similar container) with the current value
 *              and slider for a specific variable, based on its context.
 */
function populateDropDownValue(dropdown, context, fxnName, variableName, equation)
{
    var v, vars = equation.variables(), // Get all variables from the equation.
        varLen = vars.length,           // Count of variables (not directly used in this function).
        template = "";                  // Initialize an empty HTML template string.

    // Clear the existing content of the dropdown.
    dropdown.empty();

    // Get the specific context (min, curr, max) for the given variable.
    var currCtx = context[variableName];

    // Generate the HTML for displaying the current value.
    template = currentValueTemplate(template, fxnName, variableName, currCtx);

    // Generate the HTML for the slider control.
    template = sliderValueTemplate(template, fxnName, variableName, currCtx);

    // This line is commented out; it would typically close a variable list container.
    // template = closeVariableList(template);

    dropdown.html(template); // Insert the generated HTML into the dropdown element.
}


// TODO: This function currently uses string concatenation to build HTML.
//       For better maintainability and performance, it should ideally be
//       refactored to use actual DOM object creation methods.
function populateDropDownVariables(dropdown, fxnName, equation)
{
    var vars = equation.variables(), // Retrieve all variables associated with the equation.
        varLen = vars.length,        // Get the total number of variables.
        varName,                     // Variable to hold the current variable's name.
        active = equation.variable.varName, // Get the currently active variable's name.
        template = "";               // Initialize an empty string to build the HTML.

    // Clear any existing content within the dropdown element.
    dropdown.empty();

    // Start building the HTML for the variable list form.
    template = openVariableList(template, "variables");

    // Iterate through each variable to create its corresponding radio button.
    var varDOM; // Temporary variable to hold each variable's DOM string.
    for (var i = 0; i < varLen; i++)
    {
        varName = vars[i]; // Get the name of the current variable.
        varDOM = "<label><input type='radio' name='variable'"; // Start building the label and radio button.
        if (varName == active) // Check if this variable is the active one.
        {
            varDOM += " checked='checked'"; // If active, mark the radio button as checked.
        }
        // Add the onchange event handler and close the label.
        varDOM += " onchange='selectVariable(\"" + fxnName + "\",\"" + varName + "\")'>" + varName + "</label>";
        template += varDOM; // Append the variable's radio button HTML to the template.
    }

    // Close the variable list form.
    template = closeVariableList(template);

    dropdown.html(template); // Insert the complete HTML template into the dropdown element.
}


// Helper function to open the HTML form for variable lists.
function openVariableList(template, label)
{
    template += "<form>"; // Append the opening form tag.
    return template; // Return the updated template string.
}