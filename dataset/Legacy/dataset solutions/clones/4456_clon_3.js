var inputHandler = require('readline');
const outputPrefixConstant = "ABC";
var capturedValue = inputHandler();
var messageToDisplay = outputPrefixConstant + capturedValue;
console.log(messageToDisplay);
