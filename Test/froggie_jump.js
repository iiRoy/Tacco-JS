/**
 * @param {number[]} stones
 * @return {boolean}
 */

function canCross(stones) {
  const n = stones.length;

  // First jump must be exactly 1
  if (stones[1] !== 1) return false;

  const stoneSet = new Set(stones);
  const jumpsAtStone = new Map();

  for (const stone of stones) {
    jumpsAtStone.set(stone, new Set());
  }

  // Frog starts at stone 0 with previous jump size 0
  jumpsAtStone.get(0).add(0);

  for (const stone of stones) {
    const jumps = jumpsAtStone.get(stone);

    for (const jump of jumps) {
      for (const nextJump of [jump - 1, jump, jump + 1]) {
        if (nextJump <= 0) continue;

        const nextStone = stone + nextJump;

        if (nextStone === stones[n - 1]) {
          return true;
        }

        if (stoneSet.has(nextStone)) {
          jumpsAtStone.get(nextStone).add(nextJump);
        }
      }
    }
  }

  return false;
}