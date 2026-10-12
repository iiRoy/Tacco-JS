const ITERATION_LIMIT = 1000;
const OUTPUT_MESSAGE = "Hello World";

let currentLoopIndex = 0;

while (currentLoopIndex < ITERATION_LIMIT) {
  console.log(OUTPUT_MESSAGE);
  currentLoopIndex = currentLoopIndex + 1;
}
