function ProcessInput(dataString) {
  console.log(1);
}
// This part of the script is responsible for reading standard input and initiating the main processing logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
