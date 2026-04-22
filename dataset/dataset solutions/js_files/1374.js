function Main (input) {
    var lines = input.split("\n");
    while(1) {
        nx = lines.shift().split(" ").map(Number);
        n = nx[0]; x = nx[1];
        if(n == 0) break;
        cnt = 0
        for(var i = 1; i < n-2; i++) {
            for(var j = i+1; j < n-1; j++) {
                k = x - j - i
                if(j + 1 <= k && k <= n) cnt++;
            }
        }
        console.log(cnt);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));