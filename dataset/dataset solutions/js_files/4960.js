'use strict';
function Main(inputString) {
  let input = inputString.split("\n");
  let string = input[0];
  let point = parseInt(input[1]);
  let which = 0;
  while(point){
    if(string[which] == "a"){
      ++which;
    }else{
      if((27 - (string[which].charCodeAt(0) - 97 + 1)) <= point){
        point = point - (27 - (string[which].charCodeAt(0) - 97 + 1));
        string = string.slice(0, which) + "a" + string.slice(which+1);
        ++which;
      }else{
        if (string.length === (which + 1)) {
          point = point%26;
          var code = (string[which].charCodeAt(0) + point);
          if(code > 122){
            code += (- 122 + 97 - 1);
          }
          var lastLetter = String.fromCharCode(code);
          point = 0;
          string = string.slice(0, which) + lastLetter + string.slice(which+1);
        } else {
          ++which;
        }
      }
    }
  }
  console.log(string);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));