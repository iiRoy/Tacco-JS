'use strict';

function ProcessInput(inputData) {
    const rawLines = inputData.trim().split('\n');
    const dimensions = rawLines[0].split(' ');
    const studentCount = Number(dimensions[0]);
    const landmarkCount = Number(dimensions[1]);

    const studentPositions = Array.from({ length: studentCount }, (_, currentIdx) => {
        return rawLines[currentIdx + 1].split(' ').map(Number);
    });

    const landmarkPositions = Array.from({ length: landmarkCount }, (_, currentIdx) => {
        return rawLines[currentIdx + 1 + studentCount].split(' ').map(Number);
    });

    const nearestLandmarkIdentifiers = studentPositions.map((currentStudentPosition) => {
        return landmarkPositions.reduce((accumulator, currentLandmarkPosition, landmarkIndex) => {
            const calculatedSpan = Math.abs(currentStudentPosition[0] - currentLandmarkPosition[0]) + Math.abs(currentStudentPosition[1] - currentLandmarkPosition[1]);

            if (calculatedSpan < accumulator.minimumObservedDistance) {
                return {
                    minimumObservedDistance: calculatedSpan,
                    nearestLandmarkIdentifier: landmarkIndex + 1
                };
            }
            return accumulator;
        }, { minimumObservedDistance: Number.MAX_VALUE, nearestLandmarkIdentifier: -1 }).nearestLandmarkIdentifier;
    });

    console.log(nearestLandmarkIdentifiers.join('\n'));
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
