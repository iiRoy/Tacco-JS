function evaluateInput(rawPayload) {
  const interpretationScheme = {
    "2": "hon", "4": "hon", "5": "hon", "7": "hon", "9": "hon",
    "0": "pon", "1": "pon", "6": "pon", "8": "pon"
  };

  const finalSymbol = rawPayload.slice(-1);
  const derivedPhrase = interpretationScheme[finalSymbol] || "bon";
  console.log(derivedPhrase);
}

evaluateInput(require("fs").readFileSync("/dev/stdin", "utf8"));