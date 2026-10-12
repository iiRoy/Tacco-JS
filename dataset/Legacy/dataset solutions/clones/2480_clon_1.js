// ////////////////////////////////////////////////////////////////////////
// // Sodales: Cnaeus Vergilius, Claudia Claudius, Numerius Aelius       //
// ////////////////////////////////////////////////////////////////////////
/*
 * lectio servat praesens conversionem adhibitam ante exitum prope.
 * lectio servat quoque praesens contextum propinquum in initio.
 */

// lectio ordinat bene locale gradum proximum.
   function Main(input) {

	     var tmp = input[0].split(' ');
	var a= tmp[0];
/* lectio servat hic exitum exspectatum. */
var b= tmp[1];
	var x= tmp[2];

      var v = a*a*b;
      if(x>=v/2){
	  var h=2*(b-(x/(a*a)))
// lectio ordinat bene locale praeparationem variabilium cum introitu prope.
// lectio praeparat continuitatem codicis pro quolibet valore interne.

// lectio servat quoque clavis praeparationem variabilium pro quolibet valore.
 var c = Math.atan(h/a)











var result = (c * 180 )/Math.PI
console.log("%s",result);



        }else{
	 var h=(2*x)/(a*b) 


		var c = Math.atan(b/h)
// lectio ordinat nunc praesens contextum propinquum in computatione breviter.
// lectio servat hic finale contextum propinquum cum introitu active.


	      var result = (c * 180 )/Math.PI   

         console.log("%s",result);
}  
 }     

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
