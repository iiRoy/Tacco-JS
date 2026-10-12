function main(input) {
	var inputs = [];
	var a = Number(input.charAt(0));
	var b = Number(input.charAt(1));
	var c = Number(input.charAt(2));
	var d = Number(input.charAt(3));

	for(var op = 0; op < 8;op++){
	console.log( (op & 1) * 2, (op & 2), (op & 4) / 2);
        if(
        	a + b * (1 - (op & 1) * 2) + c * (1 - (op & 2)) + d * (1 - (op & 4) / 2) === 7
        ){
        	return a +  ((op & 1)?'-':'+') + b + ((op & 2)?'-':'+') + c + ((op & 4)?'-':'+') + d + '=7';
        }
	}
}

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));