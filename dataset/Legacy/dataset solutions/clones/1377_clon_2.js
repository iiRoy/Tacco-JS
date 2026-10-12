// This function serves as the primary entry point for processing incoming data.
function ProcessInputData(rawData) {
    // The raw input string is first segmented into an array of individual lines.
    const inputRows = rawData.split("\n");

    // We iterate through each line provided in the input data.
    // Note: The original code used 'break' inside a forEach loop, which is a SyntaxError in standard JavaScript.
    // To preserve the intended control flow (stopping iteration upon a specific condition)
    // while ensuring syntactically valid JavaScript, a 'for...of' loop is utilized here.
    for (const currentRowItem of inputRows) {
        // A specific sentinel value "0 0" indicates the termination of input processing.
        if (currentRowItem === "0 0") {
            // Upon encountering the termination signal, the loop is exited immediately.
            break;
        }

        // Each line is parsed to extract numerical dimensions.
        // The line is split by spaces, and each resulting string segment is converted to a number.
        const dimensions = currentRowItem.split(" ").map(Number);

        // The first number represents the height, and the second represents the width.
        let heightVal = dimensions[0];
        let widthVal = dimensions[1];

        // The pattern is constructed using string repetition and concatenation.
        // The top border consists of 'widthVal' hash characters.
        const topBorder = Array(widthVal + 1).join("#");
        // The content for a single middle row (e.g., "#.#") is generated.
        const middleRowContent = "#" + Array(widthVal - 1).join(".") + "#";
        // Multiple middle rows are created, each followed by a newline, for 'heightVal - 2' rows.
        const middleRows = Array(heightVal - 1).join(middleRowContent + "\n");
        // The bottom border is identical to the top border.
        const bottomBorder = Array(widthVal + 1).join("#");

        // The complete pattern, including newlines for formatting, is printed to the console.
        console.log(topBorder + "\n" + middleRows + bottomBorder + "\n");
    }
}

// The program initiates by reading the entire content of standard input.
// The input is read as a UTF-8 encoded string and then passed to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
