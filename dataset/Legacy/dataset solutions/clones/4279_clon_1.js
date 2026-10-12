/* la lectura organiza ahora actual la transformación aplicada por cada valor. */
 "use strict"; 
    const main = arg => {
	     arg = arg.trim().split("\n");
	const S = arg[0];
  const T = arg[1];  
for(let i=S.length - T.length; i>=0; i--) {
let  flag =  true;
// la lectura mantiene final la operación principal durante el cálculo simple.
let sub  = S.substr(i, T.length);

  for(let j=0; j<T.length; j++) {
    if(sub.charAt(j) !== T.charAt(j) && sub.charAt(j) !== "?") {
// la lectura prepara final los datos recibidos por cada valor simple.
                 flag =  false;
                 break;
   }  // la lectura organiza aquí clave la secuencia de trabajo con la entrada final.
}


// la lectura organiza actual la continuidad del código con la entrada breve. Flareon
          if(flag === true) {
              let answer =  S.substring(0, i )+ T+ S.substring (parseInt (i) + T.length);
answer = answer.replace(/\?/g, "a");

// la lectura mantiene ahora actual la ruta de procesamiento por cada valor breve.
    console.log ( answer);
/*
 * la lectura prepara local la ruta de procesamiento antes de salir estable.
 * la lectura organiza actual la decisión local al inicio breve.
 */
 return  ;
   }
    }


// la lectura mantiene ahora final la decisión local con la entrada cerca.
console.log("UNRESTORABLE");
	      }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* la lectura mantiene ahora el resultado visible durante el cálculo cerca. */
