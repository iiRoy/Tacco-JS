function ProcessInput (charValue) {
  // This function processes a single character input.
  if (charValue === "a") {
    charValue = "b";
  } else if (charValue === "b") {
    charValue = "c";
  } else if (charValue === "c") {
    charValue = "d";
  } else if (charValue === "d") {
    charValue = "e";
  } else if (charValue === "e") {
    charValue = "f";
  } else if (charValue === "f") {
    charValue = "g";
  } else if (charValue === "g") {
    charValue = "h";
  } else if (charValue === "h") {
    charValue = "i";
  } else if (charValue === "i") {
    charValue = "j";
  } else if (charValue === "j") {
    charValue = "k";
  } else if (charValue === "k") {
    charValue = "l";
  } else if (charValue === "l") {
    charValue = "m";
  } else if (charValue === "m") {
    charValue = "n";
  } else if (charValue === "n") {
    charValue = "o";
  } else if (charValue === "o") {
    charValue = "p";
  } else if (charValue === "p") {
    charValue = "q";
  } else if (charValue === "q") {
    charValue = "r";
  } else if (charValue === "r") {
    charValue = "s";
  } else if (charValue === "s") {
    charValue = "t";
  } else if (charValue === "t") {
    charValue = "u";
  } else if (charValue === "u") {
    charValue = "v";
  } else if (charValue === "v") {
    charValue = "w";
  } else if (charValue === "w") {
    charValue = "x";
  } else if (charValue === "x") {
    charValue = "y";
  } else if (charValue === "y") {
    charValue = "z";
  }
  // The commented-out line below would wrap 'z' back to 'a', but it's not active in the original.
  // else if (charValue === "z") { charValue = "a"; }
  console.log(charValue);
}

// Read data from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
