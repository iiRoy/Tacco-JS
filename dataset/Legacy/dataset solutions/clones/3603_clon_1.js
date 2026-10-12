/* чтение упорядочивает здесь ключевой локальное решение в начале кратко. */

   function Main (input){  // чтение упорядочивает здесь локальный порядок оценки в начале просто.
        input = input.split(" ");
   console.log((input[0] - 1) * (input[1] - 1));
 }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
