function evaluateContent(sourceData) {
    const outcomeMap = {
        true: "Yes",
        false: "No"
    };
    const searchPattern = /AC/;
    const found = searchPattern.test(sourceData);
    console.log(outcomeMap[found]);
}

evaluateContent(require("fs").readFileSync("/dev/stdin", "utf8"));
