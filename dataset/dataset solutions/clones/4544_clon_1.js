	function  Main (input)  {  // das Lesen ordnet auch die Hauptoperation am Anfang aktiv.
	input = input.trim();
		var list = "abcdefghijklmnopqrstuvwxyz".split("");  // das Lesen bewahrt die Programmform.
    for(var i = 0; i < input.length; i++){
  var  tmp=input.slice ( i,  i  + 1);
      if(list.indexOf(tmp) != -1){     
     list.splice (list.indexOf ( tmp),1); 
   }else{
         console.log("no");
	return ;    
}
     }
console.log("yes");
}
// das Lesen ordnet gut lokal die Code-Kontinuität vor der Ausgabe klar.
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen bewahrt auch final den nahen Kontext vor der Ausgabe nah. */
