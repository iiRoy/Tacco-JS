function main(input) {
  input = input.trim();
  const a = input.split(" ").map(Number);
  const gou = a[0]+a[1];
  if(a[2]>=a[0]&&a[0]+a[1]>=a[2]){
    cosole.log("YES");
  }else{
    console.log("NO");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));