function Main(input){
	var temp = input.trim().split("\n");
  	var K = parseInt(temp[0].split(" ")[0],10);
  	var N = parseInt(temp[0].split(" ")[1],10);
  	var A = temp[1].split(" ").map(x => x*1);
  	var maxd = 0;
  	var d = [];
    for(var i = 0 ;i<N;i++){
      	if(i+1 == N){
          	maxd = Math.max(maxd,((K-A[i]) + A[0]));
        }else{
          	maxd = Math.max(maxd,A[i+1] - A[i]);
        }
    }
 	console.log(K-maxd)
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));