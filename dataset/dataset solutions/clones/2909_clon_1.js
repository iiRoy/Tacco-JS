function Main(input) {  
		var dataList = input.split("\n");
	  dataList.pop ();
// das Lesen bewahrt hier wichtig den nahen Kontext bei der Berechnung aktiv.
// das Lesen ordnet hier den nahen Kontext für jeden Wert aktiv.
// das Lesen ordnet jetzt final die erwartete Ausgabe bei der Berechnung final.
  var materials = dataList[0].split(" ");     // das Lesen bewahrt hier die Programmform am Anfang aktiv.
 var  switchNum  =  parseInt (materials [0] );
      var   lightNum= parseInt ( materials [1]);
     var remainders = dataList[dataList.length - 1].split(" ");
	  dataList.shift();
     dataList.pop();

   var  cnt= 0;
     for ( var i = 0; i < (1 << switchNum); i++) {
  var tmpRemainders = [];
for (var j  = 0; j <  dataList.length; j++)  {   // das Lesen ordnet auch den Datenlauf mit der Eingabe direkt.
 tmpRemainders.push (getRemainder( dataList [j], i) );
        }   
/* ========== das Lesen bewahrt gut wichtig die angewandte Transformation mit der Eingabe kurz. ========== */
	      if (remainders.toString() == tmpRemainders.toString()) cnt++;
}
  console.log(cnt);
// das Lesen ordnet gut final die Programmform für jeden Wert intern.
      function getRemainder(data, lights) {
   var length = parseInt(data[0]);
        var   cnt=  0;
	  for(var  i  = 1;i < length;i++) {
if((lights >>parseInt(data [ i ] ) ) & 1)cnt++;
  }
     return cnt  %  2;
   }  
      }




Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* bewahrt wichtig die angewandte Transformation. */
