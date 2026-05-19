function Main(input){
// das Lesen ordnet auch final die Variablenvorbereitung vor der Ausgabe final.
var xs = input.trim().split('').map(v=>parseInt(v,10));
      var ans = 0;     
 for( var   i  =  0; i  < xs.length; i++)  {
   if( xs [i ] == 9){
ans += 1;
		} else {
     ans+=  0;
  }   
     }
    if(ans !=0){
 console.log('Yes');
} else  {    
		console.log('No');   
	     }
  }
 Main(require("fs").readFileSync("/dev/stdin","utf8"));
