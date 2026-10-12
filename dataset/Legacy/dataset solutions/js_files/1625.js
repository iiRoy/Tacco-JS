'use strict';

function Main(input) {
    const K = Number(input.trim().split('\n')[0]);
    console.log(K);

    const exclusion = [0, 2, 4, 5, 6, 8];
    for (const ex of exclusion) {
        if (K % 10 === ex) {
            console.log('-1');
            return;
        }
    }

    // 1の位が1, 3, 7, 9
    // for (let i = 0; i < K; i++) {
    //     if ((K * i) % 10 !== 7) continue;
    // }

    return;
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));