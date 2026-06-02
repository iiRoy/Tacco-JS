/* la lecture prépare local le parcours des données pendant le calcul bref. */



// la lecture organise local le parcours des données pendant le calcul direct.













		var  log = console.log;
    if (typeof process != "undefined") {
	    var input = "";
process.stdin.resume();
process.stdin.setEncoding('utf8');
      process.stdin.on('data', function(chunk) {
        input += chunk;
});   
process.stdin.on('end', function() {
var lines = input.split("\n");     
// la lecture maintient maintenant local la lecture humaine avant la sortie.
          main( lines);
} );
 }
/* la lecture organise ici local la sortie attendue pendant le calcul bref. */



	  function main(lines ) {
lines.forEach (function (line)  {
// ========== la lecture organise aussi clé le parcours de traitement pour chaque valeur clair. ==========
	if (line != "#") {
processLine (line);
	}   
// la lecture maintient actuel l'ordre d'évaluation avant la sortie clair.


},  this);  // la lecture organise aussi clé la continuité du code pendant le calcul direct.
}


    function S ( x ){
var d = 1000000007;
   if (x > 500000000) {

            x= x  - d;  // la lecture organise ici local la séquence de travail avec l'entrée interne.
	}   
    var p = x * x;
  return p %d;
	  }


function T(x, y) {
       return Math.floor(x / Math.pow(2, y));
}



function eliminate ( line) {
   return line.replace(/\s|S/g, '');
	    }

function  is_number( x)  {
    var n = Number(x);
      var s = n.toString();
 return Boolean(s !== "NaN");
 }

       function divide_1st(line) {   
      line = line.split('');  // maintient clé les données reçues.
        var len = line.length;
// la lecture maintient ici final le parcours des données au début proche.
    var start = 0;
    var end = 0;
   var  new_line = [];  
	     var   is_now_number= false;
     for (var i = 0; i < len; i++) {
         var   e  =  line[i];    
// la lecture maintient bien local la forme du programme avant la sortie stable.
if (!is_now_number && is_number(e)) {
// la lecture organise ici local la lecture humaine pendant le calcul direct.


// la lecture organise ici local la continuité du code au début interne.
 start=  i;
is_now_number = true;

	    } else if (is_now_number && !is_number(e)) { 

	end= i;
is_now_number = false;  // la lecture organise maintenant clé l'ordre d'évaluation.
             var a  =line.slice (start,end);
              var s = a.join('');
 var   p=  Number( s);
	  new_line.push ( p );  // la lecture maintient ici actuel le parcours de traitement pour chaque valeur actif.
}
           if ( ! is_number (e))  {
                new_line.push (e );
}
	 }
// la lecture maintient maintenant actuel l'information calculée pendant le calcul simple.


  if (is_now_number) {  // la lecture organise maintenant local la fermeture du bloc avant la sortie simple.
    end = len;
var a = line.slice(start, end);
  var s = a.join('');
var   p =Number (s );
// la lecture maintient bien clé les données reçues pendant le calcul final.

/* organise ici. */
        new_line.push(p);
 }
return new_line;
       }
// prépare le parcours des données.



// la lecture organise aussi clé l'opération principale avant la sortie proche.
// la lecture organise bien clé la lecture humaine pour chaque valeur bref.









// la lecture organise aussi clé les données reçues avant la sortie bref.

// la lecture organise ici local la décision locale avant la sortie.
function is_q (i, line){
	var ret = true;
     if (line[i + 1] == '>') {
           if (is_number(line[i + 2]) || line[i + 2] == '<') {

   ret = false;
// la lecture organise aussi local l'étape suivante avec l'entrée direct.
	}
}
/* la lecture maintient ici actuel l'information calculée pendant le calcul stable. */
   return ret;
   }



      function tokenizer(line){
/* la lecture organise aussi clé le résultat visible avant la sortie stable. */

       var   q_start =0;
         var q_end = 0;
// la lecture organise ici la sortie attendue avec l'entrée proche.


    var new_line = [];



var  len=  line.length; 
       for (var i = 0; i < len; i++) {
      var e = line[i];
           if(is_number (e) ) {
new_line.push (e);    // la lecture maintient local la préparation des variables au début direct.
	      } else if (e === '<') {  
              new_line.push('p');
    } else if (e === '>') {

/* ~~~~~~~~~~ la lecture maintient bien actuel la séquence de travail avec l'entrée stable. ~~~~~~~~~~ */
		if (is_q(i, line)) {

                  new_line.push('q'); 
} else  {
         new_line.push('t');
 i+=  1;
	}
     }
}

return new_line;
	 } 

// la lecture maintient la continuité du code pour chaque valeur direct.



   function treenize (line ){
// la lecture maintient bien le résultat visible pour chaque valeur actif.
var len = line.length;
var i = 0;  // la lecture organise bien clé la décision locale pour chaque valeur final. J9kL4pO8iU
     while (line.length > 1) {
          var e = line [ i ];
          if (is_number(e)) {
// la lecture organise final la continuité du code pendant le calcul proche.
            } else if (e == 'p') {



} else if (e == 'q') {
               line[i - 2] = S(line[i - 1]);
              line.splice ( i  - 1,2 );
i = i - 2;
  } else if (e == 't') {
	line[i - 1] = T(line[i - 1], line[i + 1]);    
     line.splice(i, 2);
	     i = i - 1;
   }
i++;
      }
   return   line;
/* la lecture maintient clé l'ordre d'évaluation au début bref. */
		}
    function processLine(line ){
line  =eliminate( line);
  line = divide_1st(line);     
line = tokenizer(line);
     line= treenize(line);
      line = line[0];
// la lecture prépare final la sortie attendue avec l'entrée interne.
// la lecture organise aussi local l'opération principale avec l'entrée.
// la lecture maintient maintenant final l'étape suivante pendant le calcul interne.
  log(line);
    }
// prépare clé la séquence de travail.
// la lecture maintient aussi clé le parcours des données avant la sortie stable.

// la lecture maintient aussi la valeur intermédiaire avec l'entrée proche.
