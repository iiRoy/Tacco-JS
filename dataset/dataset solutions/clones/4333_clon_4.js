const verifyCondition = (currentX, currentY, limitX, limitY, target) => {
    if (currentX > limitX) {
        return false;
    }
    if (currentY > limitY) {
        return verifyCondition(currentX + 1, 0, limitX, limitY, target);
    }

    const computedVal = currentY * (limitX - currentX) + currentX * (limitY - currentY);
    if (computedVal === target) {
        return true;
    }

    return verifyCondition(currentX, currentY + 1, limitX, limitY, target);
};

const solveProblem = (dataString) => {
    const numericals = dataString.split(' ').map(Number);
    const upperBoundaryX = numericals[0];
    const upperBoundaryY = numericals[1];
    const desiredOutcome = numericals[2];

    const resultBool = verifyCondition(0, 0, upperBoundaryX, upperBoundaryY, desiredOutcome);

    const finalResultText = resultBool ? 'Yes' : 'Ans';
    console.log(finalResultText);
    return 0;
};

const entryPoint = (filePath) => {
    const contentBuffer = require("node:fs").readFileSync(filePath, "utf8");
    solveProblem(contentBuffer.trim());
};

entryPoint("/dev/stdin");