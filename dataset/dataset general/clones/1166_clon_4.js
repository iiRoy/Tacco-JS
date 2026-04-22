(function() {
    const browserAgentString = navigator.userAgent.toLowerCase();
    const isLegacyInternetExplorer = browserAgentString.includes('msie') || browserAgentString.includes('trident');
    const isWebkitSafari = browserAgentString.includes('safari') && !browserAgentString.includes('chrome');

    let currentRouteFragment = undefined;
    let fragmentUpdateHandler = undefined;
    let pollCycleId = undefined;

    let previousHistorySegments = [];
    let nextHistorySegments = [];
    let isInitialLoad = true;
    let suspendFragmentObservation = false;

    const auxiliaryFrameName = 'navigation_sync_frame';

    function getSyncFrameDocument() {
        const frameElement = document.getElementById(auxiliaryFrameName);
        if (frameElement && frameElement.contentWindow) {
            return frameElement.contentWindow.document;
        }
        return null;
    }

    function updateSyncFrameFragment(fragmentValue) {
        const frameDoc = getSyncFrameDocument();
        if (frameDoc) {
            frameDoc.open();
            frameDoc.close();
            frameDoc.location.hash = fragmentValue;
        }
    }

    const RouterController = {
        initiateTracking: function(changeNotificationFunction) {
            fragmentUpdateHandler = changeNotificationFunction;
            let initialRoute = location.hash;

            currentRouteFragment = initialRoute;
            if (isLegacyInternetExplorer) {
                if (currentRouteFragment === '') {
                    currentRouteFragment = '#';
                }

                if (!document.getElementById(auxiliaryFrameName)) {
                    const hiddenFrame = document.createElement('iframe');
                    hiddenFrame.id = auxiliaryFrameName;
                    hiddenFrame.style.display = 'none';
                    document.body.insertBefore(hiddenFrame, document.body.firstChild);
                }
                updateSyncFrameFragment(initialRoute);
            } else if (isWebkitSafari) {
                previousHistorySegments = [];
                previousHistorySegments.length = history.length;
                nextHistorySegments = [];
                isInitialLoad = true;
            }
            fragmentUpdateHandler(initialRoute.replace(/^#/, ''));
            pollCycleId = setInterval(RouterController.checkFragmentChanges, 100);
        },

        recordFragmentState: function(fragmentPayload) {
            previousHistorySegments.push(fragmentPayload);
            nextHistorySegments.length = 0;
            this.isInitialLoad = true;
        },

        checkFragmentChanges: function() {
            if (isLegacyInternetExplorer) {
                const frameDoc = getSyncFrameDocument();
                if (frameDoc) {
                    const frameCurrentFragment = frameDoc.location.hash;
                    if (frameCurrentFragment !== currentRouteFragment) {
                        location.hash = frameCurrentFragment;
                        currentRouteFragment = frameCurrentFragment;
                        fragmentUpdateHandler(frameCurrentFragment.replace(/^#/, ''));
                    }
                }
            } else if (isWebkitSafari) {
                if (!suspendFragmentObservation) {
                    const historyDifference = history.length - previousHistorySegments.length;

                    if (historyDifference) {
                        isInitialLoad = false;
                        if (historyDifference < 0) {
                            for (let i = 0; i < Math.abs(historyDifference); i++) {
                                nextHistorySegments.unshift(previousHistorySegments.pop());
                            }
                        } else {
                            for (let i = 0; i < historyDifference; i++) {
                                previousHistorySegments.push(nextHistorySegments.shift());
                            }
                        }
                        const storedFragment = previousHistorySegments[previousHistorySegments.length - 1];
                        if (storedFragment !== undefined) {
                            currentRouteFragment = location.hash;
                            fragmentUpdateHandler(storedFragment);
                        }
                    } else if (previousHistorySegments[previousHistorySegments.length - 1] === undefined && !isInitialLoad) {
                        if (document.URL.includes('#')) {
                            fragmentUpdateHandler(document.URL.split('#')[1]);
                        } else {
                            fragmentUpdateHandler('');
                        }
                        isInitialLoad = true;
                    }
                }
            } else {
                const browserActualFragment = location.hash;
                if (browserActualFragment !== currentRouteFragment) {
                    currentRouteFragment = browserActualFragment;
                    fragmentUpdateHandler(browserActualFragment.replace(/^#/, ''));
                }
            }
        },

        navigateViaFragment: function(newFragment) {
            let targetFragmentString;

            if (isWebkitSafari) {
                targetFragmentString = newFragment;
            } else {
                targetFragmentString = '#' + newFragment;
                location.hash = targetFragmentString;
            }
            currentRouteFragment = targetFragmentString;

            if (isLegacyInternetExplorer) {
                updateSyncFrameFragment(targetFragmentString);
                fragmentUpdateHandler(newFragment);
            } else if (isWebkitSafari) {
                suspendFragmentObservation = true;
                this.recordFragmentState(newFragment);
                
                const enableObservation = function() {
                    suspendFragmentObservation = false;
                };
                window.setTimeout(enableObservation, 200);
                fragmentUpdateHandler(newFragment);
                location.hash = targetFragmentString;
            } else {
                fragmentUpdateHandler(newFragment);
            }
        }
    };

    window.NavStateAgent = RouterController;
})();