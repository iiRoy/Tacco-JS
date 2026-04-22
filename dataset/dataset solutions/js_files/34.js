var MIN = 0,
    MAX = 9;
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on("data",function(chunk){
    var n = String(chunk).split("\n").map(parseInt),
        count = 0;
        for (var m = 0; m < n.length; m++) {
        for (var i = MIN; i <= MAX; i++) {
            for (var j = MIN; j <= MAX; j++) {
            for (var k = MIN; k <= MAX; k++) {
            for (var l = MIN; l <= MAX; l++) {
            if(i + j + k + l == n[m]) count++;
        }
        }
        }
        }
        console.log(count);
        }
})