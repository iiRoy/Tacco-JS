var fin = [];

for(var i = 0;i < 50;i++)
    fin[i] = [];

var dx = [1,1,1,0,0,-1,-1,-1];
var dy = [1,0,-1,1,-1,1,0,-1];

function dfs(i,j,h,w,map){
    fin[i][j] = false;

    for(var k = 0;k < 8;k++){
        var ii = i + dx[k],jj = j + dy[k];
        if(ii >= 0 && ii < h && jj >= 0 && jj < w && map[ii][jj] == 1 && fin[ii][jj])
            dfs(ii,jj,h,w,map);
    }
}

function Main(input){
    input = input.split("\n");
    var k = 0;
    while(1){
        input[k] = input[k].split(" ");
        var w = parseInt(input[k][0],10);
        var h = parseInt(input[k++][1],10);

        if(w == 0 && h == 0)
            break;

        var map = [];

        for(var i = 0;i < h;i++){
            map[i] = [];
            input[k] = input[k].split(" ");
            for(var j = 0;j < w;j++)
                map[i][j] = parseInt(input[k][j],10);
            k++;
        }

        for(var j = 0;j < h;j++){
            for(var l = 0;l < w;l++)
                fin[j][l] = true;
        }
        sum = 0;
        while(1){
            var flag = true;
            for(var j = 0;j < h;j++){
                for(var l = 0;l < w;l++){
                    if(map[j][l] == 1 && fin[j][l]){
                        sum++;
                        flag = false;
                        dfs(j,l,h,w,map);
                    }
                }
            }
            if(flag)
                break;
        }
        console.log(sum);
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));