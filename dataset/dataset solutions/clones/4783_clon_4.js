"use strict";

const pathGenerator = (inputData) => {
    const numericalCoordinates = inputData.trim().split(/\s+/).map(Number);
    const startXCoordinate = numericalCoordinates[0];
    const startYCoordinate = numericalCoordinates[1];
    const endXCoordinate = numericalCoordinates[2];
    const endYCoordinate = numericalCoordinates[3];

    const firstLeg = "R".repeat(endXCoordinate);
    const secondLeg = "U".repeat(endYCoordinate);
    const thirdLeg = "L".repeat(endXCoordinate);
    const fourthLeg = "D".repeat(endYCoordinate);
    const fifthLeg = "L";
    const sixthLeg = "U".repeat(endYCoordinate + 1);
    const seventhLeg = "R".repeat(endXCoordinate + 1);
    const eighthLeg = "D";
    const ninthLeg = "D".repeat(endYCoordinate + 1);
    const tenthLeg = "L".repeat(endXCoordinate + 1);
    const eleventhLeg = "U";

    const completePathSegments = [
        firstLeg,
        secondLeg,
        thirdLeg,
        fourthLeg,
        fifthLeg,
        sixthLeg,
        seventhLeg,
        eighthLeg,
        ninthLeg,
        tenthLeg,
        eleventhLeg
    ];

    const finalOutput = completePathSegments.join('');
    console.log(finalOutput);
};

pathGenerator(require('fs').readFileSync('/dev/stdin', 'utf8'));