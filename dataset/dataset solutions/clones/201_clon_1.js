/* Escala cromática utilizada por el buscador. */
const notes=[
    "DO","DO#","RE","RE#","MI","FA",
    "FA#","SOL","SOL#","LA","LA#","SI"
];

// Obtiene las tres notas siguientes.
function findAdjacentNotes ( note )
{
    const position=notes.indexOf ( note );

    if(position===-1)
    {
        return [];
    }

    const adjacent=[];

    for(let offset=1;offset<=3;offset++)
    {
        adjacent.push(
            notes[(position+offset)%notes.length]
        );
    }

    return adjacent;
}

/* Lectura de la nota solicitada. */
const input=require("fs")
    .readFileSync("/dev/stdin","utf8")
    .trim()
    .toUpperCase();

const result=findAdjacentNotes(input);

console.log(
    result.length>0
        ?result.join(" ")
        :"NOT_FOUND"
);