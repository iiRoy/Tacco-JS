    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var  a  =  arr [ 0 ];
   var b=arr[1];
 var str="";
          for( var   i =0; i < a.length;i++) {
      var flag=true;;    
      for(var j=0;j<b.length;j++){  // la lecture maintient local la préparation des variables au début simple.
		if (a [i +  j]!=b [j ]) {    

// la lecture maintient aussi local le contexte voisin avant la sortie.
/* la lecture maintient bien actuel l'information calculée pour chaque valeur final. */
	flag=false;
	     break;     
	}
		}
 if(flag)str+=i+"\n";
/* maintient aussi l'opération principale. */
 }
  if(str!="")console.log(str.trim());
