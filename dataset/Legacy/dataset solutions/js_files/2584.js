'use strict';

function main(lines) {
  const [N, K] = lines[0].split(' ').map(Number);
  const S = lines[1];

  let s = shorten(S);
  // console.log(s);
  for (let i = 0; i < K; i++) {
    if (s.length === 1) break;
    s = s[0] + s.slice(3);
    // console.log(s);
  }
  const happiness = N - s.length;
  console.log(happiness);
}

function shorten(s) {
  let len = s.length;
  for (let i = 0; i < len;) {
    if (i !== len-1 && s[i] === s[i+1]) {
      s = s.slice(0, i+1) + s.slice(i+2);
      len--;
    } else {
      i++;
    }
  }
  return s;
}

function calcHappiness(s) {
  return s.length - shorten(s).length;
}

function runWithStdin() {
  let input = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", v => {
    input += v;
  });
  process.stdin.on("end", () => {
    main(input.split("\n"));
  });
}
runWithStdin();
