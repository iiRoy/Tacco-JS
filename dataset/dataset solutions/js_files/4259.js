function Main(input) {
  input = input.split("\n");
  var n = input[0];
  tmp1=input[1].split(" ");
  tmp2=input[2].split(" ");
  tmp3=input[3].split(" ");
  a = new Array(n).fill(0);
  b = new Array(n).fill(0);
  c = new Array(n).fill(0);
  for(i=0;i<n;i++){
    a[i]=parseInt(tmp1[i]);
  }
  for(i=0;i<n;i++){
    b[i]=parseInt(tmp2[i]);
  }
  for(i=0;i<n;i++){
    c[i]=parseInt(tmp3[i]);
  }
  var ans=0;
  for(i=0;i<n;i++){
    for(j=0;j<n;j++){
      if(a[i]<b[j]){
        for(k=0;k<n;k++){
          if(b[j]<c[k]){
            ans++;
          }
        }
      }
    }

  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));