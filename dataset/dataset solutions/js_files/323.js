var input = require("fs").readFileSync("/dev/stdin","utf8");

var wrongWord = "Hoshino";
var correctWord = "Hoshina";
var word2;
// input????????\??????
var array = (input.trim()).split("\n");
for (var aoj = 1; aoj <= array[0]; aoj++) {
 var word = array[aoj].split(" ");
 for (var j = 0; j < word.length; j++) {
   if (word[j] == wrongWord) {
     word[j] = correctWord;
   }
 }
 if (word.length > 1) {
   word2 = word[0]
   for (var i = 1; i < word.length; i++) {
     word2 += " " + word[i]
   }
 }else {
   word2 = word[0]
 }

console.log(word2)

}