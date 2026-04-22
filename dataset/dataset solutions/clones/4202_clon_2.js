function obtainSourceText() {
    return require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim();
}

function displayResult(contentMessage) {
    console.log(contentMessage);
} // Writes content to standard output

function reportError(issueDetails) {
    console.error(issueDetails);
} // Writes details to standard error stream

/*
 * This utility function processes an input string based on a specified conversion mode.
 * Mode 0: Returns the input as is.
 * Mode 1: Converts to an integer.
 * Mode 2: Splits by single spaces.
 * Mode 3: Splits by newline characters.
 * Mode 4: Splits by spaces and converts each part to a number.
 * Mode 5: Splits by newlines and converts each part to a number.
 * Mode 6: Splits into individual characters.
 * Mode 7: Splits into individual characters and converts each to a number.
*/
function transformData(sourceString, parsingOption) {
    switch (parsingOption) {
        case 0:
            return sourceString;
        case 1:
            return parseInt(sourceString);
        case 2:
            return sourceString.split(" ");
        case 3:
            return sourceString.split("\n");
        case 4:
            return sourceString.split(" ").map((singleElement) => Number(singleElement));
        case 5:
            return sourceString.split("\n").map((singleElement) => Number(singleElement));
        case 6:
            return sourceString.split("");
        case 7:
            return sourceString.split("").map((singleElement) => Number(singleElement));
    }
}

function performAnalysis(incomingContent) {
    incomingContent = transformData(incomingContent, 6);

    var symbolMap = {
        "K": incomingContent.indexOf("K"),
        "I": incomingContent.indexOf("I"),
        "H": incomingContent.indexOf("H"),
        "B": incomingContent.indexOf("B"),
        "R": incomingContent.indexOf("R")
    };

    // Verify all required characters are present in the input
    if (symbolMap["K"] === -1 || symbolMap["I"] === -1 ||
        symbolMap["H"] === -1 || symbolMap["B"] === -1 ||
        symbolMap["R"] === -1) {
        displayResult("NO");
        return;
    }

    // Check for correct sequence ordering of specific characters
    if (symbolMap["K"] > symbolMap["I"] || symbolMap["I"] > symbolMap["H"] ||
        symbolMap["H"] > symbolMap["B"] || symbolMap["B"] > symbolMap["R"]) {
        displayResult("NO");
        return;
    }

    // Ensure the total length of the processed input doesn't exceed a limit
    if (incomingContent.length > 9) {
        displayResult("NO");
        return;
    }

    // Validate specific character adjacency
    if (symbolMap["K"] !== symbolMap["I"] - 1) {
        displayResult("NO");
        return;
    }

    // Analyze spacing between 'H' and 'B'
    if (symbolMap["B"] - symbolMap["H"] > 2) {
        displayResult("NO");
        return;
    }

    // If 'H' and 'B' are separated by two positions, check the intermediate character
    if (symbolMap["B"] - symbolMap["H"] === 2) {
        var intermediateElement = incomingContent[symbolMap["B"] - 1];
        if (intermediateElement !== "A") {
            displayResult("NO");
            return;
        }
    }

    // Analyze spacing between 'B' and 'R'
    if (symbolMap["R"] - symbolMap["B"] > 2) {
        displayResult("NO");
        return;
    }

    // If 'B' and 'R' are separated by two positions, check the intermediate character
    if (symbolMap["R"] - symbolMap["B"] === 2) {
        var auxiliaryValue = incomingContent[symbolMap["R"] - 1];
        if (auxiliaryValue !== "A") {
            displayResult("NO");
            return;
        }
    }

    // Count consecutive 'A' characters at the beginning
    var initialACount = 0;
    for (var loopIndex = 0; loopIndex < incomingContent.length; loopIndex++) {
        if (incomingContent[loopIndex] === "A") {
            initialACount++;
        } else {
            break;
        }
    }

    // Restrict the number of leading 'A's
    if (initialACount > 1) {
        displayResult("NO");
        return;
    }

    // Count consecutive 'A' characters at the end
    var finalACount = 0;
    for (var loopIndex = incomingContent.length - 1; loopIndex >= 0; loopIndex--) {
        if (incomingContent[loopIndex] === "A") {
            finalACount++;
        } else {
            break;
        }
    }

    // Restrict the number of trailing 'A's
    if (finalACount > 1) {
        displayResult("NO");
        return;
    }

    // If all checks pass, the input is valid
    displayResult("YES");
}

performAnalysis(obtainSourceText());