//
// INTERSTELLAR PERSPECTIVE :: 2024 Reimagining
//
// This script orchestrates a dynamic, scroll-driven visual journey
// through cosmic and terrestrial scales using P5.js.

let currentDisplayCanvas; // Renamed from 'canvas'
let currentScrollPosition = 0; // New variable to store scroll position

// Configuration object for common values and colors
const cosmicVisuals = {
    viewPortWidth: 1400, // Slightly changed width from 1280
    viewPortHeight: 5500, // Increased height from 5200
    initialYPlacement: 40, // Changed from 30
    canvasCssClass: "cosmic-view", // Renamed class from "galaxy"
    baseTextMarginX: 40, // Changed from 30
    mainTitleY: 45, // Changed from 35
    captionTextY: 135, // Changed from 125
    horizontalDividerY: 155, // Changed from 145
    bgColor: [70, 200, 180], // Slightly different background color
    milkyWayHue: [240, 100, 60], // Slightly different color
    solarBodyHue: [255, 210, 10], // Slightly different color
    terraOrbHue: [60, 180, 230], // Slightly different color
    canyonScapeHue: [230, 130, 0], // Slightly different color
    skyScraperHue: [70, 200, 180], // Matches background, for blending
    oceanGiantHue: [35, 110, 250], // Slightly different color
    humanoidHue: [240, 110, 160], // Slightly different color
    insectoidHue: [70, 200, 180], // Matches background
    microCellHue: [195, 90, 220], // Slightly different color
    initialOrbVerticalPos: 375, // Renamed from 365
    milkyWayGrowthFactor: 8, // Changed from 9
    sunScrollTrigger: 1400, // Changed from 1300
    earthScrollTrigger: 1900, // Changed from 1800
    canyonScrollTrigger: 2300, // Changed from 2200
    wtcScrollTrigger: 2800, // Changed from 2700
    whaleScrollTrigger: 3000, // Changed from 2900
    humanScrollTrigger: 3200, // Changed from 3100
    basketballScrollTrigger: 3400, // Changed from 3300
    antScrollTrigger: 3800, // Changed from 3700
    bloodCellScrollTrigger: 4100, // Changed from 4000
    scaleEffectMultiplier: 2.8, // Changed from 3
    shapeCenterXOffset: -40 // Changed from -30 for ellipses/rects
};

// Initializes the P5.js canvas and static HTML elements.
function initializeDisplayEnvironment() {
    currentDisplayCanvas = createCanvas(cosmicVisuals.viewPortWidth, cosmicVisuals.viewPortHeight);
    currentDisplayCanvas.position(0, cosmicVisuals.initialYPlacement);
    currentDisplayCanvas.class(cosmicVisuals.canvasCssClass);

    // Dynamic content generation for titles and scale indicators
    createPageHeading("Cosmic Scale Journey", 30, cosmicVisuals.mainTitleY);
    addDescriptiveCaption("Explore the universe's vastness, controlled by your scroll", 35, cosmicVisuals.captionTextY);

    // Only a selection of scroll texts are kept, others are deleted.
    appendScrollingDetail("Milky Way: ~200,000 light-years in diameter", cosmicVisuals.baseTextMarginX, 395); // Content changed
    appendScrollingDetail("Our Sun: A star of immense power", cosmicVisuals.baseTextMarginX, 2050); // Content changed, Y changed
    appendScrollingDetail("Earth: Our home, a pale blue dot", cosmicVisuals.baseTextMarginX, 2550); // Content changed, Y changed
    appendScrollingDetail("Grand Canyon: A testament to geological time", cosmicVisuals.baseTextMarginX, 2950); // Content changed, Y changed
    // Deleted: One World Trade Center, Blue Whale, Human, Basketball, Ant, Blood Cell texts
}

// The main rendering loop for P5.js, called repeatedly.
function renderScene() {
    // Early exit if canvas is not ready (guard clause)
    if (!currentDisplayCanvas) {
        console.warn("Canvas not yet initialized. Skipping render cycle.");
        return;
    }

    // Use a local variable for scroll position to optimize repeated access
    const scrollYCurrent = window.pageYOffset || document.documentElement.scrollTop;
    currentScrollPosition = scrollYCurrent; // Update global for onscroll handler

    setShapeDisplayMode(CENTER); // Renamed from rectMode(CENTER)
    applyCanvasBackground(cosmicVisuals.bgColor[0], cosmicVisuals.bgColor[1], cosmicVisuals.bgColor[2]);
    displayDistantGalaxy(); // Renamed from incomingGalaxy()

    // Helper function to draw objects based on scroll threshold
    const renderScrollActivatedObject = (colorArray, initialY, baseSize, renderFn, threshold, customSizeOffset = 0) => {
        if (scrollYCurrent > threshold) {
            const dynamicSize = (scrollYCurrent - threshold) * cosmicVisuals.scaleEffectMultiplier + customSizeOffset;
            renderFn(colorArray[0], colorArray[1], colorArray[2], initialY, baseSize + dynamicSize);
        }
    };

    // Milky Way (primary dynamic object, always visible but scales with scroll)
    drawFilledOrb(
        cosmicVisuals.milkyWayHue[0], cosmicVisuals.milkyWayHue[1], cosmicVisuals.milkyWayHue[2],
        cosmicVisuals.initialOrbVerticalPos, 15 + (scrollYCurrent * cosmicVisuals.milkyWayGrowthFactor) // Modified calculation
    );
    drawStrokedOrb( // Added an extra stroked layer for Milky Way
        cosmicVisuals.milkyWayHue[0], cosmicVisuals.milkyWayHue[1], cosmicVisuals.milkyWayHue[2],
        cosmicVisuals.initialOrbVerticalPos, 20 + (scrollYCurrent * (cosmicVisuals.milkyWayGrowthFactor - 1)) // Slightly different scaling
    );

    // Sun
    renderScrollActivatedObject(
        cosmicVisuals.solarBodyHue, 2000, 0, displaySolarBody, cosmicVisuals.sunScrollTrigger
    );

    // Earth
    renderScrollActivatedObject(
        cosmicVisuals.terraOrbHue, 2500, 0, projectEarthGlobe, cosmicVisuals.earthScrollTrigger
    );

    // Grand Canyon
    renderScrollActivatedObject(
        cosmicVisuals.canyonScapeHue, 2900, 0, illustrateCanyon, cosmicVisuals.canyonScrollTrigger
    );

    // WTC Tower
    renderScrollActivatedObject(
        cosmicVisuals.skyScraperHue, 3400, 0, sketchModernTower, cosmicVisuals.wtcScrollTrigger
    );

    // Blue Whale
    renderScrollActivatedObject(
        cosmicVisuals.oceanGiantHue, 3600, 0, paintOceanGiant, cosmicVisuals.whaleScrollTrigger
    );

    // Human
    renderScrollActivatedObject(
        cosmicVisuals.humanoidHue, 3800, 0, depictHumanFigure, cosmicVisuals.humanScrollTrigger
    );

    // Basketball (using generic orb, with slightly different color)
    renderScrollActivatedObject(
        [255, 120, 40], 4200, 0, drawFilledOrb, cosmicVisuals.basketballScrollTrigger
    );

    // Ant
    renderScrollActivatedObject(
        cosmicVisuals.insectoidHue, 4600, 0, renderTinyCreature, cosmicVisuals.antScrollTrigger
    );

    // Blood Cell (modified to draw multiple slightly offset cells)
    if (scrollYCurrent > cosmicVisuals.bloodCellScrollTrigger) {
        let bloodCellSize = (scrollYCurrent - cosmicVisuals.bloodCellScrollTrigger) * cosmicVisuals.scaleEffectMultiplier;
        drawStrokedOrb(cosmicVisuals.microCellHue[0], cosmicVisuals.microCellHue[1], cosmicVisuals.microCellHue[2], 4800, 25 + bloodCellSize); // Larger base size
        drawStrokedOrb(cosmicVisuals.microCellHue[0], cosmicVisuals.microCellHue[1], cosmicVisuals.microCellHue[2], 4810, 15 + bloodCellSize * 0.8); // Offset and smaller
        // Removed one of the original blood cell calls, added an offset one.
    }

    updateSeparatorLine(); // Renamed from lineRefresh()
}

// Handles scroll events to update a global position variable.
window.onscroll = (event) => {
    // Using console.info instead of println for browser compatibility
    console.info("Current Vertical Scroll Offset:", window.pageYOffset);
    // Removed pageXOffset as it was unused and potentially confusing.
};

// Draws a filled circular object.
function drawFilledOrb(red, green, blue, verticalPosition, diameter) {
    fill(red, green, blue);
    noStroke();
    ellipse((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition, diameter, diameter);
}

// Draws a filled rectangular object.
function drawFilledRectangle(red, green, blue, verticalPosition, widthParam) {
    fill(red, green, blue);
    noStroke();
    rect((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition, widthParam, widthParam);
}

// Draws a stroked circular object.
function drawStrokedOrb(red, green, blue, verticalPosition, diameter) {
    stroke(red, green, blue);
    strokeWeight(2.5); // Slightly changed stroke weight
    noFill(); // Added noFill for stroked objects
    ellipse((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition, diameter, diameter);
}

// Draws a horizontal separator line across the canvas.
function updateSeparatorLine() {
    stroke(240); // Slightly different shade of white
    strokeWeight(0.75); // Slightly different stroke weight
    line(cosmicVisuals.baseTextMarginX, cosmicVisuals.horizontalDividerY, width - cosmicVisuals.baseTextMarginX, cosmicVisuals.horizontalDividerY); // Line extends from text start to near canvas end
}

// Creates an HTML heading element and positions it.
function createPageHeading(textContent, posX, posY) {
    const headingElement = createHTML(`<h1>${textContent}</h1>`); // Changed to H1 tag
    headingElement.position(posX, posY);
}

// Creates an HTML subtitle element and positions it.
function addDescriptiveCaption(textContent, posX, posY) {
    const captionElement = createHTML(`<p>${textContent}</p>`); // Changed to P tag
    captionElement.position(posX, posY);
    captionElement.id("sub-description-text"); // Renamed ID
}

// Creates an HTML paragraph for scrolling details and positions it.
function appendScrollingDetail(textContent, posX, posY) {
    const detailElement = createHTML(`<span class="scroll-info-item">${textContent}</span>`); // Changed to span with class
    detailElement.position(posX, posY);
    detailElement.id("scroll-detail-" + posY); // Dynamic ID based on Y position
}

// Renders a small, elongated creature (ant).
function renderTinyCreature(red, green, blue, verticalPosition, size) {
    fill(red, green, blue);
    noStroke();
    ellipse((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition, size * 0.8, size * 1.1); // Modified aspect ratio
    ellipse((width / 2) + cosmicVisuals.shapeCenterXOffset + size * 0.3, verticalPosition + size * 0.1, size * 0.4, size * 0.4); // Added a head/tail segment
}

// Depicts a human figure using a rectangle.
function depictHumanFigure(red, green, blue, verticalPosition, bodySize) {
    fill(red, green, blue);
    noStroke();
    rect((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition, bodySize * 0.65, bodySize * 1.05); // Modified aspect ratio
    ellipse((width / 2) + cosmicVisuals.shapeCenterXOffset, verticalPosition - bodySize * 0.6, bodySize * 0.4, bodySize * 0.4); // Added a head
}

// Paints a blue whale with some additional details.
function paintOceanGiant(red, green, blue, verticalPosition, scaleFactor) {
    fill(red, green, blue);
    noStroke(); // Added noStroke
    ellipse((width / 2), verticalPosition, scaleFactor * 2.2, scaleFactor * 1.1); // Modified dimensions

    // Fins and tail (modified calculations and positions)
    fill(red * 0.8, green * 0.8, blue * 0.8); // Slightly darker color for details
    ellipse(width / 2 - scaleFactor * 0.5, verticalPosition + scaleFactor * 0.2, scaleFactor * 0.6, scaleFactor * 0.1); // Side fin
    ellipse(width / 2 + scaleFactor * 0.5, verticalPosition + scaleFactor * 0.2, scaleFactor * 0.6, scaleFactor * 0.1); // Other side fin
    triangle(
        width / 2, verticalPosition + scaleFactor * 0.8,
        width / 2 - scaleFactor * 0.3, verticalPosition + scaleFactor * 1.2,
        width / 2 + scaleFactor * 0.3, verticalPosition + scaleFactor * 1.2
    ); // Simple tail fin (changed from ellipse)
}

// Sketches a modern tower, inspired by WTC.
function sketchModernTower(red, green, blue, verticalPosition, towerHeight) {
    fill(red, green, blue);
    noStroke();
    const towerBaseWidth = towerHeight / 12; // Dynamic width
    const towerTopWidth = towerHeight / 18; // Tapered top
    const baseHeight = towerHeight * 0.9;
    const topOffset = towerHeight * 0.1;

    // Base structure (using quad for a more trapezoidal look, instead of 2 rects)
    quad(
        (width / 2) - towerBaseWidth / 2, verticalPosition + baseHeight / 2,
        (width / 2) + towerBaseWidth / 2, verticalPosition + baseHeight / 2,
        (width / 2) + towerTopWidth / 2, verticalPosition - baseHeight / 2 - topOffset,
        (width / 2) - towerTopWidth / 2, verticalPosition - baseHeight / 2 - topOffset
    );

    // Simplified top element
    fill(200, 200, 200); // Different color for spire
    rect((width / 2), verticalPosition - baseHeight / 2 - topOffset - towerHeight * 0.1, towerTopWidth / 2, towerHeight * 0.2);
}

// Illustrates a canyon landscape.
function illustrateCanyon(red, green, blue, verticalPosition, depthFactor) {
    fill(red, green, blue);
    noStroke(); // Added noStroke
    const canyonSegmentCount = 4; // Changed from fixed loop to config
    const segmentWidth = width / (canyonSegmentCount + 1); // Calculate segment width dynamically

    for (let i = 0; i < canyonSegmentCount; i++) {
        const currentX = (i * segmentWidth) + (segmentWidth / 2);
        const randomHeightOffset = sin(frameCount * 0.05 + i) * (depthFactor * 0.2); // Added subtle animation and randomness
        rect(currentX, verticalPosition + (depthFactor / 2) + randomHeightOffset, segmentWidth * 0.8, depthFactor);
        // Added another layer for depth
        fill(red * 0.8, green * 0.8, blue * 0.8);
        rect(currentX - segmentWidth * 0.1, verticalPosition + (depthFactor / 2) + randomHeightOffset + depthFactor * 0.1, segmentWidth * 0.7, depthFactor * 0.8);
        fill(red, green, blue); // Reset fill color
    }
}

// Projects the Earth globe with landmasses.
function projectEarthGlobe(red, green, blue, verticalPosition, planetScale) {
    fill(red, green, blue);
    noStroke();
    ellipse((width / 2), verticalPosition, planetScale, planetScale);

    // Continents (modified pattern from simple rectangles)
    const continentColor = color(0, 120, 0); // Define color once
    const numContinents = 5; // Fixed number of continents
    for (let i = 0; i < numContinents; i++) {
        fill(continentColor);
        const angle = TWO_PI / numContinents * i + frameCount * 0.01; // Rotate continents slowly
        const xOffset = cos(angle) * planetScale * 0.3;
        const yOffset = sin(angle) * planetScale * 0.3;
        ellipse((width / 2) + xOffset, verticalPosition + yOffset, planetScale * 0.2, planetScale * 0.15); // Elliptical continents
    }
}

// Displays the solar body with radiating lines.
function displaySolarBody(red, green, blue, verticalPosition, sunSize) {
    fill(red, green, blue);
    noStroke();
    ellipse((width / 2), verticalPosition, sunSize, sunSize);

    // Solar flares/rings (modified loop and drawing)
    const maxRings = 10; // Reduced number of rings
    const ringIncrement = sunSize / (maxRings + 2); // Dynamic increment
    const flareColor = color(255, 150, 0, 150); // Added alpha for transparency

    for (let i = 0; i < maxRings; i++) {
        strokeWeight(1 + i * 0.2); // Increasing stroke weight
        stroke(flareColor);
        noFill();
        const currentRingSize = sunSize - (i * ringIncrement);
        ellipse((width / 2), verticalPosition, currentRingSize, currentRingSize);
    }

    // Adding some radiating lines for a 'flare' effect
    const numFlares = 12;
    stroke(flareColor);
    strokeWeight(1.5);
    for (let i = 0; i < numFlares; i++) {
        const angle = TWO_PI / numFlares * i + frameCount * 0.005;
        const startX = (width / 2) + cos(angle) * (sunSize / 2 + 5);
        const startY = verticalPosition + sin(angle) * (sunSize / 2 + 5);
        const endX = (width / 2) + cos(angle) * (sunSize / 2 + 30);
        const endY = verticalPosition + sin(angle) * (sunSize / 2 + 30);
        line(startX, startY, endX, endY);
    }
}

// Shows a distant galaxy with multiple ellipses and stars.
function displayDistantGalaxy() {
    noFill();
    stroke(250); // Slightly different white
    strokeWeight(1.8); // Slightly different weight
    const galaxyCenterX = (width / 2) + cosmicVisuals.shapeCenterXOffset;
    const galaxyCenterY = cosmicVisuals.initialOrbVerticalPos;

    // Multiple concentric ellipses for galaxy arms
    ellipse(galaxyCenterX, galaxyCenterY, 60, 60); // Changed dimensions
    ellipse(galaxyCenterX, galaxyCenterY, 100, 110);
    ellipse(galaxyCenterX, galaxyCenterY, 120, 130);
    ellipse(galaxyCenterX, galaxyCenterY, 150, 140); // Added an extra ellipse

    // Central bulge
    fill(255, 255, 200); // Yellowish center
    noStroke();
    ellipse(galaxyCenterX, galaxyCenterY, 15, 15);

    // Scattered stars (modified positions and count)
    fill(255);
    const starCount = 5; // Reduced star count
    const starPositions = [
        { x: 590, y: 360 }, { x: 650, y: 330 }, { x: 570, y: 380 }, { x: 610, y: 310 }, { x: 630, y: 390 }
    ];
    for(const star of starPositions) {
        ellipse(star.x + cosmicVisuals.shapeCenterXOffset, star.y, 8, 8); // Slightly smaller stars
    }
}

// Helper function to set rectMode (renamed and encapsulated)
function setShapeDisplayMode(mode) {
    rectMode(mode);
}

// Helper function to set background (renamed and encapsulated)
function applyCanvasBackground(r, g, b) {
    background(r, g, b);
}