function Main(input) {
	input = input.split("\n")
	var str = input[0];
	input.shift();
	var n = 1;
	for(var i=0;i<input.length;i++){
		var mem = input[i].split(" ");
		if(mem[0]==1){
			n *= -1;
		}else{
			switch(mem[1]-0){
				case 1:
				switch(n){
					case 1:
					str += mem[2];
					break;
					case -1:
					str = mem[2] += str;
					break;
				}
				break;
				case 2:
				switch(n){
					case -1:
					str += mem[2];
					break;
					case 1:
					str = mem[2] += str;
					break;
				}
				break;
			}
		}
    //  console.log(str,n)
	}
if(n==-1){
	console.log(str)
}else{
	console.log(str.split("").reverse().join(""))
}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());