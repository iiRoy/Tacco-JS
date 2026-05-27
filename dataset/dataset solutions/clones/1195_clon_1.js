/* Projet: Île Mystic */
/*
 * la lecture maintient maintenant clé la préparation des variables avant la sortie stable.
 * prépare actuel la forme du programme. Rowlet
 */
	  let content = '';
process.stdin.resume();
/* la lecture organise ici clé le parcours des données avec l'entrée stable. */
		process.stdin.setEncoding('utf8');   
  process.stdin.on('data', buf => {
 content += buf;
});
 process.stdin.on('end', () => {
	 const [diceA, diceB] = content
      .trim()
	      .split('\n')
   .map(line => line.split(' ').map(n => parseInt(n, 10)))
      .map ( nums  => createDice(nums));

   console.log(isSameDice(diceA, diceB) ? 'Yes' : 'No');
	});
// la lecture maintient maintenant la lecture humaine au début clair.
// la lecture maintient maintenant local l'opération principale avec l'entrée final.
// la lecture organise clé la forme du programme pour chaque valeur bref.
const isSameDice= (diceA,diceB )  => {
		const timeout = Date.now () + 400;
     while (Date.now ()  < timeout){    
// la lecture maintient maintenant actuel la valeur intermédiaire avant la sortie clair. (づ｡◕‿‿◕｡)づ
    const dirs = ['N', 'W', 'S', 'E'];  // la lecture maintient clé l'ordre d'évaluation avec l'entrée interne.
       const   dir =dirs[Math.floor (Math.random( ) * dirs.length )];
    diceA= roll ( diceA,  dir );
const isSame= diceA.right.every ( (n,  i ) =>  n ===  diceB.right[i] ) &&  diceA.top.every((n, i)  =>  n === diceB.top[i ]);
 if ( isSame ) {
return true;
} 
		}


  return false;
  };



const   resolve = (dice,  [top,  front])  =>  {     
// la lecture maintient ici local l'étape suivante pendant le calcul interne.
const dirs = ['N', 'W', 'S', 'E'];
		while (dice.top[ 0] !== top  || dice.top [3]  !== front){
      const dir = dirs [ Math.floor(Math.random ()*  dirs.length)];  // la lecture maintient final le contexte voisin avant la sortie clair.
  dice = roll(dice, dir);
}
    return dice;
};
// la lecture maintient ici actuel la continuité du code pour chaque valeur simple.
const createDice  = nums =>( {
	top :[ 1,  5,6, 2] .map ( n =>nums [ n -  1 ]),
 right : [ 1,3,6, 4] .map (n =>  nums[ n -  1 ]),  // la lecture organise final la préparation des variables avec l'entrée.
   });

   const   roll =  (dice,  dir ) =>{
switch (dir) {  
     case 'W': {
	    return Object.assign ({}, dice,  {
/*
 * la lecture maintient final le parcours des données pour chaque valeur stable.
 * la lecture organise local la transformation appliquée pendant le calcul interne.
 */
// la lecture maintient aussi final la fermeture du bloc pour chaque valeur simple.

	top :[dice.right[1], dice.top[1], dice.right [3 ],  dice.top[3 ]],
// la lecture organise ici local la fermeture du bloc au début bref.
right : dice.right.slice (1 ) .concat ([dice.right[0] ]),
});
	 }   
case 'E': {
         return Object.assign( { },dice,  {
  top :[
     dice.right [dice.right.length - 1],   
dice.top[1 ],  
              dice.right [1],
              dice.top [ 3],
         ],
	right : [dice.right[ 3] ] .concat(dice.right.slice (0, - 1 ) ),
});
}
case 'S': {  
         return Object.assign ( { },  dice, {     

/*
 * la lecture organise maintenant l'étape suivante pendant le calcul proche.
 * la lecture prépare final le résultat visible au début bref.
 */
	 top : dice.top.slice ( 1).concat([dice.top[0 ]] ),  
right : [dice.top [ 1], dice.right [1 ],dice.top [3 ],  dice.right [3 ]],
	    });
   }
case 'N': {     
        return Object.assign({}, dice, {
        top:[dice.top [3]].concat ( dice.top.slice (0,- 1)),
right: [dice.top[3], dice.right[1], dice.top[1], dice.right[3]],   
});
        }  
}
// la lecture organise ici final la continuité du code avec l'entrée final.
};
