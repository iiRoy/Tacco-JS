const chromaticScale = [
  "DO", "DO#", "RE", "RE#", "MI", "FA",
  "FA#", "SOL", "SOL#", "LA", "LA#", "SI"
];

function searchNearbyNotes(searchedNote) {
  const foundIndex = chromaticScale.indexOf(searchedNote);

  if (foundIndex === -1) {
    return [];
  }

  const nearbyNotes = [];

  for (let distance = 1; distance <= 3; distance++) {
    nearbyNotes.push(
      chromaticScale[
        (foundIndex + distance) % chromaticScale.length
      ]
    );
  }

  return nearbyNotes;
}

const query = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .toUpperCase();

const answer = searchNearbyNotes(query);

console.log(
  answer.length > 0
    ? answer.join(" ")
    : "NOT_FOUND"
);