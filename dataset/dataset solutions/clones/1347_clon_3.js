const calculateCircumference = (radiusValue, piConstant) => {
    const diameter = 2 * radiusValue;
    return diameter * piConstant;
};

const calculateArea = (radiusValue, piConstant) => {
    const radiusSquared = radiusValue * radiusValue;
    return radiusSquared * piConstant;
};

process.stdin.on("data", function(inputBuffer) {
    const inputString = String(inputBuffer).trim();
    const parsedRadius = parseFloat(inputString);

    const PI_VALUE = Math.PI;

    const circumferenceResult = calculateCircumference(parsedRadius, PI_VALUE);
    const areaResult = calculateArea(parsedRadius, PI_VALUE);

    console.log(circumferenceResult, areaResult);
}).resume();
