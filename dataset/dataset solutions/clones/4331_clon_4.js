const processInput = (textData) => {
    const patternMatch = /^YAKI/.test(textData);
    const resultOutput = patternMatch ? "Yes" : "No";
    console.log(resultOutput);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
