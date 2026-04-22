'use strict';

function Main(input) {
    const tmp = input.trim().split('\n');
    const D = Number(tmp[0]);
    const C = tmp[1].split(' ').map((v) => Number(v));
    const S = tmp
        .slice(2, 2 + D)
        .map((v) => v.split(' ').map((v) => Number(v)));

    let LastContestDays = Array(26).fill(0); // コンテストの種類ごとの最終開催日
    let currnetContestLebels = Array(26).fill(0); // ある開催日のコンテストごとの満足度
    let lebelDrops = Array(26).fill(0); // ある開催日のコンテストごとの満足低下量

    for (let i = 1; i <= D; i++) {
        for (let j = 0; j < C.length; j++) {
            lebelDrops[j] = C[j] * (i - LastContestDays[j]) * -1;
        }
        for (let k = 0; k < C.length; k++) {
            const l = [...lebelDrops];
            l[k] = S[i - 1][k];
            const lr = l.reduce((acc, cur) => acc + cur);
            currnetContestLebels[k] = lr;
            // currnetContestLebels[k] += S[i - 1][k] + drop - lebelDrops[k];
        }
        let openContestNo = 0;
        let maxLebel = 0;
        for (let m = 0; m < C.length; m++) {
            if (maxLebel < currnetContestLebels[m]) {
                maxLebel = currnetContestLebels[m];
                openContestNo = m;
            }
        }
        LastContestDays[openContestNo] = i;
        console.log(openContestNo + 1);
    }

    return;
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));