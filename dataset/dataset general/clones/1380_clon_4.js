const acquireMotionValue = (timePassed, initialValue, changeAmount, totalDuration) => {
    timePassed /= totalDuration;
    timePassed--;
    return -changeAmount * (timePassed * timePassed * timePassed * timePassed - 1) + initialValue;
};

const obtainAnimationFrame = (() => {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           ((callback) => {
               window.setTimeout(callback, Math.floor(1000 / 60));
           });
})();

const buildImageSpinner = (targetContainerId, assetPathPattern, totalAssetCount) => {
    let primaryDisplayElement;
    let presentationArea;
    let assetItems = [];
    let currentAssetPosition = 0;
    let previousAssetPosition = 0;
    let pointerEngaged = false;
    let lastPointerCoordinate = 0;
    let momentumEffectActive = false;
    let rotationMomentumDirection = null;
    let currentSpinVelocity = 0;
    let momentumDecayRate = 0;
    let decayProgressTime = 0;
    let decayDurationLimit = 0;

    const commenceSetup = () => {
        primaryDisplayElement = document.getElementById(targetContainerId);
        if (!primaryDisplayElement) {
            console.error(`Target container '${targetContainerId}' not found.`);
            return;
        }

        presentationArea = document.createElement('div');
        presentationArea.className = 'spinner-presentation-area';
        primaryDisplayElement.appendChild(presentationArea);

        const loadIndicator = document.createElement('span');
        loadIndicator.className = 'spinner-loading-message';
        loadIndicator.textContent = 'Loading...';
        presentationArea.appendChild(loadIndicator);

        preloadAndInjectAssets();
    };

    const preloadAndInjectAssets = () => {
        const assetLoadPromises = [];
        for (let k = 0; k < totalAssetCount; k++) {
            const visualAsset = document.createElement('img');
            visualAsset.src = assetPathPattern.replace('{i}', k + 1);
            visualAsset.alt = `View ${k + 1}`;
            visualAsset.dataset.spinnerIndex = k;
            visualAsset.classList.add('spinner-asset-frame');
            visualAsset.style.display = 'none';

            assetItems[k] = visualAsset;

            assetLoadPromises.push(new Promise(resolve => {
                visualAsset.onload = () => resolve();
                visualAsset.onerror = () => {
                    console.warn(`Failed to load asset: ${visualAsset.src}`);
                    resolve();
                };
            }));

            presentationArea.appendChild(visualAsset);
        }

        Promise.all(assetLoadPromises).then(allAssetsReady);
    };

    const allAssetsReady = () => {
        const loadingMessage = presentationArea.querySelector('.spinner-loading-message');
        if (loadingMessage) {
            presentationArea.removeChild(loadingMessage);
        }

        if (assetItems[0]) {
            assetItems[0].style.display = 'block';
        }
        
        bindInteractionEvents();
    };

    const bindInteractionEvents = () => {
        if (typeof document.ontouchstart !== 'undefined') {
            presentationArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
                initiatePointerAction(e.touches[0].pageX);
            });
            presentationArea.addEventListener('touchmove', (e) => {
                e.preventDefault();
                processPointerMovement(e.touches[0].pageX);
            });
            presentationArea.addEventListener('touchend', (e) => {
                e.preventDefault();
                releasePointerAction();
            });
            presentationArea.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                releasePointerAction();
            });
        }

        presentationArea.addEventListener('mousedown', (e) => {
            e.preventDefault();
            initiatePointerAction(e.screenX);
        });
        presentationArea.addEventListener('mousemove', (e) => {
            e.preventDefault();
            processPointerMovement(e.screenX);
        });
        presentationArea.addEventListener('mouseup', (e) => {
            e.preventDefault();
            releasePointerAction();
        });
        presentationArea.addEventListener('mouseout', (e) => {
            e.preventDefault();
            const relatedTarget = e.relatedTarget || e.toElement;
            if (!presentationArea.contains(relatedTarget)) {
                releasePointerAction();
            }
        });
    };

    const initiatePointerAction = (currentX) => {
        pointerEngaged = true;
        lastPointerCoordinate = currentX;
        stopMomentumProcess();
    };

    const processPointerMovement = (currentX) => {
        if (pointerEngaged) {
            currentSpinVelocity = Math.max(1, Math.floor(Math.abs(lastPointerCoordinate - currentX) * 0.05));
            previousAssetPosition = currentAssetPosition;

            if (currentX > lastPointerCoordinate) {
                currentAssetPosition = (currentAssetPosition - currentSpinVelocity + totalAssetCount) % totalAssetCount;
                rotationMomentumDirection = 'backward';
            } else if (currentX < lastPointerCoordinate) {
                currentAssetPosition = (currentAssetPosition + currentSpinVelocity) % totalAssetCount;
                rotationMomentumDirection = 'forward';
            }
            
            if (previousAssetPosition !== currentAssetPosition) {
                updateDisplayedAsset();
            }
            lastPointerCoordinate = currentX;
        }
    };

    const releasePointerAction = () => {
        pointerEngaged = false;
        if (currentSpinVelocity > 0) {
            beginMomentumDecay();
        }
    };

    const beginMomentumDecay = () => {
        decayDurationLimit = currentSpinVelocity;
        momentumDecayRate = 0;
        decayProgressTime = 0;

        if (!momentumEffectActive) {
            obtainAnimationFrame(momentumFrameCycle);
            momentumEffectActive = true;
        }
    };

    const momentumFrameCycle = () => {
        decayProgressTime += (1 / 60);
        
        currentSpinVelocity = decayDurationLimit - Math.floor(acquireMotionValue(decayProgressTime, 0, decayDurationLimit, decayDurationLimit));
        momentumDecayRate += decayDurationLimit - acquireMotionValue(decayProgressTime, 0, decayDurationLimit, decayDurationLimit);

        if (momentumDecayRate >= 1) {
            previousAssetPosition = currentAssetPosition;
            if (rotationMomentumDirection === "forward") {
                currentAssetPosition = (currentAssetPosition + Math.floor(momentumDecayRate)) % totalAssetCount;
            } else {
                currentAssetPosition = (currentAssetPosition - Math.floor(momentumDecayRate) + totalAssetCount) % totalAssetCount;
            }
            momentumDecayRate = 0;
            updateDisplayedAsset();
        }

        if (decayProgressTime > decayDurationLimit || currentSpinVelocity < 1) {
            stopMomentumProcess();
        } else {
            obtainAnimationFrame(momentumFrameCycle);
        }
    };

    const stopMomentumProcess = () => {
        decayProgressTime = 0;
        decayDurationLimit = 0;
        momentumEffectActive = false;
        currentSpinVelocity = 0;
    };

    const updateDisplayedAsset = () => {
        if (assetItems[previousAssetPosition]) {
            assetItems[previousAssetPosition].style.display = 'none';
        }
        if (assetItems[currentAssetPosition]) {
            assetItems[currentAssetPosition].style.display = 'block';
        }
    };

    commenceSetup();

    return {};
};

const setupProductViewer = (identifier, imagePath, frameCount) => {
    return buildImageSpinner(identifier, imagePath, frameCount);
};

setupProductViewer;