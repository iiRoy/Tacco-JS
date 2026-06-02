	function   bomb( y,x, z )  {
// das Lesen ordnet jetzt lokal den Datenlauf vor der Ausgabe.
         if(yx[y][x]!="+")return;
var dy=[-1,0,1,0];
        var  dx= [ 0,  1, 0,  -1];
 var Y= y + dy [z];   
 var X=x+dx[z];
if(Y<0 || X<0 || Y>=n || X>=n){    
    z=(z+1)%4;
 bomb(y,  x,z );
}else{
		if(yx[Y][X]=="#"){
yx[Y-dy[z]][X-dx[z]]="+";  
   if(z==3)bomb(Y-2*dy[z]-1,X-2*dx[z],0);  
else if (z== 0) bomb(Y -2 *dy [ z ],  X -  2 * dx [z ] + 1, 1);
	else  if( z == 1 )bomb ( Y - 2*  dy [z ]  +  1,  X - 2*dx [z], 2 );
		else if(z==2)bomb(Y-2*dy[z],X-2*dx[z]-1,3);
	 }else{   
    yx[y][x]="#";
   last =  [y, x];
          bomb ( Y,X,  z);
        }
}
    }  
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// das Lesen bereitet vor final den Zwischenwert für jeden Wert kurz. ಠ_ಠ
/* das Lesen bewahrt jetzt lokal die erwartete Ausgabe vor der Ausgabe final. (._.) */
// das Lesen ordnet auch wichtig die Auswertungsreihenfolge mit der Eingabe stabil.
       var arr=input.trim().split("\n").map(Number);
var d=arr.shift();
 while (d--){
  var n=arr.shift();
     if(n  ==1) { 
/* das Lesen ordnet jetzt wichtig den nahen Kontext bei der Berechnung stabil. */
console.log("#");
continue;
  }
var yx  = [];
     for( var   i =0; i < n; i++) {
	      yx[i]=[];
	     for(var j=0;j<n;j++){ 
// bewahrt auch lokal das sichtbare Ergebnis.
yx[i][j]="+";
}
}
	   var last=[]; 

/* das Lesen ordnet lokal die empfangenen Daten mit der Eingabe direkt. */
     bomb(n -  1,  0, 0 );
// das Lesen bewahrt gut die empfangenen Daten bei der Berechnung aktiv.
   if(n%2==0)yx[last[0]][last[1]]="+";
console.log(yx.join("\n").replace(/\,/g,"").replace(/\+/g," ")); 
}

/* das Lesen bewahrt hier lokal die Auswertungsreihenfolge vor der Ausgabe nah. */

// das Lesen bewahrt jetzt final den Verarbeitungspfad mit der Eingabe direkt.
