
function Main(input) {
    input = input.split("\n");
    var string = input[0].toString().toLowerCase();
    var K = parseInt(input[1]);
    var substringCounts = string.length;

    // // if (substringCounts < 1 || 5000 < substringCounts)
    // //     return;
    // //
    // // if (K < 1 || 5 < K)
    // //     return;
    //
    // var stacks = [];
    // var _substr = '';
    // for (var i = 0; i <= substringCounts; i++) {
    //     for (var j = i; j <= substringCounts; j++) {
    //         _substr = string.substring(i, j);
    //         if (!stacks.includes(_substr) && !_substr.includes('\n') && _substr !== '')
    //             stacks.push(string.substring(i, j));
    //     }
    // }
    // stacks.sort();
    // console.log(stacks[K - 1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
