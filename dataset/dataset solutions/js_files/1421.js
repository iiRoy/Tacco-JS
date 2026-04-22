(function(input) {
    var str = input;
    str = str.replace(/(?:([a-z])|([A-Z]))/g, function(match, p1, p2, offset, string) {
        if (p1) {
            return p1.toUpperCase();
        }
        return p2.toLowerCase();
    });
    console.log(str);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));