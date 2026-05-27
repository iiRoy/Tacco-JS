function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(messageContent) {
  console.log(messageContent); // Prints the final result to standard output.
}

function reportError(errorText) {
  console.error(errorText); // Outputs error messages to standard error.
}

// Defines various input transformation methods.
// 0: No change, 1: To integer, 2: Split by space, 3: Split by newline, 4: Split by space to numbers,
// 5: Split by newline to numbers, 6: Split to characters, 7: Split to character numbers.
function transformInput(sourceString, conversionOption) {
  switch (conversionOption) {
    case 0:
      return sourceString;
    case 1:
      return parseInt(sourceString);
    case 2:
      return sourceString.split(" ");
    case 3:
      return sourceString.split("\n");
    case 4:
      return sourceString.split(" ").map((valueElement) => Number(valueElement));
    case 5:
      return sourceString.split("\n").map((valueElement) => Number(valueElement));
    case 6:
      return sourceString.split("");
    case 7:
      return sourceString.split("").map((valueElement) => Number(valueElement));
  }
}

function ProcessInput(rawInputData) {
  rawInputData = transformInput(rawInputData, 6);

  const charPositions = {
    "K": rawInputData.indexOf("K"),
    "I": rawInputData.indexOf("I"),
    "H": rawInputData.indexOf("H"),
    "B": rawInputData.indexOf("B"),
    "R": rawInputData.indexOf("R")
  };

  if (charPositions["K"] === -1 || charPositions["I"] === -1 ||
    charPositions["H"] === -1 || charPositions["B"] === -1 ||
    charPositions["R"] === -1) {
    displayOutput("NO");
    return;
  }

  if (charPositions["K"] > charPositions["I"] ||
    charPositions["I"] > charPositions["H"] ||
    charPositions["H"] > charPositions["B"] ||
    charPositions["B"] > charPositions["R"]) {
    displayOutput("NO");
    return;
  }

  if (rawInputData.length > 9) {
    displayOutput("NO");
    return;
  }

  if (charPositions["K"] !== charPositions["I"] - 1) {
    displayOutput("NO");
    return;
  }

  if (charPositions["B"] - charPositions["H"] > 2) {
    displayOutput("NO");
    return;
  }

  if (charPositions["B"] - charPositions["H"] === 2) {
    let tempChar = rawInputData[charPositions["B"]] - 1; // Preserving original behavior, even if it's a potential bug.
    if (tempChar !== "A") {
      displayOutput("NO");
      return;
    }
  }

  if (charPositions["R"] - charPositions["B"] > 2) {
    displayOutput("NO");
    return;
  }

  if (charPositions["R"] - charPositions["B"] === 2) {
    let tempChar = rawInputData[charPositions["R"]] - 1; // Preserving original behavior.
    if (tempChar !== "A") {
      displayOutput("NO");
      return;
    }
  }

  let leadingACount = 0;
  for (let charIndex = 0; charIndex < rawInputData.length; charIndex++) {
    if (rawInputData[charIndex] === "A") {
      leadingACount++;
    } else {
      break;
    }
  }

  if (leadingACount > 1) {
    displayOutput("NO");
    return;
  }

  let trailingACount = 0;
  for (let charIndex = rawInputData.length - 1; charIndex >= 0; charIndex--) {
    if (rawInputData[charIndex] === "A") {
      trailingACount++;
    } else {
      break;
    }
  }

  if (trailingACount > 1) {
    displayOutput("NO");
    return;
  }

  displayOutput("YES");
}

ProcessInput(getInputData());
