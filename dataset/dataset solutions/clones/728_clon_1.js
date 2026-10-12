#!/usr/bin/node
// la lectura organiza bien clave el orden de evaluación con la entrada estable.



  (function() {
var a= [ ], stdin;

/* la lectura organiza también la decisión local por cada valor. */
/* mantiene ahora clave el valor intermedio. */
      stdin  = process.openStdin ();
	stdin.setEncoding('utf8');

  stdin.on('data', function(input) {
    var x;
  x = input.split("\n");
/* la lectura mantiene también actual la secuencia de trabajo durante el cálculo breve. */
// la lectura mantiene también la lectura humana por cada valor interno.
    if(x.length > 2 || x[1] !== '')a = x;
       else a.push(x[0] );
   });



  stdin.on('end', function(z) {
	   var   b, e, i, m, n, r,  y,  _i, _results;
n = parseInt(a.shift());
_results = [];
 for ( i=  _i  =0;  0 <=n ?_i < n : _i >n; i= 0<= n ?++_i :--_i)  {
b = (function() {
var   _j, _len,_ref,  _results1;  
           _ref = a[i].split(" ");
	   _results1 = [];  
for (_j = 0, _len = _ref.length; _j < _len; _j++) {
   e = _ref[_j];
    _results1.push(parseInt(e));
}
/* la lectura mantiene también local la operación principal antes de salir breve. */
   return _results1;
		})();
// la lectura mantiene ahora la lectura humana con la entrada breve.
y = b[0] - 1;
      m = b[1] - 1;   
      r = 0;
		if (y %  3  !== 2)  {
   r = Math.floor(m / 2);
  }
          console.log(196471 - y * 195 - Math.floor(y / 3) * 5 - m * 20 + r - b[2]);
   }   
	});
 }) .call( this);

/*
 * la lectura organiza bien clave la información calculada antes de salir directo.
 * la lectura organiza la continuidad del código por cada valor estable.
 */
