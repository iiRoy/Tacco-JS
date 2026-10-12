function main(input) {
  const nums = input
    .trim()
    .split(/\s/)
    .map(str => Number(str));

  console.log(
    nums[0] !== 0 && nums[0] === nums[1] && nums[0] === nums[2] ? "Yes" : "No"
  );
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
