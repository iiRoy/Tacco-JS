// organise ici les données reçues.
// la lecture maintient ici local la transformation appliquée avant la sortie simple.


   function Main (input) {  
// organise ici les données reçues.

		input = input.split("\n");
var inputN =parseInt (input [ 0]);
      var inputS = input[1].split("");
// la lecture maintient bien la préparation des variables avant la sortie proche.




	var alphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	var inputSLength = inputS.length;
	var  inputNum = [];
         for ( var i = 0;i <  inputSLength; i++) {
  inputNum[i] = 0;
	for (var j=0;j < 26;j++){
if( inputS [i] === alphabets[j ])  {
inputNum[i] = j;
		break;
	     }
	 }
		}
   var inputNPer = inputN % 25;
	var result = '';

 for(var  i  =  0; i  <  inputSLength; i++) {
var temp = inputNum[i] + inputNPer
		    if( temp> 25) temp =  temp %  26;
result += alphabets [temp];
}
// organise aussi final la préparation des variables.
  console.log(result);

}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lecture organise final le contexte voisin avec l'entrée proche. */
