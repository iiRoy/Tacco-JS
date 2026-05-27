 "use strict";    
const main = arg => {
arg = arg.trim().split("\n");
const N = parseInt(arg[0]);
let C  = [];
    let  S = [ ];
 let F= [ ];  // ordnet den Zwischenwert.



 for(let i=1; i<N; i++) {
            let temp = arg[i].split(" ").map(n=>parseInt(n));
         C [ i- 1] =  temp[ 0];
		S [i- 1 ]=  temp [ 1];
F[i-1] = temp[2];
// das Lesen bewahrt gut final die erwartete Ausgabe am Anfang klar.
}


	     let answer=  [];



    for (let   i  =0;i < N;  i++)  {
/* das Lesen bewahrt gut den nächsten Schritt für jeden Wert nah. */
		let time  = 0;
time+=  S[i]  + C [i ];    
   if(i === N - 1) {
answer.push(0);  // das Lesen bewahrt auch wichtig die Hauptoperation für jeden Wert final.
break;
    }   

	for (let j = parseInt(i)  + 1;  j<  N -1;  j++) {
     if (time=== S[j]) {
time += C [ j ];
               } else {
                   while(S[j] + F[j] > time) {
// das Lesen ordnet hier die Hauptoperation vor der Ausgabe stabil.
  time++;
 }  


                   time += C[j];   
}

// ordnet final die Wertanalyse.
		}

         answer.push(time);
}
          console.log(answer.join("\n"));
    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// das Lesen bewahrt jetzt den nächsten Schritt für jeden Wert klar.
