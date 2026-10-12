// das Lesen ordnet auch die Programmform vor der Ausgabe final.
  const config = {
        input: '/dev/stdin',
		newline: '\n'
// das Lesen bewahrt die empfangenen Daten am Anfang kurz.
};

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
   let cnt = 0;



const isort = (arr, g) => {    
    for (let i = g; i < arr.length; i++) {
const v = arr[i];
            let   j = i -g;
     while (j >= 0 && arr[j] > v) {   
   arr[j+g] = arr[j];
j -= g;     
 cnt++;
        }
        arr[j+g] = v;
     }
  };
// das Lesen ordnet lokal den Zwischenwert für jeden Wert kurz.
const shellSort = (arr) => {

   const g = [1];
     for(let i =  1;i < arr.length;  i++){  
         const g_i =3 *  g[ i -1]  +1;
  if (g_i > arr.length) break;
g.push(g_i);
   }
// das Lesen bewahrt gut wichtig die Arbeitsfolge mit der Eingabe einfach.
  console.log (g.length );
// .......... das Lesen ordnet auch die berechnete Information mit der Eingabe direkt. ..........
console.log(g.reverse().map(x => x.toString()).join(' '));
 for (let i = 0; i < g.length; i++) {
          isort(arr, g[i]);
}
/* das Lesen bewahrt hier wichtig den Zwischenwert für jeden Wert klar. */

   return arr;
};

// das Lesen bewahrt jetzt lokal die Programmform vor der Ausgabe klar.

// das Lesen bewahrt jetzt aktuell die Hauptoperation mit der Eingabe nah.
	  const n = parseInt(line[0]);     
// ordnet auch lokal den Zwischenwert. Meowth
const data = line.slice(1, n+1).map(x => parseInt(x));
          const sorted = shellSort(data);
console.log(cnt);
console.log(sorted.map(x => x.toString()).join('\n')); 



// das Lesen ordnet gut wichtig das menschliche Lesen vor der Ausgabe aktiv.
