var k = 0;
 
function route90(x,y,m){
    for(var i = 1;i <= m;i++){
        var a = x[i];
        var b = y[i] == 0 ? 0 : y[i] * (-1);
        x[i] = b;
        y[i] = a;
    }
}
 
 
function inline(x,y,n,m,input){
 
    m[n] = parseInt(input[k++],10);
    x[n] = [];y[n] = [];
    for(var i = 1;i <= m[n];i++){
        input[k] = input[k].split(" ");
        x[n][i] = parseInt(input[k][0],10);
        y[n][i] = parseInt(input[k++][1],10);
        if(i > 1){
            x[n][i] -= x[n][1];
            y[n][i] -= y[n][1];
        }
    }
    x[n][1] = y[n][1] = 0;
 
    if(y[n][2] > 0)
        route90(x[n],y[n],m[n]);
    if(x[n][2] < 0)
        route90(x[n],y[n],m[n]);
    if(y[n][2] < 0)
        route90(x[n],y[n],m[n]);
}
 
function inv(x,y,m){
    var x1 = [],y1 = [];
    for(var i = 1;i <= m;i++){x1[i] = x[i];y1[i] = y[i];}
 
    for(var i = 1;i <= m;i++){
        x[i] = x1[m - i + 1] - x1[m];
        y[i] = y1[m - i + 1] - y1[m];
    }
 
    if(y[2] > 0)
        route90(x,y,m);
    if(x[2] < 0)
        route90(x,y,m);
    if(y[2] < 0)
        route90(x,y,m);
 
}
 
function Main(input){
    input = input.split("\n");

    while(1){
        var n = parseInt(input[k++],10);
        if(n == 0)
            break;
        var m = [];
        var x = [],y = [];
        for(var i = 0;i <= n;i++)
            inline(x,y,i,m,input);
 
        for(var i = 1;i <= n;i++){
            if(m[0] == m[i]){
                var flag = true;
                for(var j = 1;j <= m[0];j++){
                    if(x[0][j] != x[i][j] || y[0][j] != y[i][j]){
                        flag = false;break;
                    }
                }
                if(flag)
                    console.log(i);
                else{
                    inv(x[i],y[i],m[i]);
                    var flag = true;
                    for(var j = 1;j <= m[0];j++){
                        if(x[0][j] != x[i][j] || y[0][j] != y[i][j]){
                            flag = false;break;
                        }
                    }
                    if(flag)
                        console.log(i);
 
                }
            }
        }

        console.log("+++++");
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));