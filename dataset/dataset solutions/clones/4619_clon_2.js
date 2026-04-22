"use strict";

function executeProgram(incomingText) {
  const initials = incomingText
    .trim()
    .split(' ')
    .map(segment => segment[0].toUpperCase());

  console.log(
    initials[0] +
    initials[1] +
    initials[2]
  );
}

executeProgram(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);