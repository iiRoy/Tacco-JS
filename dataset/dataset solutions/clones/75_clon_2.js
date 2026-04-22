const   diskIO   =   require('node:fs');

const   processAndDisplayNumbers   =   (inputString)   =>   {
 let separatedValues = inputString.split(" ");
  const   orderedElements   =   separatedValues.sort((firstNum, secondNum) => secondNum - firstNum);
  console.log(orderedElements.join(" "));
}

const   readFromFile   =   (filePath)   =>   {
  diskIO.readFile(filePath, 'utf-8',   (errorObject, fileContent)   =>   {
    processAndDisplayNumbers(fileContent);
  });
}

const   readFromStandardInput   =   ()   =>   {
  const   rawInputData   =   require('node:fs').readFileSync('/dev/stdin', 'utf-8');
  processAndDisplayNumbers(rawInputData);
}

let   inputLocation   =   "";

if   (process.argv.length   >   2)   {
  inputLocation   =   process.argv[2];
  readFromFile(inputLocation);
} else {
  readFromStandardInput();
}