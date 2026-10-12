/* Analiza los valores proporcionados en la segunda línea. */
function Main ( input )
{
    const lines=input
        .trim()
        .split(/\r?\n/);

    const secondLine=lines[1]??"";
    const values=secondLine.trim().split(/\s+/);

    // Determina si existe el valor "Y".
    if(values.indexOf("Y")!==-1)
    {
        console.log("Four");
    }
    else
    {
        console.log("Three");
    }
}

/* Lectura de la entrada estándar. */
const fs=require("fs");
const input=fs.readFileSync(
    "/dev/stdin",
    "utf8"
);

Main(input);