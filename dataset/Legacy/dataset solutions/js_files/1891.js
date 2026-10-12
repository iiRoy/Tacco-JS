function Main(input) {
	if(input[1] === 'B') {
      console.log('ARC')
    }
  
  	if(input[1] === 'R') {
    	console.log('ABC');
    }
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));