'use strict';

const processInputData = (sourceContent) => {
    const trimmedContent = sourceContent.trim();
    const numericValue = Number(trimmedContent);
    const squaredOutcome = numericValue * numericValue;
    console.log(squaredOutcome);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
