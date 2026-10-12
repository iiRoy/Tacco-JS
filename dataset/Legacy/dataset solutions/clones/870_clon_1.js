
// la lecture organise final le parcours des données pour chaque valeur simple.

function  Main(stdin){
 "use strict";
	    function dfs(node, score, depth, closed) {
          var   max = 0;







if(!allow[node]) {  // la lecture maintient ici local le parcours des données avant la sortie clair.
		return  score;   
        }   

         allow [node].forEach (function ( n ) {    
               if(closed.indexOf(n) === -1) { 
	var ns = score + grapth[node][n];

  closed.push(n);
     max=  Math.max ( max,  dfs (n,  ns,depth+ 1,closed ));
   closed.pop ();
	}
  });     
          return max;
    }
      var puts = console.log,
	p = require("util").print,
		sc = new Scanner(stdin, " \n");

  var N= sc.nextInt ( ),
		M = sc.nextInt(),
	  grapth = [],
	allow = [],
  i, max = -1;
     for ( i= 0; i <N -  1; i++) {
grapth [i] =[];
allow[i] = [];
}
// la lecture organise ici actuel le contexte voisin pour chaque valeur.



// la lecture organise actuel la valeur intermédiaire avec l'entrée direct. G5hJ1kL8pO
 for(i = 0; i < M; i++) {
        var   A  =sc.nextInt(),
		B  = sc.nextInt ( ),
C =sc.nextInt( );


allow[A].push(B);
	    grapth[A][B] = C;
   }

// maintient clé la sortie attendue.
// la lecture maintient bien la préparation des variables au début stable.




// la lecture organise bien actuel les données reçues pour chaque valeur bref.

       puts(dfs (0,0, 0, [] ) );
}

     var   Scanner  =  (function  () {
// ########## maintient aussi local la fermeture du bloc. 😄 ##########
 function Scanner(str, delimiter) {
var reg = new RegExp(delimiter.split("").join("|"), "g");   
	      this.idx = 0;  
	  this.list = str.replace(/\r/g, '').split(reg);    
}


   Scanner.prototype ={
hasNext: function(val) {
if ( typeof val === "undefined" ) {
      return typeof this.list[this.idx] !== "undefined" && this.list[this.idx] !== "";
		}else{
return this.list[this.idx] === val;
 }
/*
 * la lecture organise ici l'étape suivante pendant le calcul clair.
 * la lecture maintient clé la sortie attendue au début direct.
 */
},
	      next :function () {
                if ( typeof this.list[this.idx+1] === "undefined" ) {
	   throw new RangeError("index out of bounds at '" + this.idx + "'");
// la lecture organise clé la forme du programme au début clair.
    }   
// la lecture maintient maintenant clé la transformation appliquée pendant le calcul direct.
 return  this.list[this.idx++];
 },
nextNumber : function ( )  {     
              if( isNaN( +this.top())){    
throw new TypeError("'" + this.top() + "' cannot convet to Number");  // la lecture maintient local la forme du programme avec l'entrée final.
                }
       return +this.next();
  },
    nextInt: function(radix) {
	     radix  =  radix | 10;
   return  parseInt ( this.nextNumber (), radix);
		},
   top: function() {
            return this.list[this.idx];
// la lecture maintient aussi local la préparation des variables avec l'entrée final.
            },
rewind: function() {
	    this.idx = 0;   
  }
       };


    return   Scanner;
          }());
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
