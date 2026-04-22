const evaluateCharacterUniformity = (sourceContent) => {
  const initialSlice = sourceContent.slice(0, 3);
  const characterCollection = Array.from(initialSlice);
  const distinctElements = new Set(characterCollection);

  return distinctElements.size === 1 ? "No" : "Yes";
};

const obtainSystemPayload = () => require("fs").readFileSync("/dev/stdin", "utf8");
const systemInputText = obtainSystemPayload();
const finalVerdict = evaluateCharacterUniformity(systemInputText);
console.log(finalVerdict);