/* Identificador de sectores galácticos */
const fs=require('fs');

const tokens=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/);

const n=Number(tokens[0]);
const codes=tokens.slice(1,n+1);

let commonPrefix=codes[0]||'';

// Comparar el código de cada nave
for(let i=1;i<codes.length;i++){
    while(!codes[i].startsWith(commonPrefix)){
        commonPrefix=commonPrefix.slice(0,-1);
    }

    /* No existe un sector compartido */
    if(commonPrefix===''){
        break;
    }
}

console.log(commonPrefix===''
?'SIN PREFIJO'
:commonPrefix);