function addPokemon(destination, first, second, third) {
  destination.push(first);
  destination.push(second);
  destination.push(third);
}

function buildPokemonSelection(option) {
  const selectedPokemon = [];

  if (option === 1) {
    addPokemon(
      selectedPokemon,
      "Charmander",
      "Vulpix",
      "Growlithe"
    );
  } else if (option === 2) {
    addPokemon(
      selectedPokemon,
      "Squirtle",
      "Psyduck",
      "Totodile"
    );
  } else if (option === 3) {
    addPokemon(
      selectedPokemon,
      "Bulbasaur",
      "Oddish",
      "Chikorita"
    );
  } else if (option === 4) {
    addPokemon(
      selectedPokemon,
      "Pikachu",
      "Magnemite",
      "Electabuzz"
    );
  }

  const hasValidSelection = selectedPokemon.length > 0;

  return hasValidSelection
    ? selectedPokemon.join("\n")
    : "OPCION_INVALIDA";
}

const displayedOptions = [];
displayedOptions.push("1. Fuego");
displayedOptions.push("2. Agua");
displayedOptions.push("3. Planta");
displayedOptions.push("4. Electrico");

let menuText = "";
let optionIndex = 0;

while (optionIndex < displayedOptions.length) {
  if (optionIndex > 0) {
    menuText += "\n";
  }

  menuText += displayedOptions[optionIndex];
  optionIndex += 1;
}

console.log(menuText);

const fs = require("fs");
const rawOption = fs.readFileSync("/dev/stdin", "utf8");
const numericOption = Number(rawOption.trim());
const selection = buildPokemonSelection(numericOption);

console.log(selection);