const filesystem = require('fs');

const circleConstant = Math.acos(-1);

function renderNumeric(numericInput, precision) {
    const scaleFactor = Math.pow(10, precision);
    let processed = Math.round(numericInput * scaleFactor) / scaleFactor;
    let stringRepresentation = String(processed);

    if (!stringRepresentation.includes('.')) {
        stringRepresentation += '.';
    }

    let parts = stringRepresentation.split('.');
    let fractionalComponent = parts[1] || '';

    while (fractionalComponent.length < precision) {
        fractionalComponent += '0';
    }

    if (fractionalComponent.length > precision) {
        fractionalComponent = fractionalComponent.substring(0, precision);
    }
    
    return parts[0] + '.' + fractionalComponent;
}

const computeSurface = (val, constVal) => constVal * Math.pow(val, 2);

const computePerimeter = (val, constVal) => constVal * (val + val);

const rawData = filesystem.readFileSync('/dev/stdin', 'utf8');
const measurement = Number(rawData);

const surfaceValue = computeSurface(measurement, circleConstant);
const perimeterValue = computePerimeter(measurement, circleConstant);

const formattedSurface = renderNumeric(surfaceValue, 6);
const formattedPerimeter = renderNumeric(perimeterValue, 6);

process.stdout.write(formattedSurface + " " + formattedPerimeter + "\n");