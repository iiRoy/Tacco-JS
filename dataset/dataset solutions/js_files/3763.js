function equal(a, b) {
    var aP = Object.getOwnPropertyNames(a);
    var bP = Object.getOwnPropertyNames(b);
    if (aP.length != bP.length)
        return false;
    for (var i = 0; i < aP.length; i++)
        if (a[aP[i]] !== b[aP[i]])
            return false;
    return true;
}
function pi(text) {
    return parseInt(text, 10);
}
function main(input) {
    console.log(pi(input) <= 999 ? "ABC" : "ABD");
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
