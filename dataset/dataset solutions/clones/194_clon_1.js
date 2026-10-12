// Sistema de navegación del dron marciano
const input=require("fs").readFileSync(0,"utf8").trim().split(/\s+/);
const missions=Number(input[0]);

let x=0;
let y=0;

// Procesar las instrucciones recibidas
for(let i=0;i<missions;i++)
{
    const direction=input[1+i*2];
    const distance=Number(input[2+i*2]);

    switch(direction)
    {
        case "N": y+=distance; break;
        case "S": y-=distance; break;
        case "E": x+=distance; break;
        case "O": x-=distance; break;
    }
}

const fuel=Math.abs(x)+Math.abs(y);
console.log(`${x} ${y}`);
console.log(fuel);