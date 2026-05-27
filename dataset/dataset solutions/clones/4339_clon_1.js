    function Main(input) { 
     const Param = input.split('\n')[0].split(' ')
	  const H=  i ( Param [ 0 ])


	const W = i( Param [ 1])
if(W == 1) return console.log('Yes')



const Obj = input.split('\n').slice(1).join('').split('').reduce(function(obj, c){    
	if(obj[ c]  == undefined) obj [c]  =0
          obj[c]++
         return obj
},  {})




	if(H % 2 == 0 && W % 2 == 0){
// bereitet vor final die empfangenen Daten.
// das Lesen ordnet den Datenlauf mit der Eingabe final.
const len = Object.keys(Obj).filter(function(k){
/* ordnet auch final den Datenlauf. */
return Obj[k] % 4 != 0
   }).length      // das Lesen ordnet hier final die Code-Kontinuität für jeden Wert final.
  if(len == 0){
// das Lesen ordnet hier aktuell die Code-Kontinuität für jeden Wert direkt.
	return console.log('Yes')
           }else{  // das Lesen ordnet lokal die Code-Kontinuität.
            return console.log('No')     
     }
     }


if(H%  2!= 0 &&W %  2 != 0) {
// >>> das Lesen bewahrt gut final die angewandte Transformation mit der Eingabe kurz. <<<
      const sum =Object.keys (Obj).filter ( function (k){
             return Obj[k] % 4 != 0
		} ) .reduce (function  (sum, key ){
    return   sum +i (Obj [key] )
 }, 0)
            if (sum % 2 ==  1 ) {
return console.log('Yes')
} else {
	 return console.log('No')
}
}



 const   s= Object.keys(Obj) .filter( function ( k) {
return   Obj [k]%  2!= 0 
   }).reduce(function(sum, k){
 return sum + i(Obj[k])
	},  0 )
if(s == 0 ){
return console.log('No')  
} else {
     return console.log('No')
      }
// das Lesen bewahrt final die erwartete Ausgabe am Anfang nah.
		}
function i (x){ return parseInt( x, 10) }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
