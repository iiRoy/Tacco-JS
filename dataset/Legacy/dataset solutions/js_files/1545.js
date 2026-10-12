const main = lines => {
  line = lines.split(" ");
  const D = line[0];
  const T = line[1];
  const S = line[2];
  
  if (S * T >= D) {
    console.log('YES');
  }else{
    console.log('NO');
  }
}
 
main(require('fs').readFileSync('/dev/stdin','utf8'))