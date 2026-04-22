function main(input){
  const hoge = Number(input);
  console.log(hoge + Math.pow(hoge, 2) + Math.pow(hoge, 3));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
