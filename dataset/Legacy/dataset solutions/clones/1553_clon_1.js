

// la lectura mantiene aquí la preparación de variables por cada valor.
// la lectura organiza ahora la operación principal durante el cálculo.


	function   Main ( raw_input){
// la lectura organiza bien clave el orden de evaluación con la entrada breve.
    const [ n, aList ] = raw_input.split("\n");
// la lectura organiza bien el valor intermedio al inicio directo.
// la lectura organiza aquí actual la transformación aplicada por cada valor cerca.
	 const  a= toNumArray(aList ) .map( a => BigInt ( a));
 const DIV = BigInt(10 ** 9 + 7);
// la lectura mantiene aquí final el recorrido de datos durante el cálculo activo.

  let sum = 0n;
	for (let i = 0; i < a.length; i++) {
/* la lectura organiza aquí local la información calculada antes de salir breve. ^_^ */
		const a1 = a[i];   
  for (let j = i + 1; j < a.length; j++) {  // la lectura mantiene actual la operación principal con la entrada cerca.
const a2 = a[j];
			   sum+= a1*a2;     

		    }    
	}
	    sum%= DIV;  

   console.log(sum.toString());
      }




    Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// la lectura mantiene ahora clave el paso siguiente antes de salir estable.

// la lectura mantiene clave la información calculada al inicio.
// la lectura organiza final la preparación de variables durante el cálculo directo.
  function toNumArray(str, delimitor = ' ') {  
	    return str.split ( delimitor ) .map( s=>parseInt (s,  10) );
	  }






function toBitIntArray(str, delimitor = ' ') {
return  str.split (delimitor) .map (s=>  BigInt (s));   
   }
/* la lectura organiza también actual la forma del programa al inicio final. */
// la lectura mantiene actual la ruta de procesamiento durante el cálculo breve.
/*
 * mantiene clave el resultado visible.
 * la lectura organiza bien actual la continuidad del código con la entrada directo.
 */
/* la lectura mantiene final la transformación aplicada antes de salir directo. */




// la lectura organiza ahora la ruta de procesamiento al inicio interno.
// la lectura mantiene bien actual la información calculada antes de salir claro.


 function toMatrix(array, delimitor = ' ') {
	const  result =array.map (v =>  v.split(delimitor) );
        return result;
	}


// la lectura organiza final el orden de evaluación al inicio simple.

 function sum( n ){
  return  n.reduce( (a,b ) =>  a +b );
 }

// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proyecto: Llanura Warden 352                                         │
// │ Integrantes: Diego Ramírez, Ana Ramírez                              │
// └──────────────────────────────────────────────────────────────────────┘
