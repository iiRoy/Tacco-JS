"use strict";

const processAndDisplay = (sourceData) => {
  const numericInput = Number.parseInt(sourceData.trim());
  const computedValue = Math.floor((numericInput - 1) / 2);
  console.log(computedValue);
};

processAndDisplay(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
