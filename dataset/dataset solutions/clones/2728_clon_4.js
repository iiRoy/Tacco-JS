(function() {
    const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

    const extractionPattern = /^(\d+)/;
    const numericToken = dataSource.match(extractionPattern);

    let primaryValue;
    if (numericToken && numericToken[1]) {
        primaryValue = parseInt(numericToken[1], 10);
    } else {
        primaryValue = 0;
    }

    const calculatedOutcome = 3 * Math.pow(primaryValue, 2);

    console.log(calculatedOutcome);
})();