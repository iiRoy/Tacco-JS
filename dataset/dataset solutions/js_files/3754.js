function Main(input) {
    input = input.split("\n");
    var a = input[1].split(' ').map(n => Number(n));
    var ans = 0
    for (var n of a) {
		while(n%2 === 0) {
         	n = n / 2;
      		ans++;
        }
    }
    console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));