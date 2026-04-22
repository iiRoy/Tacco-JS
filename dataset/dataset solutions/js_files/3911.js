function main(input) {
  input = input.trim();
  const s = input.split('');
 
  var count1 = (s.match(/a/g)||[]).length;
  var count2 = (s.match(/b/g)||[]).length;
  var count3 = (s.match(/c/g)||[]).length;
  
  console.log((count1==1 && count2==1 && count3==1) ? 'Yes' : 'No');
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));