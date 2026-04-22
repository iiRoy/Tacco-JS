function Main(input) {
  input = input.split("\n");
  n = input[0].split("");
  a = input[1].split(" ").map((a)=>Number(a));
  b = input[2].split(" ").map((b)=>Number(b));
  c = input[3].split(" ").map((c)=>Number(c));
  var ans=0;
  for(var i=0; i<n; i++){
    ans+=b[a[i]-1];
    if(a[i]==a[i-1]+1){
      ans+=c[a[i-1]-1];
    }
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));