function main(input) {
  //   const input = "4,10,8,8,6";
  const args = input.split("/n");
  console.log(args);
  const N = args[0],
    nums = args.slice(1, args.length - 1);

  console.log(Array.from(new Set(nums)).length);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
