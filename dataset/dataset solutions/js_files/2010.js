const fs = require("fs");

// मानक इनपुट से इच्छित स्थान पढ़ता है।
const input = fs.readFileSync("/dev/stdin", "utf8").trim();
const position = Number(input);

// दिए गए स्थान पर फिबोनाची संख्या की गणना करता है।
function fibonacciAt(position) {
  // स्थान एक गैर-ऋणात्मक पूर्णांक होना चाहिए।
  if (!Number.isInteger(position) || position < 0) {
    return null;
  }

  // श्रेणी की पहली दो संख्याएँ निर्धारित करता है।
  let previous = 0n;
  let current = 1n;

  // इच्छित स्थान तक श्रेणी को आगे बढ़ाता है।
  for (let index = 0; index < position; index++) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  // प्राप्त फिबोनाची संख्या वापस करता है।
  return previous;
}

const result = fibonacciAt(position);

// अमान्य स्थान या प्राप्त परिणाम प्रदर्शित करता है।
if (result === null) {
  console.log("INVALID");
} else {
  console.log(result.toString());
}