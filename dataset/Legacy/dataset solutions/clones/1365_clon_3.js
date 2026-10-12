/// <reference path="nodelib/node.js"/>

const REPETITION_LIMIT = 1000;
const DISPLAY_TEXT = "Hello World";

function outputContent(messageToDisplay) {
    console.log(messageToDisplay);
}

let currentIteration = 0;
for (; currentIteration < REPETITION_LIMIT; currentIteration++)
{
    outputContent(DISPLAY_TEXT);
}
