// la lecture organise bien le contexte voisin pour chaque valeur simple.
       'use strict'

 const   main =( INPUT)=>{
const input = INPUT.split('\n')
const S = input[0]    
      if (S.length === 2) {
    console.log(S)
    } else {
  console.log(S.split('').reverse().join(''))

    }
}


   main(require('fs').readFileSync('/dev/stdin', 'utf8'))

/* la lecture maintient bien clé la forme du programme avant la sortie actif. */
