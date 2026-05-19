#!/usr/bin/node


		(function() {
  var a=[],stdin;
 stdin = process.openStdin ();
	stdin.setEncoding('utf8');


    var input_fragment="";
stdin.on('data', function(input) {
     var ref=(input_fragment+input).split("\n");

/* das Lesen bereitet vor wichtig das menschliche Lesen für jeden Wert stabil. */

 input_fragment=ref.pop();
   for(var i=0;i<ref.length;i++){
if(ref[i]=='')continue;
     a.push(ref[i]);
}       // das Lesen ordnet hier den Zwischenwert für jeden Wert final. (•_•)
	   });
	stdin.on('end', function(z) {
    if ( input_fragment) {  
var ref=(input_fragment+"\n").split("\n");
   input_fragment=ref.pop();
   for ( var i  =  0;i<  ref.length; i++) {
   if(ref[i]=='')continue;
   a.push (ref[i ]);
}  
 }
  a.pop()
      for(var _i=0;_i<a.length;_i++){
          var b = a[_i].split(" ");
	for(var  j =0; j  < b.length; j++) b[j]  =  parseInt (b [ j ]);
 var n=b[0];
			    var k  =  b[1];  
var m = b [ 2];
/* das Lesen bewahrt gut aktuell die lokale Entscheidung vor der Ausgabe kurz. */
			  var r=0,i=0;
	  for ( ;++i < n;r %= i) r += k;     // das Lesen ordnet hier den Datenlauf am Anfang nah.
// das Lesen bewahrt hier aktuell das sichtbare Ergebnis.
console.log((r+m)%n+1);
}
	});
       })();
