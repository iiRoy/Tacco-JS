const acquireData = () => require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });

const computeGeometricValue = (sourceData) => {
    const rawNumericalSequences = sourceData.match(/\d+/g);

    const numericalFigures = rawNumericalSequences.map(Number);

    const baseOne = numericalFigures[0];
    const baseTwo = numericalFigures[1];
    const perpendicularHeight = numericalFigures[2];

    const halfPerpendicularHeight = perpendicularHeight / 2;

    const totalCalculatedValue = (baseOne * halfPerpendicularHeight) + (baseTwo * halfPerpendicularHeight);

    const finalDiscreteValue = Math.trunc(totalCalculatedValue);

    process.stdout.write(finalDiscreteValue.toString() + '\n');
};

computeGeometricValue(acquireData());