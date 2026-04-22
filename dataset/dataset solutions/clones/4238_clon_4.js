"use strict";

const dataAcquisitionUtility = require("node:fs");
const receivedDataPayload = dataAcquisitionUtility.readFileSync("/dev/stdin", "utf8");

const relevantLineSegment = receivedDataPayload.trim().split(/\r?\n/)[0];

const parsedNumericalElements = relevantLineSegment.split(" ").map(token => +token);

const primaryParameter = parsedNumericalElements[0];
const secondaryParameter = parsedNumericalElements[1];

const componentOne = 1900 * secondaryParameter;
const componentTwo = 100 * (primaryParameter - secondaryParameter);
const sumOfComponents = componentOne + componentTwo;

const factorOfTwoPower = 1 << secondaryParameter;

const computedOutcome = sumOfComponents * factorOfTwoPower;

console.info(computedOutcome);