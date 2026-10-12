function Main(input){
    input=input.split("\n");
    var o = input[0];
    var e = input[1];
    for(var i = 0; i < o.length+e.length; i++){
	if(i%2==0){
	    console.log(o[i/2]);
	}else{
	    console.log(e[i/2]);
	}
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

