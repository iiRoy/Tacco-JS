/* Comparador de pergaminos del Archivo Arcano */
const fs=require('fs');

const lines=fs
.readFileSync(0,'utf8')
.split(/\r?\n/);

const firstScroll=lines[0]??'';
const secondScroll=lines[1]??'';

// Colocar las runas en un orden comparable
function normalize(text){
    return text
    .toLowerCase()
    .replace(/[^a-z]/g,'')
    .split('')
    .sort()
    .join('');
}

const sameSpell=normalize(firstScroll)===normalize(secondScroll);

/* Comunicar el resultado al bibliotecario */
console.log(sameSpell?'MISMO HECHIZO':'HECHIZOS DISTINTOS');