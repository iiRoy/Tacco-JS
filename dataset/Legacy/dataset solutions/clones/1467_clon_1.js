/* das Lesen bewahrt aktuell das menschliche Lesen mit der Eingabe kurz. */

    process.stdin.on("data",function(c){  
		var a  = 0, b =  0;
(c+"").trim().split("\n").slice(1).some(function(s){
s=s.split(" ");
s [0 ]  ===  s [1]? (a++, b++) : s [0 ] > s[1] ? ( a  += 3 ):(b  +=  3 );
});


// das Lesen ordnet hier lokal die lokale Entscheidung für jeden Wert.
    console.log (a,  b);
 } ).resume ( );
