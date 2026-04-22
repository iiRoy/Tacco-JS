// inputに入力データ全体が入る
function Main(input) {
  "use strict";
	const lines = input.split("\n");
	const line1 = lines[0].split(" ");
  const n = parseInt(line1[0], 10);
  const k = parseInt(line1[1], 10);
	const chars = lines[1].split("");

  const count = chars.length;
  const stands = []
  const stands_0 = [];
  const stands_1 = [];
  let x = 1;
  let prev = chars[0];
  for (let i = 1; i < count; i++) {
    const c = chars[i];
    if ( c !== prev) {
      stands.push(x)
      if (c === "1") {
        stands_1.push(x);
      } else {
        stands_0.push(x);
      }
      x = 1;
    } else {
      x++;
    }
      prev = c;
  }
  if (k >= stands_0.length) { console.log(n); return }

  const w = chars[0] === "1" ? k*2 + 1 : k*2 + 2 ;
  const ww = stands.slice(0, w)
  const sum = arr => arr.reduce((acc, e) => acc + e,0);

  const nums = [sum(ww)];
  const stands_count = stands.length

  for (let i = w; i < stands_count; i++) {
    ww.pop();
    ww.push(stands[i])
    nums.push(sum(ww))
  }
	console.log('%s',nums.reduce((acc, n) => acc > n ? acc : n, 0))
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));