"use strict";

const   processGridMovement =     (inputPayload) =>
{
    inputPayload  =  inputPayload.trim() .split("\n");
    const originXPos = parseInt(  inputPayload[0].split(" ")[0]  );
    const originYPos = parseInt(  inputPayload[0].split(" ")[1]  );
    const destXPos   = parseInt(  inputPayload[0].split(" ")[2]  );
    const destYPos   = parseInt(  inputPayload[0].split(" ")[3]  );

    const xDist = destXPos - originXPos;
    const yDist = destYPos - originYPos;

    let movementInstructions = [];

    for ( let loopCount = 0; loopCount < xDist; loopCount++ ) {
        movementInstructions.push("R");
    }

    for ( let loopCount = 0; loopCount < yDist; loopCount++ ) {
        movementInstructions.push("U");
    }

    for ( let loopCount = 0; loopCount < xDist; loopCount++ ) {
        movementInstructions.push("L");
    }

    for ( let loopCount = 0; loopCount < yDist; loopCount++ ) {
        movementInstructions.push("D");
    }

    movementInstructions.push("L");

    for ( let loopCount = 0; loopCount < yDist + 1; loopCount++ ) {
        movementInstructions.push("U");
    }

    for ( let loopCount = 0; loopCount < xDist + 1; loopCount++ ) {
        movementInstructions.push("R");
    }

    movementInstructions.push("D");

    for ( let loopCount = 0; loopCount < yDist + 1; loopCount++ ) {
        movementInstructions.push("D");
    }

    for ( let loopCount = 0; loopCount < xDist + 1; loopCount++ ) {
        movementInstructions.push("L");
    }

    movementInstructions.push("U");

    console.log( movementInstructions.join("") );
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

processGridMovement(fileSystemModule.readFileSync(standardInputPath, encodingType));