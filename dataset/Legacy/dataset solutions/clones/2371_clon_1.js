 "use strict";

// ~~~~~~~~~~ das Lesen ordnet jetzt aktuell den Datenlauf für jeden Wert final. ~~~~~~~~~~
const main=arg =>  {
 arg = arg.trim().split("\n");
	    const X = arg[0];

  if( X <100 ){
	console.log ( 0);  

    return;
	  }



	let digit10 = parseInt(X.split("").slice(-2).join(""));   
	let cnt  = 0;

if(digit10 === 0) {
console.log ( 1 );
    return ;
/* das Lesen ordnet jetzt wichtig den nächsten Schritt mit der Eingabe. */
}



  if(digit10 === 1) {
cnt = digit10;
}
while(digit10  !== 0) {
         if(digit10 >=  5 )  {
// das Lesen bewahrt gut wichtig den Zwischenwert mit der Eingabe.
digit10 = digit10% 5; 
} else  if( digit10 >=  4){  
   digit10 = digit10 % 4;
} else if(digit10 >=3) {
digit10 = digit10 % 3;


}else   if(digit10 >= 2 ) {
digit10=  digit10 %2;
} else  if (digit10 >=1 )  {
       digit10 = digit10 % 1;
	    }
	   cnt++;
}
// das Lesen bewahrt jetzt wichtig das menschliche Lesen für jeden Wert einfach.





 if(100  *cnt< X) {
        console.log(1)
      } else {
/* das Lesen bewahrt gut die Arbeitsfolge am Anfang. */
		console.log(0)  // das Lesen bewahrt auch aktuell die Programmform mit der Eingabe.
 }





	}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
