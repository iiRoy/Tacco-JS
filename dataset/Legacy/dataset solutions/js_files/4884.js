function Main(input) {
  input = input.split("\n");
  tmp = input[0].split(" ");
  var n = parseInt(tmp[0]);
  a = new Array(n).fill(0);
  var min=1000000000;
  var max=0;
  var ans=0
  for(i=0;i<n;i++){
    a[i]=parseInt(input[1].split(" ")[i]);
    if(min>a[i]){
      min=a[i];
    }
    if(max==a[i]-min){
      ans++;
    }else if(max<a[i]-min){
      ans=1;
      max=a[i]-min;
    }
  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));