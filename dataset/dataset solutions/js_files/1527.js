function Main(input) {
   const text = input.split(" ");
   const a = parseInt(text[0],10),
         b = parseInt(text[1],10),
         c = parseInt(text[2],10),
         d = parseInt(text[3],10);
   
   let result = a * c;

   if (a * d > result) {
     result = a * d;
   } else if(b * c > result) {
     result = a * d;
   } else if(b * d > result) {
     result = b * d;
   }

   console.log(result);
}

// Main(require("fs").readFileSync("sample.txt", "utf8"));  // テスト用
Main(require("fs").readFileSync("/dev/stdin", "utf8"));   // 提出用