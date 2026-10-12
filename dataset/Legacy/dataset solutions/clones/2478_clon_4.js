(function() {
    const acquireInput = require('fs').readFileSync;
    const processData = (inputContent) => {
        const [paramOne, paramTwo, paramThree] = inputContent.split(/\s+/g).map(Number);

        const squareOfParamOne = Math.pow(paramOne, 2);
        const squareOfParamTwo = Math.pow(paramTwo, 2);

        const decisionPoint = (paramTwo * squareOfParamOne) / 2;

        const angleInRadians = (paramThree >= decisionPoint)
            ? Math.atan((2 / paramOne) * (paramTwo - (paramThree / squareOfParamOne)))
            : Math.atan((paramOne * squareOfParamTwo) / (2 * paramThree));

        const degreesPerRadian = 180 / Math.PI;
        return angleInRadians * degreesPerRadian;
    };

    const sourceData = acquireInput('/dev/stdin', 'utf8');
    const computedResult = processData(sourceData);
    console.log(computedResult);
})();
