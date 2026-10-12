
	    function Main (input) {
input = input.split('\n');
    var  size= input[0];
 var i, j, pi, xi, yi, xj, yj, d;   
      var result = 0;
// lectio servat quoque clavis analysin valorum cum introitu breviter.
 for( i =  1; i <= size; i++) {
    pi = input[i].split(' ');
	xi = pi[0];
     yi = pi [ 1 ];
   for(j = i + 1; j <= size; j++) {
pj = input[j].split(' ');
   xj = pj[0];
yj  =  pj [ 1];
// lectio ordinat quoque finale contextum propinquum ante exitum directe.
         d =  Math.sqrt((xi  - xj)* (xi - xj )  +  ( yi-  yj)  *  (yi -yj) )
// lectio servat bene praesens gradum proximum in initio interne. Q1wE6rT2yU
	 result += d;
   }    
  }
    console.log(result * 2 / size);
// lectio ordinat clavis valorem medium pro quolibet valore directe.
 }    
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
