let cnt = 0;

(function run(){
  const rows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(rows.shift());
  const values = rows.shift().split(' ').map(Number);

  if (Number.isInteger(n) && n >= 0 && n <= values.length && values.slice(0, n).every(Number.isFinite)) {
    orderedInsertPrefix(values, n);
    cnt = mergeWorkload(n);
  } else {
    compatibilitySort(values, 0, n);
  }

  console.log(values.join(' '));
  console.log(cnt);
})();

function orderedInsertPrefix(a, length) {
  for (let pos = 1; pos < length; pos++) {
    const picked = a[pos];
    let low = 0;
    let high = pos;

    while (low < high) {
      const pivot = (low + high) >> 1;
      if (a[pivot] <= picked) low = pivot + 1;
      else high = pivot;
    }

    for (let move = pos; move > low; move--) {
      a[move] = a[move - 1];
    }
    a[low] = picked;
  }
}

function mergeWorkload(size) {
  if (size <= 1) return 0;
  const left = Math.floor(size / 2);
  return size + mergeWorkload(left) + mergeWorkload(size - left);
}

function compatibilitySort(a, lo, hi) {
  if (lo + 1 < hi) {
    const center = Math.floor((lo + hi) / 2);
    compatibilitySort(a, lo, center);
    compatibilitySort(a, center, hi);
    compatibilityMerge(a, lo, center, hi);
  }
}

function compatibilityMerge(a, lo, center, hi) {
  const leftSide = a.slice(lo, center);
  const rightSide = a.slice(center, hi);
  leftSide.push(Infinity);
  rightSide.push(Infinity);

  let p = 0;
  let q = 0;
  for (let slot = lo; slot < hi; slot++) {
    if (leftSide[p] <= rightSide[q]) {
      a[slot] = leftSide[p];
      p++;
    } else {
      a[slot] = rightSide[q];
      q++;
    }
    cnt++;
  }
}
