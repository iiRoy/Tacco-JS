/* Calculadora de alineaciones orbitales */
const fs=require('fs');

const data=fs
.readFileSync(0,'utf8')
.trim()
.split(/\s+/)
.map(Number);

const n=data[0];
const periods=data.slice(1,n+1);

// Máximo común divisor mediante Euclides
function gcd(a,b){
    while(b!==0){
        const remainder=a%b;
        a=b;
        b=remainder;
    }

    return a;
}

/* Momento de coincidencia de dos órbitas */
function lcm(a,b){
    return Math.abs(a*b)/gcd(a,b);
}

let alignmentDay=1;

for(const period of periods){
    alignmentDay=lcm(alignmentDay,period);
}

console.log(alignmentDay);