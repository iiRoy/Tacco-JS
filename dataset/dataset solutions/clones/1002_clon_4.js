//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

A = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline, 2);
A = A[1].split(' ').map(Number);

cnt = rebuild(A);
console.log(A.join(' '));
console.log(cnt);

function rebuild(A) {
  var total, left, right, part, sorted, i, k;
  total = 0;
  left = 0;

  for (right = 0; right <= A.length; right++) {
    if (right === A.length || Number.isNaN(A[right])) {
      part = A.slice(left, right);
      if (part.length > 1) {
        sorted = mergeCount(part);
        total += sorted.c;
        for (k = 0; k < sorted.a.length; k++) {
          A[left + k] = sorted.a[k];
        }
      }
      left = right + 1;
    }
  }
  return total;
}

function mergeCount(list) {
  var mid, l, r, merged, i, j, c;
  if (list.length < 2) {
    return { a: list.slice(), c: 0 };
  }

  mid = list.length >> 1;
  l = mergeCount(list.slice(0, mid));
  r = mergeCount(list.slice(mid));

  merged = [];
  i = 0;
  j = 0;
  c = l.c + r.c;

  while (i < l.a.length && j < r.a.length) {
    if (l.a[i] <= r.a[j]) {
      merged.push(l.a[i]);
      i++;
    } else {
      merged.push(r.a[j]);
      c += l.a.length - i;
      j++;
    }
  }

  while (i < l.a.length) {
    merged.push(l.a[i]);
    i++;
  }
  while (j < r.a.length) {
    merged.push(r.a[j]);
    j++;
  }

  return { a: merged, c: c };
}
