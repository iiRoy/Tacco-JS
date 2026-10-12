function MainC(input){
    const N = Number(input);
    const num = N*N - N;
    console.log(num % (10**9+7));
}
MainC(require("fs").readFileSync("/dev/stdin", "utf8").trim());
