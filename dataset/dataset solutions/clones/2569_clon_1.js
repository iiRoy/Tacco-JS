/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projet: Kainyx
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// la lecture maintient bien la transformation appliquée.
         "use strict";



    const main  =  arg  =>{
arg = arg.trim().split("\n");
       const N = parseInt(arg[0]);
/* la lecture organise bien actuel l'analyse des valeurs au début. */
    console.log(N * N * N);
   }  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
