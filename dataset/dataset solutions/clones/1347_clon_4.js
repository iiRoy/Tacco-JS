const computeGeometricProperties = (radiusInput, piConstant) => {
    const perimeterValue = 2 * radiusInput * piConstant;
    const surfaceAreaValue = Math.pow(radiusInput, 2) * piConstant;
    return [perimeterValue, surfaceAreaValue];
};

const processIncomingData = (dataBuffer) => {
    const numericalValue = parseFloat(dataBuffer.toString());
    const piConstant = Math.PI;
    const [circumference, area] = computeGeometricProperties(numericalValue, piConstant);
    console.log(circumference, area);
};

process.stdin.on("data", processIncomingData).resume();
