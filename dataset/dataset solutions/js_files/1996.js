function Main(input) {
    var sum  = function(arr) {
        var sum = 0;
        arr.forEach(function(elm) {
            sum += elm;
        });
        return sum;
    };
    var C = 1e+9 + 7;
    var C2 = 1e+5;
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    var N = parseInt(input[0][0], 10);
    var K = parseInt(input[0][1], 10);

    var vec_ruijoR = Array.from({length: Math.ceil(K)}, () => 0);
    var tmp;
    for (var i = 1; i <= K; i++){
        tmp = (K / i | 0);
        i = (K / tmp | 0);
        vec_ruijoR[i -1] = oldProduct = fastRuijoR(i, N, C, C2);
    }
    var vec_countPattern = Array.from({length: K}, () => 0);
    var limit;
    var ans = 0;
    for (var x = K; x >= 1; x --){
        limit = (K / x | 0);
        tmp = vec_ruijoR[limit - 1];
        for (var j = 2; j <= limit; j ++){
            tmp -= vec_countPattern[x * j - 1];
        }
        tmp = mod(tmp, C);
        ans += kakeruR(x, tmp, C, C2);
        // console.log("xa", x, ans);
        ans %= C;
        vec_countPattern[x - 1] = tmp;
    }
    console.log(ans);
}

function kakeruR(a, b, C, C2){
    var tmpQ, tmpR, ans;
    tmpQ =  (b / C2 | 0);
    tmpR =  b - (tmpQ * C2);
    ans = (a * tmpQ % C) * C2 % C + (a * tmpR);
    ans %= C;
    return ans;
}

function fastRuijoR(a, b, C, C2){
    var ans = 1;
    var binary = b.toString(2);
    var l = binary.length;
    var tmp = a;
    for (var i = 0; i < l; i++){
        if (binary.substr((i + 1) * -1, 1) == '1') ans = kakeruR(ans, tmp, C, C2);
    tmp = kakeruR(tmp, tmp, C, C2);
    }
    return ans;
}

function mod(i, j) {
    return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 