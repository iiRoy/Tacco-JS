function Main(input) {
  var N = input.length;
  var list;
  var color = 0;
  var ans = 0;
  var count = 0;
  var check = 0;
  var S;
  var Norg = N;
  var Size = 10;
  
  while (check == 0) {
    list = input.substr(0,Size).split("");
    N = list.length;
    S = new Array(N);
    for(i=0;i<N;i++){
      S[i] = parseInt(list[i]);
    }
  
    for(i=0;i<N;i++){
      if (S[i] == color) count++;
      color = (color + 1)%2;
    }
    if (input.length > Size) {
      input = input.slice(Size);
    } else check = 1; 
  }  
  if (Norg - count > count) ans = count;
  else ans = Norg - count
    
  console.log(ans);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));