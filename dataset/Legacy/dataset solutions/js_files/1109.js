function Main(input){
    input = input.split("\n");
    var n = parseInt(input[0],10);
    input[1] = input[1].split(" ");
    var h = new Array(n + 1);

    for(var i = 0;i < n;i++){
        h[i + 1] = parseInt(input[1][i],10);
    }

    for(var i = 1;i <= n;i++){
        var ans = "node " + i + ": key = " + h[i] + ", ";
        if(i > 1)
            ans += "parent key = " + h[Math.floor(i / 2)] + ", ";
        if(i * 2 <= n)
            ans += "left key = " + h[i * 2] + ", ";
        if(i * 2 + 1 <= n)
            ans += "right key = " + h[i * 2 + 1] + ", ";
        console.log(ans);
    }
}
 
Main(require("fs").readFileSync("/dev/stdin","utf8"));