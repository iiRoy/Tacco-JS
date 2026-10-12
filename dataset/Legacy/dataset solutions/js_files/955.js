var h = [],hs = 0;
h[0] = new Array(2);
h[0][0] = -1;h[0][1] = -1;
 
function insert(key){
    h[++hs] = key;
 
    var i = hs;
 
    while(h[i][1] < h[Math.floor(i / 2)][1]){
        var ex = h[i];
        h[i] = h[Math.floor(i / 2)];
        h[Math.floor(i / 2)] = ex;
        i = Math.floor(i / 2);
    }
}
 
function extract(){
    if(hs <= 0)
        return;
 
    var ret = h[1];
 
    h[1] = h[hs--];
 
    i = 1;
    while((i * 2 <= hs && h[i][1] > h[i * 2][1]) || (i * 2 + 1 <= hs && h[i][1] > h[i * 2 + 1][1])){
        var l = i * 2;var r = i * 2;
        if(i * 2 + 1 <= hs)
            r++;
        var m = h[l][1] <= h[r][1] ? l : r;
        var ex = h[i];
        h[i] = h[m];
        h[m] = ex;
        i = m;
 
    }
    return ret;
}


function Main(input){
    input = input.split("\n");
    var n = parseInt(input[0],10);

    var graph = [];

    for(var i = 0;i < n;i++){
        graph[i] = new Array(n);
        input[i + 1] = input[i + 1].split(" ");
        for(var j = 0;j < n;j++){
            graph[i][j] = parseInt(input[i + 1][j + 1],10);
        }
    }

    var ans = [];

    for(var i = 0;i < n;i++){
        ans[i] = new Array(n);
        for(var j = 0;j < n;j++){
            ans[i][j] = -1;
        }
    }

    var count = 1;
    var fin = Array(n);
    for(var i = 0;i < n;i++)
        fin[i] = false;
    fin[0] = true;
    for(var i = 0;i < n;i++){
        if(graph[0][i] > -1){
            var a = [];a[0] = i;a[1] = graph[0][i];a[2] = 0;
            insert(a);
        }
    }

    while(count < n){
        var aa = extract();
        if(fin[aa[0]])
            continue;

        fin[aa[0]] = true;
        ans[aa[0]][aa[2]] = ans[aa[2]][aa[0]] = aa[1];
        count++;

        for(var i = 0;i < n;i++){
            if(graph[aa[0]][i] > -1){
                var a =[];a[0] = i;a[1] = graph[aa[0]][i];a[2] = aa[0];
                insert(a);
            }
        }
    }

    var sum = 0;

    for(var i = 0;i < n;i++){
        for(var j = 0;j < n;j++){
            if(i < j && ans[i][j] > -1)
                sum += ans[i][j];
        }
    }
    console.log(sum);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));