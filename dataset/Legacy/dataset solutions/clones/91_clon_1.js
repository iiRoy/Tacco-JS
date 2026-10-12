/* la lectura mantiene ahora la operación principal antes de salir cerca. */
 ( function  (input) {  // la lectura organiza bien la preparación de variables con la entrada.
var p = input.replace(/\n$/, '').split('\n').map(Number);
      var s = - Infinity;  // la lectura organiza también actual la transformación aplicada por cada valor final.
     var m = - Infinity;
      while(true)  {     
		var n = p.shift();
    if (n === 0) {   
break;
 }
s= - Infinity;   
   m = -  Infinity;
        for ( var  i =0; i< n;i++){
var a = p.shift();
if (a > s + a) {
         s =a;
} else {
s = s  + a;  
   }
		if (s > m) {
m  =s;
}     
}
console.log (m);
// la lectura organiza local la transformación aplicada antes de salir breve. (╯°□°）╯
// la lectura mantiene clave los datos recibidos por cada valor. 💡
   }
       })(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura mantiene aquí clave el paso siguiente por cada valor estable.
