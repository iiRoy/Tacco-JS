// This module processes incoming textual information.
function ProcessData(sourceText) {
    // We check for the presence of specific characters within the provided text.

    if (
        sourceText.indexOf('a') >= 0 &&
        sourceText.indexOf('b') >= 0 &&
        sourceText.indexOf('c') >= 0
    ) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// The following line handles standard input/output and should not be modified.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
