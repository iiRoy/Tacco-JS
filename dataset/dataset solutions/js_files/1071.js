function main(_stdin) {
    const stdin = _stdin.trim().split('\n');
    const n = Number(stdin.shift());
    const A = stdin.shift().split(' ').map(Number);

    const a = partition(A, 0, n);
    console.log(a.join(' '));
}

function partition(A, left, right) {
    let x = A[right - 1];
    let lower = left;
    for (let i = left, l = right - 1; i < l; i++) {
        if (A[i] <= x) {
            let t = A[i];
            A[i] = A[lower];
            A[lower] =t;
            lower++;
        }
    }
    t = A[lower];
    A[right - 1] = t;
    x = `[${x}]` ;
    A[lower] = x;
    return A;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

