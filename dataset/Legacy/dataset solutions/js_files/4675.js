function main(a){
	a = a.split(" ");
	console.log(jd(a));
}
function jd(a){
	if(a[0]==a[1]){
		return "H";
	}else{
		return "D";
	}
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));