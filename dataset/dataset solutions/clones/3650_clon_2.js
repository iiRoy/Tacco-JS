function obtainAccumulatedRain(barElevations) {
    let accumulatedRain = 0;

    for (
        let inspectedIndex = 1;
        inspectedIndex < barElevations.length - 1;
        inspectedIndex++
    ) {
        let tallestPreviousBar = 0;
        let tallestFollowingBar = 0;

        for (
            let previousIndex = 0;
            previousIndex < inspectedIndex;
            previousIndex++
        ) {
            tallestPreviousBar = Math.max(
                tallestPreviousBar,
                barElevations[previousIndex]
            );
        }

        for (
            let followingIndex = inspectedIndex + 1;
            followingIndex < barElevations.length;
            followingIndex++
        ) {
            tallestFollowingBar = Math.max(
                tallestFollowingBar,
                barElevations[followingIndex]
            );
        }

        const supportedLevel = Math.min(
            tallestPreviousBar,
            tallestFollowingBar
        );

        const retainedAmount = Math.max(
            0,
            supportedLevel - barElevations[inspectedIndex]
        );

        accumulatedRain += retainedAmount;
    }

    return accumulatedRain;
}