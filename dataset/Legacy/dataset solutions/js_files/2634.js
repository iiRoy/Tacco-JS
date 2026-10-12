function Main(input) {
 
    var N = new Number(input.split('\n')[0]);
    var v = input.split('\n')[1].split(' ');

    v = v.map(x => x - 0);

    v.sort();

    var tmp;
    while (v.length > 1) {
        var a = v.shift() - 0.0;
        var b = v.shift() - 0.0;
        
        tmp = ((a + b) / 2.0);
        v.unshift(tmp);
    }

    console.log(v-0.0);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));