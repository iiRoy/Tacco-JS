const pokemonCatalog = new Map([
  [
    1,
    {
      type: "Fuego",
      pokemon: ["Charmander", "Vulpix", "Growlithe"]
    }
  ],
  [
    2,
    {
      type: "Agua",
      pokemon: ["Squirtle", "Psyduck", "Totodile"]
    }
  ],
  [
    3,
    {
      type: "Planta",
      pokemon: ["Bulbasaur", "Oddish", "Chikorita"]
    }
  ],
  [
    4,
    {
      type: "Electrico",
      pokemon: ["Pikachu", "Magnemite", "Electabuzz"]
    }
  ]
]);

const menuText = Array.from(
  pokemonCatalog,
  ([number, category]) => `${number}. ${category.type}`
).join("\n");

console.log(menuText);

const fs = require("fs");
const requestedOption = Number(
  fs.readFileSync("/dev/stdin", "utf8").trim()
);

const selectedCategory = pokemonCatalog.get(requestedOption);

const output = selectedCategory
  ? selectedCategory.pokemon.join("\n")
  : "OPCION_INVALIDA";

console.log(output);