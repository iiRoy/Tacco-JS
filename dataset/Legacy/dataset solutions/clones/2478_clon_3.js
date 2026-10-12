function calculateAngle(inputStr) {
    const inputParts = inputStr.split(/\s+/g);

    const dimensionA = parseFloat(inputParts[0]);
    const dimensionB = parseFloat(inputParts[1]);
    const currentVolume = parseFloat(inputParts[2]);

    const PI_CONSTANT = Math.PI;
    const dimensionA_squared = dimensionA ** 2;

    let angleInRadians = 0;

    const criticalVolumeThreshold = (dimensionB * dimensionA_squared) / 2;

    if (currentVolume >= criticalVolumeThreshold) {
        const termForFirstCase = (2 / dimensionA) * (dimensionB - currentVolume / dimensionA_squared);
        angleInRadians = Math.atan(termForFirstCase);
    } else {
        const numeratorForSecondCase = dimensionA * (dimensionB ** 2);
        const denominatorForSecondCase = 2 * currentVolume;
        angleInRadians = Math.atan(numeratorForSecondCase / denominatorForSecondCase);
    }

    const finalAngleInDegrees = angleInRadians * (180 / PI_CONSTANT);
    console.log(finalAngleInDegrees);
}

calculateAngle(require('fs').readFileSync('/dev/stdin', 'utf8'));
