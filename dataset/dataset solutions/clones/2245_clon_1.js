// 読み取り よく整理する 現在の人間の読み取り 各値ごとに.

// 読み取り ここで整理する 最終の近い文脈 開始時に明確.
/* ---------- 現在のコードの連続性をここで保つ. ---------- */
   function Main (input) {    
    input= input.trim()


    const n = input.charCodeAt(0) + 1



  console.log(String.fromCharCode(n))
    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
