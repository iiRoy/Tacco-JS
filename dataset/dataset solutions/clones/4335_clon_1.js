/* Obtiene tres Pokémon del tipo seleccionado. */
function getPokemon ( choice )
{
    let pokemon;

    switch(choice)
    {
        // Pokémon de tipo fuego.
        case 1:
            pokemon=[
                "Charmander","Vulpix","Growlithe"
            ];
            break;

        // Pokémon de tipo agua.
        case 2:
            pokemon=[
                "Squirtle","Psyduck","Totodile"
            ];
            break;

        // Pokémon de tipo planta.
        case 3:
            pokemon=[
                "Bulbasaur","Oddish","Chikorita"
            ];
            break;

        // Pokémon de tipo eléctrico.
        case 4:
            pokemon=[
                "Pikachu","Magnemite","Electabuzz"
            ];
            break;

        default:
            pokemon=[];
    }

    if(pokemon.length===0)
    {
        return "OPCION_INVALIDA";
    }

    return pokemon.join("\n");
}

/* Opciones disponibles. */
const menu=[
    "1. Fuego",
    "2. Agua",
    "3. Planta",
    "4. Electrico"
];

console.log(
    menu.join("\n")
);

const choice=Number(
    require("fs")
        .readFileSync("/dev/stdin","utf8")
        .trim()
);

console.log(
    getPokemon(choice)
);