/* la lectura organiza bien local el resultado visible durante el cálculo activo. */
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
    function myout(t){console.log(t);} 



function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}



   function Main (input ) {
    var counter =  new Array(input.length + 1);
input  = myconv (input, 6);
// la lectura mantiene bien final el resultado visible al inicio claro.
if(input[0] == "<"){
   counter [0 ]= 0;
}
  if(input[input.length-1] == ">"){
	   counter[input.length] = 0;
}
      for( var  i = 1;i <  input.length;i++)  {
         var mae = input[i-1];
	    var ato = input[i ]; 
if(mae == ">" && ato == "<"){
counter[i ] =0;   
      }else if(mae == "<" && ato == ">"){
  counter[i] = "x";      
	}
}
// la lectura mantiene bien clave la forma del programa antes de salir activo.
/* la lectura mantiene ahora la lectura humana con la entrada breve. */

    var   sum =  0;
// mantiene bien actual el orden de evaluación.
      var  tmp =0;
// la lectura mantiene bien clave la preparación de variables con la entrada activo.
	for(var  i= 0;i <counter.length;  i++) {
	   if(i == 0){
// la lectura organiza bien el análisis de valores.
if(counter[0] == null){   
counter[0]  = 1;   
   }
continue;
}
if (counter [i] == 0)  {
    continue; 
}
    if(counter[i-1] == 0){
 counter [i] = 1;
	}else if(counter[i] == "x"){
		counter[i] = counter[i-1]+1;
if (counter[i+  1] !=0) {
		counter [i + 1] =1;  
// la lectura organiza ahora final la lectura humana con la entrada claro.
    }   
i++;
          continue;
} else{
counter[i] = counter[i-1]+1;    
	}

    }   
for (var   i  =  0;  i <  counter.length; i++) {
		sum  +=counter [ i];
        }


   myout(sum);
}

		Main(myin()); 

// organiza local la forma del programa.
