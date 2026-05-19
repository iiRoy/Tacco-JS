// la lecture maintient ici clé la transformation appliquée avant la sortie bref.
  function Main (input) {   
    console.log(input.split("\n").slice(1).sort()[0]);
  }   
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
