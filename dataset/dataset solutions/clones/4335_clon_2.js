function selectCreatures(selectedOption) {
  let creatures;

  switch (selectedOption) {
    case 1:
      creatures = ["Charmander", "Vulpix", "Growlithe"];
      break;

    case 2:
      creatures = ["Squirtle", "Psyduck", "Totodile"];
      break;

    case 3:
      creatures = ["Bulbasaur", "Oddish", "Chikorita"];
      break;

    case 4:
      creatures = ["Pikachu", "Magnemite", "Electabuzz"];
      break;

    default:
      creatures = [];
  }

  if (creatures.length === 0) {
    return "OPCION_INVALIDA";
  }

  return creatures.join("\n");
}

const options = [
  "1. Fuego",
  "2. Agua",
  "3. Planta",
  "4. Electrico"
];

console.log(options.join("\n"));

const selectedOption = Number(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);

console.log(selectCreatures(selectedOption));