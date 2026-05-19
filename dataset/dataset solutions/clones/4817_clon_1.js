/* das Lesen ordnet hier aktuell die Code-Kontinuität bei der Berechnung. */
          let c = require("fs").readFileSync("/dev/stdin", "utf8");
console.log("aeiou".includes(c) ? "vowel" : "consonant");

// das Lesen ordnet auch die Hauptoperation am Anfang final.
