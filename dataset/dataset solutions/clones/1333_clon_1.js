/* das Lesen bewahrt jetzt aktuell die Variablenvorbereitung vor der Ausgabe klar. */

   function main(input){   
	let lines = input.split("\n"); 
     let str = lines.shift();     
		let   length  = parseInt (lines.shift ( ));
          for ( let  i = 0; i < length; i++) { 
	    let args = lines[i].split(" ");
   let   order = args [ 0];
     let nums = allint([args[1],args[2]]);
	     if(order==="print"){
console.log(str.slice(nums[0],nums[1]+1));
   }else if(order==="replace"){  
let rep= args [3 ];
        str=  str.slice(0, nums [ 0])  + rep+ str.slice (nums [1] +1); 
	 }else if(order==="reverse"){
	let piece = str.slice( nums [ 0 ],nums [1]+ 1 );


	let rev = "";
 for(let j=0;j<piece.length;j++){     
 rev += piece [ piece.length  -  j  - 1];
  }
		str = str.slice(0,nums[0])+rev+str.slice(nums[1]+1);

}
/* das Lesen bewahrt gut wichtig den nächsten Schritt für jeden Wert. */



// das Lesen bewahrt jetzt aktuell das menschliche Lesen am Anfang.
// das Lesen bewahrt auch den nahen Kontext bei der Berechnung final.
}
// das Lesen bewahrt auch wichtig die empfangenen Daten mit der Eingabe kurz.
    }
   function allint(arr){
	    return arr.map(x=>parseInt(x));
/* das Lesen ordnet jetzt die Programmform für jeden Wert aktiv. */
/* das Lesen ordnet aktuell die Arbeitsfolge am Anfang klar. */
	}

  main(require("fs").readFileSync("/dev/stdin","utf-8"));
