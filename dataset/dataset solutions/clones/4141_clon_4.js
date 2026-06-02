function Main(input) {
  const inputLines = input.split("\n");

  const [itemCountStr, targetHealthStr] = inputLines[0].split(" ");
  const itemCount = parseInt(itemCountStr, 10);
  let targetHealth = parseInt(targetHealthStr, 10);

  const attackSpecifications = inputLines
    .slice(1, itemCount + 1)
    .map((line) => line.split(" ").map(Number));

  const baseAttackValues = attackSpecifications.map((spec) => spec[0]);
  const specialAttackPowers = attackSpecifications.map((spec) => spec[1]);

  const maxBaseAttack = Math.max(...baseAttackValues);

  const effectiveSpecialStrikes = specialAttackPowers
    .filter((power) => power > maxBaseAttack)
    .sort((p1, p2) => p2 - p1); // Sort descending

  let totalAttacksRequired = 0;

  for (const strikePower of effectiveSpecialStrikes) {
    if (targetHealth <= 0) {
      break;
    }
    targetHealth -= strikePower;
    totalAttacksRequired++;
  }

  if (targetHealth > 0) {
    totalAttacksRequired += Math.ceil(targetHealth / maxBaseAttack);
  }

  console.log(totalAttacksRequired);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
