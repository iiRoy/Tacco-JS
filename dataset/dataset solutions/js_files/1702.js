function Main(input) {
    var C = 1e+9 + 7;
    var C2 = 1e+5;
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    var N = parseInt(input[0][0], 10);
    var K = parseInt(input[0][1], 10);
    var vec_A = input[1].map(e => parseInt(e, 10));
    vec_A.sort((a, b) => Math.abs(b) - Math.abs(a));

    var ans = calc(vec_A, N, K, C, C2);
    console.log(mod(ans, C));

}

function calc(vec_A, N, K, C, C2){
    var ans = 1;
    var minusCount = 0;
    var minPlus;
    var minMinus;
    for (var i = 0; i < K; i++){
        ans = kakeruR(ans, vec_A[i], C, C2);
        if (ans === 0) return 0
        if (vec_A[i] > 0) minPlus = i;
        if (vec_A[i] < 0) {
            minMinus = i;
            minusCount ++;
        }
    }
    if (K === N) return ans;
    if (minusCount % 2 === 0) return ans;

    if (minusCount < K) {
        // console.log("here", minMinus, minPlus);
        var tmp01 = [0, 0, -1];
        var tmp02 = [0, 0, -1];
        for (var i = K; i < N; i++){
            if (vec_A[i] < 0){
                tmp01 = [vec_A[i], vec_A[minPlus], i];
                break;
            }
        }
        for (var i = K; i < N; i++){
            if (vec_A[i] > 0){
                tmp02 = [vec_A[i], vec_A[minMinus], i];
                break;
            }
        }
        if (tmp02[2] === -1){
            vec_A.splice(K, tmp01[2] - K);
            vec_A.splice(minPlus, 1);
        } else if (tmp01[2] === -1){
            vec_A.splice(K, tmp02[2] - K);
            vec_A.splice(minMinus, 1);
        } else if (BigInt(tmp01[0]) * BigInt(tmp02[1]) >= BigInt(tmp02[0]) * BigInt(tmp01[1])){
            vec_A.splice(K, tmp01[2] - K);
            vec_A.splice(minPlus, 1);
        } else {
            vec_A.splice(K, tmp02[2] - K);
            vec_A.splice(minMinus, 1);
        }
        // console.log(vec_A);
        
        ans = 1;
        for (var i = 0; i < K; i++){
            ans = kakeruR(ans, vec_A[i], C, C2);
            if (ans === 0) return 0
        }
        return ans;
    } else {
        // console.log("there");
        for (var i = K; i < N; i++){
            if (vec_A[i] >= 0){
                vec_A.splice(K, i - K);
                vec_A.splice(minMinus, 1);
                ans = 1;
                for (var i = 0; i < K; i++){
                    ans = kakeruR(ans, vec_A[i], C, C2);
                    if (ans === 0) return 0
                }   
                return ans;
            }
        }
        // console.log("reached?");
        ans = 1;
        for (var i = N - 1; i >= (N - K); i--){
            ans = kakeruR(ans, vec_A[i], C, C2);
        }
        return ans;
    }
}

function kakeruR(a, b, C, C2){
	var tmpQ, tmpR, ans;
  	tmpQ =  (b / C2 | 0);
    tmpR =  b - (tmpQ * C2);
    ans = (a * tmpQ % C) * C2 % C + (a * tmpR);
  	ans %= C;
  return ans;
}

function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 