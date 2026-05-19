((sourceContent) => {
    const processAndCompute = (fullInputString) => {
        const initialSegment = fullInputString.split('\n')[0];
        const numericalDatum = Number(initialSegment.trim());
        return numericalDatum * Math.PI * 2;
    };

    console.log(processAndCompute(sourceContent));
})(require("fs").readFileSync("/dev/stdin", "utf8"));
