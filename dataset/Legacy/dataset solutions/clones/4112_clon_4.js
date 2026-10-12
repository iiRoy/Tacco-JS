"use strict";

class MaxHeap {
    constructor(values) {
        this.data = values.slice();
        for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i--) {
            this.down(i);
        }
    }

    down(index) {
        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            let best = index;

            if (left < this.data.length && this.data[left] > this.data[best]) {
                best = left;
            }
            if (right < this.data.length && this.data[right] > this.data[best]) {
                best = right;
            }
            if (best === index) {
                return;
            }

            const save = this.data[index];
            this.data[index] = this.data[best];
            this.data[best] = save;
            index = best;
        }
    }

    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.down(0);
        }
        return top;
    }

    get length() {
        return this.data.length;
    }
}

const solve = source => {
    const rows = source.trim().split("\n");
    const first = rows[0].split(" ");
    const count = parseInt(first[0]);
    let life = parseInt(first[1]);

    const weapons = rows.slice(1, count + 1).map(row => {
        const pieces = row.split(" ");
        return [parseInt(pieces[0]), parseInt(pieces[1])];
    });

    let slash = weapons[0][0];
    for (const pair of weapons) {
        if (pair[0] > slash) {
            slash = pair[0];
        }
    }

    const disposable = [];
    for (const pair of weapons) {
        if (pair[1] > slash) {
            disposable.push(pair[1]);
        }
    }

    const heap = new MaxHeap(disposable);
    let used = 0;

    while (heap.length > 0 && life > 0) {
        life -= heap.pop();
        used++;
    }

    if (life <= 0) {
        console.log(used);
        return;
    }

    console.log(used + Math.ceil(life / slash));
};

solve(require("fs").readFileSync("/dev/stdin", "utf8"));
