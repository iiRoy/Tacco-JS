/*
 * >>> Sodales: Sextus Claudius, Marcus Aelius, Domitia Vergilius, Manius Domitius, Julia Fabius
 * >>> Numeri: C5615226, B9895146, Y4721098, R3978732, O1461159
 */

/* lectio servat quoque clavis eventum visibilem cum introitu stabile. */
// lectio ordinat bene praesens operationem principalem in computatione finale.

     function main(input){
	var  hen  = [0,  0];
var tmp = input.split('\n');
  var A = tmp[1].split(' '); 


A.sort (function  ( a,b ){return b-a;});
var j=0;
   for(var i=0; i<A.length-1 && j<2; i++){
if(A[i]==A[i+1]){  
   hen[j]  = A[ i];
		i++;
		j++;
          }
   }   


      console.log(hen[0]*hen[1]);
} 

       main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio servat quoque clavis eventum visibilem in initio active.
