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

reader.on("close", () => {
  let [top, front, right, left, back, bottom] = lines[0].split(" ");
  let n = lines[1] - 0;
  let s1 = [top, front, bottom, back];
  let s2 = [top, right, bottom, left];
  let s3 = [front, right, back, left];
  for (let i = 2; i < n + 2; i++) {
    let [t, f] = lines[i].split(" ");
    let s = s1.includes(t) ? (s2.includes(t) ? s3 : s2) : s1;
    let ixf = s.indexOf(f);
    if (t === top || t === right || t === back) {
      ixf = ixf === 3 ? 0 : ixf + 1;
    } else {
      ixf = ixf === 0 ? 3 : ixf - 1;
    }
    console.log(s[ixf]);
  }
});

