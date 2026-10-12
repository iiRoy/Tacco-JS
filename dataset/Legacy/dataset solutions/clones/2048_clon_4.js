function performCubicOperation(sourceData) {
    const numericValue = parseFloat(sourceData);
    const baseComponent = numericValue / 3;

    let cubicResult = 1;
    for (let iterationCount = 0; iterationCount < 3; iterationCount++) {
        cubicResult *= baseComponent;
    }

    console.log(cubicResult);
}

const fileSystemAccess = require('fs');
const inputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
performCubicOperation(inputContent);
