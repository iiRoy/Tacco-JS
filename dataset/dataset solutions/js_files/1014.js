const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

let cnt = 0;

const isort = (arr, g) => {
    for (let i = g; i < arr.length; i++) {
        const v = arr[i];
        let j = i - g;
        while (j >= 0 && arr[j] > v) {
            arr[j+g] = arr[j];
            j -= g;
            cnt++;
        }
        arr[j+g] = v;
    }
};

const shellSort = (arr) => {

    const g = [1];
    for (let i = 1; i < arr.length; i++) {
        const g_i = 3 * g[i-1] + 1;
        if (g_i > arr.length) break;
        g.push(g_i);
    }

    console.log(g.length);
    console.log(g.reverse().map(x => x.toString()).join(' '));

    for (let i = 0; i < g.length; i++) {
        isort(arr, g[i]);
    }

    return arr;
};

const n = parseInt(line[0]);
const data = line.slice(1, n+1).map(x => parseInt(x));
const sorted = shellSort(data);

console.log(cnt);
console.log(sorted.map(x => x.toString()).join('\n'));

