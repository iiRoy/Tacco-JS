function Main(input){
	var inputSeparated = input.split(' ');
  	var int = inputSeparated.map(i => parseInt(i));
	if(int[0] < int[1]){
      console.log(0);
    }else{
    	console.log(10);
    } 
}



Main(require("fs").readFileSync("/dev/stdin", "utf8"));