const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const csort = (arr) => {
    const k = arr.reduce((acc, x) => acc < x ? x : acc);
    const c = [...Array(k+1)].map(_ => 0);
    const result = [...Array(arr.length)];
    for (let i = 0; i < arr.length; i++) {
        c[arr[i]]++;
    }

    for (let i = 1; i <= k; i++) {
        c[i] += c[i-1];
    }
    
    for (let i = arr.length-1; i >= 0; i--) {
        result[c[arr[i]]-1] = arr[i];
        c[arr[i]]--;
    }

    return result;
};

const data = line[1].split(' ').map(Number);
console.log(csort(data).join(' '));

