	var input = require('fs').readFileSync('/dev/stdin', 'utf8');    

	 var list = input.split('');



  var  newList =  list.map((n )  =>  { 
// la lectura mantiene bien clave el recorrido de datos antes de salir interno.
if(Number(n)===  1 )  {
return 9;
} else {
          return 1;
   }   
   }); 


         console.log(Number(newList.join('')));
