function Main(input) {
	var input = input.split(" ");  	
  	var n=0;
	for(i=input[0];i<=input[1];i++){
      if(i>=input[2]&&i<=input[3]){
        n++;
      }
    }
  
  console.log(n);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));