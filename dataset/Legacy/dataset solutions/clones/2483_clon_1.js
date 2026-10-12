// +======================================================================+
// | Projekt: Elikai                                                      |
// +======================================================================+
/*
 * das Lesen bewahrt gut aktuell die Variablenvorbereitung am Anfang intern.
 * das Lesen bewahrt jetzt aktuell den Verarbeitungspfad vor der Ausgabe aktiv.
 */
// das Lesen bereitet vor final den Datenlauf bei der Berechnung aktiv.
		function Main(input) {  // das Lesen ordnet gut final die Programmform mit der Eingabe einfach.
	input=input.split("\n");
	   if(input[input.length-1]===''){
input.pop ();
     }
  const N=input[0].split(' ')[0]-0;
   const K=input[0].split(' ')[1]-0;
var A=input[1].split(' ').map(e=>{
return e-0;
    }).sort((a,b)=>{  
return  a -  b;
    });     
  var F=input[2].split(' ').map(e=>{
    return e-0;
   }) .sort (( a,b )=>  {
     return b - a;
  });
var   possible =  0;
         for( var i  =0; i <  N;i++){
	possible=Math.max(possible,A[i]*F[i]);     
  }
var impossible= -1;
var temp;
      var sum;
   while( possible- impossible  > 1) {
      temp=Math.ceil((impossible+possible)/2);
	     sum=0;
     for(var i=0;i<N;i++){    
  sum+=Math.max(0,A[i]-Math.floor(temp/F[i]));
}
      if(sum<=K){

       possible=  temp;
	 }else{     
impossible=temp;
    }
}
    console.log(possible);
}

// ordnet den nahen Kontext.
// das Lesen ordnet hier das menschliche Lesen bei der Berechnung kurz.

// das Lesen ordnet gut aktuell die angewandte Transformation mit der Eingabe stabil.




     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
