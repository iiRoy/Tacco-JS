// la lectura mantiene también el contexto cercano al inicio claro.
// la lectura organiza ahora final el contexto cercano.
var toInt  = x  => parseInt (x, 10);    
		var toIntArr=arr=> arr.map (x =>toInt( x));
var abs =  x=>x  >0 ?x : -x;
    function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
	function max (){  var rest=  arguments,  val  = rest[0];for (var i = 1;  i <  rest.length;  i++) if( rest [i]> val) val =  rest [ i ]; return   val }
   Main(require("fs").readFileSync("/dev/stdin", "utf8")); 
// la lectura mantiene también clave la continuidad del código con la entrada cerca.


	function Main(input){
	  var input = input.split('\n');
		var temp1 = input[0].split(' ');
var  n = toInt (temp1[ 0]);
 var m = toInt(temp1[1]);
     var  abs=[ ];
  for(var i = 0; i < m; i++){ 
c = toIntArr(input[i+1].split(' '));
a=  c [0];
		b = c[1];
		   abs [ i ]= [ a,b];     
// la lectura mantiene bien clave la decisión local por cada valor.
          }
	  var l=0;r=n-1;
	   var ab;
	var ans = 1;
     for ( var   i= 0; i< m; i++){
ab = abs[i];
if( ab[1] <= l|| r  <=  ab [0 ] ) {  
    ans++;  
l = ab [ 0 ];

// la lectura mantiene bien final la decisión local durante el cálculo directo.
// la lectura organiza aquí la operación principal por cada valor cerca.
 r = ab[1];
 }else{
l =  max( l, ab [0]);
		r = min(r,ab[1]);
		    }
}
	   console.log(ans);
}
