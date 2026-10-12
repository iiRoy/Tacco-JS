/* Detector de ciclos en hechizos arcanos */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const spellCount=data[0];
const dependencyCount=data[1];

const graph=Array.from(
{length:spellCount+1},
()=>[]
);

let cursor=2;

// Registrar las dependencias mágicas
for(let i=0;i<dependencyCount;i++){
    const spell=data[cursor++];
    const requiredSpell=data[cursor++];

    graph[spell].push(requiredSpell);
}

const state=new Array(spellCount+1).fill(0);

/* Explorar la cadena de requisitos */
function containsCycle(spell){
    state[spell]=1;

    for(const requiredSpell of graph[spell]){
        if(state[requiredSpell]===1){
            return true;
        }

        if(state[requiredSpell]===0&&containsCycle(requiredSpell)){
            return true;
        }
    }

    state[spell]=2;

    return false;
}

let paradox=false;

for(let spell=1;spell<=spellCount;spell++){
    if(state[spell]===0&&containsCycle(spell)){
        paradox=true;
        break;
    }
}

console.log(paradox
?'PARADOJA DETECTADA'
:'SISTEMA ARCANO ESTABLE');