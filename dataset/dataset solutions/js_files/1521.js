const main = arg => {
  const x = parseInt(arg);
  console.log(x ? 0 : 1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8')); 