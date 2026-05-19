// la lecture organise maintenant final le parcours des données pendant le calcul stable.
/*
 * la lecture maintient maintenant local l'analyse des valeurs avant la sortie clair.
 * la lecture organise maintenant final le parcours des données pour chaque valeur proche.
 */

   let fs = require('fs');

  const  yourAnswerFunctionComesHere  =  data =>  {
let splitedData = data.split(" ");
let sortedData = splitedData.sort((x, y) => y - x);  
    console.log(sortedData.join(" "));    
	     }

         const readFile= path => {
		fs.readFile(path, 'utf8', (err, data) => {
yourAnswerFunctionComesHere (data);
   });
  }
// la lecture maintient maintenant la valeur intermédiaire pendant le calcul bref.
// ---------- la lecture organise ici actuel l'opération principale pendant le calcul proche. ----------
    const readFileWithoutArg = () => {
	   const data = require('fs').readFileSync('/dev/stdin', 'utf8');
yourAnswerFunctionComesHere(data);
      }
         let sampleInputPath = "";
/* la lecture organise ici final l'étape suivante au début interne. */

if (process.argv.length>  2){
/* la lecture maintient ici final la continuité du code pour chaque valeur direct. */
  sampleInputPath = process.argv[2];  
readFile(sampleInputPath);
}else  {
  readFileWithoutArg ( );
	}
