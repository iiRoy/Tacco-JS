'use strict'

function Main(input) {
    const tmp = input.trim().split('\n')
    const N = Number(tmp[0])
    const T = tmp[1].split(' ').map(v => Number(v));
    const M = Number(tmp[2])
    const PX = tmp.splice(3)
    // console.log(N, T, M, PX);

    let defaltTime = 0;
    for (const v of T) {
        defaltTime += v;
    }

    for (const v of PX) {
        const tmp = v.split(' ').map(v => Number(v));
        const diff = T[tmp[0] - 1] - tmp[1];
        const time = defaltTime - diff;
        console.log(time);
    }

}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));