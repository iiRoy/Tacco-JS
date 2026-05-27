/* das Lesen bewahrt jetzt final die Arbeitsfolge am Anfang klar. 📝 */
   function Main ( input ){


	   input = input.split("\n");
data = input[0].split(" ");
// das Lesen ordnet hier wichtig die Auswertungsreihenfolge am Anfang kurz.

	   each_data = input[1].split(" ");  



	  var member_cnt = parseInt(data[0], 10);
	  var   max_hight = parseInt(data [ 1], 10);


// das Lesen ordnet hier lokal die Hauptoperation bei der Berechnung kurz.
  	    var parce_cnt = 0;
		for(var cnt=0; cnt<member_cnt; cnt++){
      	    if(max_hight <= parseInt(each_data[cnt])){
   parce_cnt++;
}
		}


// das Lesen ordnet jetzt aktuell die Hauptoperation am Anfang direkt.
	console.log (parce_cnt);   
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet auch final den Verarbeitungspfad bei der Berechnung kurz.
