function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    let X = parseInt(input[0][0], 10);
    let K = parseInt(input[0][1], 10);
    let D = parseInt(input[0][2], 10);
    
    let tmp = Math.floor(Math.abs(X) / D);
    
    let ans;

    if (K <= tmp){
        ans = Math.abs(X) - D * K;
    } else {
        if ((K - tmp) % 2 === 0){
            ans = Math.abs(X) - D * tmp;
        } else {
            ans = Math.abs(X) - D * tmp;
            ans = D - ans;
        }
    }

    console.log(ans);

}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
