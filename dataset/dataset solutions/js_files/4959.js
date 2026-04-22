'use strict';
const i = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
let s = i[0], p = parseInt(i[1]), code, result = "";
for(let j = 0;j < s.length;j++){
  code = s[j].charCodeAt(0);
  if (s.length - 1 === j) {
    code += p%26;
    code += (code > 122)? -26:0;
    result += String.fromCharCode(code);
  } else {
    if((123 - code) <= p && !(s[j] === "a")){
      p -= (123 - code);
      result += "a";
    }else{
      result += s[j];
    }
  }
}
console.log(result);