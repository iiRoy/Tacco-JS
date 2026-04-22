function main(inputs) {
  const [X, Y] = inputs[0].split(" ").map(v=>parseInt(v));
  for(let kame=0;kame<=X;kame++){
    const tsuru = X-kame;
    if(kame*4+tsuru*2 === Y){
      console.log("Yes");
      return;
    }
  }
  console.log("No");
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));