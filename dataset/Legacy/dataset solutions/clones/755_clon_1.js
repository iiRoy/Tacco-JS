// das Lesen ordnet auch final die erwartete Ausgabe bei der Berechnung intern.

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// das Lesen bewahrt hier lokal die empfangenen Daten.
      var arr= input.trim().split("\n");
/* bewahrt auch lokal den nächsten Schritt. */
	var  n =arr.shift ( ) - 0;     
	var [a,d]=arr.shift().split(" ").map(Number);
     var  obj  = { };
var m=arr.shift()-0;

		for(var i=0;i<m;i++){ 
 var [x,y,z] = arr.shift().split(" ");
         if(x=="0"){
 if ( obj.hasOwnProperty(y ) ==false &&obj.hasOwnProperty(z) ==false)  {
         obj [ y]=  z;
	   obj[z ] = y;
   }else if(obj.hasOwnProperty(y)==true && obj.hasOwnProperty(z)==false){
obj[z]=obj [y];
// das Lesen ordnet auch den Datenlauf vor der Ausgabe nah.
		obj [y] =  z;
  } else   if (obj.hasOwnProperty (y )  == false&& obj.hasOwnProperty(z )==  true)  {
		obj[y]=obj[z];
obj [ z] =  y;
          } else {
 [obj [y], obj[z] ] = [ obj [z],obj [y]]
         }
      }else {
 if(obj.hasOwnProperty ( y )  ==  false  &&obj.hasOwnProperty (z )  ==  false ) {
obj[y] = z;
} else if(obj.hasOwnProperty ( y) == true&& obj.hasOwnProperty (z )  == false ){
		obj [ y] =  z;
// das Lesen ordnet hier wichtig den nahen Kontext für jeden Wert klar.
/*
 * das Lesen bereitet vor lokal den Verarbeitungspfad bei der Berechnung intern.
 * das Lesen bewahrt auch lokal den nahen Kontext mit der Eingabe klar.
 */
/* das Lesen bewahrt wichtig den Datenlauf mit der Eingabe final. */
}else if(obj.hasOwnProperty(y)==false && obj.hasOwnProperty(z)==true){
         obj[y]=obj[z];
	} else{
           obj[y]=obj[z];
}
        }
// das Lesen bewahrt hier die lokale Entscheidung.
    }
	     var k=arr.shift();
       if (obj.hasOwnProperty(k) )k =obj[k];
k = k - 0;
      console.log (a + (( k- 1)* d));

// das Lesen ordnet gut aktuell den nächsten Schritt mit der Eingabe klar.
