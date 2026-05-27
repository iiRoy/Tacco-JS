const fileSystemModule = require('fs');

function readStandardInput() {
    const inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
    const dataBuffer = Buffer.alloc(inputDataLength);
    const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');
}

const inputLines = readStandardInput();

processInputData();

function processInputData() {
    if (inputLines.length === 0) {
        return;
    }

    inputLines.forEach(function(currentLine) {
        const currentLineParts = currentLine.split(' ');
        const { pointOne, pointTwo, pointThree, testPoint } = parsePointsFromLine(currentLineParts);

        const result = checkPointInTriangle(pointOne, pointTwo, pointThree, testPoint);
        console.log(result);
    });
}

function parsePointsFromLine(partsArray) {
    let partIndex = 0;
    const p1 = new PointVector(partsArray[partIndex++], partsArray[partIndex++]);
    const p2 = new PointVector(partsArray[partIndex++], partsArray[partIndex++]);
    const p3 = new PointVector(partsArray[partIndex++], partsArray[partIndex++]);
    const pTest = new PointVector(partsArray[partIndex++], partsArray[partIndex++]);
    return { pointOne: p1, pointTwo: p2, pointThree: p3, testPoint: pTest };
}

function checkPointInTriangle(p1, p2, p3, pTest) {
    const vec12 = p2.subtractVector(p1);
    const vec2P = pTest.subtractVector(p2);
    
    const vec23 = p3.subtractVector(p2);
    const vec3P = pTest.subtractVector(p3);

    const vec31 = p1.subtractVector(p3);
    const vec1P = pTest.subtractVector(p1);

    const crossProd1 = vec12.calculateCrossProduct(vec2P);
    const crossProd2 = vec23.calculateCrossProduct(vec3P);
    const crossProd3 = vec31.calculateCrossProduct(vec1P);

    const isAllPositive = (crossProd1 > 0 && crossProd2 > 0 && crossProd3 > 0);
    const isAllNegative = (crossProd1 < 0 && crossProd2 < 0 && crossProd3 < 0);

    if (isAllPositive || isAllNegative) {
        return 'YES';
    } else {
        return 'NO';
    }
}

function PointVector(coordX, coordY) {
    this.x = Number(coordX);
    this.y = Number(coordY);
}

PointVector.prototype.subtractVector = function(otherVector) {
    return new PointVector(this.x - otherVector.x, this.y - otherVector.y);
};

PointVector.prototype.calculateCrossProduct = function(otherVector) {
    return this.x * otherVector.y - this.y * otherVector.x;
};
