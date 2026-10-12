function main(input) {
  input=input.trim();
  const N = parseInt(input.split(" ")[0], 10);
  const arrS = input.split('\n')[1].split(' ').map((n) => (n));
  var ans=0;
  if(arrS.indexOf("P")!=-1){
    ans++
  }
  if(arrS.indexOf("W")!=-1){
    ans++
  }
  if(arrS.indexOf("G")!=-1){
    ans++
  }
  if(arrS.indexOf("Y")!=-1){
    ans++
  }
  if(ans==3){
    console.log("Three");
  }else{
    console.log("Four");
  }

}



main(require('fs').readFileSync('/dev/stdin', 'utf8'));
