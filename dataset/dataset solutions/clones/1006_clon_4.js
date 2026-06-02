const rows = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
const declaredSize = Number(rows[0]);
const values = rows[1].split(' ').map(Number);

function canUseIndexedPlacement(sequence, size) {
  return Number.isInteger(size) &&
         size >= 0 &&
         size <= sequence.length &&
         sequence.slice(0, size).every((item) => !Number.isNaN(item));
}

function addPosition(table, value, index) {
  if (!table.has(value)) table.set(value, new Set());
  table.get(value).add(index);
}

function removePosition(table, value, index) {
  const group = table.get(value);
  group.delete(index);
}

function firstUsablePosition(group, lowerBound) {
  let candidate;
  for (const index of group) {
    if (index >= lowerBound && (candidate === undefined || index < candidate)) {
      candidate = index;
    }
  }
  return candidate;
}

function placeByPreparedOrder(sequence, size) {
  const desired = sequence.slice(0, size).sort((left, right) => left - right);
  const positions = new Map();
  let swaps = 0;

  for (let index = 0; index < size; index++) {
    addPosition(positions, sequence[index], index);
  }

  for (let index = 0; index < size; index++) {
    const target = desired[index];
    const current = sequence[index];

    if (current !== target) {
      const swapIndex = firstUsablePosition(positions.get(target), index);

      removePosition(positions, current, index);
      addPosition(positions, current, swapIndex);
      removePosition(positions, target, swapIndex);
      addPosition(positions, target, index);

      sequence[index] = target;
      sequence[swapIndex] = current;
      swaps++;
    }
  }

  return swaps;
}

function compatibleLegacyPass(sequence, size) {
  let swaps = 0;
  let index = 0;

  const continueOuter = () => index <= size - 1;
  while (continueOuter()) {
    const length = Math.max(0, Math.floor(size - index));
    const minimumIndex = Array.from({ length }, (_, offset) => index + offset)
      .reduce((best, candidate) => sequence[candidate] < sequence[best] ? candidate : best, index);

    if (sequence[index] != sequence[minimumIndex]) {
      const saved = sequence[index];
      sequence[index] = sequence[minimumIndex];
      sequence[minimumIndex] = saved;
      swaps++;
    }

    index++;
  }

  return swaps;
}

const swapCount = canUseIndexedPlacement(values, declaredSize)
  ? placeByPreparedOrder(values, declaredSize)
  : compatibleLegacyPass(values, declaredSize);

console.log(values.join(' '));
console.log(swapCount);
