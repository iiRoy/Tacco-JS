function Main(input){
  input = input.split("\n");//[N, L L L L L,]
  //const N = parseInt(input[0], 10);
  const hairetu = input[1].split("");//[L,L,L,L,L,]
  let result = 0;

  for(let i = 0; i < hairetu.length; i++){
   for(let j = i+1; j < hairetu.length; j++){
    for(let k = j +1; k < hairetu.length; k++){
      if(hairetu[i] < hairetu[j] + hairetu[k] &&
        hairetu[j] < hairetu[i] + hairetu[k]&&
        hairetu[k] < hairetu[i] + hairetu[j]
        && hairetu[i] !== hairetu[j] && hairetu[j] !== hairetu[k] && hairetu[i] !== hairetu[k]){
             result++;}//要素3つが三角形の成立条件を満たしているか
      }
    }
   }
    console.log(result);
  }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
