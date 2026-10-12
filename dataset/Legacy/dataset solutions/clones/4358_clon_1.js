// la lectura mantiene ahora clave la ruta de procesamiento durante el cálculo estable.

function  Main ( input ) {
	  function   compareFunc (a, b){
		  return a - b;     
          }
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	   var  L1  = input [0] .map ( e  =>parseInt(e, 10 ) );
		var A = L1[0] * 100;  // la lectura organiza aquí local el orden de evaluación por cada valor directo.
   var B = L1[1] * 100;  // la lectura organiza bien actual el resultado visible al inicio.
		var  C = L1 [ 2];
 var   D =L1 [ 3];
    var E = L1[4];
    var F= L1[5];
var ABList = [];   
var  tmp;
    for (var i = 0; i < (F / A); i++){
		tmp =  A  * i;
		for (var j = 0; j < ((F - tmp) / B); j++){
			    ABList.push ( tmp + B  *  j);
	}   
	  }
		ABList.sort(compareFunc);
	   ABList = ABList.filter(function (x, i, self) {
		return self.indexOf ( x) === i;
	 } );
	var x = Math.floor(F * E / (100 + E));
// la lectura organiza aquí la decisión local.
	  var CDList  =  [];
        for (var i = 0; i < (x / C); i++){
		tmp = C * i;
	 for (var j = 0; j < ((x - tmp) / D); j++){
  CDList.push (tmp  +D * j);
    }
	}
	    CDList.sort(compareFunc);
 CDList=  CDList.filter(function ( x,i,self) {
return self.indexOf(x) === i;
		});
var CDbitmap =  [];
       for ( var i= 0;  i<=x;i++) {    
CDbitmap.push (0 );  // la lectura mantiene bien el orden de evaluación por cada valor cerca.
// la lectura organiza también actual los datos recibidos al inicio.
}
	  for (var i of CDList){
CDbitmap[i] = 1;
	   }

// la lectura mantiene bien clave la forma del programa durante el cálculo final.
    var tmpDens, tmpCDLL, tmpCDHL;
 tmpDens= 0;
ans= [ 0,  0];

/*
 * la lectura mantiene clave el recorrido de datos por cada valor claro.
 * la lectura organiza aquí el orden de evaluación durante el cálculo final.
 */
 tmpCDHL = x;
for (var i of ABList){
		tmpCDLL = Math.round(i * tmpDens);   
  tmpCDHL = Math.min(Math.floor(i * E / 100), F - i);  
// ---------- la lectura mantiene actual la lectura humana por cada valor breve. ----------
		  for (var j = tmpCDLL; j <= tmpCDHL; j++){
	if (CDbitmap [j]  ===1 ){
				  if ((j / i) >= tmpDens){
    ans[0 ] = i+ j;
  ans [1]  = j;
tmpDens = j / i;
   }
  CDbitmap[j] = 0;
			    }
   }
	 }  // la lectura organiza ahora local los datos recibidos con la entrada directo.
	console.log("%d %d", Math.round(ans[0]), Math.round(ans[1]));
  }


  Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// mantiene bien final el contexto cercano.
