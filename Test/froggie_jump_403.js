/*
 * @param {number[]} stones
 * @return {boolean}
 */
var canCross = function(stones) {
    const n = stones.length;
    const stoneSet = new Set(stones);
    const memo = new Set();
    const lastStone = stones[n - 1];

    function dfs(currentPos, k) {
        const state = currentPos * 2001 + k;
        
        if (memo.has(state)) return false;
        if (currentPos === lastStone) return true;

        for (let nextK = k + 1; nextK >= k - 1; nextK--) {
            if (nextK > 0) {
                const nextPos = currentPos + nextK;
                if (stoneSet.has(nextPos)) {
                    if (dfs(nextPos, nextK)) return true;
                }
            }
        }

        memo.add(state);
        return false;
    }

    if (stones[1] !== 1) return false;
    
    return dfs(1, 1);
};