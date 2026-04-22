// Poker.JS - A JavaScript library for drawing poker cards on HTML5 Canvas.
// Project home: https://github.com/Tairraos/Poker.JS

// Author: Xiaole Tao (http://xiaole.happylive.org)
// License: MIT License (see project repository for full license text)
// Version: 1.0

// This self-executing anonymous function encapsulates the entire library
(function() {
  // Enforce strict mode for cleaner code and better error handling
  'use strict';

  // Check if CanvasRenderingContext2D is available in the global window object
  // This ensures the library only attempts to extend the prototype if canvas is supported
  if (window.CanvasRenderingContext2D) {

    // Define a mapping of symbols to SVG path data
    // These paths are used to draw the card numbers/letters and suits
    var symbolPath = {
      'a': 'M6,200V183H23L58,0H78L117,183H131V200H85V183H97L92,156H46L42,183H54V200H6zM88,135L68,37L49,135H88z',
      '2': 'M10,200L11,187C15,149,23,136,70,97C93,78,100,68,101,57C104,31,81,23,65,23C46,22,23,34,35,62L12,68C8,43,12,18,33,8C61,-6,96,-1,115,21C127,36,129,56,123,72C104,113,39,131,35,179H105V152H127V200L10,200z',
      '3': 'M2,156L18,145C31,167,47,181,70,178C104,176,119,140,112,113C105,89,76,77,53,90C47,93,43,96,41,96C39,96,33,85,34,82C50,59,87,21,87,21H28V47H6V0H120V16C120,16,90,48,80,64C104,65,125,81,132,105C136,118,135,148,129,160C119,182,94,199,71,200C33,202,12,176,2,156L2,156z',
      '4': 'M70,200L70,183L86,183L86,153L5,153L5,133L93,0L107,0L107,133L132,133L132,153L107,153L107,183L120,183L120,200zM86,49L30,133L86,133z',
      '5': 'M4,148L24,148C28,160,37,173,48,176C80,183,101,166,108,144C116,120,107,84,85,71C67,61,40,70,27,92L13,83L20,0H112V20H37L37,55C52,44,77,44,93,52C123,66,137,98,131,137C123,175,105,197,64,200C20,201,4,170,4,148L4,148z',
      '6': 'M8,139C6,122,6,78,8,65C15,26,30,7,55,2C81,-4,116,3,124,35L103,36C91,14,60,15,46,29C34,37,28,68,30,70C30,70,50,55,73,55C120,55,132,94,130,127C129,167,116,198,73,200C31,198,12,177,8,139zM110,128C111,101,98,80,73,77C50,76,26,99,27,127C29,155,40,179,69,179C101,179,110,147,110,128z',
      '7': 'M37,200C50,131,65,79,102,22H26V46H6V0H117L131,22C91,64,54,202,61,200H37z',
      '8': 'M2,142C3,115,13,105,32,90C17,79,10,63,12,50C15,17,41,0,69,0C98,1,123,24,125,48C127,69,120,79,105,90C123,105,135,115,135,141C134,168,111,199,71,200C31,201,1,168,2,142L2,142zM113,142C115,117,93,101,69,101C45,101,23,121,23,143C23,166,51,178,69,178C91,178,112,163,113,142L113,142zM105,55C106,34,87,20,67,21C50,21,31,34,31,51C31,72,52,83,70,83C86,84,105,71,105,55L105,55z',
      '9': 'MM11,161L30,156C37,174,52,180,67,178C94,176,102,146,104,120C94,131,78,137,64,136C21,134,10,100,10,65C9,35,21,13,43,3C55,-1,81,-1,92,4C118,18,128,42,126,98C126,144,117,198,66,200C36,204,14,181,11,161L11,161zM85,111C94,105,98,100,102,92C106,86,106,83,106,69C103,36,86,17,60,21C44,23,36,31,33,46C24,73,35,105,55,112C63,116,78,115,85,111L85,111z',
      // The path for '10' is represented by '0' and 'j' for 'Joker' (see below for 'j')
      '0': 'M6,200V0H26V200H6M85,0C66,0,50,17,50,39V162C50,183,66,200,85,200H96C115,200,130,183,130,162V39C130,17,115,0,96,0H85M90,19C102,19,110,28,110,38V163C110,174,102,183,90,183C79,183,70,174,70,163V38C70,28,79,19,90,19L90,19z',
      'j': 'M68,0V21H88C88,21,89,41,89,84C89,126,90,146,88,158C81,185,40,185,32,166C27,155,28,146,28,134H6C6,134,6,140,6,147C6,178,17,193,41,198C65,204,95,194,105,174C111,162,111,161,111,89C111,41,111,21,111,21H130V0H68z',
      'q': 'M24,134L6,134L6,112L24,112C24,112,24,60,24,40C24,18,40,0,66,0C92,0,110,18,110,40C110,62,111,148,110,155C110,168,108,170,108,171C110,176,130,178,130,177L130,199C115,201,109,199,96,190C88,198,65,205,46,196C32,190,24,174,24,134zM81,174C73,162,58,145,44,140C44,156,46,165,51,171C59,181,71,183,81,174zM66,22C50,22,44,30,44,70C44,94,44,116,44,116C67,123,90,150,90,150L90,70C90,30,82,22,66,22z',
      'k': 'M76,180L96,180L64,106L40,142L40,180L56,180L56,200L0,200L0,180L20,180L20,20L0,20L0,0L56,0L56,20L40,20L40,100L92.0636,19.841L76,20L76,0L136,0L136,20L120,20L76,88L116,180L136,180L136,200L76,200z',
      // Joker (letter 'o')
      'o': 'M141,0L181,0C168,55,161,150,129,183C91,219,15,198,21,141L60,137C58,157,62,166,81,166C102,165,110,143,115,118M6,378C6,306,53,256,119,256C197,256,213,346,187,398C164,438,130,458,88,459C39,458,7,422,6,378M47,377C49,406,67,425,93,425C168,423,182,292,115,290C69,294,47,338,47,377M0,714L42,518L84,518L66,601L159,518L215,518L124,595L191,714L144,714L94,621L55,654L42,714M8,973L50,777L200,777L193,809L85,809L75,854L180,854L173,887L68,887L56,940L173,940L166,973M43,1231L1,1231L44,1035L133,1035C170,1037,197,1051,198,1087C195,1127,169,1143,136,1148C158,1171,171,1206,182,1231L137,1231C116,1182,112,1150,60,1150M67,1121C96,1121,155,1126,156,1087C151,1061,100,1068,78,1068z',
      // Hearts suit
      'h': 'M100,30C60,7,0,7,0,76C0,131,100,190,100,190C100,190,200,131,200,76C200,7,140,7,100,30z',
      // Diamonds suit
      'd': 'M184,100C152,120,120,160,100,200C80,160,48,120,16,100C48,80,80,40,100,0C120,40,152,80,184,100z',
      // Spades suit
      's': 'M200,120C200,168,144,176,116,156C116,180,116,188,128,200C112,196,88,196,72,200C84,188,84,180,84,156C56,176,0,168,0,120C0,72,60,36,100,0C140,36,200,72,200,120z',
      // Clubs suit
      'c': 'M80,200C92,184,92,160,92,136C76,180,0,176,0,124C0,80,40,76,68,88C80,92,80,88,72,84C44,64,40,0,100,0C160,0,156,64,128,84C120,88,120,92,132,88C160,76,200,80,200,124C200,176,124,180,108,136C108,160,108,184,120,200C100,196,100,196,80,200z',
      // Crown (part of Joker symbol)
      'r': 'M44,60,C45,56,-3,33,0,70,C2,107,39,146,48,150,C57,154,12,107,12,77,C12,45,43,65,44,60,M37,65,C31,64,20,60,19,81,C19,100,63,158,65,149,C65,139,33,102,37,65,M86,56,C87,52,38,28,40,66,C43,103,69,141,78,148,C86,155,54,102,54,71,C54,39,86,60,86,56,M82,65,C77,64,59,54,59,74,C60,95,82,146,84,138,C86,132,78,102,82,65,M154,60,C153,56,203,33,200,70,C197,107,159,146,151,150,C142,154,187,107,187,77,C187,45,155,65,154,60,M161,65,C167,64,179,60,180,81,C181,100,137,158,135,149,C134,139,165,102,161,65,M113,56,C112,52,161,28,158,66,C155,103,130,141,122,148,C114,155,145,102,145,71,C145,39,114,60,113,56,M117,65,C123,64,141,54,141,74,C140,95,118,146,116,138,C114,132,121,102,117,65z'
      // Path for 'n' (Nine) is commented out in original, so it remains commented here.
      // 'n': 'M157,89C159,188,80,211,16,196L23,160C62,172,100,167,107,119C93,127,83,133,62,132C28,133,0,113,0,70C0,25,37,0,78,0C137,0,157,41,157,89M105,56C100,42,92,34,77,33C59,33,49,49,49,69C52,101,83,104,107,95C107,82,108,66,105,56z'
    };

    // Helper function to create a canvas element with predefined dimensions
    var pc = function(size) {
      var canvas = document.createElement('canvas'); // Create a new canvas element
      canvas.height = size; // Set canvas height
      canvas.width = size * 3 / 4; // Set canvas width with a 3:4 aspect ratio
      return canvas; // Return the created canvas
    };

    // Helper function to normalize the suit input
    var fixSuit = function(suit) {
      // Valid suits: 'hearts', 'diamonds', 'spades', 'clubs'
      // Returns the first character, lowercase
      return (suit || 'h').substr(0, 1).toLowerCase();
    };

    // Helper function to normalize the symbol (card point) input
    var fixSymbol = function(symbol) {
      // Valid symbols: A, 2-10, J, Q, K, Joker
      // Handles '10', 'JOKER', 'CROWN' by extracting the relevant character
      symbol = (symbol || 'o').toString().toLowerCase();
      // If the symbol matches 'jo', '10', or 'cr', take the second character (index 1), otherwise the first (index 0)
      return symbol.substr((symbol.match(/jo|10|cr/)) ? 1 : 0, 1);
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw the front side of a poker card.
     * This function draws the card outline, suit, and point symbols.
     *
     * @summary canvas.drawPokerCard (x, y, size, suit, point)
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the card in the canvas.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the card in the canvas.
     * @param {number} [size=200] - The height of the card in pixels. The width is calculated as 3/4 of the height.
     * @param {string} [suit='h'] - The poker suit ('h', 'hearts', 'd', 'diamonds', 's', 'spades', 'c', 'clubs').
     *     Case-insensitive. For Joker cards ('O'), 'h' or 'd' indicates a big joker, 's' or 'c' a little joker.
     * @param {string} [point='O'] - The card point ('A', '2'-'10', 'J', 'Q', 'K', 'O', 'JOKER').
     *     Case-insensitive. 'O' is an abbreviation for 'JOKER'.
     * @example
     *     // Draw a Queen of Diamonds
     *     canvas.drawPokerCard(0, 200, 100, 'd', 'Q');
     *     // Draw a Joker (big)
     *     canvas.drawPokerCard(0, 400, 100, 'hearts', 'O');
     */
    CanvasRenderingContext2D.prototype.drawPokerCard = function(x, y, size, suit, point) {
      // Helper functions to scale coordinates and sizes based on the card's 'size' parameter
      var ax = function(n) {
          return x + n * size / 200;
        },
        ay = function(n) {
          return y + n * size / 200;
        },
        as = function(n) {
          return n * size / 200;
        };

      // Normalize suit and point values
      suit = fixSuit(suit);
      point = fixSymbol(point);

      // Draw the empty card background and border
      this.drawEmptyCard(ax(0), ay(0), as(200));

      // Set fill style based on suit color (red for hearts/diamonds, black for spades/clubs)
      this.fillStyle = (suit === 'h' || suit === 'd') ? '#a22' : '#000';

      // Conditional rendering based on card size for detail level
      if (size >= 100) {
        // For non-Joker cards
        if (point !== 'o') {
          // Draw main suit symbol in the center
          this.fillPokerSymbol(ax(40), ay(65), as(70), suit);
          // Draw point symbol (top-left)
          this.fillPokerSymbol(ax(10), ay(10), as(40), point);
          // Draw small suit symbol (top-left, below point)
          this.fillPokerSymbol(ax(11), ay(55), as(25), suit);
          // Draw point symbol (bottom-right, inverted)
          this.fillPokerSymbol(ax(140), ay(190), as(-40), point);
          // Draw small suit symbol (bottom-right, inverted)
          this.fillPokerSymbol(ax(139), ay(145), as(-25), suit);
        } else { // For Joker cards
          // Draw small 'o' (Joker symbol) top-left
          this.fillPokerSymbol(ax(11), ay(10), as(18), 'o');
          // Draw small 'o' (Joker symbol) bottom-right, inverted
          this.fillPokerSymbol(ax(139), ay(190), as(-18), 'o');

          // Draw the crown symbol in the center, with color variations for big/little joker
          if (suit === 'h' || suit === 'd') { // Big Joker (red suits)
            this.drawPokerCrown(ax(38), ay(63), as(74), '#b55', '#a22'); // Shadow/outline crown
            this.drawPokerCrown(ax(40), ay(65), as(70), '#fdf98b', '#e7bd4f', '#a22'); // Main crown
          } else { // Little Joker (black suits)
            this.drawPokerCrown(ax(38), ay(63), as(74), '#000', '#000'); // Shadow/outline crown
            this.drawPokerCrown(ax(40), ay(65), as(70), '#eee', '#888', '#333'); // Main crown
          }
        }
      } else { // For smaller cards (less detail)
        if (point !== 'o') { // Non-Joker cards
          // Draw larger main suit symbol
          this.fillPokerSymbol(ax(30), ay(75), as(100), suit);
          // Draw larger point symbol (top-left only)
          this.fillPokerSymbol(ax(15), ay(15), as(50), point);
        } else { // Joker cards
          // Draw larger 'o' (Joker symbol) top-left
          this.fillPokerSymbol(ax(11), ay(10), as(22), 'o');

          // Draw the crown symbol in the center, with color variations for big/little joker
          if (suit === 'h' || suit === 'd') { // Big Joker (red suits)
            this.drawPokerCrown(ax(45), ay(73), as(89), '#b55', '#a22'); // Shadow/outline crown
            this.drawPokerCrown(ax(47), ay(75), as(85), '#fdf98b', '#e7bd4f', '#a22'); // Main crown
          } else { // Little Joker (black suits)
            this.drawPokerCrown(ax(45), ay(73), as(89), '#000', '#000'); // Shadow/outline crown
            this.drawPokerCrown(ax(47), ay(75), as(85), '#eee', '#888', '#333'); // Main crown
          }
        }
      }
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw the back side of a poker card.
     * This function creates a stylized card back with a patterned design.
     *
     * @summary canvas.drawPokerBack (x, y, size[, foregroundColor, backgroundColor])
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the card in the canvas.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the card in the canvas.
     * @param {number} [size=200] - The height of the card in pixels. The width is calculated as 3/4 of the height.
     * @param {string} [foregroundColor='#BB5555'] - The color used for the main pattern elements.
     * @param {string} [backgroundColor='#AA2222'] - The color used for the background of the pattern.
     * @example
     *     // Draw a red card back
     *     canvas.drawPokerBack(10, 10, 300, '#a22', '#b55');
     *     // Draw a blue card back
     *     canvas.drawPokerBack(375, 400, 100, '#2E319C', '#7A7BB8');
     */
    CanvasRenderingContext2D.prototype.drawPokerBack = function(x, y, size, foregroundColor, backgroundColor) {
      // Helper functions for scaling coordinates and sizes
      var ax = function(n) {
          return x + n * size / 200;
        },
        ay = function(n) {
          return y + n * size / 200;
        },
        as = function(n) {
          return n * size / 200;
        };

      // Default colors if not provided
      foregroundColor = foregroundColor || '#b55';
      backgroundColor = backgroundColor || '#a22';

      // Draw the empty card outline and background
      this.drawEmptyCard(x, y, size);

      // Fill the inner rectangle with the background color
      this.fillStyle = backgroundColor;
      this.fillRoundRect(ax(10), ay(10), as(130), as(180), as(8));

      // Draw a stroke for an inner border with the foreground color
      this.strokeStyle = foregroundColor;
      this.strokeRoundRect(ax(18), ay(18), as(114), as(164), as(4));

      // Fill a smaller inner rectangle with the foreground color, creating a frame effect
      this.fillStyle = foregroundColor;
      this.fillRoundRect(ax(26), ay(26), as(96), as(148), as(24), true);

      // Draw spade symbols at the corners of the inner frame
      this.fillPokerSymbol(ax(24), ay(24), as(20), 's');
      this.fillPokerSymbol(ax(106), ay(24), as(20), 's');
      this.fillPokerSymbol(ax(44), ay(176), as(-20), 's'); // Inverted
      this.fillPokerSymbol(ax(126), ay(176), as(-20), 's'); // Inverted

      // Create a central rectangle with the background color, overlapping the foreground frame
      this.fillStyle = backgroundColor;
      this.fillRoundRect(ax(50), ay(40), as(50), as(120), as(24));

      // Draw a large spade symbol in the center
      this.fillPokerSymbol(ax(32), ay(54), as(86), 's');

      // Draw smaller spade symbols around the central design
      this.fillPokerSymbol(ax(30), ay(60), as(16), 's');
      this.fillPokerSymbol(ax(104), ay(60), as(16), 's');
      this.fillPokerSymbol(ax(30), ay(128), as(16), 's');
      this.fillPokerSymbol(ax(104), ay(128), as(16), 's');

      // Stroke an outline for the central spade design
      this.strokePokerSymbol(ax(31), ay(53), as(88), 's');

      // Reset fill style to foreground color for the final detail
      this.fillStyle = foregroundColor;

      // Draw a club symbol in the center (or 'n' for '99' pattern if enabled)
      this.fillPokerSymbol(ax(50), ay(75), as(50), 'c');
      // Original code had commented out lines for '99' pattern. Keeping them commented.
      // this.fillPokerSymbol(ax(47), ay(80), as(35), 'n');
      // this.fillPokerSymbol(ax(77), ay(80), as(35), 'n');
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw a round-cornered rectangle.
     * This function defines the path for a rectangle with rounded corners.
     *
     * @summary canvas.roundRect (x, y[, width, height[, radius[, direction]]])
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} [width=200] - The width of the rectangle.
     * @param {number} [height=200] - The height of the rectangle.
     * @param {number} [radius=20] - The radius of the corner rounds.
     * @param {boolean} [direction=false] - If true, corners are rounded inward; otherwise, outward.
     * @example
     *     // Draw a standard round rectangle
     *     canvas.roundRect(0, 0, 200, 200, 30);
     *     // Draw a round rectangle with inward-rounded corners
     *     canvas.roundRect(50, 50, 100, 100, 30, true);
     */
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius, direction) {
      // Default values for width, height, and radius
      width = width || 200;
      height = height || 200;
      radius = radius || 20;

      // Start a new path
      this.beginPath();

      // If direction is false (outward rounding)
      if (!direction) {
        // Move to the top-left corner after the first curve
        this.moveTo(x + radius, y);
        // Line to the top-right corner before the curve
        this.lineTo(x + width - radius, y);
        // Arc for the top-right corner
        this.arc(x + width - radius, y + radius, radius, (Math.PI / 180) * 270, 0);
        // Line to the bottom-right corner before the curve
        this.lineTo(x + width, y + height - radius);
        // Arc for the bottom-right corner
        this.arc(x + width - radius, y + height - radius, radius, 0, (Math.PI / 2));
        // Line to the bottom-left corner before the curve
        this.lineTo(x + radius, y + height);
        // Arc for the bottom-left corner
        this.arc(x + radius, y + height - radius, radius, (Math.PI / 2), Math.PI);
        // Line to the top-left corner before the curve
        this.lineTo(x, y + radius);
        // Arc for the top-left corner
        this.arc(x + radius, y + radius, radius, Math.PI, (Math.PI / 180) * 270);
      } else { // If direction is true (inward rounding)
        // Move to the bottom-left corner of the inner rectangle
        this.moveTo(x, y + radius);
        // Line up to the top-left inner corner
        this.lineTo(x, y + height - radius);
        // Arc for the bottom-left inner corner
        this.arc(x, y + height, radius, (Math.PI / 180) * 270, 0);
        // Line to the bottom-right inner corner
        this.lineTo(x + width - radius, y + height);
        // Arc for the bottom-right inner corner
        this.arc(x + width, y + height, radius, Math.PI, (Math.PI / 180) * 270);
        // Line down to the top-right inner corner
        this.lineTo(x + width, y + radius);
        // Arc for the top-right inner corner
        this.arc(x + width, y, radius, Math.PI / 2, Math.PI);
        // Line to the top-left inner corner
        this.lineTo(x + radius, y);
        // Arc for the top-left inner corner
        this.arc(x, y, radius, 0, Math.PI / 2);
      }
      // Close the path to complete the shape
      this.closePath();
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to stroke a round-cornered rectangle.
     * This function calls `roundRect` and then `stroke()` to draw the outline.
     *
     * @summary canvas.strokeRoundRect (x, y[, width, height[, radius[, direction]]])
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} [width=200] - The width of the rectangle.
     * @param {number} [height=200] - The height of the rectangle.
     * @param {number} [radius=20] - The radius of the corner rounds.
     * @param {boolean} [direction=false] - If true, corners are rounded inward; otherwise, outward.
     * @example
     *     // Stroke a standard round rectangle
     *     canvas.strokeRoundRect(0, 0, 200, 200, 30);
     *     // Stroke an inward-rounded rectangle
     *     canvas.strokeRoundRect(50, 50, 100, 100, 30, true);
     */
    CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, width, height, radius, direction) {
      // Adjust coordinates and size slightly for crisp pixel-perfect lines
      this.roundRect(x + 0.5, y + 0.5, width - 1, height - 1, radius, direction);
      // Stroke the defined path
      this.stroke();
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to fill a round-cornered rectangle.
     * This function calls `roundRect` and then `fill()` to draw a filled shape.
     *
     * @summary canvas.fillRoundRect (x, y[, width, height[, radius[, direction]]])
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} [width=200] - The width of the rectangle.
     * @param {number} [height=200] - The height of the rectangle.
     * @param {number} [radius=20] - The radius of the corner rounds.
     * @param {boolean} [direction=false] - If true, corners are rounded inward; otherwise, outward.
     * @example
     *     // Fill a standard round rectangle
     *     canvas.fillRoundRect(0, 0, 200, 200, 30);
     *     // Fill an inward-rounded rectangle
     *     canvas.fillRoundRect(50, 50, 100, 100, 30, true);
     */
    CanvasRenderingContext2D.prototype.fillRoundRect = function(x, y, width, height, radius, direction) {
      // Define the path for the round rectangle
      this.roundRect(x, y, width, height, radius, direction);
      // Fill the defined path
      this.fill();
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw an SVG path string as a curve.
     * This function parses a simplified SVG path and draws it on the canvas.
     *
     * @summary canvas.svgCurve (x, y, size, svgPath)
     * @param {number} [x=0] - The x-coordinate offset for the path.
     * @param {number} [y=0] - The y-coordinate offset for the path.
     * @param {number} size - The scaling factor for the path (assumes original path is scaled to 200px height/width).
     * @param {string} svgPath - The 'd' attribute value from an SVG path element.
     *     Note: Path should be designed with origin (0,0) and max dimension 200px.
     *     Only M, L, H, V, C, Q commands are supported.
     * @example
     *     // Draw a heart symbol using its SVG path
     *     canvas.svgCurve(0, 0, 200, 'M100,30C60,7 0,7 0,76C0,131 100,190 100,190C100,190 200,131 200,76C200,7 140,7 100,30z');
     */
    CanvasRenderingContext2D.prototype.svgCurve = function(x, y, size, svgPath) {
      var relativeX, // Stores the last X coordinate for H/V commands
        relativeY, // Stores the last Y coordinate for H/V commands
        pathNumber, // Loop counter for path segments
        pathArray, // Array of commands and coordinates for a single segment
        svgPathArray, // Array of all parsed path segments
        // Helper functions to scale and offset coordinates
        ax = function(n) {
          return (relativeX = x + n * size / 200);
        },
        ay = function(n) {
          return (relativeY = y + n * size / 200);
        };

      // Pre-process the SVG path string:
      // 1. Add '|' before each command letter (M, Z, L, H, V, C, S, Q, T, A)
      // 2. Remove leading '|' or '|Z,' (if Z is at the start)
      // 3. Split into an array of segments based on '|'
      svgPathArray = svgPath.replace(/ *([MZLHVCSQTA]) */gi, '|$1,').replace(/^\||\|[Z],/gi, '').split(/\|/);

      this.beginPath(); // Start a new path for the SVG curve

      // Iterate through each segment of the SVG path
      for (pathNumber in svgPathArray) {
        // Split the segment into command and coordinates
        pathArray = svgPathArray[pathNumber].split(/[, ]/);

        // Process each SVG path command
        if (pathArray[0] === 'M') { // MoveTo command
          this.moveTo(ax(pathArray[1]), ay(pathArray[2]));
        } else if (pathArray[0] === 'L') { // LineTo command
          this.lineTo(ax(pathArray[1]), ay(pathArray[2]));
        } else if (pathArray[0] === 'H') { // Horizontal LineTo command
          this.lineTo(ax(pathArray[1]), relativeY);
        } else if (pathArray[0] === 'V') { // Vertical LineTo command
          this.lineTo(relativeX, ay(pathArray[1]));
        } else if (pathArray[0] === 'C') { // Bezier CurveTo command
          this.bezierCurveTo(ax(pathArray[1]), ay(pathArray[2]), ax(pathArray[3]), ay(pathArray[4]), ax(pathArray[5]), ay(pathArray[6]));
        } else if (pathArray[0] === 'Q') { // Quadratic CurveTo command
          this.quadraticCurveTo(ax(pathArray[1]), ay(pathArray[2]), ax(pathArray[3]), ay(pathArray[4]));
        }
        // Note: The original code does not support 'A' (Arc), 'S' (Smooth Curve), 'T' (Smooth Quadratic)
      }
      this.closePath(); // Close the path
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw a poker symbol (suit or rank).
     * This function uses predefined SVG paths to draw the symbol.
     *
     * @summary canvas.drawPokerSymbol (x, y, size[, symbol])
     * @param {number} [x=0] - The x-coordinate offset for the symbol.
     * @param {number} [y=0] - The y-coordinate offset for the symbol.
     * @param {number} [size=200] - The scaling factor for the symbol.
     * @param {string} [symbol='O'] - The identifier for the symbol ('h', 'd', 's', 'c', 'A'-'K', 'O', 'R', 'N').
     *     Case-insensitive. 'O' for Joker, 'R' for Crown, 'N' for Nine (if enabled).
     * @example
     *     // Draw a hearts symbol
     *     canvas.drawPokerSymbol(0, 0, 200, 'hearts');
     */
    CanvasRenderingContext2D.prototype.drawPokerSymbol = function(x, y, size, symbol) {
      symbol = fixSymbol(symbol); // Normalize the symbol input

      // If a path exists for the given symbol, draw it
      if (symbolPath[symbol]) {
        this.svgCurve(x, y, size, symbolPath[symbol]);
      }
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to stroke a poker symbol.
     * This function calls `drawPokerSymbol` to define the path and then `stroke()` to draw its outline.
     *
     * @summary canvas.strokePokerSymbol (x, y, size[, symbol])
     * @param {number} [x=0] - The x-coordinate offset for the symbol.
     * @param {number} [y=0] - The y-coordinate offset for the symbol.
     * @param {number} [size=200] - The scaling factor for the symbol.
     * @param {string} [symbol='O'] - The identifier for the symbol.
     * @example
     *     // Stroke a hearts symbol
     *     canvas.strokePokerSymbol(0, 0, 200, 'hearts');
     */
    CanvasRenderingContext2D.prototype.strokePokerSymbol = function(x, y, size, symbol) {
      // Adjust coordinates and size slightly for crisp pixel-perfect lines
      this.drawPokerSymbol(x + 0.5, y + 0.5, size - 1, symbol);
      this.stroke(); // Stroke the defined symbol path
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to fill a poker symbol.
     * This function calls `drawPokerSymbol` to define the path and then `fill()` to draw a filled shape.
     *
     * @summary canvas.fillPokerSymbol (x, y, size[, symbol])
     * @param {number} [x=0] - The x-coordinate offset for the symbol.
     * @param {number} [y=0] - The y-coordinate offset for the symbol.
     * @param {number} [size=200] - The scaling factor for the symbol.
     * @param {string} [symbol='O'] - The identifier for the symbol.
     * @example
     *     // Fill a hearts symbol
     *     canvas.fillPokerSymbol(0, 0, 200, 'hearts');
     */
    CanvasRenderingContext2D.prototype.fillPokerSymbol = function(x, y, size, symbol) {
      this.drawPokerSymbol(x, y, size, symbol); // Define the symbol path
      this.fill(); // Fill the defined symbol path
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw a poker crown, typically used for Joker cards.
     * This function draws a stylized crown with gradient colors and jewel details.
     *
     * @summary canvas.drawPokerCrown (x, y, size[, startColor, endColor[, fillColor]])
     * @param {number} [x=0] - The x-coordinate offset for the crown.
     * @param {number} [y=0] - The y-coordinate offset for the crown.
     * @param {number} [size=200] - The scaling factor for the crown.
     * @param {string} [startColor='#FDF98B'] - The starting color for the gradient background of the crown.
     * @param {string} [endColor='#E7BD4F'] - The ending color for the gradient background of the crown.
     * @param {string} [fillColor='#FFFFFF'] - The fill color for the jewel details on the crown.
     * @example
     *     // Draw a default-colored crown
     *     canvas.drawPokerCrown(0, 0, 200);
     */
    CanvasRenderingContext2D.prototype.drawPokerCrown = function(x, y, size, startColor, endColor, fillColor) {
      // Helper functions for scaling coordinates and sizes
      var fillLinGrad, // Variable to hold the linear gradient object
        ax = function(n) {
          return x + n * size / 200;
        },
        ay = function(n) {
          return y + n * size / 200;
        },
        as = function(n) {
          return n * size / 200;
        };

      // Default colors if not provided
      startColor = startColor || '#fdf98b';
      endColor = endColor || '#e7bd4f';
      fillColor = fillColor || '#fff';

      // Create a linear gradient for the crown's main body
      fillLinGrad = this.createLinearGradient(ax(5), ay(5), ax(100), ay(200));
      fillLinGrad.addColorStop(0, startColor);
      fillLinGrad.addColorStop(1, endColor);

      // Apply the gradient as the fill style
      this.fillStyle = fillLinGrad;

      // Draw the main crown shape using the 'r' (crown) symbol path
      this.fillPokerSymbol(ax(0), ay(0), as(200), 'r');

      // Draw a rectangular element as part of the crown's base
      this.fillRoundRect(ax(88), ay(42), as(23), as(110), as(12));

      // Draw a spade symbol on top of the crown
      this.fillPokerSymbol(ax(86), ay(18), as(27), 's');

      // Draw another rectangular element as the lower band of the crown
      this.fillRoundRect(ax(40), ay(150), as(120), as(24), as(10));

      // Set fill style for the jewel details
      this.fillStyle = fillColor;

      // Draw various small suit symbols as jewels on the crown
      this.fillPokerSymbol(ax(92), ay(26), as(15), 'd'); // Diamond at the top
      this.fillPokerSymbol(ax(93), ay(60), as(13), 'h'); // Hearts down the center
      this.fillPokerSymbol(ax(93), ay(80), as(13), 'h');
      this.fillPokerSymbol(ax(93), ay(100), as(13), 'h');
      this.fillPokerSymbol(ax(93), ay(120), as(13), 'h');
      this.fillPokerSymbol(ax(93), ay(155), as(13), 'h'); // Hearts along the bottom band
      this.fillPokerSymbol(ax(73), ay(155), as(13), 'h');
      this.fillPokerSymbol(ax(53), ay(155), as(13), 'h');
      this.fillPokerSymbol(ax(113), ay(155), as(13), 'h');
      this.fillPokerSymbol(ax(133), ay(155), as(13), 'h');
    };

    /**
     * Extends CanvasRenderingContext2D.prototype to draw an empty card (background and border).
     * This function creates the basic shape and shading for a poker card.
     *
     * @summary canvas.drawEmptyCard (x, y, size)
     * @param {number} [x=0] - The x-coordinate of the top-left corner of the card.
     * @param {number} [y=0] - The y-coordinate of the top-left corner of the card.
     * @param {number} [size=200] - The height of the card. The width is calculated as 3/4 of the height.
     * @example
     *     // Draw a blank card
     *     canvas.drawEmptyCard(0, 0, 200);
     */
    CanvasRenderingContext2D.prototype.drawEmptyCard = function(x, y, size) {
      // Helper functions for scaling coordinates and sizes
      var fillLinGrad, // Variable to hold the linear gradient object
        ax = function(n) {
          return x + n * size / 200;
        },
        ay = function(n) {
          return y + n * size / 200;
        },
        as = function(n) {
          return n * size / 200;
        };

      // Create a linear gradient for the card's background fill
      fillLinGrad = this.createLinearGradient(ax(5), ay(5), ax(55), ay(200));
      fillLinGrad.addColorStop(0, '#fff'); // White at the start
      fillLinGrad.addColorStop(1, '#e0e0e0'); // Light grey at the end, creating a subtle gradient

      // Apply the gradient as the fill style
      this.fillStyle = fillLinGrad;
      // Fill a round-cornered rectangle for the card's main body
      this.fillRoundRect(ax(0), ay(0), as(150), as(200), as(16));

      // Set stroke style for the card's border
      this.strokeStyle = '#666';
      // Stroke a round-cornered rectangle for the card's border
      this.strokeRoundRect(ax(0), ay(0), as(150), as(200), as(16));
    };

    // Expose the Poker object globally
    window.Poker = {
      /**
       * Generates an HTML <img> element representing the front side of a poker card.
       * The image data is created on a canvas and then converted to a data URL.
       *
       * @summary Poker.getCardImage (size, suit, point)
       * @param {number} [size=200] - The height of the card in pixels.
       * @param {string} [suit='h'] - The poker suit.
       * @param {string} [point='O'] - The card point.
       * @return {HTMLElement} An HTML `<img>` element with the card rendered.
       * @example
       *     // Add a Queen of Hearts image to the document body
       *     document.body.appendChild(Poker.getCardImage(100, 'h', 'Q'));
       */
      getCardImage: function(size, suit, point) {
        var image = document.createElement('img'); // Create a new image element
        // Set the image source to the data URL of the rendered card
        image.src = this.getCardData(size, suit, point);
        return image; // Return the image element
      },

      /**
       * Generates an HTML <canvas> element with the front side of a poker card drawn on it.
       * This allows for direct manipulation of the canvas if needed.
       *
       * @summary Poker.getCardCanvas (size, suit, point)
       * @param {number} [size=200] - The height of the card in pixels.
       * @param {string} [suit='h'] - The poker suit.
       * @param {string} [point='O'] - The card point.
       * @return {HTMLElement} An HTML `<canvas>` element with the card drawn.
       * @example
       *     // Add a Queen of Hearts canvas to the document body
       *     document.body.appendChild(Poker.getCardCanvas(100, 'h', 'Q'));
       */
      getCardCanvas: function(size, suit, point) {
        var canvas = pc(size); // Create a new canvas using the helper function
        // Get the 2D rendering context and draw the poker card
        canvas.getContext('2d').drawPokerCard(0, 0, size, suit, point);
        return canvas; // Return the canvas element
      },

      /**
       * Returns the data URL (Base64 encoded image string) of the front side of a poker card.
       * This can be used as the `src` attribute for an `<img>` tag or for other image processing.
       *
       * @summary Poker.getCardData (size, suit, point)
       * @param {number} [size=200] - The height of the card in pixels.
       * @param {string} [suit='h'] - The poker suit.
       * @param {string} [point='O'] - The card point.
       * @return {string} The data URL of the rendered card image.
       * @example
       *     // Get the data URL for a Queen of Hearts
       *     var imgData = Poker.getCardData(100, 'h', 'Q');
       */
      getCardData: function(size, suit, point) {
        // Create a canvas, draw the card, and convert it to a data URL
        return this.getCardCanvas(size, suit, point).toDataURL();
      },

      /**
       * Generates an HTML <img> element representing the back side of a poker card.
       * The image data is created on a canvas and then converted to a data URL.
       *
       * @summary Poker.getBackImage (size[, foregroundColor, backgroundColor])
       * @param {number} [size=200] - The height of the card in pixels.
       * @param {string} [foregroundColor='#BB5555'] - The foreground color for the card back design.
       * @param {string} [backgroundColor='#AA2222'] - The background color for the card back design.
       * @return {HTMLElement} An HTML `<img>` element with the card back rendered.
       * @example
       *     // Add a red card back image to the document body
       *     document.body.appendChild(Poker.getBackImage(100, '#a22', '#b55'));
       */
      getBackImage: function(size, foregroundColor, backgroundColor) {
        var image = document.createElement('img'); // Create a new image element
        // Set the image source to the data URL of the rendered card back
        image.src = this.getBackData(size, foregroundColor, backgroundColor);
        return image; // Return the image element
      }
      // The original code was truncated here, but following the pattern, more
      // `getBackCanvas` and `getBackData` methods would likely be defined.
      // For a Type I clone, we only reproduce the provided code.
    };
  }
})();