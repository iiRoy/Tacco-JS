"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.trim().split(/ |\n/), cid = 0;

function main() {
    let N = +cin.shift();
    let A = cin.map(x => +x);
    let node = Array(N + 1);
    let ans = 1;
    node[0] = 1;
    for (let d = 0; d < N; d++) {
        node[d + 1] = (node[d] - A[d]) * 2;
        if (node[d + 1] > 0) {
            ans += node[d + 1];
        } else {
            console.log(-1);
            return;
        }
    }
    //console.log(ans);
    if (node[N] < A[N]) {
        console.log(-1);
    } else if (node[N] == A[N]) {
        console.log(ans);
    } else {
        // node[d] が多すぎた場合。枝を逆に減らしていく必要がある。
        let over = Array(N + 1);
        let nodemax = Array(N + 1);
        nodemax[N] = A[N];
        for (let d = N; d > 0; d--) {
            //console.log({ d, A, node, nodemax, ans });
            if (nodemax[d] >= node[d]) {
                nodemax[d - 1] = node[d] + A[d - 1];
            } else {
                over[d] = node[d] - nodemax[d]; // d層目で多すぎた葉
                ans = ans - over[d];
                nodemax[d - 1] = nodemax[d] + A[d - 1];
            }
        }
        if (nodemax[0] < node[0]) {
            ans = ans - node[0] + nodemax[0];
        }
        console.log(ans);
    }
}
main();

