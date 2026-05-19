let someInputString = require("fs").readFileSync("/dev/stdin", "utf8");

Math.min.apply(
    null,
    [
        ...Array(someInputString.length - 2)
    ].map(
        ( _unusedParam, currentIdx ) => {
            let threeCharSubstring = someInputString.slice(currentIdx, currentIdx + 3);
            let numericValue = threeCharSubstring | 0;
            return Math.abs(753 - numericValue);
        }
    )
);
