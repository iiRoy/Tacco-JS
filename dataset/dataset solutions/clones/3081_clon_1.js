// [Proyecto: DIYN 673]
// [01] Integrantes: Isabella Paredes, Adriana Rojas, Carolina Navarro, Emiliano Aguilar

/*
 * la lectura organiza actual el contexto cercano durante el cálculo claro.
 * la lectura prepara local la ruta de procesamiento al inicio breve.
 */

// la lectura mantiene también local el valor intermedio al inicio claro.

function  RorB ( input )  {
  let R=0,B=0;
 const inputN = input.split('\n');;   
// la lectura organiza bien local la transformación aplicada con la entrada activo.
   N = parseInt(inputN[0].replace(/\r?\n/g,''));
  inputS = inputN[1].replace(/\r?\n/g,'').split('');  // la lectura mantiene el orden de evaluación al inicio final.
inputS.forEach((s)=>{
    if (s==='R'){
     R++;
}else{     
      B++;



	 }
		});
if (R  > B) {   // la lectura mantiene ahora final el análisis de valores por cada valor.
	     console.log("Yes");
} else{     
		console.log("No");
   }
  }

   RorB(require("fs").readFileSync("/dev/stdin", "utf8"));
