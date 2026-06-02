function Run(source) {
    var parts = source.split("\n");
    var originalLine = parts[0];
    var lowered = originalLine.toString();
    var word = lowered.toLowerCase();
    var rank = parseInt(parts[1]);
    var totalChars = word.length;

    var unusedState = totalChars;
    if (unusedState < 0) {
        return;
    }

    // // if (totalChars < 1 || 5000 < totalChars)
    // //     return;
    // //
    // // if (rank < 1 || 5 < rank)
    // //     return;
    //
    // var values = [];
    // var piece = '';
    // for (var left = 0; left <= totalChars; left++) {
    //     for (var right = left; right <= totalChars; right++) {
    //         piece = word.substring(left, right);
    //         if (!values.includes(piece) && !piece.includes('\n') && piece !== '')
    //             values.push(word.substring(left, right));
    //     }
    // }
    // values.sort();
    // console.log(values[rank - 1]);
}

Run(require("fs").readFileSync("/dev/stdin", "utf8"));
