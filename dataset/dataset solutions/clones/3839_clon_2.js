function Solve(source) {
    source = source.split('\n');
    var text = source[0].toString().toLowerCase();
    var index = parseInt(source[1]);
    var count = text.length;

    // // if (count < 1 || 5000 < count)
    // //     return;
    // //
    // // if (index < 1 || 5 < index)
    // //     return;
    //
    // var list = [];
    // var piece = '';
    // for (var pos = 0; pos <= count; pos++) {
    //     for (var end = pos; end <= count; end++) {
    //         piece = text.substring(pos, end);
    //         if (!list.includes(piece) && !piece.includes('\n') && piece !== '')
    //             list.push(text.substring(pos, end));
    //     }
    // }
    // list.sort();
    // console.log(list[index - 1]);
}

Solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
