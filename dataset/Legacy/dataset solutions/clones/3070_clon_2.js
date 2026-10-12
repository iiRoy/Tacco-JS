"use strict";

// This module defines the primary execution routine.
const executeCoreLogic = (rawInputString) => {
    // Process the incoming data: remove leading/trailing whitespace and split by newline.
    rawInputString = rawInputString.trim().split("\n");

    // Parse the numerical values from the processed input array.
    const totalQuantity = parseInt(rawInputString[0]); // Represents the total number of items.
    const rateAlpha = parseInt(rawInputString[1]);     // First capacity/rate value.
    const rateBeta = parseInt(rawInputString[2]);      // Second capacity/rate value.
    const rateGamma = parseInt(rawInputString[3]);     // Third capacity/rate value.
    const rateDelta = parseInt(rawInputString[4]);     // Fourth capacity/rate value.
    const rateEpsilon = parseInt(rawInputString[5]);   // Fifth capacity/rate value.

    // Calculate the result based on the algorithm:
    // 1. Find the minimum among the five rate values.
    // 2. Divide the total quantity by this minimum rate.
    // 3. Round the result up to the nearest whole number using Math.ceil.
    // 4. Add 4 to the final ceiling value.
    // 5. Output the computed value to the console.
    console.log(Math.ceil(totalQuantity / Math.min(rateAlpha, rateBeta, rateGamma, rateDelta, rateEpsilon) + 4));
};

// Invoke the core logic function, reading input from standard input.
executeCoreLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
