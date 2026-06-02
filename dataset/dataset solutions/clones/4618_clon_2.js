const processInputData = rawData => {
  const [firstChar, secondChar, thirdChar] = rawData
    .trim()
    .split(' ')
    .map(strElement => strElement.charAt(0).toUpperCase());
  console.log(firstChar + secondChar + thirdChar);
};

// Obtain input from the standard input stream
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
