Solve = (src => {
  "use strict";
  src = src.split("\n")[1].split(" ");
  let freq = {};
  for (const val of src) freq[val] = (freq[val] || 0) + 1;
  for (const key of Object.keys(freq)) freq[key] = { p: freq[key], q: freq[key] * (freq[key] - 1) / 2, r: (freq[key] - 1) * (freq[key] - 2) / 2 };
  var sum;
  for (let idx = 0; idx < src.length; idx++) {
    const cur = src[idx];
    sum = 0;
    for (const key of Object.keys(freq)) sum += cur == key ? freq[key].r : freq[key].q;
    console.log(sum);
  }
});
Solve(require("fs").readFileSync("/dev/stdin", "utf8").trim());
