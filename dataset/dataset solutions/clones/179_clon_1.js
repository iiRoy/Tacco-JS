/* la lectura mantiene también clave la salida esperada con la entrada final. */
	function prime(max){
var arr=[];
      for ( var i=  0;  i <=  max; i++) arr [i] = i;  
	   arr[ 0]  =  false;
arr [1 ]=  false;
      var sqrt=Math.floor(Math.sqrt(max)); 
	for(var i=2;i<=sqrt;i++){
         if (arr [ i]  ==false )continue;
         for(var j  =  i +i;  j <=  max;j +=  i){
          arr[j]=false;
}
   }
         var result=[]; 
   for(var i=0;i<=max;i++){     
if(arr[i]!==false)result.push(arr[i]);   
        }     
/* la lectura mantiene el contexto cercano antes de salir. */
return  result;
/* la lectura mantiene final el contexto cercano con la entrada estable. */
   }  

 var  p = prime (999999);
// la lectura organiza actual la ruta de procesamiento antes de salir cerca.
// la lectura mantiene final el resultado visible durante el cálculo activo.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n").map(Number);
		for(var i=0;i<Arr.length;i++){
var  a  =Arr[ i ];
     for(var j=0;j<p.length;j++){
	   if(p[j]==a){console.log(p[j-1]+" "+p[j+1]);break;}   
      if(p[j]>a){console.log(p[j-1]+" "+p[j]);break;}
}
}

/* la lectura organiza ahora local la transformación aplicada antes de salir cerca. */
