const VIEW_DIMENSIONS = {
    xSize: 1280,
    ySize: 5200
};

const MAIN_HEADING_ATTRIBUTES = {
    phrase: "Galaxy of Things",
    xCoord: 25,
    yCoord: 35
};

const SUB_HEADING_ATTRIBUTES = {
    phrase: "Zooming into the galaxy, scroll controlled by scale",
    xCoord: 30,
    yCoord: 125
};

const DETAIL_PARAGRAPH_DATA = [
    { textContent: "Milky Way 232, 435, 203, 412, 073, 480, 000, 000, 000, 000, 000, 000 square feet", xCoord: 30, yCoord: 385 },
    { textContent: "Sun 9, 000, 000, 000, 000, 000, 000, 000, 000 square feet", xCoord: 30, yCoord: 2000 },
    { textContent: "Earth 5, 500, 000, 000, 000, 000 square feet", xCoord: 30, yCoord: 2500 },
    { textContent: "Grand Canyon 53, 000, 000, 000 square feet", xCoord: 30, yCoord: 2900 },
    { textContent: "One World Trade Center Tower 1,776 feet high", xCoord: 30, yCoord: 3300 },
    { textContent: "Blue Whale 80 feet long", xCoord: 30, yCoord: 3600 },
    { textContent: "Human 6 feet tall", xCoord: 30, yCoord: 3900 },
    { textContent: "Basketball 2.5 feet circumference", xCoord: 30, yCoord: 4200 },
    { textContent: "Ant 0.0393701 feet long", xCoord: 30, yCoord: 4500 },
    { textContent: "Blood Cell 0.00002624671 feet long", xCoord: 30, yCoord: 4820 }
];

let currentScrollDepth = 0;

function renderFilledCircularForm(redComp, greenComp, blueComp, yPosition, widthDim, heightDim = widthDim) {
    fill(redComp, greenComp, blueComp);
    noStroke();
    ellipse((width / 2) - 30, yPosition, widthDim, heightDim);
}

function renderFilledRectangularForm(redComp, greenComp, blueComp, yPosition, widthDim, heightDim = widthDim) {
    fill(redComp, greenComp, blueComp);
    noStroke();
    rect((width / 2) - 30, yPosition, widthDim, heightDim);
}

function renderStrokedCircularForm(redComp, greenComp, blueComp, yPosition, size) {
    stroke(redComp, greenComp, blueComp);
    strokeWeight(2);
    ellipse((width / 2) - 30, yPosition, size, size);
}

function drawHorizontalSeparator() {
    stroke(255);
    strokeWeight(0.5);
    line(30, 145, width, 145);
}

function createMainHeading(contentString, xLoc, yLoc) {
    const headerElement = createHTML(contentString);
    headerElement.position(xLoc, yLoc);
}

function createSubHeading(contentString, xLoc, yLoc) {
    const subElement = createHTML(contentString);
    subElement.position(xLoc, yLoc);
    subElement.id("subtext");
}

function createScrollingParagraph(contentString, xLoc, yLoc) {
    const paragraphElement = createHTML(contentString);
    paragraphElement.position(xLoc, yLoc);
    paragraphElement.id("scrolltext");
}

function displayInsect(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    renderFilledCircularForm(redComp, greenComp, blueComp, yPosition, currentGrowth * 0.75, currentGrowth);
}

function displayPerson(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    renderFilledRectangularForm(redComp, greenComp, blueComp, yPosition, currentGrowth * 0.75, currentGrowth);
}

function displayMarineCreature(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    fill(redComp, greenComp, blueComp);
    ellipse(width / 2, yPosition, currentGrowth * 2, currentGrowth);
    ellipse(width / 2, yPosition + (currentGrowth * 0.01), currentGrowth / 2, currentGrowth / 8);
    ellipse(width / 2, yPosition - (currentGrowth * 0.07), currentGrowth / 8, currentGrowth / 2);
    ellipse(width / 2, yPosition + (currentGrowth * 0.18), currentGrowth / 6, currentGrowth / 2);
}

function displayTowerStructure(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    fill(redComp, greenComp, blueComp);
    noStroke();
    rect(width / 2, yPosition - (currentGrowth - 100), currentGrowth / 10, currentGrowth);
    rect(width / 2, yPosition, currentGrowth + 200, currentGrowth + 100);
}

function displayGeologicalFormation(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    fill(redComp, greenComp, blueComp);
    // Replaces the original for loop with a functional iteration over offsets
    Array.from({ length: 3 }, (_, index) => index * 200).forEach(offset => {
        rect((width / 3) + offset, yPosition + (yPosition / 10), currentGrowth / 3, currentGrowth);
    });
}

function displayPlanetaryBody(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    fill(redComp, greenComp, blueComp);
    noStroke();
    ellipse(width / 2, yPosition, currentGrowth, currentGrowth);

    // Original loop ran only once (i=0), so direct call suffices
    fill(0, 102, 0);
    rect(width / 2, yPosition, currentGrowth, currentGrowth / 30);
}

function displayCelestialOrb(redComp, greenComp, blueComp, yPosition, currentGrowth) {
    fill(redComp, greenComp, blueComp);
    noStroke();
    ellipse(width / 2, yPosition, currentGrowth, currentGrowth);

    // Replaces the original for loop with a functional iteration over offsets
    Array.from({ length: 10 }, (_, index) => index * 150).forEach(offset => {
        strokeWeight(1);
        stroke(255, 145, 0);
        noFill();
        ellipse(width / 2, yPosition, currentGrowth - offset, currentGrowth - offset);
    });
}

function displayCosmicConstellation() {
    noFill();
    stroke(255);
    strokeWeight(2);
    ellipse((width / 2) - 30, 365, 50, 50);
    ellipse((width / 2) - 30, 365, 90, 90);
    ellipse((width / 2) - 30, 365, 100, 100);
    fill(255);
    ellipse(585, 365, 10, 10);
    ellipse(642, 327, 10, 10);
}

const SCROLL_TRIGGERED_VISUALS = [
    {
        activationPoint: 1300,
        visualAction: (scaledFactor) => displayCelestialOrb(255, 204, 0, 2000, scaledFactor)
    },
    {
        activationPoint: 1800,
        visualAction: (scaledFactor) => displayPlanetaryBody(52, 170, 220, 2500, scaledFactor)
    },
    {
        activationPoint: 2200,
        visualAction: (scaledFactor) => displayGeologicalFormation(255, 149, 0, 2900, scaledFactor)
    },
    {
        activationPoint: 2700,
        visualAction: (scaledFactor) => displayTowerStructure(82, 237, 199, 3400, scaledFactor)
    },
    {
        activationPoint: 2900,
        visualAction: (scaledFactor) => displayMarineCreature(29, 98, 240, 3600, scaledFactor)
    },
    {
        activationPoint: 3100,
        visualAction: (scaledFactor) => displayPerson(255, 123, 179, 3800, scaledFactor)
    },
    {
        activationPoint: 3300,
        visualAction: (scaledFactor) => renderFilledCircularForm(255, 94, 58, 4200, scaledFactor) // Basketball
    },
    {
        activationPoint: 3700,
        visualAction: (scaledFactor) => displayInsect(82, 237, 199, 4600, scaledFactor)
    },
    {
        activationPoint: 4000,
        visualAction: () => { // Blood cell has fixed size, scaleFactor is not used
            renderStrokedCircularForm(188, 86, 214, 4800, 20);
            renderStrokedCircularForm(188, 86, 214, 4800, 10);
        },
        fixedSize: true // Custom flag for fixed-size objects
    }
];

function prepareVisuals() {
    const drawingSurface = createCanvas(VIEW_DIMENSIONS.xSize, VIEW_DIMENSIONS.ySize);
    drawingSurface.position(0, 30);
    drawingSurface.class("galaxy");

    createMainHeading(MAIN_HEADING_ATTRIBUTES.phrase, MAIN_HEADING_ATTRIBUTES.xCoord, MAIN_HEADING_ATTRIBUTES.yCoord);
    createSubHeading(SUB_HEADING_ATTRIBUTES.phrase, SUB_HEADING_ATTRIBUTES.xCoord, SUB_HEADING_ATTRIBUTES.yCoord);

    DETAIL_PARAGRAPH_DATA.forEach(item => {
        createScrollingParagraph(item.textContent, item.xCoord, item.yCoord);
    });
}

function animateDisplay() {
    rectMode(CENTER);
    background(82, 237, 199);
    displayCosmicConstellation();

    // Milky Way elements, always visible and scale with total scroll
    renderFilledCircularForm(255, 94, 58, 365, 10 + (currentScrollDepth * 9));
    renderStrokedCircularForm(255, 255, 255, 365, 10 + (currentScrollDepth * 2));

    SCROLL_TRIGGERED_VISUALS.forEach(item => {
        if (currentScrollDepth > item.activationPoint) {
            if (item.fixedSize) {
                item.visualAction();
            } else {
                const calculatedScale = (currentScrollDepth - item.activationPoint) * 3;
                item.visualAction(calculatedScale);
            }
        }
    });

    drawHorizontalSeparator();
}

window.onscroll = function (event) {
    console.log(window.pageYOffset);
    currentScrollDepth = window.pageYOffset;
};

// Global p5.js functions assumed to be available in the environment:
// createCanvas, background, ellipse, rect, fill, noStroke, stroke, strokeWeight, line, createHTML, position, class, id, width, height, rectMode.
// No other p5.js specific functions are called directly (e.g., println replaced with console.log).