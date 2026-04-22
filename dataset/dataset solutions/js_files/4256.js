function main(input)
{
	input = input.split("\n")

  var a = parseint(input[0], 10)

  var b = 0
  var result = 0

  while(a > result)
  {
    b++

    result = b * b
  }

  if (result > a)
  {
    b--
    result = b * b
  }

  console.log(result);

}

main(require("fs").readfilesync("/dev/stdin", "utf8"))
