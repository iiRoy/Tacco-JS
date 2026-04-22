const processInputAndCompute = (dataString) => {
    const firstNumericalToken = Number.parseInt(dataString);

    const magicConstant = [...Array(1000).keys()].pop();

    return magicConstant - firstNumericalToken;
};

(function(sourceReader) {
    const rawData = sourceReader("/dev/stdin", "utf8");
    console.log(processInputAndCompute(rawData));
})(require("fs").readFileSync);