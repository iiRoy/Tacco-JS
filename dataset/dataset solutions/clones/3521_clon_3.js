function processInput(rawInput) {
    let values = rawInput.split(' ');
    values = values.map(function (item) {
        return parseInt(item, 10);
    });

    const largestValue = Math.max(...values);
    values.splice(values.indexOf(largestValue), 1);

    const secondLargestValue = Math.max(...values);
    values.splice(values.indexOf(secondLargestValue), 1);

    const thirdLargestValue = Math.max(...values);
    values.splice(values.indexOf(thirdLargestValue), 1);

    const joinedLargestValues = largestValue.toString() + secondLargestValue.toString();
    const answer = parseInt(joinedLargestValues, 10) + thirdLargestValue;

    console.log(answer);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));