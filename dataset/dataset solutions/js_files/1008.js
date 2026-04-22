const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

const selectionSort = arr => {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
        let min = i;
        for (let j = i; j < arr.length; j++) {
            if (arr[j] < arr[min]) {
                min = j;
            }
        }
        const tmp = arr[i];
        arr[i] = arr[min];
        arr[min] = tmp;
        if (i !== min) count++;
    }
    
    console.log(arr.map(x => x.toString()).join(' '));

    return count;
}

console.log(selectionSort(line[1].split(' ').map(x => parseInt(x))));

