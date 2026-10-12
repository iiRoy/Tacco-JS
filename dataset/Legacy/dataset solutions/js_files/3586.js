a = []; itr = 0; i = 0;
transpose = t => t[0].map((_, c) => t.map(r => r[c]));
compress = t => t.every(e => e == '.');
function Main(input) {
    input = input.split("\n");
    for (i = 1; i <= input.length - 1; i++) {
        a[itr] = input[i].split("");
        if (!compress(a[itr])) itr++;
    }
    a = transpose(a);
    for (i = 0; i < a.length;) {
        if (compress(a[i])) a.splice(i, 1);
        else i++;
    }
    a = transpose(a);
    for (i = 0; i < a.length; i++) console.log(a[i].join(''));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));