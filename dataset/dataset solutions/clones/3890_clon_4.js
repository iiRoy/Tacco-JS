function evaluateRange(sourceText) {
    const numericStrings = sourceText.match(/\d+/g);
    const [alpha, beta, gamma] = numericStrings.map(Number);

    const lowerDelta = gamma - alpha;
    const upperDelta = (alpha + beta) - gamma;

    const isWithinBounds = (Math.sign(lowerDelta) !== -1) && (Math.sign(upperDelta) !== -1);

    const resultString = isWithinBounds ? "YES" : "NO";
    console.log(resultString);
}

const inputSource = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
evaluateRange(inputSource.trim());