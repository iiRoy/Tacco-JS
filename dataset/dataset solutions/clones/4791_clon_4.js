"use strict"
const acquireInputData = () => {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const firstLine = rawContent.split("\n")[0];
    const parsedNumbers = firstLine.split(" ").map(val => Number(val));
    return parsedNumbers;
};

const calculateValue = (valA, valB) => {
    const absoluteA = valA < 0 ? -valA : valA;
    const absoluteB = valB < 0 ? -valB : valB;
    const differenceAbs = absoluteA - absoluteB;
    let baseResult = differenceAbs < 0 ? -differenceAbs : differenceAbs;

    const evaluationMap = new Map();
    // Key format: `${signA},${signB},${isALessThanB}`
    // sign: -1 for negative, 0 for zero, 1 for positive
    // isALessThanB: 1 for true, 0 for false

    // Cases for +1 increment
    evaluationMap.set("-1,1,1", 1); // x<0, y>0, x<y (e.g. -2,3)
    evaluationMap.set("1,-1,0", 1); // x>0, y<0, x not< y (false) (e.g. 2,-3)
    evaluationMap.set("1,0,0", 1);  // x>0, y=0, x not< y (false) (e.g. 3,0)
    evaluationMap.set("0,-1,0", 1); // x=0, y<0, x not< y (false) (e.g. 0,-3)

    // Cases for +2 increment
    evaluationMap.set("1,1,1", 2);   // x>0, y>0, x<y (e.g. 1,5)
    evaluationMap.set("-1,-1,1", 2); // x<0, y<0, x<y (e.g. -5,-1)
    evaluationMap.set("0,1,1", 2);   // x=0, y>0, x<y (e.g. 0,5)
    evaluationMap.set("-1,0,1", 2);  // x<0, y=0, x<y (e.g. -5,0)

    const signOfA = valA > 0 ? 1 : (valA < 0 ? -1 : 0);
    const signOfB = valB > 0 ? 1 : (valB < 0 ? -1 : 0);
    const isALessThanB = valA < valB ? 1 : 0;

    const mapKey = `${signOfA},${signOfB},${isALessThanB}`;
    const additionalIncrement = evaluationMap.get(mapKey) || 0;

    return baseResult + additionalIncrement;
};

const mainProgram = () => {
    const [alpha, beta] = acquireInputData();
    const finalResult = calculateValue(alpha, beta);
    console.log(finalResult);
};

mainProgram();