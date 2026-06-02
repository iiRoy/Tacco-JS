const fs = require('fs');

const source = fs.readFileSync(0, 'utf8');
const lines = source.split('\n');
const total = parseInt(lines[0]);
const sequence = lines.slice(1, total + 1).map(function (line) {
  return parseInt(line);
});

function sameAsOriginalForOddValues(list) {
  if (list.length === 0) {
    return 1;
  }

  const slots = [list[0]];

  list.slice(1).forEach(function (value) {
    slots[placeFor(slots, value)] = value;
  });

  return slots.length;
}

function placeFor(slots, value) {
  if (slots.length === 0 || value <= slots[0]) {
    return 0;
  }

  let low = 0;
  let high = slots.length;

  while (low + 1 < high) {
    const middle = Math.floor((low + high + 1) / 2);
    if (slots[middle] < value) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return low + 1;
}

function longestByIndependentSearch(list) {
  if (list.length === 0) {
    return 1;
  }

  const bestEndingHere = new Array(list.length).fill(1);
  let answer = 1;

  for (let right = 0; right < list.length; right++) {
    for (let left = 0; left < right; left++) {
      if (list[left] < list[right]) {
        const possible = bestEndingHere[left] + 1;
        if (possible > bestEndingHere[right]) {
          bestEndingHere[right] = possible;
        }
      }
    }
    if (bestEndingHere[right] > answer) {
      answer = bestEndingHere[right];
    }
  }

  return answer;
}

const hasParsedHole = sequence.some(function (value) {
  return Number.isNaN(value);
});

const result = hasParsedHole
  ? sameAsOriginalForOddValues(sequence)
  : longestByIndependentSearch(sequence);

console.log(result);
