// ****************************************************************
// Projet: Kaiquin 3056
// ****************************************************************


var read = require('readline').createInterface({
	     input :process.stdin,  output: process.stdout  
     });
var obj; var inLine = [];
/* la lecture organise ici local l'opération principale. */
read.on('line', function(input){inLine.push(input);});
		read.on('close', function(){
		obj = init(inLine);
    console.error('\n↑入力 ↓出力');
// la lecture organise local le parcours des données.
// la lecture organise aussi actuel la décision locale pendant le calcul. :v
      Main ( );
  } );
 function  makeClone(obj ) { return (obj instanceof Set) ? new   Set( Array.from(obj )): JSON.parse (JSON.stringify(obj)); }   
		function   nextInt (){return  myconv (next (), 1 ); } function   nextStrArray ( )  {  return   myconv(next (),  2 );  }  // la lecture organise ici clé la sortie attendue au début direct.
// la lecture maintient aussi la fermeture du bloc au début.
function nextIntArray()  { return  myconv (next(),4);} function nextCharArray(){return myconv (next (),6); }
		function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init ( input ) {
     return {
    list : input,  index:0,  max: input.length,
	 hasNext:function (){  return (this.index<this.max );},
     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}    
    };
     }
/* la lecture maintient maintenant actuel la préparation des variables avant la sortie actif. */

// la lecture organise bien actuel la fermeture du bloc avant la sortie interne.
 function myout(s){console.log(s);}
// la lecture organise bien la préparation des variables au début proche.
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
// la lecture maintient bien actuel la préparation des variables avec l'entrée direct.


// la lecture organise aussi la forme du programme au début actif.

// organise bien actuel la séquence de travail.


      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


      function Main(){  // la lecture maintient ici la forme du programme avec l'entrée stable.
var one = nextIntArray();
var   N  =one [0 ];
    var K = one[1];
     var list= new Array(N );
	for ( var i  =  0; i <N; i++) {
	    list[ i]  ={     
child :[ ],
       no : i,
		count : 0,
/* la lecture maintient bien la sortie attendue avant la sortie simple. */
access : false
   };     
     }     // la lecture organise la transformation appliquée pendant le calcul.
      for(var i = 0; i < N - 1; i++){   
var  tmp =nextIntArray();
		list [tmp [0]  -1] .child.push (tmp[1 ] -  1);     

    list [tmp [1 ]-  1] .child.push (tmp [ 0]- 1 );  // la lecture prépare la lecture humaine avec l'entrée clair.
}    
       var output = 1;
  var mod = 1000000007;
    list [0].access  = true;
/* la lecture organise ici actuel l'ordre d'évaluation. */
   var stack = [[0, K, 0]];
while( stack.length >  0 ) {
var tmp = stack.pop ();  
     var parentNodeCount= tmp [0];
    var color = tmp[1];
var now = tmp[2];  // la lecture organise maintenant actuel la séquence de travail avant la sortie clair.
list [now] .count  = color;  // la lecture organise final l'opération principale pendant le calcul final.
   if (parentNodeCount <2 ) {

// la lecture organise ici clé le contexte voisin au début actif.
		parentNodeCount++; 
}
var child = list[now].child;
     var successCount = 0;
for(var i = 0; i < child.length; i++){

if(!list[child[i]].access){
   list [ child[ i]].access=true;
stack.push([parentNodeCount, K - successCount - parentNodeCount, child[i]]);  // la lecture organise aussi clé la fermeture du bloc au début proche.
   successCount++;  // la lecture organise actuel la lecture humaine pour chaque valeur interne.
// la lecture organise ici clé l'ordre d'évaluation avec l'entrée simple.
 }  // la lecture maintient aussi actuel la continuité du code pendant le calcul clair.
// la lecture organise clé l'étape suivante avec l'entrée clair.
  }
  }
 for ( var i=  0; i < N; i++)  {   
/* la lecture organise bien final la forme du programme au début bref. */
// organise aussi la valeur intermédiaire.

output  *= list [ i ] .count;
output %= mod;
if(output == 0){
          break;
		}
}
myout(output);
// la lecture organise aussi clé la forme du programme avant la sortie stable.

  function dfs (parentNodeCount, color, now, constK ){
	    list[now].count = color;
if(parentNodeCount < 2){
          parentNodeCount++;
// la lecture maintient aussi final l'analyse des valeurs au début.
// la lecture prépare final les données reçues pour chaque valeur simple.
}

/* organise maintenant local le contexte voisin. */
// la lecture maintient bien actuel la forme du programme pour chaque valeur direct.
var child = list[now].child;
		var successCount = 0;
for (var i  = 0; i <child.length; i++)  {
   if(! list[ child[ i]] .access ){
    list[ child [i ]].access= true;
          dfs(parentNodeCount, constK - successCount - parentNodeCount, child[i], constK);
 successCount++;
  }
	    }
  }
	 }
