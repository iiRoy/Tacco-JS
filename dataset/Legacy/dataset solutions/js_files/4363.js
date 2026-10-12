function main(input) {
  input = input.trim();
  const a = input.split(" ").map(Number);
  if(a[0]==9 || a[1]==9){
  	console.log('Yes');
  }else{
    console.log('No');
  }
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
