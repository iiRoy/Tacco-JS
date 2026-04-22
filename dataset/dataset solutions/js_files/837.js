var dx = [1,1,1,0,0,-1,-1,-1];
var dy = [1,0,-1,1,-1,1,0,-1];

function judge(s,turn,ii,jj){
    var sum = 0;
    for(var i = 0;i < 8;i++){
        var su = 0;
        var x = jj + dx[i],y = ii + dy[i];
        while(x > 0 && x < 9 && y > 0 && y < 9){
            if(s[y][x] == turn){sum += su;break;}
            else if(s[y][x] == turn * (-1))su++;
            else
                break;
            x += dx[i];y += dy[i];
        }
    }
    return sum;
}

function put(s,turn,ii,jj){
    for(var i = 0;i < 8;i++){
        var su = 0;
        var x = jj + dx[i],y = ii + dy[i];
        var flag = false;
        while(x > 0 && x < 9 && y > 0 && y < 9){
            if(s[y][x] == turn){flag = true;break;}
            else if(s[y][x] == turn * (-1))su++;
            else
                break;
            x += dx[i];y += dy[i];
        }
        if(flag){
            var x = jj + dx[i],y = ii + dy[i];
            for(var j = 0;j < su;j++){
                s[y][x] = turn;
                x += dx[i];y += dy[i];
            }
        }
    }
    s[ii][jj] = turn;
}



function Main(input){
    input = input.split("\n");
    var s = [];
    for(var i = 1;i <= 8;i++){
        s[i] = [];
    }

    var fin = 0;

    for(var i = 1;i <= 8;i++){
        for(var j = 1;j <= 8;j++){
            if(input[i - 1][j - 1] == 'o'){
                fin++;
                s[i][j] = 1;
            }
            else if (input[i - 1][j - 1] == 'x'){
                fin++;
                s[i][j] = -1;
            }
            else
                s[i][j] = 0;
        }
    }

    var turn = 1;var aaa = false;

    while(fin < 64){
        var maxi = 0,imax = -1,jmax = -1;
        if(turn == 1){
            for(var i = 1;i <= 8;i++){
                for(var j = 1;j <= 8;j++){
                    if(s[i][j] == 0){
                        var a = judge(s,turn,i,j);
                        if(a > maxi){
                            maxi = a;imax = i;jmax = j;
                        }
                    }
                }
            }
        }else{
            for(var i = 1;i <= 8;i++){
                for(var j = 1;j <= 8;j++){
                    if(s[i][j] == 0){
                        var a = judge(s,turn,i,j);
                        if(a >= maxi){
                            maxi = a;imax = i;jmax = j;
                        }
                    }
                }
            }
        }

        if(maxi > 0){
            aaa = false;
            fin++;
            put(s,turn,imax,jmax);
        }else{
            if(aaa)
                break;
            aaa = true;
        }
        turn *= (-1);
    }

    for(var i = 1;i <= 8;i++){
        var ans = "";
        for(var j = 1;j <= 8;j++){
            if(s[i][j] == 1)
                ans += 'o';
            else if(s[i][j] == (-1))
                ans += 'x';
            else
                ans += '.';
        }
        console.log(ans);
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));