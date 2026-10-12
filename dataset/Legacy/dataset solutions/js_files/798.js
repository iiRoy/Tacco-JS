function Main(input){
    input = input.split("\n");
    var k = 0;
    while(1){
        input[k] = input[k].split(" ");
        var n = parseInt(input[k][0],10);
        var m = parseInt(input[k++][1],10);
        if(n == 0 && m == 0)
            break;

        var h = [],w = [];

        h[0] = 0;w[0] = 0;
        for(var i = 1;i <= n;i++)
            h[i] = parseInt(input[k++],10) + h[i - 1];
        for(var i = 1;i <= m;i++)
            w[i] = parseInt(input[k++],10) + w[i - 1];

        var edgeh = [],edgew = [];

        for(var i = 0;i <= 1000;i++)
            edgeh[i] = edgew[i] = 0;

        for(var i = 0;i <= n;i++)
            for(var j = i + 1;j <= n;j++)
                edgeh[h[j] - h[i]]++;
        for(var i = 0;i <= m;i++)
            for(var j = i + 1;j <= m;j++)
                edgew[w[j] - w[i]]++;

        var ans = 0;

        for(var i = 1;i <= 1000;i++)
            ans += edgeh[i] * edgew[i];

        console.log(ans);
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));