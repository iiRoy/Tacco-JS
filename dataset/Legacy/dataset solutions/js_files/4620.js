function main(input) {
  input = input.trim();
  const [a,b,c] = input.split(" ");
  let x = a.slice(0,1).toUpperCase() + b.slice(0,1).toUpperCase() + c.slice(0,1).toUpperCase();
  console.log(x);
 
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));