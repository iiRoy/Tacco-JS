// ABC157 B - Checkpoints
'use strict';

function Main(input) {
    const tmp = input.trim().split('\n');
    const NM = tmp[0].split(' ');
    const N = Number(NM[0]);
    const M = Number(NM[1]);
    let students = tmp
        .slice(1, N + 1)
        .map((v) => v.split(' ').map((v) => Number(v)));
    const checkpoints = tmp
        .slice(N + 1)
        .map((v) => v.split(' ').map((v) => Number(v)));
    // console.log(N, M, students, checkpoints);

    for (const student of students) {
        let point = -1
        let near = Number.MAX_VALUE;
        for (let i = 0; i < M; i++) {
            const d = distance(student, checkpoints[i]);
            if (d < near) {
                near = d;
                point = i + 1;
            }
        }
        console.log(point);
    }

    return;
}

function distance(a, b) {
    return Math.abs(a[0]- b[0]) + Math.abs(a[1] - b[1]);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
