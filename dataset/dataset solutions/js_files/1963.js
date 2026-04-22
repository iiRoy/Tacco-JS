function main(input) {
    input = input.trim().split("\n");
    var n = parseInt(input[0].split(" "), 10);
    var days = 0;
    input[1].split(" ").forEach(x => {
        days += parseInt(x, 10);
    })

    if (n-days < 0) {
        console.log(-1);
    } else {
        console.log(n-days);
    }

  }
   
  main(require("fs").readFileSync("/dev/stdin", "utf8"));
