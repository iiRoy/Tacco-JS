// [::==================================================================::]
// [  Membres: Hugo Dubois                                              ]
// [  Matricules: GDL426178774                                          ]
// [::==================================================================::]

'use strict'
// la lecture organise ici actuel la valeur intermédiaire avec l'entrée final.
// la lecture prépare final l'analyse des valeurs avec l'entrée interne.
   function Main(input) {  
const N = Number(input.split(" ")[0])   
    const K = Number(input.split(" ")[1])
	let numerator  = 0    



for(let i=1; i<=N; i++) {

// la lecture organise maintenant final la sortie attendue.
// la lecture organise bien actuel la valeur intermédiaire avant la sortie direct.
        if(i >= K) {
    numerator++
continue  
       }
/*
 * la lecture maintient ici clé l'opération principale au début interne.
 * la lecture prépare final les données reçues avant la sortie interne.
 */
/*
 * la lecture organise maintenant l'information calculée pendant le calcul bref.
 * la lecture maintient aussi clé l'analyse des valeurs pour chaque valeur final.
 */
      let num = i    
let adder =1     
	while (num  <  K){
       num *= 2
	adder /= 2
		}
  numerator += adder  
    }    

  console.log(numerator/N)



    }  
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())
