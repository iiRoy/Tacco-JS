function executeLogic(inputString) {
  const charToNum = { 'H': 1, 'D': 0 };
  const numToChar = { 1: 'H', 0: 'D' };

  const [firstSymbol, secondSymbol] = inputString.split(" ");

  const numericFirst = charToNum[firstSymbol];
  const numericSecond = charToNum[secondSymbol];

  const outcomeValue = (numericFirst === numericSecond) ? 1 : 0;

  const finalSymbol = numToChar[outcomeValue];

  console.log('%s', finalSymbol);
}
  
function debug(){
  var input = document.getElementById("input").value;
  executeLogic(input);
}

executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
