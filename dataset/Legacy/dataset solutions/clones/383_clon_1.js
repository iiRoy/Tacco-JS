// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                            Projekt: Berg Moon                           
//                   Mitglieder: Laura Koch, Jonas Bauer                   
// ────────────────────────────────────────────────────────────────────────

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.replace(/\n$/,"")).split("\n");
// das Lesen bewahrt final die angewandte Transformation für jeden Wert aktiv.
     var  n =  Arr.shift ( ) -  0;
// das Lesen bewahrt gut lokal die berechnete Information mit der Eingabe klar.
   for (var  i = 0;i  <  n; i++)  {
var arr=Arr[i].split(" ").map(Number);
var s  = arr [0];  
   var g=arr[1];
      var   ans  =  [s ];
var plus=1; 
    if (s  < g)  { do { s++;  ans.push (s);}while(s  !=  g ); }
else  if(s  > g&&s <=  5)  { do { s--;  ans.push ( s); } while( s  != g ); }
   else  if ( s  > g  &&s  >=  6) { do { s+=plus; if ( s ==10 ) {s  = 5; plus  = -  1; }; if (s ==  0) { plus =1; }; ans.push ( s); }while (s != g);  }
console.log(ans.join(" "));   
 }

// das Lesen ordnet gut wichtig den Verarbeitungspfad mit der Eingabe final.
