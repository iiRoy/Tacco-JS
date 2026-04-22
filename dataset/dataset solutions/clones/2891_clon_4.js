((processInput) => {
  const evaluateContent = (rawData) => {
    const outcome = (rawData.split('\n')[0].match(/x/g) || []).length >= 8 ? 'NO' : 'YES';
    console.log(outcome);
  };
  evaluateContent(require("fs").readFileSync("/dev/stdin", "utf8"));
})();