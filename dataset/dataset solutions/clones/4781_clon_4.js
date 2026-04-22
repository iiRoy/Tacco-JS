"use strict";

const generateCharacterSequence = (symbolToRepeat, repetitionCount) => {
  if (repetitionCount <= 0) {
    return "";
  }
  return symbolToRepeat + generateCharacterSequence(symbolToRepeat, repetitionCount - 1);
};

const processCoordinateInput = (entryString) => {
  const [initial_x_pos, initial_y_pos, terminal_x_pos, terminal_y_pos] = entryString
    .trim()
    .split('\n')[0]
    .split(' ')
    .map(Number);

  const horizontal_span = terminal_x_pos - initial_x_pos;
  const vertical_span = terminal_y_pos - initial_y_pos;

  const movementBlueprint = [
    { direction: "R", quantity: horizontal_span },
    { direction: "U", quantity: vertical_span },
    { direction: "L", quantity: horizontal_span },
    { direction: "D", quantity: vertical_span },
    { direction: "L", quantity: 1 },
    { direction: "U", quantity: vertical_span + 1 },
    { direction: "R", quantity: horizontal_span + 1 },
    { direction: "D", quantity: 1 },
    { direction: "D", quantity: vertical_span + 1 },
    { direction: "L", quantity: horizontal_span + 1 },
    { direction: "U", quantity: 1 },
  ];

  const constructedPath = movementBlueprint.reduce((currentAccumulation, currentDirective) => {
    return currentAccumulation + generateCharacterSequence(currentDirective.direction, currentDirective.quantity);
  }, "");

  return constructedPath;
};

const initiateExecution = (rawData) => {
  console.log(processCoordinateInput(rawData));
};

initiateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));