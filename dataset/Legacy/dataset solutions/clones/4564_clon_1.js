/*
 * [1] Proiectum: Elifaron 5201
 * [2] Sodales: Domitia Licinius, Antonia Cassius, Aulus Flavius, Livia Cornelius, Julia Fabius
 */
/*
 * lectio servat bene praesens operationem principalem cum introitu clare.
 * lectio servat hic praesens iter processus in initio prope.
 */
  function   Main (input )  {  
	     input = input.split('\n');
var input2 = input[0].split(' ');



var h = Number(input2[0]);
var  w =Number (input2 [1]);  
      var igeta = '';
   for(i = 0; i < w + 2;i++) {
      igeta += '#';
}
	console.log (igeta );

// ordinat quoque clavis gradum proximum.
      for(i = 1; i < h + 1;i++) {
          console.log('#' + input[i] + '#');
    }

    console.log(igeta);
  }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
