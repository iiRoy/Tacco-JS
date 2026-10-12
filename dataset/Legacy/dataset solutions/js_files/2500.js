function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)>>1]<e?a=c:b=c;return d[a]<e?b:a};

function compareNumbers(a, b) { //for sort
    return a-b;
}

function Main(arg) {
 
    var N = arg.split("\n")[0]-0;
    var L = arg.split("\n")[1].split(" ").map(v=>v-0);
 
    var ans = 0;

    var a, b, c;
    L.sort(compareNumbers);
    for (var i = 0; i < N - 2; i++){
        a = L[i];
        for (var j = i+1; j < N - 1; j++){
            b = L[j];
            var tmp = lower_bound(L, j + 1, N, a + b) - 1;
            ans += (tmp - j);
        }
    }


    console.log(ans)

    return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));