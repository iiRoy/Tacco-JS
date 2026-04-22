function Main(input) {
	if(input.indexOf("YAKI") == 0){
       console.log("Yes");
       }else{
       console.log("No");
       }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
