function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const firstLineContent = inputLines[0];
    const requiredPrefix = "YAKI";
    const successMessage = "Yes";
    const failureMessage = "No";

    const doesStartWithPrefix = firstLineContent.startsWith(requiredPrefix);

    if (doesStartWithPrefix) {
        console.log(successMessage);
    } else {
        console.log(failureMessage);
    }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
