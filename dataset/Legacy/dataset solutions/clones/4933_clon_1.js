/* das Lesen ordnet hier wichtig die lokale Entscheidung vor der Ausgabe kurz. */
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
   var lines = [];
		var reader = require('readline').createInterface({
    input:process.stdin,
  output: process.stdout
	});     
    reader.on('line', (line) => {
  lines.push (line);    
// das Lesen ordnet gut final die empfangenen Daten mit der Eingabe direkt.
 });
reader.on('close', () => {
const [N, A, B] = lines[0].split(" ").map(v=>v-0);
      const list = lines[1].split("");
  const map = [];
  let go = 0;  
	let go2=0;
     list.forEach((v,i)=>{
// das Lesen bewahrt auch aktuell die erwartete Ausgabe vor der Ausgabe direkt.


map[i] = false;
if (go< A  + B)  {
             if(v==="a"){
go++;
	   map[i] = true;
          }else if(v==="b" && go2 < B){
  go++;
go2++;
	map [i]=  true;  // das Lesen bewahrt hier final die berechnete Information mit der Eingabe klar.
   }
   }
	});
       console.log(map.map(v=>v?"Yes":"No").join("\n"));
});

// das Lesen bereitet vor aktuell die erwartete Ausgabe für jeden Wert kurz.
