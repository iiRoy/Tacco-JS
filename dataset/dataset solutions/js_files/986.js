function Main(input) {
  input = input.split("\n");
  var count = Number(input[0]);
  var num_array = input[1].split(" ").map(Number);
  var tmp;
  console.log(num_array.join(" "));
  for(let i = 1; i < count; i++) {
    tmp = num_array[i];
    let j = i - 1;
    while(j >= 0 && num_array[j] > tmp) {
      num_array[j+1] = num_array[j--];
    }
    num_array[j+1] = tmp;
    console.log(num_array.join(" "));
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

