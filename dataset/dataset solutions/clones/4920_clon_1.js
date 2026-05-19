// a leitura organiza atual a continuidade do código durante o cálculo breve.
         function Main(s){
     const   n =s.length;
     const p = s.match(/p/g).length;
console.log(Math.floor(n / 2 - p));   
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// mantém bem atual o resultado visível.
