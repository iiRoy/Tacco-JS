const processInputAndCompute = (sourceContent) => {
    const newlineIndex = sourceContent.indexOf('\n');
    const extractedLine = (newlineIndex === -1) ? sourceContent : sourceContent.substring(0, newlineIndex);
    const numericalValue = Number(extractedLine);
    console.log(Math.pow(numericalValue, 3));
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
