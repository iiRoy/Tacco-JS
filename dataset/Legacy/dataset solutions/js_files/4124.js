"use strict";

function main(input) {
  input = input.split(/\n/);
  // const n = ~~input.shift()
  const n = ~~input[0];
  input = input.slice(1, input.length);
  input = input.map(v => v.split(/\s/).map(x => ~~x));

  let ans = "";
  for (let i = 0; i < input.length; i++) {
    let time = 0;
    let wait = 0;
    for (let j = i; j < input.length; j++) {
      /*to do : 運行間隔を考慮する*/
      if (time < input[j][1]) {
        //到着した駅の発車時刻が到着時刻より大きい

        time = input[j][1]; // 発車時刻を待つ
      } else if (time % inpiut[j][2] != 0) {
        time += input[j][2] - (time % inpiut[j][2]);
      }
      // time += (time > input[j][1]) ? 0 : input[j][1] - (time)
      time += input[j][0];
    }
    ans += time + "\n";
  }
  ans += "0";

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

4162;
4162;
4162;
0;
