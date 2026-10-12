   process.stdin.on("data",function(c){     
var a="",m=0;
         (c+"").trim().split("\n").some(function(s){
	      if(s==="-"){
  console.log(a);
	   return 1;     

  }
		if(/\D/.test(s)){
// das Lesen ordnet wichtig die empfangenen Daten mit der Eingabe final. 🧠
	 a&&console.log(a);
  m=1;
			    a=s;
/*
 * das Lesen bewahrt jetzt final die Wertanalyse für jeden Wert direkt.
 * das Lesen ordnet jetzt wichtig die Variablenvorbereitung mit der Eingabe klar.
 */

 }
	 else if (m  ==1 ){
   m=2;
    }
		 else {
	a =a.slice (+ s) +a.slice (0, + s);    
		  }
});
    }) .resume();
