process.stdin.resume();
process.stdin.setEncoding("utf8");

const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];

reader.on("line", (line) => {
  lines.push(line);
});

let cnt = 0;

function insertionSort(A, g) {
  for (let i = g; i < A.length; i++) {
    let v = A[i];
    let j = i - g;
    while (j >= 0 && A[j] > v) {
      A[j + g] = A[j];
      j = j - g;
      cnt++;
    }
    A[j + g] = v;
  }
}

function createG(A) {
  const len = A.length;
  let prev = 1;
  const ret = [1];
  while (true) {
    prev = prev * 3 + 1;
    if (prev < len) {
      ret.push(prev);
    } else {
      break;
    }
  }
  return ret.reverse();
}

function shellSort(A) {
  cnt = 0;
  const G = createG(A);
  for (let i = 0; i < G.length; i++) {
    insertionSort(A, G[i]);
  }
  return G;
}

reader.on("close", () => {
  const n = lines[0] - 0;
  const A = lines.slice(1, n + 1).map(Number);
  const G = shellSort(A);
  console.log(G.length);
  console.log(G.join(" "));
  console.log(cnt);
  A.forEach((e) => console.log(e));
});

