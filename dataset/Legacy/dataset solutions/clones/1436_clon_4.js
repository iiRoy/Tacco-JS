const calculateEuclideanDistance = (sourceData) => {
    const coordinateValues = sourceData.match(/-?\d+(\.\d+)?/g).map(parseFloat);

    const [firstX, firstY, secondX, secondY] = coordinateValues;

    const deltaHorizontal = secondX - firstX;
    const deltaVertical = secondY - firstY;

    console.log(Math.hypot(deltaHorizontal, deltaVertical));
};

(() => {
    const rawInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    calculateEuclideanDistance(rawInputContent);
})();
