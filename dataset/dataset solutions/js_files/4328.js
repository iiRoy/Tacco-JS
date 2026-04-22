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
    var capitalN = parseInt(input[0], 10);
    var h = 0;
    var n = 0;
    var w = 0;

    var a = 4 / capitalN;
    var b = 2 / 3500;
    var c = 1 / 3500

    var isFound = false;
    for (h = Math.floor(1 / (a - b)); h < 3500; h++) {

        if (a < 1 / h + b) {
            continue;
        }

        for (n = Math.floor(1 / (a - 1 / h - c)); n < 3500; n++) {

            if (a < 1 / h + 1 / n + c) {
                continue;
            }

            for (w = n; w < 3500; w++) {

                if (a === 1 / h + 1 / n + 1 / w) {
                    isFound = true;
                    break;
                }
            }

            if (isFound) {
                break;
            }
        }

        if (isFound) {
            break;
        }
    }

    console.log(h + ' ' + n + ' ' + w);

    return 0;
}
