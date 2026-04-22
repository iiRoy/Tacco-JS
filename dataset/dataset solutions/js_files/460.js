var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    main(input)
});

function main(input){
    var args = input.trim().split('\n');

    var i = 0;
    while(true) {
        var map = [];
        var wh = splitNum(args[i++]);
        if(isEnd(wh)) break;
        initMap(wh, map);

        var startXY = splitNum(args[i++]);
        var goalXY = splitNum(args[i++]);

        var blockCount = parseInt(args[i++]);
        for(var j = 0; j < blockCount; j+=1){
            var block = splitNum(args[i++]);
            putBlock(map, block);
        }

        var res = isReachable(map, startXY[0]-1, startXY[1]-1, goalXY[0]-1, goalXY[1]-1);
        console.log(res ? "OK" : "NO");
    }
}

function initMap(wh, map){
    for(var x = 0; x < wh[0]; x+=1){
        var buff = [];
        for(var y = 0; y < wh[1]; y += 1){
            buff.push(0);
        }
        map.push(buff);
    }
}

function putBlock(map, block){
    var isHorizontal = !block[1];
    var bw = isHorizontal ? 4 : 2;
    var bh = isHorizontal ? 2 : 4;
    var x = block[2]-1;
    var y = block[3]-1;

    for(var mx = x; mx < x + bw; mx += 1){
        for(var my = y; my < y + bh; my += 1){
            map[mx][my] = block[0];
        }
    }
}

function isReachable(map, nowX, nowY, goalX, goalY){
    if(nowX === goalX && nowY === goalY){
        return true;
    }
    var color = map[nowX][nowY];
    map[nowX][nowY] = -2;

    var flag = false;
    [-1, 1].forEach(function(dx){
        [-1, 1].forEach(function(dy){
            var cx = nowX + dx, cy = nowY + dy;
            if(map[cx] && map[cx][cy] === color){
                flag = flag || isReachable(map, cx, cy, goalX, goalY);
            }
        })
    });
    return flag;
}

function splitNum(str){
    return str.split(' ').map(Number);
}

function isEnd(arr){
    return arr[0] === 0 && arr[1] === 0;
}