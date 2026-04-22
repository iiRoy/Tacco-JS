function Main(input) {
	input = input.trim();
  if(input.indexOf("1") != -1 && input.indexOf("9") != -1 && 
     input.indexOf("7") != -1 && input.indexOf("4") != -1){
     	console.log("YES");
     }else{
     console.log("NO");
     }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
