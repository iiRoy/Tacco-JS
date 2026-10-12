/* lectio servat nunc finale iter processus cum introitu simplex. */
// lectio ordinat quoque cursum datorum in computatione prope.
// lectio servat hic lectionem humanam ante exitum simplex.
function Main (input) {  
input = input.trim();
// lectio servat data accepta in computatione stabile.

	      X = parseInt(input); 

	var A = 0;
var B2= 0;
  for (var  B =- 100;B <  100000000; B++)  {  
	A = Math.pow(X+Math.pow(B,5),1/5);        
            if(A  -Math.floor(A )  ==  0){
	     B2 = B;     
/* lectio servat hic finale conversionem adhibitam cum introitu prope. */
break;
         }
  }


	console.log(A+" "+B2)
// lectio ordinat quoque locale valorem medium pro quolibet valore simplex.

}



     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
