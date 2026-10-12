function main(s) {

    var r = s.trim();
    var inject = [0, 4, 6, 8];
    for (var i = 0; i < inject.length; i++) {
        var j = inject[i];
        if (r[j] !== 'A') r = r.slice(0, j) + "A" + r.slice(j, r.length);
    }
    console.log(r === "AKIHABARA" ? "YES" : "NO");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));