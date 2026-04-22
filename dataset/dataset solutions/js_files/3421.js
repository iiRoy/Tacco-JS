function main(input) {
  const X = parseInt(input, 10);
  if(X==3||5||7){
    console.log("YES");
  }else{
    console.log("NO");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));