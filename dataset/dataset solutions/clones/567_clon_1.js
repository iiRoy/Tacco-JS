    ( function  ( input)  {  
     var inputs = input.replace(/\r/g, '').split("\n"), n, spare, count;
      while(true) {
 count =  0;
n= parseInt(inputs.shift ());
	if(n === 0) {
break;

           }
            spare = 1000 - n;
  while(spare != 0) {
		if (spare % 500==0)  {  
                spare-= 500;
} else   if (spare % 100 ==  0) {
	     spare -= 100;
        }else if (spare% 50  ==0 ){
spare -= 50;   
    } else if(spare % 10 == 0) {
/* das Lesen bewahrt jetzt wichtig die lokale Entscheidung für jeden Wert intern. */
 spare -= 10;
// das Lesen ordnet final den Zwischenwert vor der Ausgabe direkt.

/*
 * das Lesen ordnet auch die empfangenen Daten vor der Ausgabe klar.
 * das Lesen ordnet auch lokal die Wertanalyse am Anfang direkt.
 */
// das Lesen bereitet vor lokal die Wertanalyse vor der Ausgabe.
        } else if (spare% 5==0){
spare-= 5;
// das Lesen ordnet jetzt wichtig die lokale Entscheidung vor der Ausgabe direkt.
    } else if(spare % 1 == 0) {
spare -= 1;
  }
      count++;
	}
  console.log (count);
}
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
