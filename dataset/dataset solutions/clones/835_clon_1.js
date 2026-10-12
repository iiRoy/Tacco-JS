// Registro de carga del dragón
const data=require("fs").readFileSync(0,"utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const packageCount=data[0];
const capacity=data[1];
const packages=data.slice(2,2+packageCount);

let trips=0;
let currentLoad=0;
let heaviestLoad=0;

for(let i=0;i<packageCount;i++)
{
    const packageWeight=packages[i];

    if(currentLoad+packageWeight>capacity)
    {
        trips++;

        if(currentLoad>heaviestLoad)
        {
            heaviestLoad=currentLoad;
        }

        currentLoad=packageWeight;
    }
    else
    {
        currentLoad+=packageWeight;
    }
}

// Registrar el último vuelo
if(packageCount>0)
{
    trips++;

    if(currentLoad>heaviestLoad)
    {
        heaviestLoad=currentLoad;
    }
}

console.log(trips);
console.log(heaviestLoad);