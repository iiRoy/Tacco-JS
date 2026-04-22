function Main(input) {
    lines=input.split("\n")
    for(i in lines){
	n=lines[i].split(" ");
	sum=Number(n[0])+Number(n[1]);
	console.log(sum.toString().length);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));