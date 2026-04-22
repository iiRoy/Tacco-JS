function aaa(n){

    var m = 0,a = 1,b = 1,c = 1;
    var rtodd = [];
    rtodd.push(0);
    while(a <= n){
        m++;
        rtodd.push(a);
        c++;b+=c;a+=b;
    }

    var dp = [];
    dp[0] = [];
    dp[0][0] = 0;

    for(var i = 1;i < 5;i++)
        dp[i] = [];
    for(var i = 1;i <= n;i++){
        dp[0][i] = 1000000000;
    }
    for(var iii = 1;iii <= m;iii++){
        var i = iii % 5;
        var ii = i - 1;
        if(ii < 0)
            ii = 4;
        for(var j = 0;j <= n;j++){
            if(j < rtodd[i])
                dp[i][j] = dp[ii][j];
            else
                dp[i][j] = dp[ii][j] < dp[i][j - rtodd[i]] + 1 ? dp[ii][j] : dp[i][j - rtodd[i]] + 1;
        }
    }

    m %= 5;

    return dp[m][n];
}



function bbb(n){

    var m = 0,a = 1,b = 1,c = 1;
    var rtodd = [];
    rtodd.push(0);
    while(a <= n){
        if(a % 2){
            m++;
            rtodd.push(a);
        }
        c++;b+=c;a+=b;
    }

    var dp = [];
    dp[0] = [];
    dp[0][0] = 0;

    for(var i = 1;i < 5;i++)
        dp[i] = [];
    for(var i = 1;i <= n;i++){
        dp[0][i] = 1000000000;
    }
    for(var iii = 1;iii <= m;iii++){
        var i = iii % 5;
        var ii = i - 1;
        if(ii < 0)
            ii = 4;
        for(var j = 0;j <= n;j++){
            if(j < rtodd[i])
                dp[i][j] = dp[ii][j];
            else
                dp[i][j] = dp[ii][j] < dp[i][j - rtodd[i]] + 1 ? dp[ii][j] : dp[i][j - rtodd[i]] + 1;
        }
    }

    m %= 5;

    return dp[m][n];
}
function Main(input){
    input = input.split("\n");

    for(var i = 0;1;i++){
        var n = parseInt(input[i],10);
        if(n == 0)
            break;
        console.log(aaa(n),bbb(n));
    }
    
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));