/* Medidor territorial de la colonia marciana */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const n=data[0];
const intervals=[];

let cursor=1;

// Leer los límites de cada campo de fuerza
for(let i=0;i<n;i++){
    intervals.push([
    data[cursor],
    data[cursor+1],
    ]);

    cursor+=2;
}

/* Ordenar los campos por su punto inicial */
intervals.sort((a,b)=>a[0]-b[0]);

let currentStart=intervals[0][0];
let currentEnd=intervals[0][1];
let protectedLength=0;

for(let i=1;i<intervals.length;i++){
    const nextStart=intervals[i][0];
    const nextEnd=intervals[i][1];

    if(nextStart<=currentEnd){
        currentEnd=Math.max(currentEnd,nextEnd);
    }else{
        protectedLength+=currentEnd-currentStart;
        currentStart=nextStart;
        currentEnd=nextEnd;
    }
}

// Agregar el último segmento combinado
protectedLength+=currentEnd-currentStart;

console.log(protectedLength);