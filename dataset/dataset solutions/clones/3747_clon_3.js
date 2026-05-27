function processInput(inputString){
    const inputParts = inputString.split(" ");
    const parsedValues = inputParts.map(strValue => parseInt(strValue, 10));

    const firstValue = parsedValues[0];
    const secondValue = parsedValues[1];

    const MAX_ALLOWED_VALUE = 8;

    // Helper function for validation
    const isValueValid = (num) => num <= MAX_ALLOWED_VALUE;

    if (!isValueValid(firstValue) || !isValueValid(secondValue)) {
        return ":(";
    }
    
    return "Yay!";
}

(function(initialRawData, operationResult, resultDataType){
    const IS_NODE_ENVIRONMENT = typeof require !== "undefined";
    const STANDARD_INPUT_FILE_PATH = "/dev/stdin";
    const FILE_ENCODING_UTF8 = "utf8";

    if (IS_NODE_ENVIRONMENT) {
        const fileSystemModule = require("fs");
        const fileContents = fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, FILE_ENCODING_UTF8);
        console.log(processInput(fileContents));
    } else {
        // Browser-specific execution path
        const NEWLINE_DELIMITER = "\n";
        const SLICE_START_INDEX = 1;
        const SLICE_END_INDEX = -1; // Excludes the last element

        const TEXTAREA_LARGE_ROWS = 10;
        const TEXTAREA_SMALL_ROWS = 1;
        const TEXTAREA_DEFAULT_COLS = 40;
        const BREAK_ELEMENT_INDICATOR = null; // Using null as a distinct indicator for <br>

        initialRawData = initialRawData.split(NEWLINE_DELIMITER)
                                      .slice(SLICE_START_INDEX, SLICE_END_INDEX)
                                      .join(NEWLINE_DELIMITER);
        
        try {
            operationResult = processInput(initialRawData);
        } catch (executionError) {
            operationResult = executionError.stack || executionError.message;
        }
        
        resultDataType = typeof operationResult;

        // Ensure the result is a string for display purposes
        if (resultDataType !== "string") {
            operationResult = JSON.stringify(operationResult);
        }

        const outputFormContainer = $("<form>");
        const displayElementConfigs = [
            [TEXTAREA_LARGE_ROWS, initialRawData],
            BREAK_ELEMENT_INDICATOR,
            [TEXTAREA_SMALL_ROWS, resultDataType],
            BREAK_ELEMENT_INDICATOR,
            [TEXTAREA_LARGE_ROWS, operationResult]
        ];

        const generatedDisplayElements = displayElementConfigs.map(configEntry => {
            if (configEntry === BREAK_ELEMENT_INDICATOR) {
                return $("<br>");
            } else {
                const [numRows, contentText] = configEntry;
                return $("<textarea>", {
                    rows: numRows,
                    cols: TEXTAREA_DEFAULT_COLS,
                    text: contentText
                });
            }
        });

        outputFormContainer.append(generatedDisplayElements).appendTo("body");
    }
})(`
8 8
`);
