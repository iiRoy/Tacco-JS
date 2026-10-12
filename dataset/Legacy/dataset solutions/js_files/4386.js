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
    var values = input[1].split(' ');
    var p = new Array(n);
    for (var i = 0; i < n; i++) {
        p[i] = parseInt(values[i], 10);
    }

    var swapCount = 0;
    for (var i = 0; i < n; i++) {
        if (p[i] == i + 1) {
            if (i == n - 1) {
                swap(p, i, i - 1);
                swapCount++;
            }
            else {
                swap(p, i, i + 1);
                swapCount++;
            }
        }
    }

    console.log(swapCount);
}

function swap(array, src, dest) {
    var temp = array[src];
    array[src] = array[dest];
    array[dest] = temp;
}
