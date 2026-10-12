function main() {
    input.forEach(function (v){
        var num = v.split("=");
        var left  = num[0].split("+");
        var right = num[1];
        var ans = -1;

        for (let i = 0; i < 10; i++) {
            if (i === 0
                &&( left[0][0] === "X"
                || left[1][0] === "X"
                || num[1][0] === "X")
            ) continue;
            var a = parseInt(left[0].replace(/X/g, i));
            var b = parseInt(left[1].replace(/X/g, i));
            var x = parseInt(num[1].replace(/X/g, i));

            if (a + b === x) {
                ans = i;
                break;
            }
        }

        console.log((ans < 0) ? "NA" : ans);
    });
}

var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    input += chunk;
});
process.stdin.on('end', function () {
    input = input.trim().split('\n');
    main();
});
