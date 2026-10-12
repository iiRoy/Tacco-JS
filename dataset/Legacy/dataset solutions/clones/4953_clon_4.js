function processInput(fullInput) {
  const lines = fullInput.split("\n");
  const totalEntities = parseInt(lines[0], 10);
  const entityPreferences = lines[1].split(" ").map(s => parseInt(s, 10) - 1);

  const mutualPreferencePairs = entityPreferences.reduce((accumulator, preferredIdx, currentIdx) => {
    if (currentIdx < preferredIdx) {
      if (entityPreferences[preferredIdx] === currentIdx) {
        return accumulator + 1;
      }
    }
    return accumulator;
  }, 0);

  console.log(mutualPreferencePairs);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
