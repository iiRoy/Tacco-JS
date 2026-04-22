'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const N = +input[0].split(' ')[0];
const Ma = +input[0].split(' ')[1];
const Mb = +input[0].split(' ')[2];
const ABCs = input.slice(1).map(l => l.split(' ').map(Number));

let cost = [];
const maxA = 10;
const maxB = 10;
const maxC = 100;
for (let i = 0; i < N; i++) {
    cost[i] = [];
    for (let a = 1; a <= maxA * N; a++) {
        cost[i][a - 1] = [];
        for (let b = 1; b <= maxB * N; b++) {
            cost[i][a - 1][b - 1] = maxC * N + 1;
        }
    }
}

for (let i = 0; i < N; i++) {
    let a_i = ABCs[i][0];
    let b_i = ABCs[i][1];
    let c_i = ABCs[i][2];

    if (i == 0) {
        cost[i][a_i - 1][b_i - 1] = c_i;
        continue;
    }

    for (let a = 1; a <= maxA * N; a++) {
        if (a <= a_i) {
            for (let b = 1; b < maxB * N; b++) {
                cost[i][a - 1][b - 1] = cost[i - 1][a - 1][b - 1]
            }
            continue;
        }

        for (let b = 1; b <= maxB * N; b++) {
            if (b <= b_i) {
                cost[i][a - 1][b - 1] = cost[i - 1][a - 1][b - 1]
                continue;
            }

            cost[i][a - 1][b - 1] = Math.min(
                cost[i - 1][a - 1][b - 1],
                cost[i - 1][a - a_i - 1][b - b_i - 1] + c_i
            );
        }
    }
}

let answer = maxC * N;
let a = Ma;
let b = Mb;
while (a <= maxA * N && b <= maxB * N) {
    answer = Math.min(answer, cost[N - 1][a - 1][b - 1]);
    a += Ma;
    b += Mb;
}

console.log(answer == maxC * N + 1 ? -1 : answer);