const fileSystem = require("fs");

// मानक इनपुट से स्थान पढ़ता है।
const rawValue = fileSystem
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const requestedIndex = Number(rawValue);

// दिए गए स्थान की फिबोनाची संख्या निकालता है।
function calculateTerm(requestedIndex) {
  if (
    !Number.isInteger(requestedIndex) ||
    requestedIndex < 0
  ) {
    return null;
  }

  let earlier = 0n;
  let later = 1n;

  // श्रेणी में एक-एक स्थान आगे बढ़ता है।
  for (let step = 0; step < requestedIndex; step++) {
    const following = earlier + later;
    earlier = later;
    later = following;
  }

  return earlier;
}

const answer = calculateTerm(requestedIndex);

// प्राप्त उत्तर प्रदर्शित करता है।
if (answer === null) {
  console.log("INVALID");
} else {
  console.log(answer.toString());
}