const fs = require('fs');
const util = require('util');

let storedInputFragments;
let currentPosition = 0;

function acquireLine() {
  if (currentPosition >= storedInputFragments.length) {
    throw new Error("Input source exhausted.");
  }
  return storedInputFragments[currentPosition++];
}

function retrieveInteger() {
  return Number.parseInt(acquireLine(), 10);
}

function displayResult(content) {
  console.log(content);
}

function recordEvent(note) {
  console.error("debug:" + util.inspect(note, false, null));
}

function orchestrateProcessing() {
  const dataThreshold = retrieveInteger();
  const characterSequence = acquireLine();

  if (characterSequence.length <= dataThreshold) {
    displayResult(characterSequence);
  } else {
    displayResult(characterSequence.substring(0, 7) + "...");
  }
}

function initiateOperation() {
  const fullInputBuffer = fs.readFileSync(process.stdin.fd, 'utf8');
  storedInputFragments = fullInputBuffer.split(/\r?\n/).filter(segment => segment.length > 0);

  recordEvent("-----start-----");
  const initialTimestamp = process.hrtime.bigint();
  
  orchestrateProcessing();
  
  const finalTimestamp = process.hrtime.bigint();
  const elapsedNanoseconds = finalTimestamp - initialTimestamp;
  const elapsedMilliseconds = Number(elapsedNanoseconds) / 1_000_000;

  recordEvent("----- end -----");
  recordEvent("time : " + elapsedMilliseconds.toFixed(3) + "ms");
}

initiateOperation();