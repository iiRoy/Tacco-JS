function PointFactory(vX, vY) {
    if (typeof vX === 'undefined') vX = 0;
    if (typeof vY === 'undefined') vY = 0;
    return { x: vX, y: vY };
}

function BezierBasis(time, index) {
    switch (index) {
        case 0: return Math.pow(1 - time, 3);
        case 1: return 3 * time * Math.pow(1 - time, 2);
        case 2: return 3 * Math.pow(time, 2) * (1 - time);
        case 3: return Math.pow(time, 3);
        default: return 0;
    }
}

function calculateBezierPoint(progress, pA, pB, pC, pD) {
    let result = PointFactory();
    const controlPoints = [pA, pB, pC, pD];
    for (let i = 0; i < 4; i++) {
        const factor = BezierBasis(progress, i);
        result.x += controlPoints[i].x * factor;
        result.y += controlPoints[i].y * factor;
    }
    return result;
}

function constructShapedText(sourceElement, displaySettings) {

    const defaultSettings = {
        'text-alignment': 'justify',
        shapeType: 'line',
        control1: PointFactory(0, 0), control2: PointFactory(0, 0), control3: PointFactory(0, 0), control4: PointFactory(0, 0),
        dualControl1: PointFactory(0, 0), dualControl2: PointFactory(0, 0), dualControl3: PointFactory(0, 0), dualControl4: PointFactory(0, 0),
        spacingStep: 0,
        horizontalAlign: 'left'
    };
    const activeSettings = { ...defaultSettings, ...displaySettings };

    const hostContainer = document.createElement('div');
    hostContainer.style.position = 'relative';
    hostContainer.style.width = '100%';
    hostContainer.style.height = '100%';
    hostContainer.style.boxSizing = 'border-box';

    const originalContentNodes = Array.from(sourceElement.childNodes);
    sourceElement.innerHTML = ''; 
    sourceElement.appendChild(hostContainer);

    const tempHeightMeasurer = document.createElement('span');
    tempHeightMeasurer.style.visibility = 'hidden';
    tempHeightMeasurer.textContent = 'x';
    hostContainer.appendChild(tempHeightMeasurer);
    let baseLineHeight = tempHeightMeasurer.offsetHeight;
    hostContainer.removeChild(tempHeightMeasurer);

    if (baseLineHeight === 0) { 
        baseLineHeight = 16;
    }

    const totalDisplayHeight = hostContainer.offsetHeight;
    const maxSegmentCount = Math.floor(totalDisplayHeight / baseLineHeight);

    const pathGenerators = {
        'bezier': (segmentRatio, containerWidth) => {
            const point = calculateBezierPoint(segmentRatio, activeSettings.control1, activeSettings.control2, activeSettings.control3, activeSettings.control4);
            return { verticalPos: point.y, segmentWidth: containerWidth - point.x, horizontalOffset: point.x };
        },
        'dualbezier': (segmentRatio, containerWidth) => {
            const point1 = calculateBezierPoint(segmentRatio, activeSettings.control1, activeSettings.control2, activeSettings.control3, activeSettings.control4);
            const point2 = calculateBezierPoint(segmentRatio, activeSettings.dualControl1, activeSettings.dualControl2, activeSettings.dualControl3, activeSettings.dualControl4);
            return { verticalPos: point1.y, segmentWidth: containerWidth - point1.x - point2.x, horizontalOffset: point1.x };
        },
        'line': (segmentRatio, containerWidth, segmentIndex) => {
            const xOffset = segmentIndex * activeSettings.spacingStep;
            const yOffset = segmentRatio * totalDisplayHeight;
            return { verticalPos: yOffset, segmentWidth: containerWidth - xOffset, horizontalOffset: xOffset };
        }
    };

    const getSegmentPath = pathGenerators[activeSettings.shapeType] || pathGenerators['line'];

    const segmentStructures = Array.from({ length: maxSegmentCount }).map((_, segIdx) => {
        const segmentRatio = segIdx / maxSegmentCount;
        const currentContainerWidth = hostContainer.offsetWidth; 
        const segmentGeometry = getSegmentPath(segmentRatio, currentContainerWidth, segIdx);

        const segmentWrapper = document.createElement('div');
        segmentWrapper.className = 'segment-layout-wrapper';
        segmentWrapper.style.position = 'absolute';
        segmentWrapper.style.top = `${segmentGeometry.verticalPos}px`;
        segmentWrapper.style.width = `${segmentGeometry.segmentWidth}px`;
        segmentWrapper.style.height = 'auto'; 

        if (activeSettings.horizontalAlign === 'right') {
            segmentWrapper.style.right = `${segmentGeometry.horizontalOffset}px`;
        } else {
            segmentWrapper.style.left = `${segmentGeometry.horizontalOffset}px`;
        }

        const segmentContent = document.createElement('div');
        segmentContent.className = 'segment-content-area';
        segmentContent.style.textAlign = activeSettings['text-alignment'];
        segmentContent.style.overflow = 'hidden'; 
        segmentContent.style.whiteSpace = 'normal'; 

        segmentWrapper.appendChild(segmentContent);
        hostContainer.appendChild(segmentWrapper);

        return {
            outer: segmentWrapper,
            inner: segmentContent,
            capacityWidth: segmentGeometry.segmentWidth
        };
    });

    function* generateContentUnits(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.match(/\S+|\s+/g) || [];
            for (const word of words) {
                if (/\S/.test(word)) {
                    yield { type: 'word', value: word };
                } else if (/\s/.test(word)) { // Preserve spaces as separate tokens
                    yield { type: 'space', value: word };
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const attrs = Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value }));
            
            yield { type: 'openTag', tag: tagName, attributes: attrs };
            for (const child of Array.from(node.childNodes)) {
                yield* generateContentUnits(child);
            }
            yield { type: 'closeTag', tag: tagName };
        }
    }

    const contentUnitStream = (function* () {
        for (const node of originalContentNodes) {
            yield* generateContentUnits(node);
        }
    })();

    let currentSegmentIndex = 0;
    let currentDOMElementStack = [];

    const getCurrentContentTarget = () => {
        if (currentDOMElementStack.length > 0) {
            return currentDOMElementStack[currentDOMElementStack.length - 1];
        }
        return segmentStructures[currentSegmentIndex].inner;
    };

    function createNodeFromToken(token) {
        if (token.type === 'word' || token.type === 'space') {
            return document.createTextNode(token.value);
        } else if (token.type === 'openTag') {
            const el = document.createElement(token.tag);
            token.attributes.forEach(attr => el.setAttribute(attr.name, attr.value));
            return el;
        }
        return null;
    }

    while (true) {
        const { value: currentToken, done } = contentUnitStream.next();
        if (done) break;

        if (currentSegmentIndex >= segmentStructures.length) {
            break;
        }

        const currentSegment = segmentStructures[currentSegmentIndex];
        const currentContentArea = currentSegment.inner;
        const currentCapacity = currentSegment.capacityWidth;
        
        let willOverflow = false;
        if (currentToken.type !== 'closeTag') { // Close tags don't add visible content
            const tempMeasurer = document.createElement('span');
            tempMeasurer.style.visibility = 'hidden';
            tempMeasurer.style.position = 'absolute';
            tempMeasurer.style.whiteSpace = 'nowrap';
            
            const computedStyle = getComputedStyle(currentContentArea);
            tempMeasurer.style.fontFamily = computedStyle.fontFamily;
            tempMeasurer.style.fontSize = computedStyle.fontSize;
            tempMeasurer.style.fontWeight = computedStyle.fontWeight;
            tempMeasurer.style.lineHeight = computedStyle.lineHeight;

            const currentLineContentClone = currentContentArea.cloneNode(true);
            const nodeToAppend = createNodeFromToken(currentToken);
            if (nodeToAppend) {
                currentLineContentClone.appendChild(nodeToAppend);
            }
            
            tempMeasurer.appendChild(currentLineContentClone);
            hostContainer.appendChild(tempMeasurer);
            const potentialWidth = tempMeasurer.offsetWidth;
            hostContainer.removeChild(tempMeasurer);

            // Check for overflow. If currentContentArea is empty, it's the start of a line, so don't overflow
            willOverflow = (potentialWidth > currentCapacity) && (currentContentArea.offsetWidth > 0);
        }

        if (willOverflow) {
            currentSegmentIndex++;
            currentDOMElementStack = []; 
            if (currentSegmentIndex >= segmentStructures.length) {
                break;
            }
        }

        const targetNode = getCurrentContentTarget();
        
        if (currentToken.type === 'openTag') {
            const newElement = createNodeFromToken(currentToken);
            if (newElement) {
                targetNode.appendChild(newElement);
                currentDOMElementStack.push(newElement);
            }
        } else if (currentToken.type === 'closeTag') {
            if (currentDOMElementStack.length > 0 && 
                currentDOMElementStack[currentDOMElementStack.length - 1].tagName.toLowerCase() === currentToken.tag) {
                currentDOMElementStack.pop();
            }
        } else { // 'word' or 'space'
            const textNode = createNodeFromToken(currentToken);
            if (textNode) {
                targetNode.appendChild(textNode);
            }
        }
    }

    let cumulativeVerticalOffset = 0;
    segmentStructures.forEach(segment => {
        segment.outer.style.top = `${cumulativeVerticalOffset}px`;
        cumulativeVerticalOffset += segment.inner.offsetHeight;
        
        segment.inner.style.width = '100%';
        segment.inner.appendChild(document.createTextNode('\u00A0'.repeat(100)));
    });
}