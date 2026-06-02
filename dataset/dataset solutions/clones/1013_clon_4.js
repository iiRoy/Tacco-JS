process.stdin.resume();
process.stdin.setEncoding('utf8');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rows = [];
readline.on('line', (line) => rows.push(line));

let movementCount = 0;

function knuthGaps(size) {
  const gaps = [1];
  let value = 1;
  for (;;) {
    value = value * 3 + 1;
    if (value < size) {
      gaps.push(value);
    } else {
      return gaps.reverse();
    }
  }
}

function mergeAndCount(values) {
  if (values.length < 2) {
    return { ordered: values.slice(), inversions: 0 };
  }

  const middle = Math.floor(values.length / 2);
  const left = mergeAndCount(values.slice(0, middle));
  const right = mergeAndCount(values.slice(middle));
  const merged = [];
  let i = 0;
  let j = 0;
  let inversions = left.inversions + right.inversions;

  while (i < left.ordered.length && j < right.ordered.length) {
    if (left.ordered[i] > right.ordered[j]) {
      inversions += left.ordered.length - i;
      merged.push(right.ordered[j]);
      j++;
    } else {
      merged.push(left.ordered[i]);
      i++;
    }
  }

  while (i < left.ordered.length) {
    merged.push(left.ordered[i]);
    i++;
  }
  while (j < right.ordered.length) {
    merged.push(right.ordered[j]);
    j++;
  }

  return { ordered: merged, inversions };
}

function placeSortedRun(array, locations, values) {
  if (locations.length === 0) {
    return;
  }
  const result = mergeAndCount(values);
  movementCount += result.inversions;
  for (let i = 0; i < locations.length; i++) {
    array[locations[i]] = result.ordered[i];
  }
}

function reorderGapResidue(array, firstIndex, gap) {
  let locations = [];
  let values = [];

  for (let pos = firstIndex; pos < array.length; pos += gap) {
    const item = array[pos];
    if (Number.isNaN(item)) {
      placeSortedRun(array, locations, values);
      locations = [];
      values = [];
    } else {
      locations.push(pos);
      values.push(item);
    }
  }

  placeSortedRun(array, locations, values);
}

function sortByGapBlocks(array, gap) {
  for (let residue = 0; residue < gap && residue < array.length; residue++) {
    reorderGapResidue(array, residue, gap);
  }
}

function shellSortWithBlockMerges(array) {
  movementCount = 0;
  const gaps = knuthGaps(array.length);
  for (const gap of gaps) {
    sortByGapBlocks(array, gap);
  }
  return gaps;
}

readline.on('close', () => {
  const amount = rows[0] - 0;
  const values = rows.slice(1, amount + 1).map(Number);
  const gaps = shellSortWithBlockMerges(values);

  console.log(gaps.length);
  console.log(gaps.join(' '));
  console.log(movementCount);
  values.forEach((value) => console.log(value));
});
