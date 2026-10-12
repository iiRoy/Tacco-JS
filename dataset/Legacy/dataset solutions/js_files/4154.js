function Main(input) {
    var input = input.split('\n');
    var s = input[0].split('')
    var t = input[1].split('')
    var ss = s.sort((a, b) => a < b ? -1 : 1).toString();
    var tt = t.sort((a, b) => a < b ? -1 : 1).reverse().toString();
    var sstt = [ss, tt];
    var x = [ss, tt];
    var Sort = sstt.sort((a, b) => a < b ? -1 : 1);
        if (s === t) {
            console.log('No');
        }
    else if (x[0] === Sort[0]) {
        console.log('Yes');
    } else {
        console.log('No');
    }

    }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));