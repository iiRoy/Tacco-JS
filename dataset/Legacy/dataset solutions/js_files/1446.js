function Main (input) {
    var arr = input.trim().split(/\s|\n/).map(Number);
    while(1) {
        n = arr.shift();
        if(n == 0) break;
        a = new Array(n);
        sum = 0;
        v = 0;
        for(var i = 0; i < n; i++) {
            a[i] = arr.shift();
            sum += a[i];
        }
        sum /= n;
        for(var i = 0; i < n; i++) {
            v += Math.pow(a[i] - sum, 2);
        }
        console.log(Math.sqrt(v / n));
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));