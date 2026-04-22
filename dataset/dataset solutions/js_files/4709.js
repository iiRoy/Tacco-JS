function Main(input) {
	const ab = input.split(" ");
  const a  = parseFloat(ab[0]);
  const b  = parseFloat(ab[1]);
  const list = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];
  const aI = list.indexOf(a);
  const bI = list.indexOf(b);
  if(aI < bI){
    console.log("Bob");
    return;
  }
  if(bI < aI){
    console.log("Alice");
    return;
  }
  if(aI == bI){
    console.log("Draw");
    return;
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));