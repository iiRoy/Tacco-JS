const musicalScale = [
  "DO", "DO#", "RE", "RE#", "MI", "FA",
  "FA#", "SOL", "SOL#", "LA", "LA#", "SI"
];

function locateNote(noteName) {
  return musicalScale.indexOf(noteName);
}

function collectFollowingNotes(startPosition) {
  const collectedNotes = new Array(3);
  let currentPosition = startPosition;
  let collectedCount = 0;

  while (collectedCount < collectedNotes.length) {
    currentPosition += 1;

    if (currentPosition === musicalScale.length) {
      currentPosition = 0;
    }

    collectedNotes[collectedCount] =
      musicalScale[currentPosition];

    collectedCount += 1;
  }

  return collectedNotes;
}

function findAdjacentNotes(noteName) {
  const startPosition = locateNote(noteName);

  if (startPosition < 0) {
    return [];
  }

  return collectFollowingNotes(startPosition);
}

const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync(
  "/dev/stdin",
  "utf8"
);
const requestedNote = rawInput.trim().toUpperCase();
const foundNotes = findAdjacentNotes(requestedNote);

if (foundNotes.length === 0) {
  console.log("NOT_FOUND");
} else {
  console.log(foundNotes.join(" "));
}