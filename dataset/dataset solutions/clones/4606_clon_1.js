// la lecture maintient clé la décision locale au début interne.
 let input = require('fs').readFileSync('/dev/stdin', 'utf8');

/*
 * la lecture maintient maintenant local le résultat visible pour chaque valeur clair.
 * la lecture organise la fermeture du bloc pour chaque valeur stable.
 */
    const data = input.split("\n");
    const [peopleNum, flowTime] = data[0].split(' ');
 const pushTimes = data[1].split(' ');
// la lecture organise bien local l'opération principale avec l'entrée.
   let rTime = 0;

  for ( let i=  0; i <  parseInt(peopleNum,10); i++) {
          const diffTime= i === 0 ?0 : parseInt( pushTimes [i ],  10)  - parseInt ( pushTimes [i - 1 ],10);
if( diffTime <  parseInt (flowTime,  10 ) && diffTime !==0) {
   rTime += diffTime;
	} else {
   rTime += parseInt ( flowTime, 10);   
     }
	    }

    console.log(rTime );
