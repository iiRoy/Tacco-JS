'use strict'

function Main(input) {
    const tmp = input.split('\n');
    const N = tmp.shift();
    const T = tmp.shift().split(' ').map(v => Number(v));
    const M = tmp.shift();
    const PX = tmp.map(v => v.split(' ').map(v => Number(v)));
    // console.log(N, T, M, PX);

    let defaltTime = 0;
    for (const v of T) {
        defaltTime += v;
    }
    const result = [];
    for (const v of PX) {
        const diff = T[v[0] - 1] - v[1];
        const time = defaltTime - diff;
        result.push(time);
    }

    for(const v of result) {
        console.log(v);
    }

}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));