// Helper function to determine the correct plural suffix based on the last character
function getAppropriateSuffix(lastChar) {
    // Check if the last character is 's' to decide the pluralization rule
    if (lastChar === "s") {
        return "es"; // If it ends with 's', append "es"
    } else {
        return "s";  // Otherwise, append "s"
    }
}

// inputに入力データ全体が入る
function processInputData(dataString) {
    // Calculate the length of the input string
    const currentStringLength = dataString.length;

    // Safely retrieve the last character of the string.
    // If the string is empty, finalChar will be an empty string,
    // which correctly leads to appending "s" (e.g., "" + "s" = "s").
    const finalChar = currentStringLength > 0 ? dataString[currentStringLength - 1] : '';

    // Determine the correct suffix using the helper function
    const requiredSuffix = getAppropriateSuffix(finalChar);

    // Concatenate the original string with the determined suffix
    const finalOutputValue = dataString + requiredSuffix;

    // Output the resulting string to the console
    console.log(finalOutputValue);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
