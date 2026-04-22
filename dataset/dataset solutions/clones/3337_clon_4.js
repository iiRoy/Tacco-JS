(function(rawInput){
    const processedData = rawInput.trim().split(/\s+/).map(Number);

    const quantityChildren = processedData.shift();
    const aggregateSweets = processedData.shift();
    const modulusConstant = 1000000007;

    const individualSweetCaps = processedData;

    const memoStore = Array(quantityChildren).fill(null).map(() => Array(aggregateSweets + 1).fill(-1));

    function determineWays(currentChildIndex, sweetsToDistribute) {
        if (sweetsToDistribute < 0) {
            return 0;
        }

        if (currentChildIndex < 0) {
            return sweetsToDistribute === 0 ? 1 : 0;
        }

        if (memoStore[currentChildIndex][sweetsToDistribute] !== -1) {
            return memoStore[currentChildIndex][sweetsToDistribute];
        }

        let totalWaysForCurrentState = 0;
        const limitForCurrentChild = individualSweetCaps[currentChildIndex];

        for (let sweetsTakenByCurrentChild = 0; sweetsTakenByCurrentChild <= limitForCurrentChild; sweetsTakenByCurrentChild++) {
            totalWaysForCurrentState = (totalWaysForCurrentState +
                                         determineWays(currentChildIndex - 1, sweetsToDistribute - sweetsTakenByCurrentChild)) % modulusConstant;
        }

        memoStore[currentChildIndex][sweetsToDistribute] = totalWaysForCurrentState;
        return totalWaysForCurrentState;
    }

    const finalResult = determineWays(quantityChildren - 1, aggregateSweets);

    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));