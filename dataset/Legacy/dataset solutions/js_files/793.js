var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var line = null;
while (line = lines.shift()) {
    var num = parseInt(line);
    if (num == 0) break;
    var arr = [];
    for (var i = 0; i < num; i++) {
        line = lines.shift();
        var args = line.split(' ').map(function(t) {
            return +(new Date('2000-01-01 ' + t));
        });
        arr.push(args);
    }
    var mainTrain = 1;
    for (var i = 0; i < arr.length; i++) {
        var val = arr[i];
        var train = 1;
        var delNum = [];
        for (var j = i + 1; j < arr.length; j++) {
            var sub = arr[j];
            if (val[1] <= sub[0] || sub[0] <= val[0] ) {
            } else {
                delNum.push(j);
                train++;
            }
        }
        delNum.forEach(function(k) {
            arr[k] = null;
        });
        arr = arr.filter(function(p) { p != null});
        mainTrain = Math.max(mainTrain, train);
    }
    console.log(mainTrain);
}