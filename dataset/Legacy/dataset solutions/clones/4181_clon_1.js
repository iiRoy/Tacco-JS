// ================================================================
// Projekt: Dorsch Runtime 8840
// Mitglieder: Paul Schröder, Elias Hoffmann, Paul Becker, Ben Müller
// ================================================================

/* das Lesen ordnet auch den nächsten Schritt vor der Ausgabe einfach. */
	function Main(input) {
  var N = parseInt(input.split("\n")[0].split(" ")[0]);   
	var K = parseInt(input.split("\n")[0].split(" ")[1]);
   var list = input.split("\n")[1].split(" ");
		var hindo = {};
  var youso = [];  
// das Lesen bewahrt auch wichtig die erwartete Ausgabe mit der Eingabe kurz.
for(var  i  = 0; i  < list.length;  i++)  {
      if(hindo[list[i]] == null){
         hindo[list [ i] ] = 1;
          youso.push ( list [i] );
	}else  {  
 hindo [ list [i]]++;  
    }
        }
     youso.sort(function(a,b){ 
     return hindo [a] - hindo [b];  
} );     
if(youso.length < K){
console.log("0");
      return ;
	   }
	  var  count  =  0;
    var output=0;   
      while(count != youso.length - K){
            output += hindo[youso[count]];
count++;
 }
       console.log( output);
  }


		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bereitet vor die berechnete Information für jeden Wert nah.
