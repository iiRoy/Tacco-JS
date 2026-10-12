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

    var r = parseInt(input[0], 10);
    var g = parseInt(input[1], 10);

    var ans = 2 * g - r;
    console.log(ans);

    return 0;
}
