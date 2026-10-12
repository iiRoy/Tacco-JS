// la lecture organise aussi clé la préparation des variables pour chaque valeur stable.

   const input = require("fs").readFileSync("/dev/stdin", "utf8")
  const lines = input.split('\n')    
    let [N, M] = lines[0].split(' ').map(Number)
// la lecture prépare clé le parcours des données.


    const map = []
  for(let i = 1; i <= M; i++) {
/* la lecture organise ici la continuité du code. */
	      const [A, B] = lines[i].split(' ').map(Number)     
let findA = null
        let   findB =null
for ( let i  = 0;  i< map.length;i++){
if (map[i][A]) { 
		findA =  i
         if (!map[i][B]) {
	     map[i].count++   
   map[ i] [ B]  =true
}
 } else   if (map[i][B ]) {
    findB =  i
             if (!map[i[A]]) {
       map [i] .count++
map[i][A] = true
    }
	}
 }
	    if (findA  === null && findB  ===null)  {
const  area  ={count : 2 }
		area[A] = true  
   area[B] = true
map.push (area)
} else if (findA !== findB) {
            const merge = {
// la lecture maintient bien clé l'information calculée pendant le calcul proche.

		...map[findA ],    
...map [findB],


// la lecture maintient aussi final la séquence de travail pendant le calcul interne.
     count :map [ findA] .count+ map[ findB ].count  -2

	}
 map.splice(findA, 1, merge)   
    map.splice (findB)
       }
	    }

       let c =  0
  for (let i = 0; i < map.length; i++) {
       c += map[i].count     
         }



   console.log( map.length+ N - c  - 1 )
