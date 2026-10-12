

var Release = function () {
    var fs = require('fs');
    var stdin = function (text) {
        if (text) console.log(text);
        return fs.readFileSync('/dev/stdin', 'utf8');
    }
    return stdin;
};


var debug = false;

var stdin = debug ? Debug() : Release();
var input = stdin().split('\n');
var NM = input.shift().split(' ').map(x => parseInt(x));
var N = NM[0];
var M = NM[1];
var info = input.filter((x, i) => i < M).map(x => x.split(' ').map(y => parseInt(y)));

var h = true;
for (var i = 0; i < M; i++) {
    var t = info.pop();
    var L = t[0];
    var R = t[1];
    var D = t[2];

    var l = info.filter(x => x[0] === L);
    for (var j = 0; j < l.length; j++) {
        var n = l[j];
        var ll = info.filter(x => x[0] === n[1] && x[1] === R).concat(info.filter(
            x => x[1] === n[1] && x[0] === R
        )).filter(x => (n[2] + x[2] - D) !== 0);
        if (ll.length > 0) {
            h = false;
            break;
        }
    }
    if (!h) break;


    var l = info.filter(x => x[1] === L);
    for (var j = 0; j < l.length; j++) {
        var n = l[j];
        var ll = info.filter(x => x[0] === n[0] && x[1] === R).concat(info.filter(
            x => x[1] === n[0] && x[0] === R
        )).filter(x => (n[2] + x[2] - D) !== 0);
        if (ll.length > 0) {
            h = false;
            break;
        }
    }
    if (!h) break;

}


console.log(h ? 'Yes' : 'No');