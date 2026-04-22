"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.trim().split(/ |\n/), cid = 0;

function main() {
    let N = +cin.shift();
    let M = +cin.shift();
    let A;
    let B;
    let possible = Array(N + 1);
    for (let i = 0; i < N + 1; i++)possible[i] = [];
    for (let i = 0; i < M; i++) {
        A = +cin.shift();
        B = +cin.shift();
        possible[A].push(B);
        possible[B].push(A);
    }
    //    console.log({ possible });
    let ans = Array(N + 1);
    ans[0] = "Yes";
    let remain = Array(N + 1).fill(true); //計算未完了の部屋
    remain[1] = false;
    let remainNum = N - 1;
    let front = [1];
    while (remainNum > 0) {
        //console.log({ front });
        let next = [];
        front.forEach(v => {
            possible[v].forEach(vv => {
                if (remain[vv]) {
                    ans[vv] = v;
                    remain[vv] = false;
                    remainNum--;
                    next.push(vv);
                }
            });
        });
        //console.log({ next, ans });
        front = next;
    }
    ans.splice(1, 1); // indexがずれているので調整。
    console.log(ans.join("\n"));
}
main();