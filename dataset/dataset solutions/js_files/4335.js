function getPokemon(choice) {
  let pokemon;

  switch (choice) {
    case 1:
      pokemon = ["Charmander", "Vulpix", "Growlithe"];
      break;

    case 2:
      pokemon = ["Squirtle", "Psyduck", "Totodile"];
      break;

    case 3:
      pokemon = ["Bulbasaur", "Oddish", "Chikorita"];
      break;

    case 4:
      pokemon = ["Pikachu", "Magnemite", "Electabuzz"];
      break;

    default:
      pokemon = [];
  }

  if (pokemon.length === 0) {
    return "OPCION_INVALIDA";
  }

  return pokemon.join("\n");
}

const menu = [
  "1. Fuego",
  "2. Agua",
  "3. Planta",
  "4. Electrico"
];

console.log(menu.join("\n"));

const choice = Number(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);

console.log(getPokemon(choice));