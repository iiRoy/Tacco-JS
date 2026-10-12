'use strict'

let rect = [];

function Main(input) {
    const d = input.split('\n').map(v => v.split(' '));
    let s = d.shift();
    const W = Number(s[0]);
    const H = Number(s[1]);
    const N = Number(s[2]);

    rect = [];
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            rect[i] = Array(W).fill(0);
        }
    }
    for (let i = 0; i < N; i++) {
        switch (Number(d[i][2])) {
            case 1:
                draw(0, d[i][0], 0, H);
                break;
            case 2:
                draw(d[i][0], W, 0, H);
                break;
            case 3:
                draw(0, W, 0, d[i][1]);
                break;
            case 4:
                draw(0, W, d[i][1], H);
                break;
            default:
                break;
        }
    }
    console.log(rect)

    let result = 0;
    for (const arr of rect) {
        for (const v of arr) {
            if (v === 0) {
                result++
            }
        }
    }

    console.log(result);
}

function draw(xStart, xEnd, yStart, yEnd) {
    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            rect[y][x] += 1;
        }
    }
}


Main(require('fs').readFileSync('/dev/stdin', 'utf8'));