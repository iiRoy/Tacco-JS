function main(input) {
  const [x, n] = input[0].trim().split(" ").map(i => parseInt(i));
  if(n!==0){
    const p = input[1].trim().split(" ").map(i => parseInt(i));

    let i=0;
    while(true){
      if(!p.includes(x-i)){
        console.log(x-i);
        break;
      }
      if(!p.includes(x+i)){
        console.log(x+i);
        break;
      }
      i++;
    }
  }else{
    console.log(x);
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));