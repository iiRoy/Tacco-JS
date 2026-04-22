const angularConverter = (degreesInput) => degreesInput * Math.PI / 180;

const obtainIdentity = () => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

const mergeTransformations = (matrixLeft, matrixRight) => {
    const outcome = Array(16);
    for (let currentColumn = 0; currentColumn < 4; currentColumn++) {
        for (let currentRow = 0; currentRow < 4; currentRow++) {
            outcome[currentColumn * 4 + currentRow] =
                matrixLeft[currentColumn * 4 + 0] * matrixRight[0 * 4 + currentRow] +
                matrixLeft[currentColumn * 4 + 1] * matrixRight[1 * 4 + currentRow] +
                matrixLeft[currentColumn * 4 + 2] * matrixRight[2 * 4 + currentRow] +
                matrixLeft[currentColumn * 4 + 3] * matrixRight[3 * 4 + currentRow];
        }
    }
    return outcome;
};

const renderMatrixForm = (inputMatrix) => {
    return 'Transform(' + inputMatrix.map(value => value.toFixed(6)).join(', ') + ')';
};

const generateRotationX = (radiansAngle) => {
    const cosVal = Math.cos(radiansAngle);
    const sinVal = Math.sin(radiansAngle);
    return [
        1, 0, 0, 0,
        0, cosVal, sinVal, 0,
        0, -sinVal, cosVal, 0,
        0, 0, 0, 1
    ];
};

const generateRotationY = (radiansAngle) => {
    const cosVal = Math.cos(radiansAngle);
    const sinVal = Math.sin(radiansAngle);
    return [
        cosVal, 0, -sinVal, 0,
        0, 1, 0, 0,
        sinVal, 0, cosVal, 0,
        0, 0, 0, 1
    ];
};

const generateRotationZ = (radiansAngle) => {
    const cosVal = Math.cos(radiansAngle);
    const sinVal = Math.sin(radiansAngle);
    return [
        cosVal, sinVal, 0, 0,
        -sinVal, cosVal, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

const generateTranslation = (deltaX, deltaY, deltaZ) => {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        deltaX, deltaY, deltaZ, 1
    ];
};

const generateScaling = (scaleX, scaleY, scaleZ) => {
    return [
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1
    ];
};

const generateSkewX = (radiansAngle) => {
    const tanVal = Math.tan(radiansAngle);
    return [
        1, tanVal, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

const generateSkewY = (radiansAngle) => {
    const tanVal = Math.tan(radiansAngle);
    return [
        1, 0, 0, 0,
        tanVal, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};

const produceRotationalX = (degreesAngle) => renderMatrixForm(generateRotationX(angularConverter(degreesAngle)));
const produceRotationalY = (degreesAngle) => renderMatrixForm(generateRotationY(angularConverter(degreesAngle)));
const produceRotationalZ = (degreesAngle) => renderMatrixForm(generateRotationZ(angularConverter(degreesAngle)));

const produceCombinedRotation = (xDegrees, yDegrees, zDegrees) => {
    const m_x = generateRotationX(angularConverter(xDegrees));
    const m_y = generateRotationY(angularConverter(yDegrees));
    const m_z = generateRotationZ(angularConverter(zDegrees));
    const combined = mergeTransformations(mergeTransformations(m_x, m_y), m_z);
    return renderMatrixForm(combined);
};

const produceTranslationalX = (value) => renderMatrixForm(generateTranslation(value, 0, 0));
const produceTranslationalY = (value) => renderMatrixForm(generateTranslation(0, value, 0));
const produceTranslationalZ = (value) => renderMatrixForm(generateTranslation(0, 0, value));
const produceCombinedTranslation = (xVal, yVal, zVal) => renderMatrixForm(generateTranslation(xVal, yVal, zVal));

const produceScalingX = (value) => renderMatrixForm(generateScaling(value, 1, 1));
const produceScalingY = (value) => renderMatrixForm(generateScaling(1, value, 1));
const produceScalingZ = (value) => renderMatrixForm(generateScaling(1, 1, value));
const produceCombinedScaling = (xVal, yVal, zVal) => renderMatrixForm(generateScaling(xVal, yVal, zVal));

const produceSkewingX = (degreesAngle) => renderMatrixForm(generateSkewX(angularConverter(degreesAngle)));
const produceSkewingY = (degreesAngle) => renderMatrixForm(generateSkewY(angularConverter(degreesAngle)));

const produceCombinedSkew = (xDegrees, yDegrees) => {
    const m_sx = generateSkewX(angularConverter(xDegrees));
    const m_sy = generateSkewY(angularConverter(yDegrees));
    const combined = mergeTransformations(m_sx, m_sy);
    return renderMatrixForm(combined);
};

const initialMatrixState = obtainIdentity();
console.log(renderMatrixForm(initialMatrixState));

console.log(
    produceRotationalX(45),
    produceRotationalY(45),
    produceRotationalZ(45),
    produceCombinedRotation(45, 45, 45)
);

console.log(
    produceTranslationalX(45),
    produceTranslationalY(45),
    produceTranslationalZ(45),
    produceCombinedTranslation(45, 45, 45)
);

console.log(
    produceScalingX(45),
    produceScalingY(45),
    produceScalingZ(45),
    produceCombinedScaling(45, 45, 45)
);

console.log(
    produceSkewingX(45),
    produceSkewingY(45),
    produceCombinedSkew(45, 45)
);