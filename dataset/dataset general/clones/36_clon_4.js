const gameGridConfig = Object.freeze({
    matrixRows: 5,
    matrixCols: 5,
    verticalOffset: 5,
    horizontalOffset: 5,
    elementSpacing: 2,
    elementWidth: 60,
    elementHeight: 60
});

const makeChronometer = function() {
    let startMoment = 0;
    let isActive = false;
    let accumulatedTime = 0;

    return {
        initiate: function() {
            if (!isActive) {
                startMoment = Date.now() - accumulatedTime;
                isActive = true;
            }
        },
        pause: function() {
            if (isActive) {
                accumulatedTime = Date.now() - startMoment;
                isActive = false;
            }
        },
        retrieveElapsed: function() {
            return isActive ? Date.now() - startMoment : accumulatedTime;
        },
        reset: function() {
            startMoment = 0;
            isActive = false;
            accumulatedTime = 0;
        }
    };
};

const makeNumberElement = function(initialValue) {
    const displayElement = document.createElement('div');
    displayElement.style.position = 'absolute';
    displayElement.style.width = gameGridConfig.elementWidth + 'px';
    displayElement.style.height = gameGridConfig.elementHeight + 'px';
    displayElement.style.cursor = 'pointer';
    displayElement.style.display = 'flex';
    displayElement.style.justifyContent = 'center';
    displayElement.style.alignItems = 'center';
    displayElement.style.fontFamily = 'Helvetica';
    displayElement.style.fontSize = '20px';
    displayElement.style.fontWeight = 'bold';
    displayElement.dataset.storedValue = initialValue;

    const activeBackground = document.createElement('div');
    activeBackground.style.width = '100%';
    activeBackground.style.height = '100%';
    activeBackground.style.backgroundColor = '#00ff00';
    activeBackground.style.position = 'absolute';
    activeBackground.style.top = '0';
    activeBackground.style.left = '0';

    const inactiveBackground = document.createElement('div');
    inactiveBackground.style.width = '100%';
    inactiveBackground.style.height = '100%';
    inactiveBackground.style.backgroundColor = '#666666';
    inactiveBackground.style.position = 'absolute';
    inactiveBackground.style.top = '0';
    inactiveBackground.style.left = '0';
    inactiveBackground.style.display = 'none';

    const valueLabel = document.createElement('span');
    valueLabel.textContent = initialValue;
    valueLabel.style.position = 'relative';
    valueLabel.style.zIndex = '1';

    displayElement.appendChild(inactiveBackground);
    displayElement.appendChild(activeBackground);
    displayElement.appendChild(valueLabel);

    return {
        elementNode: displayElement,
        assignValue: function(newValue) {
            displayElement.dataset.storedValue = newValue;
            valueLabel.textContent = newValue;
        },
        readValue: function() {
            return parseInt(displayElement.dataset.storedValue, 10);
        },
        toggleActive: function(enabled) {
            activeBackground.style.display = enabled ? 'block' : 'none';
            inactiveBackground.style.display = enabled ? 'none' : 'block';
        },
        placeAt: function(xCoord, yCoord) {
            displayElement.style.left = xCoord + 'px';
            displayElement.style.top = yCoord + 'px';
        },
        attachTapListener: function(handler) {
            displayElement.addEventListener('touchend', handler);
            displayElement.addEventListener('click', handler);
        }
    };
};

const makeInitialScreen = function(containerWidth, containerHeight) {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = containerWidth + 'px';
    overlayDiv.style.height = containerHeight + 'px';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlayDiv.style.display = 'flex';
    overlayDiv.style.justifyContent = 'center';
    overlayDiv.style.alignItems = 'center';
    overlayDiv.style.zIndex = '100';

    const startupText = document.createElement('span');
    startupText.textContent = 'START';
    startupText.style.fontFamily = 'Helvetica';
    startupText.style.fontSize = '30px';
    startupText.style.fontWeight = 'bold';
    startupText.style.color = '#ffffff';

    overlayDiv.appendChild(startupText);

    return {
        node: overlayDiv,
        registerTapAction: function(action) {
            overlayDiv.addEventListener('touchend', action);
            overlayDiv.addEventListener('click', action);
        },
        removeNode: function() {
            overlayDiv.parentNode.removeChild(overlayDiv);
        }
    };
};

const primaryGameUnit = (function() {
    let requiredNumber = 0;
    let interactiveTiles = [];
    let numberSequence = [];
    let gameChronometer;
    let timeReadoutNode;
    let welcomeScreen;
    let mainGameArea;

    const setupEnvironment = function(containerElement) {
        mainGameArea = containerElement;
        mainGameArea.style.position = 'relative';
        mainGameArea.style.overflow = 'hidden';

        gameChronometer = makeChronometer();

        timeReadoutNode = document.createElement('div');
        timeReadoutNode.style.position = 'absolute';
        timeReadoutNode.style.left = '160px';
        timeReadoutNode.style.top = '350px';
        timeReadoutNode.style.textAlign = 'center';
        timeReadoutNode.style.fontFamily = 'Helvetica';
        timeReadoutNode.style.fontSize = '30px';
        timeReadoutNode.style.fontWeight = 'bold';
        mainGameArea.appendChild(timeReadoutNode);

        const totalElementCount = gameGridConfig.matrixRows * gameGridConfig.matrixCols;

        Array.from({ length: totalElementCount }, (_, i) => i + 1).forEach((val, i) => {
            const currentTile = makeNumberElement(val);
            const columnPosition = Math.floor(i / gameGridConfig.matrixCols);
            const rowPosition = i % gameGridConfig.matrixRows;

            const xCoordinate = gameGridConfig.horizontalOffset + rowPosition * (gameGridConfig.elementWidth + gameGridConfig.elementSpacing);
            const yCoordinate = gameGridConfig.verticalOffset + columnPosition * (gameGridConfig.elementHeight + gameGridConfig.elementSpacing);

            currentTile.placeAt(xCoordinate, yCoordinate);
            currentTile.attachTapListener((evt) => handleTileInteraction(evt, currentTile));

            mainGameArea.appendChild(currentTile.elementNode);
            interactiveTiles.push(currentTile);
            numberSequence.push(val);
        });

        welcomeScreen = makeInitialScreen(containerElement.offsetWidth, containerElement.offsetHeight);
        welcomeScreen.registerTapAction(handleWelcomeScreenDismissal);
        mainGameArea.appendChild(welcomeScreen.node);

        requestAnimationFrame(updateDisplayLoop);
    };

    const commencePlay = function() {
        requiredNumber = 1;
        gameChronometer.initiate();

        numberSequence = numberSequence
            .map(val => ({ randomKey: Math.random(), originalValue: val }))
            .sort((a, b) => a.randomKey - b.randomKey)
            .map(item => item.originalValue);

        interactiveTiles.forEach((tile, index) => {
            tile.assignValue(numberSequence[index]);
            tile.toggleActive(true);
        });
    };

    const handleWelcomeScreenDismissal = function() {
        welcomeScreen.removeNode();
        commencePlay();
    };

    const handleTileInteraction = function(evt, tappedTile) {
        evt.preventDefault();

        if (tappedTile.readValue() === requiredNumber) {
            tappedTile.toggleActive(false);
            requiredNumber++;
        }

        if (requiredNumber > numberSequence.length) {
            gameChronometer.pause();
        }
    };

    const updateDisplayLoop = function() {
        const currentDuration = gameChronometer.retrieveElapsed();
        const seconds = ("00" + Math.floor(currentDuration / 1000)).slice(-2);
        const milliseconds = ("00" + Math.floor((currentDuration % 1000) / 10)).slice(-2);
        timeReadoutNode.textContent = `${seconds}:${milliseconds}`;

        requestAnimationFrame(updateDisplayLoop);
    };

    return {
        initialize: setupEnvironment
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    const applicationRoot = document.createElement('div');
    applicationRoot.id = 'gameCanvasRoot';
    applicationRoot.style.width = '320px';
    applicationRoot.style.height = '416px';
    applicationRoot.style.border = '1px solid #ccc';
    document.body.appendChild(applicationRoot);

    primaryGameUnit.initialize(applicationRoot);
});