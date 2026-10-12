function main(_stdin) {
    const stdin = _stdin.split('\n');
    const len = Number(stdin.shift());
    const arr = stdin.shift().split(' ').map(Number);

    let count = 0;
    let sorted = 0;
    let flag =  1;
    while (flag) {
        flag = 0;

        for (let i = len - 1; i > sorted; i--) {
            if (arr[i] < arr[i - 1]) {
                const t = arr[i];
                arr[i] = arr[i - 1];
                arr[i - 1] = t;
                flag = 1;
                count++;
            }
        }
        sorted++;
    }
    console.log(arr.join(' '));
    console.log(count);
}


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

