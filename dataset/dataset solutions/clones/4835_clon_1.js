     const input = require("fs").readFileSync("/dev/stdin", "utf8");
// чтение сохраняет здесь локальный вычисленную информацию.
 const words = input.split(' ');
  words.forEach (word  => {
console.log(word[0]);
     });
