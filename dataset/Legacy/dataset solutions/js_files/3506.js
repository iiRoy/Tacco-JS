function main(input) {
  let n = input.split('\n')[0] + '';
  checker: while(true){
    const nL = n.length;
    const fN = n[0];
    for(let i=1;i<nL;i++) if(fN !== n[i]){
      const pN = parseFloat(n)+1;
      n = pN + '';
      continue checker;
    }
    console.log(n);
    break;
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));