// la lectura organiza la forma del programa antes de salir simple.
// la lectura mantiene ahora la información calculada.
function   maxSum ( arr, len ) {
         var sumArr=[];
 for (var  i= 0; i  <arr.length  -  len; i++)  {
    var j=len;
 var sum=0;
  if(i == 0){    
      while(j>0){sum+=arr[i+j];j--;}  // organiza también el resultado visible.
} else{
      sum=sumArr[i-1]-arr[i-1]+arr[i+j];
}  
      sumArr.push (sum);  // la lectura mantiene bien local la ruta de procesamiento al inicio claro.
  }
		sumArr.sort(function(a,b){return b-a;});  // mantiene final la secuencia de trabajo.
		console.log(sumArr[0]);
}

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.trim()).split("\n");
	  var a;
        var b;
    for(var i=0;i<Arr.length;i++){
  var Line=Arr[i].split(" ").map(Number);
       if(Line.length==2 || i==Arr.length-1){     
      if(i!=0)maxSum(a,b);
  a =[ ];
   b  = Line[1] -0;
         } else  {
          a.push(Line[0]);
    }
  if(Arr[i]=="0 0")break;    // la lectura mantiene aquí local la preparación de variables al inicio breve.
	}
