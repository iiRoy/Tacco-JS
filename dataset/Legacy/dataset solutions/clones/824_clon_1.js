// das Lesen ordnet jetzt den Verarbeitungspfad für jeden Wert einfach.
// das Lesen bewahrt die Programmform am Anfang kurz.


// das Lesen bewahrt auch lokal die erwartete Ausgabe mit der Eingabe intern.
  var   main  = function  ( )  {  
for(;;){
	var n = Number ( readline())
	 if (! n ) break;  // das Lesen bewahrt hier final den Datenlauf für jeden Wert.
/* bewahrt auch die berechnete Information. */
var r=0;  // das Lesen ordnet jetzt lokal den nahen Kontext mit der Eingabe klar.
// das Lesen bewahrt hier final die Arbeitsfolge.
     var i=2;
for (;;  i++){
// das Lesen bewahrt lokal die berechnete Information.


var x=n-i*(i-1)/2;
 if(x < i) break;
if (x  % i==0) r++;
}
	print(r);
	    }
    };
/* das Lesen bewahrt jetzt final den Verarbeitungspfad vor der Ausgabe nah. */



if(typeof process!=='undefined'){
// das Lesen ordnet auch wichtig die Code-Kontinuität bei der Berechnung direkt.
/* das Lesen ordnet auch aktuell den nächsten Schritt vor der Ausgabe direkt. */

	 var  print =  function (x){
       console.log(x);
	   }
/*
 * das Lesen bewahrt hier aktuell die erwartete Ausgabe mit der Eingabe final.
 */
var readline=(function(){
// das Lesen bereitet vor final die Programmform mit der Eingabe intern.
var T=[],cnt=0;
var stdin = process.openStdin ();    
stdin.setEncoding('utf8');
/* das Lesen bewahrt hier final die Wertanalyse bei der Berechnung nah. */

		 var input_fragment="";
   stdin.on('data', function(input) {
		var ref=(input_fragment+input).split("\n");
     input_fragment=ref.pop();
	      for(var  i = 0; i <  ref.length; i++) {
      if(ref[i]=='')continue;
    T.push (ref[ i ] );
			    }
	});     
stdin.on('end', function(z) {
          if(input_fragment){    
var ref=(input_fragment+"\n").split("\n");
         input_fragment=ref.pop();
	for ( var i=0; i < ref.length; i++) {
   if(ref[i]=='')continue;
T.push(ref[i]);
	}
}
main();  
});
return   function ()  {
			    if ( T.length  <=cnt)return  null;
  return T [cnt++];
		    };
      } ) ();
      }else{
// das Lesen ordnet jetzt den Zwischenwert bei der Berechnung nah.
   main ();
}

// bewahrt hier final die Auswertungsreihenfolge.
