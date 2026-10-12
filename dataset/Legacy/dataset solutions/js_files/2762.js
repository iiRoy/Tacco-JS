const Main = input => {
    input = input.split("\n");
    tmp1 = input[0].split(" ");
    const N = parseInt(tmp1[0], 10);
    const D = parseInt(tmp1[1], 10);
    let X = [];
    for(let i = 0; i < N; i++) {
        X[i] = input[i + 1].split(" ");
    }

    let count = 0;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (i === j) {
                break;
            } else {
                let diff = [];
                let value = 0;
                for (let k = 0; k < D; k++) {
                    diff[k] = Math.pow(X[i][k] - X[j][k], 2);
                }
                value = Math.sqrt(diff.reduce((total, data) => {return total + data}));
                if (Number.isInteger(value)){count++;}
            }
        }
    }
    console.log(count);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
