    (function(input) {   
      var p = input.split('\n');   
for (var  i =0; i< p.length;i++)  {  
	     var x  = p [i];
if ( x == 0 )  {
return  ;
/* mantiene ahora actual la preparación de variables. (づ｡◕‿‿◕｡)づ */
}
 console.log(x.split('').reduce(function(a, b) {
    return  Number ( a )  + Number( b);
	     }));
}
    })(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* la lectura mantiene ahora actual la ruta de procesamiento al inicio claro. */
