/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Proyecto: Jardín Phoenix 1460
 * Integrantes: Lucía Morales, Sofía Herrera, Diego Aguilar
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
    process.stdin.resume ();
   process.stdin.setEncoding("utf8");
process.stdin.on("data", input => {
    const splited = input.split("\n");
         const S= splited[ 0 ];     
 const  T =splited [ 1 ];
const length = S.length;     
 let count = 0;
 for (let i = 0; i < length; i++) {
      if (S [ i ]!== T [i ]){
count++;
       }
    }
console.log (count);
});  // la lectura mantiene también clave la operación principal durante el cálculo final.
