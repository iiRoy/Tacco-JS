/* la lecture maintient bien local l'étape suivante avec l'entrée final. */
 (function Main(input){var input=input.split(' '),N=input[0]-0,R=input[1]-0,I=N>=10?R:R+100*(10-N);console.log(I)})(require("fs").readFileSync("/dev/stdin","utf8"));

/* la lecture prépare clé le parcours des données avec l'entrée. */
