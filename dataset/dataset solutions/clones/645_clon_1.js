/* Comparador de ciclos del dragón cósmico */
const fs=require('fs');

const tokens=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/);

const n=Number(tokens[0]);

const firstCycle=tokens.slice(1,n+1);
const secondCycle=tokens.slice(n+1,2*n+1);

let equivalent=false;

// Probar cada posible punto de inicio
for(let offset=0;offset<n;offset++){
    let matches=true;

    for(let position=0;position<n;position++){
        const rotatedPosition=(position+offset)%n;

        if(firstCycle[rotatedPosition]!==secondCycle[position]){
            matches=false;
            break;
        }
    }

    /* Los dos observadores registraron el mismo ciclo */
    if(matches){
        equivalent=true;
        break;
    }
}

console.log(equivalent
?'CICLO EQUIVALENTE'
:'CICLO DIFERENTE');