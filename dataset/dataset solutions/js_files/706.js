function Main(input){
    input = input.split("\n");
    var k = 0;
    while(1){
        input[k] = input[k].split(" ");
        var n = parseInt(input[k][0],10);
        var m = parseInt(input[k++][1],10);
        if(n == 0 && m == 0)
            break;
        var t = [],h = [],tsum = 0,hsum = 0;

        for(var i = 0;i < n;i++){
            t[i] = parseInt(input[k++],10);
            tsum += t[i];
        }
        for(var i = 0;i < m;i++){
            h[i] = parseInt(input[k++],10);
            hsum += h[i];
        }
        if((tsum + hsum) % 2){
            console.log("-1");
            continue;
        }
        var flag = true;
        for(var i = 0;i < n;i++){
            for(var j = 0;j < m;j++){
               if(tsum - t[i] + h[j] == hsum + t[i] - h[j]){
                   flag = false;
                   console.log(t[i] + " " + h[j]);
                   break;
               }
            }
            if(!flag)
                break;
        }
        if(flag)
            console.log("-1");
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));