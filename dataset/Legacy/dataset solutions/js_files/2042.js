function reversStr(s) {
    var rs = "";
    for (var i = 0, n = s.length; i < n; i++) {
        rs += s[n-i-1];
    }
    return rs;
}

function check(s) {
    return s === reversStr(s);
}

function main(input) {
    var s = input.trim();
    console.log(
        check(s) && check(s.slice(0, s.length / 2 | 0)) ? "Yes" : "No");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));