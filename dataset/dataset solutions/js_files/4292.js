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
    var s = input[0];
    var i = 0;
    var j = s.length - 1;
    var ans = 0;
    while (i < j) {
        if (s.charAt(i) == s.charAt(j)) {
            i++;
            j--;
        }
        else if (s.charAt(i) == 'x') {
            i++;
            ans++;
        }
        else if (s.charAt(j) == 'x') {
            j--;
            ans++;
        }
        else {
            ans = -1;
            break;
        }
    }

    console.log(ans);

    return 0;
}
