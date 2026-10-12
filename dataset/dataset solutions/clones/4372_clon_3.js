const input = require("fs").readFileSync("/dev/stdin", "utf8");

(function(input) {
    const lines = input.trim().split('\n');
    const N = Number(lines[0]);

    const A = {};
    let count = 0;

    for (let i = 1; i <= N; i++) {
        const key = lines[i];

        if (A[key]) {
            A[key] = 0;
            count--;
        } else {
            A[key] = 1;
            count++;
        }
    }

    Object.keys(A).forEach(function(k) {
        if (A[k] !== 0 && A[k] !== 1) {
            A[k] = 0;
        }
    });

    console.log(count);
})(input);