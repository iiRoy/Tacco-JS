function Main(input) {
  input = input.split("\n");
  n = input[0].split("");
  a = input[1].split(" ");
  b = input[2].split(" ");
  c = input[3].split(" ");
  var ans=0;
  for(var i=0; i<n; i++){
    ans+=Number(b[a[i]-1]);
    if(i>0 && a[i]==Number(a[i-1])+1){
      ans+=Number(c[a[i-1]-1]);
    }
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));