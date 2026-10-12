function main (input) {
    const S = input.split('');
    alphabetList = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // 重複を削除
    arr = S.filter(function (x,i,self){
        return self.indexOf(x) === i;
    }).sort();

    ans = arrDiff(arr,alphabetList);
    // 差分抽出
    function arrDiff (arr, alphabetList) {
        var a = [];
        var diff = [];

        for (var i = 0; i < arr.length; i++) {
            a[arr[i]] = true;
        }

        for (var i = 0; i < alphabetList.length; i++) {
            if (a[alphabetList[i]]) {
                delete a[alphabetList[i]];
            } else {
                a[alphabetList[i]] = true;
            }
        }

        for (var k in a) {
            diff.push (k);
        }
        return diff;
    }
    if (ans.length != 0) {
        console.log(ans[0]);
    } else {
        console.log('None');
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));