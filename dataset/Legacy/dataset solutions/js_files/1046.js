const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const [n, k] = inputs[0].split(' ').map(Number);
const wi = inputs.slice(1).map(Number);

const isAllocatable = (list, maxWeight, units) => {
  let weight = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] > maxWeight) {
      return false;
    }
    if (weight + list[i] > maxWeight) {
      if (--units <= 0) {
        return false;
      }
      weight = list[i];
    } else {
      weight += list[i];
    }
  }
  return true;
}

const pList = [...Array(wi.reduce((a, b) => a + b)).keys()];

let l = 0;
let r = pList.length;
while (l + 1 < r) {
  const index = Math.floor((l + r) / 2);
  if (!isAllocatable(wi, pList[index], k)) {
    l = index;
  } else {
    r = index;
  }
}
const p = pList[r];
console.log(p);

