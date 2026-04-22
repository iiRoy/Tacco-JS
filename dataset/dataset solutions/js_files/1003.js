const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

let count = 0;

const bubbleing = (n, arr) => {
    if (arr.length === 0) return [n];
    const head = arr[0];
    const tail = arr.slice(1);

    if (n < head) return [n].concat(bubbleing(head, tail));
    else {
        count++;
        return [head].concat(bubbleing(n, tail));
    }
};

const bsort = arr => {
    if (arr.length <= 1) return arr;
    const head = arr[0];
    const tail = arr.slice(1);
    return bubbleing(head, bsort(tail));
};

console.log(bsort(line[1].split(' ').map(x => parseInt(x))).join(' '));
console.log(count);

