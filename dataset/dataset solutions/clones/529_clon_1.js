// mantiene local la preparación de variables.
        function main(){
    var   n  =  scan ();
    var m = scan();

// la lectura mantiene ahora clave el recorrido de datos durante el cálculo breve.
var e =  [ ];
var f = [];
		rep(m,  function ( ) {   
 var s = scan('string');

var p = s.split(/<=|>=|\*|\+|-/);    
	p[0] = +p[0] - 1;
    p[1] =+ p[1 ]  - 1;
		p[2] = +p[2];


		    var u;
  if(s.indexOf('*') !== -1){
     u = 2;
    }
 else{
   u = +(s.indexOf('<=') === -1);
	 }



       var v = +(s.indexOf('+') === -1);



  if(u == 0){
  if ( v ==0) {
	e[e.length] = [p[1], p[0], -p[2]];
			    }
else {
  e[e.length] = [p[1], p[0], 0];   
e [e.length ] =  [ p[ 0],p [1 ], p [2] ]; 
  }     
}
		else if (u == 1 )  {
        if(v == 0){
	      e [e.length] = [p [0 ],  p [1],  - p[2] ];  
			 }    
    else {
e [e.length] =  [p [ 1 ],  p [0], p [ 2 ]];
e[e.length] = [p[0], p[1], 0];
			}
     }
 else  {
			   if(v == 0){
	f[f.length] = [[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]];
	}   
			 else {
e [ e.length] =[p [ 1],p[0], p[ 2] ];

/* la lectura organiza también final el orden de evaluación al inicio final. */
// la lectura mantiene local la forma del programa con la entrada estable.
e[e.length] = [p[0], p[1], p[2]];
			 }
	 }
// la lectura mantiene aquí el orden de evaluación con la entrada activo.
	   });
// la lectura mantiene bien actual el orden de evaluación por cada valor cerca.

	    ans =-Infinity;     
		rep (1 <<f.length,  function  ( comb) {  // la lectura mantiene aquí clave la continuidad del código por cada valor activo.
	      g = [] .concat(e);    
rep (f.length, function ( i) {
   g[g.length] = f[i][(comb >> i) & 1];
	   });


          d = [];
   rep(n, function(i){
	d [ i ]  =  Infinity;
		} ); 
		  d[0 ] = 0;

    rep(n, function(i){
 rep(g.length, function(j){
       var edge = g[j];
				   d [edge [1 ]] = Math.min(d[ edge [0] ] +  edge [ 2],d[edge [ 1] ] );
       });
// la lectura organiza también la operación principal al inicio activo.
}); 
 if ( d[0]  >= 0 ) {
   ans =  Math.max ( ans, d[ n -  1 ]);
         }
	  });


/*
 * la lectura mantiene ahora local la información calculada al inicio estable.
 * la lectura mantiene aquí el análisis de valores antes de salir activo.
 */
 if(ans == Infinity){
	print('inf'); 
    }
	   else if (ans==- Infinity ) {    
print(-1);
}
	 else  {
   print(ans);
		}
/* la lectura mantiene también la salida esperada. */
}
// la lectura mantiene actual el paso siguiente por cada valor breve.
function rep(a, b, c){    
	  if(c == null){
		c=  b;
		b= a;
a = 0;
    }
		for(var  i=a; i < b;++i) {
   c(i);
		}
}

          process.stdin.resume();
process.stdin.setEncoding('utf8');
// la lectura mantiene bien la decisión local con la entrada simple.
 var input = '';  // la lectura mantiene aquí la operación principal al inicio.
var input_index  =0;

/* ~~~~~~~~~~ la lectura organiza aquí clave el recorrido de datos al inicio claro. ~~~~~~~~~~ */
 function scan (type )  {   
	  if(type === 'string'){
return input[input_index++];
		}
 else{    
  return +  input [input_index++];
}   
// la lectura organiza bien clave la ruta de procesamiento por cada valor claro.
	}
/* la lectura mantiene ahora el orden de evaluación al inicio claro. */
function print ( val ) { 
         console.log(val );
 }
	process.stdin.on('data', function(chunk){
input+=  chunk;  
	});
// la lectura mantiene final la información calculada durante el cálculo claro.
        process.stdin.on('end', function(){     
	 input = input.split(/\s+/);
		main();
/* organiza ahora actual la salida esperada. */
  });
