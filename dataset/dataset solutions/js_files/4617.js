function main(input) {
  input=input.trim();
  const s1 = input.split(" ")[0];
  const s2 = input.split(" ")[1];
  const s3 = input.split(" ")[2];
  console.log(s1.substr(0,1).toUpperCase()+s2.substr(0,1).toUpperCase()+s3.substr(0,1).toUpperCase());
}



main(require('fs').readFileSync('/dev/stdin', 'utf8'));
