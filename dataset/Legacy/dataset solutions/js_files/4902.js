function Main(input) {
  var input = input.split("\n");
  var K = parseInt(input[0].split(" ")[0]);
  var T = parseInt(input[0].split(" ")[1]);
  var a = input[1].split(" ").map((el,i)=>{
    return [i,parseInt(el)];
  });
  var last = -1;
  var count = 0;
  while(1){
    if(K == 0){
      return console.log(count);
    };
    a.sort(function(a,b){return a[1] < b[1];});
    var found = 0;
    for(var i = 0;i < a.length;i++){
      if(a[i][1] > 0 && a[i][0] != last){
        last = a[i][0];
        a[i][1]--;
        K--;
        found = 1;
        break;
      }
    };
    if(!found){
      for(var i = 0;i < a.length;i++){
        if(a[i][1] > 0){
          last = a[i][0];
          a[i][1]--;
          K--;
          count++;
          break;
        }
      };
    }
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));