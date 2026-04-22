var dx = { N: 0, S: 0, E: 1, W: -1};
var dy = { N: 1, S: -1, E: 0, W: 0};

function Main(input){
    input = input.split("\n");
    var k = 0;
    while(1){
        var n = parseInt(input[k++],10);

        if(n == 0)
            break;

        var a = [];
        for(var i = 0;i <= 20;i++){
            a[i] = [];
            for(var j = 0;j <= 20;j++)
                a[i][j] = false;
        }
        for(var i = 0;i < n;i++){
            input[k] = input[k].split(" ");
            a[parseInt(input[k][0],10)][parseInt(input[k++][1],10)] = true;
        }

        var m = parseInt(input[k++],10);

        var op = [],dis = [];

        for(var i = 0;i < m;i++){
            input[k] = input[k].split(" ");
            op[i] = input[k][0];
            dis[i] = parseInt(input[k++][1],10);
        }

        var get = 0;

        var x = 10,y = 10;
        if(a[x][y]){
            a[x][y] = false;get++;
        }

        for(var i = 0;i < m;i++){
            for(var j = 0;j <dis[i];j++){
                x += dx[op[i]];
                y += dy[op[i]];
                if(a[x][y]){
                    a[x][y] = false;get++;
                }
            }
        }
        if(get == n)
            console.log("Yes");
        else
            console.log("No");
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));