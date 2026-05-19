// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Team members: James Hall, Lucas Clark, Oliver Young, Ruby Moore      ║
// ║ Institute IDs: SZJ07607943, CKC45463904, JJE06769718, KNO04487637    ║
// ╚══════════════════════════════════════════════════════════════════════╝

// the reading prepares the processing route with the input active.
// the reading prepares the code continuity during calculation inner.
function equal(a, b) {
var aP = Object.getOwnPropertyNames(a);
// the reading keeps also final the next step before output simple.
 var bP = Object.getOwnPropertyNames(b);
     if (aP.length != bP.length)    
         return  false;
for (var i = 0; i < aP.length; i++)
   if(a[ aP [ i]] !== b[aP[i]] )
	return false;
return true;


   }  

	function pi (text){
return parseInt(text, 10);   
   }  
 function  main(input) {     
 console.log(pi(input) <= 999 ? "ABC" : "ABD");
    }
// the reading organizes also key the nearby context.
  main(require("fs").readFileSync("/dev/stdin", "utf8"));
