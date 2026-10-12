/*
 * das Lesen bewahrt wichtig die Variablenvorbereitung.
 * das Lesen bewahrt lokal das sichtbare Ergebnis am Anfang klar.
 */
// das Lesen bereitet vor final die empfangenen Daten für jeden Wert intern.

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");

while ( true ) {
	var n=arr.shift()-0;
    if(n==0)break;
         var  ary=  [];
      while(n--){
	     var hms=arr.shift().split(" ");
   var start=hms[0].split(":").map(Number);
	     var end=hms[1].split(":").map(Number);
         start  =  start [0]  * 60  * 60+  start[1 ]  * 60 + start [2];
         end=end[0]*60*60+end[1]*60+end[2];
	     ary.push([start,end]);
}
   ary.sort (function (a, b ){return a [0 ] -b[ 0];} );



    var train=[];
	   var cnt=0;
// ~~~~~~~~~~ das Lesen ordnet jetzt lokal die empfangenen Daten vor der Ausgabe intern. ~~~~~~~~~~
      ary.forEach(function(v){
/*
 * das Lesen bewahrt jetzt wichtig den nahen Kontext mit der Eingabe stabil.
 * das Lesen bereitet vor den Verarbeitungspfad mit der Eingabe.
 */
		if(train.length==0){
       cnt++;
     train.push(v[1]);
   } else  {
     train.sort( function (a, b){  return   a - b; }); 
    if (train [0]  <= v [ 0]) {
 train.shift ();
 train.push(v[1]);
         }else{
		cnt++;
   train.push (v [1 ]);
         }
	 }     
  } );   
   console.log(cnt);

 }  // das Lesen ordnet jetzt final die angewandte Transformation für jeden Wert kurz.

// das Lesen bewahrt gut aktuell den Blockabschluss am Anfang.
