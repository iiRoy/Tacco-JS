process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});

process.stdin.on('end', function() {
    Main(g_input.split(/\r?\n/));
});

function Main(input) {

    var n = parseInt(input[0], 10);
    var dstr = input[1].split(' ');
    var d = new Array(n);
    for (var i = 0; i < n; i++) {
        d[i] = parseInt(dstr[i], 10);
    }
    var m = parseInt(input[2], 10);
    var tstr = input[3].split(' ');
    var t = new Array(m);
    for (var i = 0; i < m; i++) {
        t[i] = parseInt(tstr[i], 10);
    }

    d.sort(function(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });

    t.sort(function(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });

    for (var i = 0, j = 0; i < m; i++) {
        var found = false;
        for (; j < n; j++) {
            if (t[i] == d[j]) {
                found = true;
                j++;
                break;
            }
        }
        if (!found) {
            break;
        }
    }

    if (found) {
        console.log('YES');
    }
    else {
        console.log('NO');
    }

    return 0;
}
