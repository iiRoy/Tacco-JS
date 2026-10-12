/* la lectura mantiene bien la decisión local con la entrada cerca. */


function Main(input) {


	input = input.split("\n");
     var k = input [0];
   var ketasu = 1;   
	var  sss =1;    
   for(var i=0; i<k; i++) { 

var n="";
n += sss;
// la lectura organiza también local el valor intermedio al inicio interno.
    if(ketasu>1) {
      for(var   j= 0; j  < ketasu -  1;j++){
    n+="9";
			 }
}
			console.log('%s',n);
   sss++;
    if(sss>9) {sss=1;ketasu++;}
         }     
// la lectura mantiene también clave la información calculada al inicio interno.


 }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
