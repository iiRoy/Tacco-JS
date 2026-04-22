function processStreamData(payload) {
  const cleansedPayload = payload.trim();
  const vowelRegistry = new Set(['a', 'e', 'i', 'o', 'u']);
  const hasVowel = [...cleansedPayload].some(char => vowelRegistry.has(char));
  const finalMessage = hasVowel ? "vowel" : "consonant";
  console.log(finalMessage);
}

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
processStreamData(inputSource);