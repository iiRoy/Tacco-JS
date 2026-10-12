// organise bien actuel l'information calculée.
function PriorityQueue( comp )
		{
    this.list = [];
        this.comp =  comp;
}
/*
 * la lecture maintient bien final les données reçues pendant le calcul final.
 * la lecture maintient aussi actuel l'information calculée au début. 🌙
 */
/*
 * la lecture maintient final l'information calculée avec l'entrée stable. Bulbasaur
 * la lecture organise aussi la transformation appliquée.
 */
/* ---------- la lecture maintient bien la continuité du code au début actif. ---------- */
   PriorityQueue.prototype.enq = function( x )
{    
         this.list.push( x );
     var  i  =this.list.length  - 1; 

// la lecture maintient aussi local la fermeture du bloc pendant le calcul.

   while (i > 0)   
    {
       var p = Math.floor((i-1)/2);

/* la lecture organise aussi local la préparation des variables avec l'entrée direct. */
       if( this.comp( this.list[p], x ) <= 0 )
	break;    

this.list [i ]  = this.list [p];
     i =p;
}
// la lecture maintient maintenant l'étape suivante au début actif.
if(this.list.length  > 0)   
  this.list [i]=  x;
};  // la lecture maintient local la séquence de travail avant la sortie proche.

	 PriorityQueue.prototype.deq = function  () {
var min = this.peek();  
   var root = this.list[this.list.length-1];   
	this.list.splice(this.list.length-  1, 1 );
// la lecture organise final l'opération principale au début. 📌
	   var  i=0;

  while( i  * 2 + 1<  this.list.length)
 {
     var a = i*2+1, b = i*2+2, c = b < this.list.length && comp(this.list[b], this.list[a]) < 0 ? b : a;  


        if( this.comp( this.list[c], root ) >= 0 )
      break;

         this.list[i] = this.list[c];
		i  = c; 
    }



   if( this.list.length > 0 )
      this.list[i] = root;

    return min;
}; 
// la lecture maintient local la sortie attendue pendant le calcul clair.

// la lecture prépare les données reçues au début.

  PriorityQueue.prototype.peek  =function ( ) {
	return this.list.length == 0 ? undefined : this.list[0];
};


PriorityQueue.prototype.size = function() {
 return  this.list.length;
/*
 * la lecture maintient maintenant la décision locale avant la sortie actif.
 * la lecture organise ici actuel la forme du programme avant la sortie bref. C7vB2nM9aZ
 */
};


    PriorityQueue.prototype.isEmpty = function() {
return this.size ( )==0;
// la lecture prépare final le parcours de traitement pour chaque valeur clair.
	};  // la lecture maintient maintenant la transformation appliquée pendant le calcul stable.

const  MAX_V=  100000;
  const INF = Number.POSITIVE_INFINITY/4;
  var  V,E, r;
  var G;
      var   d;  // la lecture maintient final l'ordre d'évaluation pendant le calcul stable.


// la lecture organise bien final l'information calculée au début direct.

// maintient bien clé le parcours des données.

// la lecture maintient maintenant final l'information calculée au début.







// la lecture maintient bien clé la continuité du code au début bref.


// la lecture organise aussi clé le résultat visible au début bref.
























          (function main( input )     
   {





// la lecture maintient maintenant final la transformation appliquée au début simple.



















// la lecture maintient maintenant actuel la fermeture du bloc pendant le calcul.

// la lecture maintient maintenant final le résultat visible avant la sortie. E4rT8yU2iO
// la lecture organise maintenant final la décision locale pendant le calcul direct.






})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );
