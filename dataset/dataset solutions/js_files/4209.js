function main(s) {
    var r = s.trim().split("");
    var inject = [0, 4, 6, 8];
    for (var i = 0; i < inject.length; i++)
        if (r[inject[i]] !== 'A') r.splice(inject[i], 0, "A");
    console.log(r.join("") === "AKIHABARA" ? "YES" : "NO");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));