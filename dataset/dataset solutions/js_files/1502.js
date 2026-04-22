function Main(input)
{
  input = input.split("\n");
  for(let i=0;i<input.length;i+=1)
  {
    console.log(solver(input[i]));
  }
}

function solver(arg)
{
  const pattern=/s$/;
  return pattern.test(arg)?
  	arg+"es":arg+"s";
}
  



Main(require("fs").readFileSync("/dev/stdin","utf8"));