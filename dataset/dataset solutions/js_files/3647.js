"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let S = cin.getStr();
    let N = S.length;
    const ABC = "ABC";
    const MOD = 1e9 + 7;
    let dp = new Array(N + 1).fill(0).map(() => new Array(3 + 1).fill(0));
    for (let i = N; i >= 0; --i) {
        for (let j = 3; j >= 0; --j) {
            if (i == N) {
                dp[i][j] = (j == 3 ? 1 : 0);
            } else {
                dp[i][j] = dp[i + 1][j] * (S[i] == '?' ? 3 : 1);
                if (j < 3 && (S[i] == '?' || S[i] == ABC[j])) {
                    dp[i][j] += dp[i + 1][j + 1];
                }
                dp[i][j] %= MOD;
            }
        }
    }
    console.log(dp[0][0]);
}
class Inputer{constructor(t){this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
