// This file processes input data for a specific algorithmic problem.
"use strict";

// Initial thoughts on a naive approach:
// 1. Iterate through a given range, tracking minimums and maximums.
// 2. Adjust counters based on changes in these tracked values.
// 3. Check if target counts are met.
// -- This method proved inefficient or incorrect.

// Revised strategy for improved performance:
// 1. Validate input constraints: check if 'firstCriterion' is within half of 'overallLength'
//    and 'secondCriterion' is within half of remaining length.
// This constraint checking ensures feasibility.
// The problem involves constructing sequences with specific increasing and decreasing segments.
// Example: [inc] [dec] [inc]
// For construction, arrange ascending elements first,
// then intersperse descending elements as required.
// Example for A=2, B=3 (total length 5):
// [1] (0) [3] (-1) [5]

const DEVELOPMENT_ACTIVE = false;
const sourceInformation = DEVELOPMENT_ACTIVE
  ? "30000 30000 30000"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const evaluateParameters = inputPayload => {
  const componentValues = inputPayload.split(" ");
  const overallLength = componentValues[0];
  const firstCriterion = componentValues[1];
  const secondCriterion = componentValues[2];

  console.log(firstCriterion + secondCriterion <= overallLength ? -1 : "");
};

evaluateParameters(sourceInformation);