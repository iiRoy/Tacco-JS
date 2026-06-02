(function() {
  function processInputData(sourceContent) {
    const targetLine = sourceContent.split("\n")[0];
    const characterCount = (targetLine.match(/x/g) || []).length;
    console.log(characterCount >= 8 ? 'NO' : 'YES');
  }
  processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
}());
