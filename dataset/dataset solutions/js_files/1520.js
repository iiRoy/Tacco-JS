function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    let N = parseInt(input[0][0], 10);
    let X = parseInt(input[0][1], 10);
    let M = parseInt(input[0][2], 10);
    let v_amari = Array.from({length: M}, () => 0);
    let tmp = X;
    let ans = 0;
    let sum_syuki = 0;
    v_amari[tmp] = 1;
    for (let i = 2; i <= N; i ++){
        tmp = mod(Math.pow(mod(tmp, M), 2), M);
        if (v_amari[tmp] === 0) {
            v_amari[tmp] = i;
        } else {
            // console.log(v_amari[tmp]);
            let syuki = i - v_amari[tmp];
            // console.log(syuki);
            for (let j = 0; j < M; j++){
                if (v_amari[j] >= v_amari[tmp]) sum_syuki += j;
            }
            // console.log(sum_syuki);
            ans += Math.floor((N - v_amari[tmp] + 1) / syuki) * sum_syuki;
            // console.log(ans);
            N = (N - v_amari[tmp] + 1) %  syuki + v_amari[tmp] - 1;
            // console.log("N", N);
            // console.log(v_amari[tmp]);
            // if (N === v_amari[tmp]) {
            //     N += syuki;
            //     ans -= sum_syuki;
            // }
            // console.log("here", N, ans);
            // for (let j = 0; j < M; j++){
            //     if (v_amari[j] === N) {
            //         console.log(j);
            //         console.log(v_amari);
            //         return;
            //     }
            // }
            // console.log("syuki", syuki);
        }
    }
    for (let i = 0; i < M; i++){
        if (v_amari[i] > 0 && v_amari[i] <= N) {
            // console.log("i", i);
            ans += i;
        }
    }

    console.log(ans);
    

}

function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
