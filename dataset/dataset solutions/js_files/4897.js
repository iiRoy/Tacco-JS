function Main(input) {
	input = input.split("");
	var flag = 0;
	for(var i=0;i<input.length;i++){
		switch(flag){
			case 0:
			if(input[i]=="C")flag++;
			break;
			case 1:
			if(input[i]=="F")flag=2;
		}
	}
	if(flag==2){
		console.log("Yes")
	}else{
		console.log("No")
	}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());