/* Selector de cristales para el reactor */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const n=data[0];
const charges=data.slice(1,n+1);

let maximumProduct=-Infinity;

// Probar cada pareja posible
for(let i=0;i<charges.length;i++){
    for(let j=i+1;j<charges.length;j++){
        const product=charges[i]*charges[j];

        /* Conservar la combinación más energética */
        if(product>maximumProduct){
            maximumProduct=product;
        }
    }
}

console.log(maximumProduct);