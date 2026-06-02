const fs = require("fs");

const legacyInput = (() => {
  const cells = fs.readFileSync(0, "utf8").trim().split("\n");
  let row = 0;

  const numberFromCurrentToken = () => {
    let cell = cells[row];
    if (!Array.isArray(cell)) {
      cell = String(cell).split(" ").reverse();
      cells[row] = cell;
    }
    const value = cell.pop();
    if (cell.length === 0) row++;
    return Number(value);
  };

  const numericRows = (count) => {
    const part = cells.slice(row, row + count);
    row += count;
    return part.map(Number);
  };

  return { numberFromCurrentToken, numericRows };
})();

const n = legacyInput.numberFromCurrentToken();
const rows = legacyInput.numericRows(n);

const exactLengthForBrokenNumbers = (source, limit) => {
  const piles = [1];

  const place = (value, left, right) => {
    if (right - left <= 1) return piles[left] <= value ? right : left;
    const middle = (left + right) >> 1;
    return piles[middle] <= value
      ? place(value, middle, right)
      : place(value, left, middle);
  };

  for (let index = 0; index < limit; index++) {
    const value = -source[index];
    piles[place(value, 0, piles.length)] = value;
  }
  return piles.length;
};

const canUseIndependentDp = (() => {
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(-rows[i])) return false;
  }
  return true;
})();

if (!canUseIndependentDp) {
  console.log(exactLengthForBrokenNumbers(rows, n));
} else {
  const values = [1];
  for (let i = 0; i < n; i++) values.push(-rows[i]);

  const bestEndingHere = Array(values.length).fill(1);
  let answer = 1;

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < i; j++) {
      if (values[j] <= values[i] && bestEndingHere[j] + 1 > bestEndingHere[i]) {
        bestEndingHere[i] = bestEndingHere[j] + 1;
      }
    }
    if (bestEndingHere[i] > answer) answer = bestEndingHere[i];
  }

  console.log(answer);
}
