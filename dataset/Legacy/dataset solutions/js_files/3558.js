'use strict';

const main = (input) => {
    const t = input.split('\n');
    const hw = t[0].split(' ');
    const H = parseInt(hw[0], 10);
    const W = parseInt(hw[1], 10);
    const a = [];
    for (let y = 0; y < H; y++) {
        a[y] = [];
        const l = t[y + 1].split(' ');
        for (let x = 0; x < W; x++) {
            a[y][x] = parseInt(l[x], 10);
        }
    }
    const log = [];
    const move = function (sx, sy, ex, ey) {
        log.push([sy + 1, sx + 1, ey + 1, ex + 1].join(' '));
        a[ey][ex]++;
        a[sy][sx]--;
    };

    // 奇数の場合は隣に移動していくのを繰り返す
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (a[y][x] % 2 != 0) {
                // 奇数
                if (x + 1 < W) {
                    // 右へ
                    move(x, y, x + 1, y);
                } else if (y + 1 < H) {
                    // 下へ
                    move(x, y, x, y + 1);
                }
            }
        }
    }
    console.log(log.length);
    console.log(log.join('\n') + '\n');
};

const isTest = false;

if (isTest) {
    main('2 3\n1 2 3\n0 1 1\n');
} else {
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}