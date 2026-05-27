const fileSystemModule = require("fs");
(function checkStringForPattern(targetString) {
    const searchPattern = /hi/;
    const matchAttempt = targetString.match(searchPattern);

    let finalResult;

    if (matchAttempt !== null) {
        finalResult = 'Yes';
    } else {
        finalResult = 'No';
    }
    return finalResult;
})(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
