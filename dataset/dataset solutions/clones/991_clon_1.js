/* Calculadora de pantallas solares orbitales */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const n=data[0];
const towerHeights=data.slice(1,n+1);

let maximumArea=0;

// Probar cada posible inicio de la pantalla
for(let left=0;left<towerHeights.length;left++){
    let minimumHeight=Infinity;

    for(let right=left;
        right<towerHeights.length;
        right++){
        minimumHeight=Math.min(
        minimumHeight,
        towerHeights[right]
        );

        const width=right-left+1;
        const area=minimumHeight*width;

        /* Conservar la superficie más grande */
        maximumArea=Math.max(maximumArea,area);
    }
}

console.log(maximumArea);