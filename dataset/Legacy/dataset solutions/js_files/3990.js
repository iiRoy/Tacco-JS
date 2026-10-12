'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ').map(n => Number(n));

  const N = s[0];
  const M = s[1];

  let ans = Math.abs(N - 2) * Math.abs(M - 2);
  
  if (ans > Number.MAX_SAFE_INTEGER) {

    // 積がMAX_SAFE_INTEGERを越える場合、配列にして筆算で解く
    const multi_biggerInt = (a, b) => {
      const num1 = String(a).split('').map(n => Number(n)).reverse();
      const num2 = String(b).split('').map(n => Number(n)).reverse();

      // 各桁の配列
      let ans = [...Array(num1.length + num2.length)].fill(0);

      // 桁上がり
      const checkCarry = () => {
        for (let i = 0; i < ans.length; i++) {
          if (ans[i] >= 10) {
            const upper = Number(String(ans[i]).split('')[0]);
            const lower = Number(String(ans[i]).split('')[1]);

            ans[i - 1] += upper;
            ans[i] = lower;
          }
        }
      }

      // 筆算
      for (let i = 0; i < num1.length; i++) {
        for (let j = 0; j < num2.length; j++) {
          const pro   = num1[i] * num2[j];
          const digit = ans.length - (i + j) - 1;

          ans[digit] += pro;
          checkCarry();
        }
      }

      // 有効桁のみ抜き出す
      for (let i = 0; i < ans.length; i++) {
        if (ans[i] !== 0) {
          ans = ans.slice(i);
          break;
        }
      }

      // 文字列として返す
      return ans.join('');
    }

    ans = multi_biggerInt(Math.abs(N - 2), Math.abs(M - 2));
  }

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
