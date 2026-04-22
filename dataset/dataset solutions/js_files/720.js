var rt,rtodd;

function aaa(n,dp1){

    var m = 0,a = 1,b = 1,c = 1;
    rt = [];
    rt.push(0);
    while(a <= n){
        m++;
        rt.push(a);
        c++;b+=c;a+=b;
    }

    dp1[0] = [];
    dp1[0][0] = 0;

    for(var i = 1;i <= n;i++){
        dp1[0][i] = 1000000000;
    }
    for(var i = 1;i <= m;i++){

        if(i > 2)
            dp1[i - 2] = null;
        dp1[i] = [];
        for(var j = 0;j <= n;j++){
            if(j < rt[i])
                dp1[i][j] = dp1[i - 1][j];
            else
                dp1[i][j] = dp1[i - 1][j] < dp1[i][j - rt[i]] + 1 ? dp1[i - 1][j] : dp1[i][j - rt[i]] + 1;
        }
    }

    return m;
}



function bbb(n,dp2){

    var m = 0,a = 1,b = 1,c = 1;
    rtodd = [];
    rtodd.push(0);
    while(a <= n){
        if(a % 2){
            m++;
            rtodd.push(a);
        }
        c++;b+=c;a+=b;
    }

    dp2[0] = [];
    dp2[0][0] = 0;

    for(var i = 1;i <= n;i++){
        dp2[0][i] = 1000000000;
    }
    for(var i = 1;i <= m;i++){
        if(dp2[i] > 2)
            dp2[i - 2] = null;
        dp2[i] = [];
        for(var j = 0;j <= n;j++){
            if(j < rtodd[i])
                dp2[i][j] = dp2[i - 1][j];
            else
                dp2[i][j] = dp2[i - 1][j] < dp2[i][j - rtodd[i]] + 1 ? dp2[i - 1][j] : dp2[i][j - rtodd[i]] + 1;
        }
    }

    return m;
}
function Main(input){
    input = input.split("\n");
    var dp1 = [],dp2 = [];

    var m1 = aaa(1000000,dp1);var m2 = bbb(1000000,dp2);

    for(var i = 0;1;i++){
        var n = parseInt(input[i],10);
        if(n == 0)
            break;
        var a = dp1[m1][n];var b = dp2[m2][n];
        console.log(a,b);
    }
    
}


Main(require("fs").readFileSync("/dev/stdin","utf8"));