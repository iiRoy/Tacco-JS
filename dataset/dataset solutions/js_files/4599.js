function main(input) {
  input = input.trim();
  const [a,b,c] = input.split(" ").map(Number);
 
  if(a.slice(-1)==b.slice(0,1) && b.slice(-1)==c.slice(0,1)){
    console.log("YES");
  }else{
    console.log("NO");
  }
 
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));