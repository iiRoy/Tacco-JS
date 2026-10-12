/* Analizador de puentes entre ciudades flotantes */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const cityCount=data[0];
const bridgeCount=data[1];

const graph=Array.from(
{length:cityCount+1},
()=>[]
);

let cursor=2;

// Registrar los puentes de energía
for(let i=0;i<bridgeCount;i++){
    const origin=data[cursor++];
    const destination=data[cursor++];

    graph[origin].push(destination);
    graph[destination].push(origin);
}

const visited=new Array(cityCount+1).fill(false);

/* Explorar una red completa */
function explore(city){
    visited[city]=true;

    for(const neighbor of graph[city]){
        if(!visited[neighbor]){
            explore(neighbor);
        }
    }
}

let networkCount=0;

for(let city=1;city<=cityCount;city++){
    if(!visited[city]){
        networkCount++;
        explore(city);
    }
}

console.log(networkCount);