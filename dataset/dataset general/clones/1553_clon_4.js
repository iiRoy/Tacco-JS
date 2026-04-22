((globalContext) => {
    const createDisplayManager = (uniqueIdentifier) => {
        const primaryElementQuery = '.jp-seek-bar';
        const secondaryElementQuery = '.jp-buffer-bar';
        const containerIdentifier = uniqueIdentifier;

        const applyVisualExtent = (targetSelector, extentValue, usePercentage = true) => {
            const visualTarget = document.querySelector(targetSelector);
            if (visualTarget) {
                visualTarget.style.width = extentValue + (usePercentage ? '%' : 'px');
            }
        };

        const obtainProgressUpdater = () => {
            return (playbackDetails) => {
                const soundSourceElement = document.querySelector(`#${containerIdentifier} audio`);

                if (!soundSourceElement) return;

                const currentLoadedSegments = soundSourceElement.buffered;

                const processBufferState = () => {
                    if (currentLoadedSegments.length === 0) {
                        applyVisualExtent(secondaryElementQuery, 0);
                    } else {
                        const totalDurationValue = playbackDetails.jPlayer.status.duration;
                        const currentPlaybackPoint = playbackDetails.jPlayer.status.currentTime;
                        const loadedUntilPoint = currentLoadedSegments.end(0);

                        const totalDurationFloor = Math.floor(totalDurationValue);
                        const loadedUntilFloor = Math.floor(loadedUntilPoint);

                        if (totalDurationFloor === loadedUntilFloor) {
                            const adjustedBufferRatio = 100 - playbackDetails.jPlayer.status.currentPercentRelative - 0.2;
                            applyVisualExtent(secondaryElementQuery, adjustedBufferRatio);

                            const seekIndicatorElement = document.querySelector(primaryElementQuery);
                            if (seekIndicatorElement) {
                                const currentComputedWidth = parseFloat(window.getComputedStyle(seekIndicatorElement).width);
                                applyVisualExtent(primaryElementQuery, currentComputedWidth + 1, false);
                            }
                        } else {
                            const dynamicBufferRatio = (loadedUntilPoint - currentPlaybackPoint) * 100 / totalDurationValue;
                            applyVisualExtent(secondaryElementQuery, dynamicBufferRatio);
                        }
                    }
                };
                processBufferState();
            };
        };

        return {
            getPlaybackMonitor: obtainProgressUpdater
        };
    };

    globalContext.PlaybackVisualizer = createDisplayManager;
})(window);