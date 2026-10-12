'use strict';

function Main(input) {
    let sc = new Scanner(input),
        a = sc.nextInt(),
        b = sc.nextInt(),
        c = sc.nextInt(),
        maxLen = Math.max(a, b, c),
        others = [],
        redHeight = Math.floor(maxLen / 2),
        blueHeight = maxLen - redHeight;

    if (a % 2 == 0 || b % 2 == 0 || c % 2 == 0) {
        console.log(0);
        return;
    }

    [ a, b, c ].forEach(i => {
        if (i < maxLen)
            others.push(i);
    });
    while (others.length < 2) {
        others.push(maxLen);
    }

    console.log(Math.abs(blueHeight - redHeight) * others[0] * others[1]);
}

class Scanner {
    constructor(input) {
        this.input = [];
        if (typeof input === 'string')
            this.input = input.trim().split(/\s+/);
        this.index = 0;
    }
    next() {
        return this.hasNext() ? this.input[this.index++] : null;
    }
    nextInt() {
        return this.hasNext() ? parseInt(this.input[this.index++], 10) : null;
    }
    hasNext() {
        return this.index < this.input.length;
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
