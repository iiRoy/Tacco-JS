let eventingAvailable = 'GamepadEvent' in window;
let activeGamepadsMap = new Map();
let animationCycleInitiator = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
let currentCycleIdentifier = null;

const createDomNode = (tag, props = {}, childNodes = []) => {
    const node = document.createElement(tag);
    for (const key in props) {
        if (key.startsWith('data-')) {
            node.setAttribute(key, props[key]);
        } else if (key === 'className') {
            node.className = props[key];
        } else {
            node[key] = props[key];
        }
    }
    childNodes.forEach(child => {
        if (typeof child === 'string') {
            node.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            node.appendChild(child);
        }
    });
    return node;
};

function provisionInputUnit(inputDevice) {
    if (!inputDevice) return;

    const unitContainer = createDomNode('section', {
        className: 'device-presenter-unit',
        'data-device-handle': inputDevice.index
    }, [
        createDomNode('h2', { className: 'device-title' }, [`Controller: ${inputDevice.id}`])
    ]);

    const buttonDisplayPanel = createDomNode('ul', { className: 'button-grid' });
    inputDevice.buttons.forEach((_, keyIndex) => {
        buttonDisplayPanel.appendChild(createDomNode('li', {}, [
            createDomNode('button', {
                className: 'control-element-button',
                'data-button-idx': keyIndex
            }, [`${keyIndex}`])
        ]));
    });
    unitContainer.appendChild(buttonDisplayPanel);

    const axisDisplayPanel = createDomNode('ul', { className: 'axis-sliders' });
    inputDevice.axes.forEach((_, keyIndex) => {
        axisDisplayPanel.appendChild(createDomNode('li', {}, [
            createDomNode('meter', {
                className: 'analog-indicator',
                'data-axis-idx': keyIndex,
                min: -1,
                max: 1,
                value: 0
            }, [`Axis ${keyIndex}`])
        ]));
    });
    unitContainer.appendChild(axisDisplayPanel);

    document.body.appendChild(unitContainer);
    activeGamepadsMap.set(inputDevice.index, { deviceData: inputDevice, domRootNode: unitContainer });

    const initialScreenMessage = document.querySelector('[data-initial-message-area]');
    if (initialScreenMessage) {
        initialScreenMessage.style.display = 'none';
    }

    if (!currentCycleIdentifier) {
        currentCycleIdentifier = animationCycleInitiator(updateDeviceVisuals);
    }
}

function deprovisionInputUnit(inputDevice) {
    if (!inputDevice) return;

    const storedUnit = activeGamepadsMap.get(inputDevice.index);
    if (storedUnit && storedUnit.domRootNode) {
        storedUnit.domRootNode.remove();
    }
    activeGamepadsMap.delete(inputDevice.index);

    if (activeGamepadsMap.size === 0) {
        const initialScreenMessage = document.querySelector('[data-initial-message-area]');
        if (initialScreenMessage) {
            initialScreenMessage.style.display = 'block';
        }
        if (currentCycleIdentifier) {
            cancelAnimationFrame(currentCycleIdentifier);
            currentCycleIdentifier = null;
        }
    }
}

function handleDeviceConnection(eventObject) {
    provisionInputUnit(eventObject.gamepad);
}

function handleDeviceDisconnection(eventObject) {
    deprovisionInputUnit(eventObject.gamepad);
}

function pollForConnectedDevices() {
    const presentDevices = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    const currentlyActiveIndices = new Set();

    presentDevices.forEach(currentDevice => {
        if (currentDevice) {
            currentlyActiveIndices.add(currentDevice.index);
            if (!activeGamepadsMap.has(currentDevice.index)) {
                provisionInputUnit(currentDevice);
            } else {
                activeGamepadsMap.get(currentDevice.index).deviceData = currentDevice;
            }
        }
    });

    for (const [idx, { deviceData }] of activeGamepadsMap.entries()) {
        if (!currentlyActiveIndices.has(idx)) {
            deprovisionInputUnit(deviceData);
        }
    }
}

function updateDeviceVisuals() {
    pollForConnectedDevices();

    activeGamepadsMap.forEach(({ deviceData, domRootNode }) => {
        const buttonElements = domRootNode.querySelectorAll('.button-grid .control-element-button');
        deviceData.buttons.forEach((buttonState, idx) => {
            const targetButton = buttonElements[idx];
            if (!targetButton) return;

            const numericValue = typeof buttonState === 'object' ? buttonState.value : buttonState;
            const isActivated = typeof buttonState === 'object' ? buttonState.pressed : numericValue === 1.0;

            const fillRatio = Math.round(numericValue * 100);
            targetButton.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, 0.4) ${fillRatio}%, transparent ${fillRatio}%)`;
            targetButton.classList.toggle('activated', isActivated);
        });

        const axisElements = domRootNode.querySelectorAll('.axis-sliders .analog-indicator');
        deviceData.axes.forEach((axisValue, idx) => {
            const targetAxis = axisElements[idx];
            if (!targetAxis) return;

            targetAxis.value = axisValue;
            targetAxis.textContent = `Axis ${idx}: ${axisValue.toFixed(4)}`;
        });
    });

    if (activeGamepadsMap.size > 0) {
        currentCycleIdentifier = animationCycleInitiator(updateDeviceVisuals);
    } else {
        currentCycleIdentifier = null;
    }
}

if (eventingAvailable) {
    window.addEventListener("gamepadconnected", handleDeviceConnection);
    window.addEventListener("gamepaddisconnected", handleDeviceDisconnection);
} else {
    currentCycleIdentifier = animationCycleInitiator(updateDeviceVisuals);
}

document.addEventListener('DOMContentLoaded', () => {
    let initialDisplayArea = document.getElementById("start");
    if (!initialDisplayArea) {
        initialDisplayArea = document.createElement("div");
        initialDisplayArea.id = "start";
        document.body.prepend(initialDisplayArea);
    }
    initialDisplayArea.setAttribute('data-initial-message-area', '');
    initialDisplayArea.textContent = 'Awaiting input device connection...';
});