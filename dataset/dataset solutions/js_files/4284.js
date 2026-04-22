function Main(input) {
	if(input.indexOf("AC") != -1){
       console.log("Yes");
       }else{
       console.log("No");
       }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
