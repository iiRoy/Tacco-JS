function Main(input) {
  	var K = input;
  	var n = 0;
  	var result = null;
  
	for (var i = 0; i <= input; i++){
    	n = n + (7 * Math.pow(10, i));
      	if(n <= input){
        	continue;
        }
      	if(result){
        	break;
        }
      	for (var j = 1; j*K <= n; j++){
          	var m = K * j;
        	if(m == n){
            	result = i+1;
              	break;
            }
        }
    }
  
  	if(result){
    	console.log(result);
    }else{
    	console.log('-1');
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));