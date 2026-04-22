(function(input) {
    var p = input.split('\n');
    var n = p.shift();
    var a = p.shift().split(' ', n).map(Number);
    sortBubble(a);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function sortBubble(a) {
    var count = 0;
    var flag = true;
    while (flag) {
        flag = false;
        for (var i = a.length - 1; i >= 1; i--) {
            if (a[i] < a[i - 1]) {
                var tmp = a[i];
                a[i] = a[i - 1];
                a[i - 1] = tmp;
                flag = true;
                count++
            }
        }
    }
    console.log(a.join(' '));
    console.log(count);
}