const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const maxHeapify = (arr, i) => {
    const l = i * 2;
    const r = l + 1;
    let max;

    if (l <= arr.length && arr[l-1] > arr[i-1]) {
        max = l;
    } else {
        max = i;
    }
    if (r <= arr.length && arr[r-1] > arr[max-1]) {
        max = r;
    }

    if (max !== i) {
        const tmp = arr[i-1];
        arr[i-1] = arr[max-1];
        arr[max-1] = tmp;
        maxHeapify(arr, max);
    }

};

const insert = (arr, n) => {
    arr.push(n);
    const helper = (i) => {
        if (i <= 1) return;
        const parentIndex = Math.floor(i/2);
        if (arr[i-1] > arr[parentIndex-1]) {
            const tmp = arr[i-1];
            arr[i-1] = arr[parentIndex-1];
            arr[parentIndex-1] = tmp;
            helper(parentIndex);
        }
    };
    helper(arr.length);
};

const extract = arr => {
    const n = arr.shift();
    arr.unshift(arr.pop());
    maxHeapify(arr, 1);
    return n;
};

const data = line.reduce((acc, x) => {
    const cmd = x.split(' ');
    switch(cmd[0]) {
        case 'insert':
            insert(acc, Number(cmd[1]));
            break;
        case 'extract':
            console.log(extract(acc));
            break;
    }
    return acc;
}, []);

