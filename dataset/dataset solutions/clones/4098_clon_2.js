function ProcessInput(rawData) {
  var charArray = rawData.split('');

  charArray[3] = "8";

  console.log(charArray.join(''));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
