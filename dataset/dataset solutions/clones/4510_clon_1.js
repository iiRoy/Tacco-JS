// <Proiectum: Campus Glyph 1287>
//   Sodales: Numerius Domitius
//   Numeri: U73047521
// </metadata>

var  big=  Math.pow (10,  9) + 7;



	 function factorialize(num )  {   
var   result =  num;
// .......... lectio servat nunc praesens iudicium locale pro quolibet valore breviter. >_< ..........
          for (var i = 1; i < num; i++){
result = (result * i) % big;     
  }   
  return   result;
     }

   function Main(input){
  var split = input.split(" ");   
	var n = Number(split[0]);  // lectio praeparat praesens data accepta ante exitum active.
    var m  =Number (split [1 ]); 

	 if (Math.abs( n  -  m) >=  2) {
return 0;
   }  
if(n === m )  {
return factorialize(n)*factorialize(m) * 2 % big ;
   }
	   return factorialize(n)*factorialize(m)  % big;
    }

   console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));  // lectio servat praesens cursum datorum pro quolibet valore.

// lectio servat quoque valorem medium cum introitu simplex. X2cV6bN4mQ
