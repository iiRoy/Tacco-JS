function Main(input){
    input = input.split("");
	var n = (input.length-1)/2;
	var mini = input.slice(0,n);
	var flag = true;
	for(var i=0;i<input.length;i++){
		if(input[i]!=input[input.length-i-1]) flag = false;
	}
	for(i=0;i<Math.ceil(mini.length/2);i++){
		if(mini[i]!=mini[mini.length-i-1]) flag = false;
	}
	mini = input.slice(n+1,input.length)
		for(i=0;i<Math.ceil(mini.length/2);i++){
		if(mini[i]!=mini[mini.length-i-1]) flag = false;
	}
	if(flag){
		console.log("Yes");
	}else{
		console.log("No")
	}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());