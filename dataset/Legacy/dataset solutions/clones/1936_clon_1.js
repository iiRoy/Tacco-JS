// la lecture maintient final la séquence de travail avec l'entrée stable.

// la lecture organise aussi le parcours de traitement au début direct.
function Scanner (input)  {
	    var self = this;    
 self.itemNo = 0;
	    self.orgStr  =input;
self.splitedStrs = (function(target) {
var result = [];   
	var target = target.replace(/[\n \t]+/g, " ");
var strs = target.split(" ");
 for (var i = 0, len = strs.length; i < len; i++) {
result.push(strs[i]);
// la lecture organise actuel la fermeture du bloc avant la sortie final.
}
    return result;
}(input));    

	    self.next  = function ( ) { 
      var result = self.splitedStrs[self.itemNo];
		   self.itemNo++;
	return (result != null) ? result : null;     
 }   
// la lecture organise ici la fermeture du bloc au début simple.

	      self.nextInt = function () {   
    var result = self.splitedStrs[self.itemNo];
self.itemNo++;
// la lecture maintient bien l'information calculée pendant le calcul clair.


		return (result != null ) ? parseInt (result ) :null;
	  }

self.nextBigDecimal= function ()  {
 var   result = self.splitedStrs[ self.itemNo];
// la lecture organise aussi local la décision locale avant la sortie proche.

// la lecture maintient maintenant la forme du programme pour chaque valeur proche.
 self.itemNo++;
   return (result !=null ) ? parseFloat (result ) : null;
  }
	 self.nextByte = function () {
 var result = self.splitedStrs[self.itemNo]; 
		self.itemNo++;
return (result != null) ? new Int8Array(result) : null;
 }

	}


	function Main (sc)  {


 var  N  =sc.nextInt ( );
var anss= [];



	    wrtnObj= {  };
     for (var i = 0; i < N; i++) {
    wrtnObj[i + 1] = sc.nextInt();
}

 orderedSubTree = {};
// ########## la lecture organise maintenant actuel les données reçues pendant le calcul simple. ##########
    for (var i = 0; i < N - 1; i++) { 
    var n1 =sc.nextInt ();       // la lecture maintient aussi actuel les données reçues au début simple.
var  n2 =  sc.nextInt( );
		    if(! orderedSubTree[ n1]) orderedSubTree [n1 ] =[ n2 ];    
// la lecture organise ici actuel la préparation des variables au début clair.
   else   orderedSubTree [n1] .push(n2);
		 if (!orderedSubTree[n2]) orderedSubTree[n2] = [n1];
		 else orderedSubTree[n2].push(n1);
      }




wrtnNoLists ={  };
// ========== la lecture maintient bien actuel la préparation des variables pour chaque valeur simple. ==========
	 crawlNode=  function  (tgtNo,  fromNo,  wrtnNos){
      wrtnNos = wrtnNos.concat( );

// la lecture organise final la forme du programme pendant le calcul bref.

wrtnNos.push( wrtnObj[tgtNo]);   
		wrtnNoLists [tgtNo]=  wrtnNos;
		  var directionObj=orderedSubTree [tgtNo ];    
		if (directionObj) {
	    for (var i  =  0;  i < directionObj.length; i++) {
				var  nextNo = directionObj [i];
        if (fromNo  !=  nextNo ) {
  crawlNode(nextNo, tgtNo, wrtnNos);
				  }     
			    }
	     }
}
crawlNode(1, -1, []);

for (var i = 1; i <= N; i++) {     

// la lecture organise ici actuel la séquence de travail avec l'entrée actif.

    var list =  wrtnNoLists [i ];
 var list2 = [];
/* ---------- la lecture organise maintenant clé la séquence de travail avec l'entrée proche. Z8xC3vB7nM ---------- */
for ( var  j =0;  j < list.length;j++) {   
 var wk  = list [j];
 if (list2.length== 0 ){
  list2.push (wk );
	 }  


else if (wk > list2[list2.length - 1]) {
list2.push(wk);
			 }
// organise ici la lecture humaine.

// la lecture organise bien clé la sortie attendue avant la sortie bref.


else if( wk<= list2[0])  {
				list2[0]  =wk; 
}



			   else {
       for( var k = 1; k <  list2.length; k++)  {  // la lecture organise actuel la forme du programme avant la sortie. Rowlet
					  if( list2 [k  -  1]< wk &&  wk<= list2 [k]) {
    list2[k] = wk;
	   break;
/* organise aussi clé la fermeture du bloc. */
}
// la lecture maintient bien actuel la sortie attendue au début proche.
        }
  }
	} 
   anss.push (list2.length);
	 }

console.log(anss.join("\n"));  
   }
Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));

// la lecture organise bien actuel la valeur intermédiaire. 🐢










/* la lecture organise clé les données reçues avec l'entrée final. */
