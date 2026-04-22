//
// COSMIC VOYAGE :: TWO THOUSAND FOURTEEN
// This script visualizes a cosmic journey, scaling objects based on scroll position.
//

function initializeCanvas( )
{
    var drawingSurface = generateDrawingArea(   1280.0,   5200.0   );    
    drawingSurface.placeAt(  0.0,   30.0  );
    drawingSurface.assignStyle(  'cosmos'  );

    // Set up initial textual elements
    displayMainHeading(  "Cosmic Scale Tour",   25.0,    35.0  );
    displaySubHeading(  "Journeying through the universe, vertical scroll adjusts magnification",   30.0,   125.0  );

    // Add various celestial and terrestrial object descriptions
    displayScrollableInfo(  "Milky Way 232, 435, 203, 412, 073, 480, 000, 000, 000, 000, 000, 000 sq. ft.",   30.0,   385.0  );
    displayScrollableInfo(  "Sol 9, 000, 000, 000, 000, 000, 000, 000, 000 sq. ft.",   30.0,   2000.0  );
    displayScrollableInfo(  "Terra 5, 500, 000, 000, 000, 000 sq. ft.",   30.0,   2500.0  );
    displayScrollableInfo(  "Grand Canyon 53, 000, 000, 000 sq. ft.",   30.0,   2900.0  );
    displayScrollableInfo(  "One World Trade Center Spire 1,776 ft. high",   30.0,   3300.0  );
    displayScrollableInfo(  "Blue Whale 80 ft. long",   30.0,   3600.0  );
    displayScrollableInfo(  "Human Being 6 ft. tall",   30.0,   3900.0  );
    displayScrollableInfo(  "Basketball Orb 2.5 ft. circumference",   30.0,   4200.0  );
    displayScrollableInfo(  "Ant Colony Member 0.0393701 ft. long",   30.0,   4500.0  );
    displayScrollableInfo(  "Red Blood Cell 0.00002624671 ft. long",   30.0,   4820.0  );
}


function renderFrame(  )
{
    setRectangleMode(  CENTRAL  );
    fillBackground(  82,   237,   199  );
    renderCosmicBackground(  )
    // Initial cosmic dust representation
    drawDynamicOrb(  255,   94,   58,   365,   10 + (currentBrowser.verticalScroll * 9)  );
    drawOutlinedOrb(  255,   255,   255,   365,   10 + (currentBrowser.verticalScroll * 2)  );
    // Solar system elements appear based on scroll depth
    if (  currentBrowser.verticalScroll > 1300  )
    {
        renderSolarBody(  255,   204,   0,   2000,   (currentBrowser.verticalScroll - 1300) * 3  );
    }
    // Earth-like planet visualization
    if (  currentBrowser.verticalScroll > 1800  )
    {
        displayPlanetaryBody(  52,   170,   220,   2500,   (currentBrowser.verticalScroll - 1800) * 3  );
    } 
    // Geological formation representation
    if (  currentBrowser.verticalScroll > 2200  )
    {
        showCanyonFeature(  255,   149,   0,   2900,   (currentBrowser.verticalScroll - 2200) * 3  );
    }
    // Man-made edifice at scale
    if (  currentBrowser.verticalScroll > 2700  )
    {
        depictTallStructure(  82,   237,   199,   3400,   (currentBrowser.verticalScroll - 2700) * 3  );
    }   
    // Large creature rendering
    if (  currentBrowser.verticalScroll > 2900  )
    {
        renderMarineMammal(  29,   98,   240,   3600,   (currentBrowser.verticalScroll - 2900) * 3  );
    }   
    // Human-scale representation
    if (  currentBrowser.verticalScroll > 3100  )
    {
        depictHumanFigure(  255,   123,   179,   3800,   (currentBrowser.verticalScroll - 3100) * 3  );
    }  
    // Sporting equipment visualization
    if (  currentBrowser.verticalScroll > 3300  )
    {
        drawDynamicOrb(  255,   94,   58,   4200,   (currentBrowser.verticalScroll - 3300) * 3  );
    }   
    // Small insect depiction
    if (  currentBrowser.verticalScroll > 3700  )
    {
        drawInsectForm(  82,   237,   199,   4600,   (currentBrowser.verticalScroll - 3700) * 3  );
    }   
    // Microscopic organism rendering
    if (  currentBrowser.verticalScroll > 4000  )
    {
        drawOutlinedOrb(  188,   86,   214,   4800,   20.0,   20.0  );
        drawOutlinedOrb(  188,   86,   214,   4800,   10.0,   10.0  );
    }
    updateSeparatorLine(  );
    
}

currentBrowser.onPageScrolled = function (  scrollEvent  )
{
  logToConsole(  currentBrowser.verticalScroll  );
  pageVerticalOffset = currentBrowser.horizontalScroll;
}

function drawDynamicOrb(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   yCoord,   scaleFactor,   scaleFactor  );
}

function drawDynamicRectangle(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawSquareShape(  (drawingAreaWidth / 2.0) - 30.0,   yCoord,   scaleFactor,   scaleFactor  );
}

function drawOutlinedOrb(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setStrokeColor(  redVal,   greenVal,   blueVal  );
    setStrokeThickness(  2.0  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   yCoord,   scaleFactor,   scaleFactor  );
}

function updateSeparatorLine(  )
{
    setStrokeColor(  255,   255,   255  );
    setStrokeThickness(  0.5  );
    drawLineSegment(  30.0,   145.0,   drawingAreaWidth,   145.0  );
}

function displayMainHeading(  textContent,   horizPos,   vertPos  )
{
    var elementRef = createDomElement(  textContent  );
    elementRef.placeAt(  horizPos,   vertPos  );
}

function displaySubHeading(  textContent,   horizPos,   vertPos  )
{
    var elementRef = createDomElement(  textContent  );
    elementRef.placeAt(  horizPos,   vertPos  );
    elementRef.setIdentifier(  'subtext_style'  );
}

function displayScrollableInfo(  textContent,   horizPos,   vertPos  )
{
    var elementRef = createDomElement(  textContent  );
    elementRef.placeAt(  horizPos,   vertPos  );
    elementRef.setIdentifier(  'scrollable_info'  );
}

function drawInsectForm(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   yCoord,   scaleFactor * 0.75,   scaleFactor  );
}

function depictHumanFigure(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  ); // Redundant call, but preserving structure
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawSquareShape(  (drawingAreaWidth / 2.0) - 30.0,   yCoord,   scaleFactor * 0.75,   scaleFactor  );
}

function renderMarineMammal(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    drawOvalShape(  (drawingAreaWidth / 2.0),   yCoord,   scaleFactor * 2.0,   scaleFactor  );

    drawOvalShape(  drawingAreaWidth / 2.0,   yCoord + (scaleFactor * 0.01),   scaleFactor / 2.0,   scaleFactor / 8.0  );
    drawOvalShape(  drawingAreaWidth / 2.0,   yCoord - (scaleFactor * 0.07),   scaleFactor / 8.0,   scaleFactor / 2.0  );
    drawOvalShape(  drawingAreaWidth / 2.0,   yCoord + (scaleFactor * 0.18),   scaleFactor / 6.0,   scaleFactor / 2.0  );
}

function depictTallStructure(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawSquareShape(  (drawingAreaWidth / 2.0),   yCoord - (scaleFactor - 100.0),   scaleFactor / 10.0,   scaleFactor  );  
    drawSquareShape(  (drawingAreaWidth / 2.0),   yCoord,   scaleFactor + 200.0,   scaleFactor + 100.0  );

}

function showCanyonFeature(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
     for (  var loopCounter = 0;   loopCounter < 500;   loopCounter += 200  )
     { 
    // Original commented triangle shape: drawTriangularShape(30.0 + (scaleFactor + loopCounter), drawingAreaHeight / 2.0 + 75.0, 58.0 + (scaleFactor + loopCounter), drawingAreaHeight / 2.0 + 20.0, 86.0 + (scaleFactor + loopCounter), drawingAreaHeight / 2.0 + 75.0);
    drawSquareShape(  (drawingAreaWidth / 3.0) + loopCounter,   yCoord + (yCoord / 10.0),   scaleFactor / 3.0,   scaleFactor  );
     }
}

function displayPlanetaryBody(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawOvalShape(  (drawingAreaWidth / 2.0),   yCoord,   scaleFactor,   scaleFactor  );
     
    for (  var loopCounter = 0;   loopCounter < 200;   loopCounter += 200  )
    { 
    setColorFill(  0,   102,   0  ); 
    drawSquareShape(  (drawingAreaWidth / 2.0),   (yCoord + loopCounter),   scaleFactor,   scaleFactor / 30.0  );
    }
}

function renderSolarBody(  redVal,   greenVal,   blueVal,   yCoord,   scaleFactor  )
{
    setColorFill(  redVal,   greenVal,   blueVal  );
    disableStroke(  );
    drawOvalShape(  (drawingAreaWidth / 2.0),   yCoord,   scaleFactor,   scaleFactor  );

    for (  var loopCounter = 0;   loopCounter < 1500;   loopCounter += 150  )
    { 
    setStrokeThickness(  1.0  );
    setStrokeColor(  255,   145,   0  ); 
    disableColorFill(  );
    drawOvalShape(  (drawingAreaWidth / 2.0),   yCoord,   scaleFactor - loopCounter,   scaleFactor - loopCounter  );
    }
        
 }

 function renderCosmicBackground(  )
 {
    disableColorFill(  );
    setStrokeColor(  255,   255,   255  );
    setStrokeThickness(  2.0  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   365.0,   50.0,   50.0  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   365.0,   90.0,   90.0  );
    drawOvalShape(  (drawingAreaWidth / 2.0) - 30.0,   365.0,   100.0,   100.0  );
    setColorFill(  255,   255,   255  );
    drawOvalShape(  585.0,   365.0,   10.0,   10.0  );
    drawOvalShape(  642.0,   327.0,   10.0,   10.0  );

 }