function checkProvidedData(sourceContent) {
    const presencePattern = /(?=.*a)(?=.*b)(?=.*c)/;
    const outcomeMap = {
        true: "Yes",
        false: "No"
    };
    const resultBool = presencePattern.test(sourceContent);
    console.log(outcomeMap[resultBool]);
}
checkProvidedData(require("fs").readFileSync("/dev/stdin", "utf8"));