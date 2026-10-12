function Main (input) {
  if (input == "a") {input = "b";}
  else if (input == "b") {input = "c";}
  else if (input == "c") {input = "d";}
  else if (input == "d") {input = "e";}
  else if (input == "e") {input = "f";}
  else if (input == "f") {input = "g";}
  else if (input == "g") {input = "h";}
  else if (input == "h") {input = "i";}
  else if (input == "i") {input = "j";}
  else if (input == "j") {input = "k";}
  else if (input == "k") {input = "l";}
  else if (input == "l") {input = "m";}
  else if (input == "m") {input = "n";}
  else if (input == "n") {input = "o";}
  else if (input == "o") {input = "p";}
  else if (input == "p") {input = "q";}
  else if (input == "q") {input = "r";}
  else if (input == "r") {input = "s";}
  else if (input == "s") {input = "t";}
  else if (input == "t") {input = "u";}
  else if (input == "u") {input = "v";}
  else if (input == "v") {input = "w";}
  else if (input == "w") {input = "x";}
  else if (input == "x") {input = "y";}
  else if (input == "y") {input = "z";}
  //else if (input == "z") {input = "a";}
  console.log(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));