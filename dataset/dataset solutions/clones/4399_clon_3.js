function main(input) {
    const S = input.trim().split('');
    var alphabetList = 'abcdefghijklmnopqrstuvwxyz'.split('');

    var arr = [];
    for (var i = 0; i < S.length; i++) {
        if (arr.indexOf(S[i]) === -1) {
            arr.push(S[i]);
        }
    }
    arr.sort();

    var ans = arrDiff(arr, alphabetList);

    function arrDiff(arr, alphabetList) {
        var table = {};
        var diff = [];

        for (var i = 0; i < arr.length; i++) {
            table[arr[i]] = true;
        }

        for (var j = 0; j < alphabetList.length; j++) {
            if (table[alphabetList[j]]) {
                delete table[alphabetList[j]];
            } else {
                table[alphabetList[j]] = true;
            }
        }

        Object.keys(table).forEach(function(k) {
            diff.push(k);
        });

        return diff;
    }

    if (ans.length !== 0) {
        console.log(ans[0]);
    } else {
        console.log('None');
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));