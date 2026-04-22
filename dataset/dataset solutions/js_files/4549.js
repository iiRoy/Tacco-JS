function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0].split(" ")[0]);
  var a = parseInt(input[0].split(" ")[1]);
  var b = parseInt(input[0].split(" ")[2]);
  h = new Array();
  var mas =0;
  for(i=0;i<n;i++){
    h[i]=parseInt(input[i+1]);
  }
  var ans=0;
  for(i=0;Math.max.apply(null,h)>=0;i++){
    var maxi = h.indexOf(Math.max.apply(null,h));
    for(j=h.length-1;j>=0;j--){
      if(j==maxi){
        h[j]-=a;
      }else{
        h[j]-=b;
        if(h[j]<=0){
          h.splice(j,1);
        }
      }
    }
    ans++;
  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));