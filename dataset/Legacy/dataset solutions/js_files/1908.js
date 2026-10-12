"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/), cid = 0;

var myOut = main();
if (myOut !== undefined) console.log(myOut);

function main() {
    //console.log(cin);
    //   cin = cin.map(i => +i);
    let n = +cin.shift();
    let B = cin.map((v, i) => +v + i).sort((i, j) => i - j);
    let C = cin.map((v, i) => i - v).sort((i, j) => i - j);
    //console.log({ B });
    //console.log({ C });
    let i = 0;
    let j = 0;
    let ans = 0;
    while (i < n && j < n) {

        let ni = i + 1;
        while (ni < n && B[i] == B[ni]) {
            ni++;
        }
        let nj = j + 1;
        while (nj < n && C[j] == C[nj]) {
            nj++;
        }
        if (B[i] == C[j]) {
            ans += (ni - i) * (nj - j);
            i = ni;
            j = nj;
        } else if (B[i] < C[j]) {
            i = ni;
        } else if (B[i] > C[j]) {
            j = nj;
        }

        //console.log({ i, j, ni, nj, ans });
    }




    return ans;
}