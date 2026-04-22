/*
 * GALAXY OF THINGS :: 2014 - Cloned Version (Type I)
 *
 * This file contains a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered to create visual differences.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 *
 * Date: 2023-10-27
 */

function setup()
{
    // Declare a variable to hold the canvas element
    var canvas = createCanvas(1280, 5200);

    // Set the canvas position on the page
    canvas.position(0, 30);

    // Assign a CSS class to the canvas for styling
    canvas.class("galaxy");

    // Display the main title text
    htmlTitleText("Galaxy of Things", 25, 35);

    // Display the subtitle with information about scrolling
    htmlSubtitle("Zooming into the galaxy, scroll controlled by scale", 30, 125);

    // Display various scroll-controlled text elements, representing sizes of objects
    htmlScrollText("Milky Way 232, 435, 203, 412, 073, 480, 000, 000, 000, 000, 000, 000 square feet", 30, 385);

    htmlScrollText("Sun 9, 000, 000, 000, 000, 000, 000, 000, 000 square feet", 30, 2000);

    htmlScrollText("Earth 5, 500, 000, 000, 000, 000 square feet", 30, 2500);

    htmlScrollText("Grand Canyon 53, 000, 000, 000 square feet", 30, 2900);

    htmlScrollText("One World Trade Center Tower 1,776 feet high", 30, 3300);

    htmlScrollText("Blue Whale 80 feet long", 30, 3600);

    htmlScrollText("Human 6 feet tall", 30, 3900);

    htmlScrollText("Basketball 2.5 feet circumference", 30, 4200);

    htmlScrollText("Ant 0.0393701 feet long", 30, 4500);

    htmlScrollText("Blood Cell 0.00002624671 feet long", 30, 4820);
}


function draw()
{
    // Set the rectangle drawing mode to CENTER
    rectMode(CENTER);

    // Set the background color for the canvas
    background(82, 237, 199);

    // Draw the static galaxy background elements
    incomingGalaxy();

    // Milky Way objects
    incomingObject(255, 94, 58, 365, 10 + (window.pageYOffset * 9));
    incomingObject3(255, 255, 255, 365, 10 + (window.pageYOffset * 2));

    // Sun object, appears when scrolled past a certain point
    if (window.pageYOffset > 1300)
    {
        incomingSun(255, 204, 0, 2000, (window.pageYOffset - 1300) * 3);
    }

    // Earth object, appears when scrolled past another point
    if (window.pageYOffset > 1800)
    {
        incomingEarth(52, 170, 220, 2500, (window.pageYOffset - 1800) * 3);
    }

    // Grand Canyon object
    if (window.pageYOffset > 2200)
    {
        incomingCannon(255, 149, 0, 2900, (window.pageYOffset - 2200) * 3);
    }

    // One World Trade Center Tower object
    if (window.pageYOffset > 2700)
    {
        incomingWTC(82, 237, 199, 3400, (window.pageYOffset - 2700) * 3);
    }

    // Blue Whale object
    if (window.pageYOffset > 2900)
    {
        blueWhale(29, 98, 240, 3600, (window.pageYOffset - 2900) * 3);
    }

    // Human object
    if (window.pageYOffset > 3100)
    {
        human(255, 123, 179, 3800, (window.pageYOffset - 3100) * 3);
    }

    // Basketball object
    if (window.pageYOffset > 3300)
    {
        incomingObject(255, 94, 58, 4200, (window.pageYOffset - 3300) * 3);
    }

    // Ant object
    if (window.pageYOffset > 3700)
    {
        ant(82, 237, 199, 4600, (window.pageYOffset - 3700) * 3);
    }

    // Blood Cell objects
    if (window.pageYOffset > 4000)
    {
        incomingObject3(188, 86, 214, 4800, 20, 20);
        incomingObject3(188, 86, 214, 4800, 10, 10);
    }

    // Refresh the dividing line at the bottom
    lineRefresh();
}


window.onscroll = function (event)
{
  // Log the current vertical scroll position to the console
  println(window.pageYOffset);
  // Assign the horizontal scroll position (pageXOffset) to a global variable 'pageY'
  // Note: There might be a typo here, usually pageY is for vertical scroll.
  pageY = window.pageXOffset;
}


function incomingObject(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw an ellipse
    ellipse((width / 2) - 30, h, grow, grow);
}


function incomingObject2(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw a rectangle
    rect((width / 2) - 30, h, grow, grow);
}


function incomingObject3(r, g, b, h, grow)
{
    // Set stroke color
    stroke(r, g, b);
    // Set stroke weight
    strokeWeight(2);
    // Draw an ellipse
    ellipse((width / 2) - 30, h, grow, grow);
}


function lineRefresh()
{
    // Set stroke color to white
    stroke(255);
    // Set stroke weight
    strokeWeight(0.5);
    // Draw a horizontal line
    line(30, 145, width, 145);
}


function htmlTitleText(string, tx, ty)
{
    // Create an HTML element for the title
    var text = createHTML(string);
    // Position the HTML element
    text.position(tx, ty);
}


function htmlSubtitle(string, tx, ty)
{
    // Create an HTML element for the subtitle
    var text = createHTML(string);
    // Position the HTML element
    text.position(tx, ty);
    // Assign an ID to the subtitle element
    text.id("subtext");
}


function htmlScrollText(string, tx, ty)
{
    // Create an HTML element for scrollable text
    var text = createHTML(string);
    // Position the HTML element
    text.position(tx, ty);
    // Assign an ID to the scroll text element
    text.id("scrolltext");
}


function ant(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw an ellipse representing an ant
    ellipse((width / 2) - 30, h, grow * 0.75, grow);
}


function human(r, g, b, h, grow)
{
    // Set fill color (called twice, redundant but unchanged)
    fill(r, g, b);
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw a rectangle representing a human
    rect((width / 2) - 30, h, grow * 0.75, grow);
}


function blueWhale(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Draw the main body of the whale
    ellipse((width / 2), h, grow * 2, grow);

    // Draw additional whale features (eyes, fins, etc.)
    ellipse(width / 2, h + (grow * .01), grow / 2, grow / 8);
    ellipse(width / 2, h - (grow * .07), grow / 8, grow / 2);
    ellipse(width / 2, h + (grow * .18), grow / 6, grow / 2);
}


function incomingWTC(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw parts of the WTC tower
    rect((width / 2), h - (grow - 100), grow / 10, grow);
    rect((width / 2), h, grow + 200, grow + 100);
}


function incomingCannon(r, g, b, h, grow)
{
    // Set fill color
    fill(r, g, b);
    // Loop to draw multiple canyon segments
    for (var i = 0; i < 500; i += 200)
    {
        // Original commented line for triangle, left unchanged
        // triangle(30+(grow+i), height/2+75, 58+(grow+i), height/2+20, 86+(grow+i), height/2+75);
        rect((width / 3) + i, h + (h / 10), grow / 3, grow);
    }
}


function incomingEarth(r, g, b, h, grow)
{
    // Set fill color for the Earth
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw the main Earth sphere
    ellipse((width / 2), h, grow, grow);

    // Loop to draw green landmasses on Earth
    for (var i = 0; i < 200; i += 200)
    {
        fill(0, 102, 0);
        rect((width / 2), (h + i), grow, grow / 30);
    }
}


function incomingSun(r, g, b, h, grow)
{
    // Set fill color for the Sun
    fill(r, g, b);
    // Disable stroke
    noStroke();
    // Draw the main Sun sphere
    ellipse((width / 2), h, grow, grow);

    // Loop to draw concentric rings or rays around the Sun
    for (var i = 0; i < 1500; i += 150)
    {
        strokeWeight(1);
        stroke(255, 145, 0);
        noFill();
        ellipse((width / 2), h, grow - i, grow - i);
    }
}


function incomingGalaxy()
{
    // Disable fill for galaxy elements
    noFill();
    // Set stroke color to white
    stroke(255);
    // Set stroke weight
    strokeWeight(2);
    // Draw concentric ellipses for the galaxy shape
    ellipse((width / 2) - 30, 365, 50, 50);
    ellipse((width / 2) - 30, 365, 90, 90);
    ellipse((width / 2) - 30, 365, 100, 100);
    // Set fill color for stars within the galaxy
    fill(255);
    // Draw individual stars
    ellipse(585, 365, 10, 10);
    ellipse(642, 327, 10, 10);
}