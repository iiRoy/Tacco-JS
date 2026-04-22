//解説参照済み

function main(input = "") {
    const lines = input.split("\n");
    const _K = 0 | lines[0].split(" ")[1];
    const arr = lines[1].split(" ").map((v) => 0 | v);

    let l = 1;
    let r = arr.reduce((a, b) => { return Math.max(a, b) });
    let mid = 0 | (r + l) * 0.5;
    let res = r;
    while (l <= r) {

        let k = 0;
        arr.forEach((v) => {
            let d = 0 | v / mid;
            if (v === d * mid) { d--; }
            k += d;
        })

        if (k <= _K) {
            res = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
        mid = 0 | (r + l) * 0.5;
    }
    return res;
}


//******************************
exports.main = main;

function Main(input) {
    console.log(main(input.trim()));
}

if (process.argv[2] !== "test") {
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}