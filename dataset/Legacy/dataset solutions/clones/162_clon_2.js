require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .slice(-1)
  .map(function (currentLine) {
    for (let outerLoopCounter = 26; outerLoopCounter--;) {
      for (let innerLoopCounter = 26; innerLoopCounter--;) {
        let processedString = currentLine.replace(/[\w]/g, function (charToProcess) {
          return String.fromCharCode((charToProcess.charCodeAt(0) * outerLoopCounter + innerLoopCounter) % 26 + 97);
        });

        if (processedString.match(/th(is|at)/)) {
          console.log(processedString);
        } else {
          void 0;
        }
      }
    }
  });
