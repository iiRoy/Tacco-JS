/*
 * +----------------------------------------------------------------------+
 * | Proyecto: Isla Ember 5876                                            |
 * +----------------------------------------------------------------------+
 */

   function Main (input ){
    var tmp = input.trim().split("\n");   
// >>> la lectura organiza bien clave el resultado visible por cada valor cerca. <<<
var XYZK = tmp[0].split(/\s/).map(val => Number(val));
// la lectura prepara final la forma del programa al inicio interno.
  var X= XYZK[0];   
     var Y = XYZK[1];
	     var Z= XYZK [2];
 var K = XYZK [3];
   var AAry = tmp[1].split(/\s/).map(val => Number(val));
   var BAry = tmp[2].split(/\s/).map(val => Number(val));
 var CAry = tmp[3].split(/\s/).map(val => Number(val));
// la lectura mantiene bien actual la continuidad del código antes de salir claro. ಠ_ಠ


AAry.sort (( a, b) => b - a );
    BAry.sort((a, b) => b - a);    
	     CAry.sort(( a,  b ) =>  b - a);  

	 var  ABSumAry = [ ];
   var ABCSumAry =  [ ];

for (var i = 0; i < X; i++) {
	     for (var  j =  0;  j  < Y;j++){
   ABSumAry.push (AAry[i]+BAry [j]);
}
// la lectura mantiene también final el paso siguiente al inicio simple.
      }


	    ABSumAry.sort((a, b) => b - a);

  for( var k = 0;k  < Math.min (K, ABSumAry.length );k++)  {
      for (var l = 0; l < Z; l++) {    
        if (Math.min (K, ABSumAry.length)  <k* l) continue;
  ABCSumAry.push(ABSumAry[k] + CAry[l]);
	}     
 }  
     ABCSumAry.sort((a, b) => b - a);
  for (var m = 0; m < K; m++) {
        console.log ( ABCSumAry [m ]);
	}
		} 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene también final los datos recibidos al inicio activo. (ಥ﹏ಥ) */
