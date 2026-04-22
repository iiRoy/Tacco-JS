/*
 * CardDraw.JS
 * Module available at https://github.com/YourName/CardDraw.JS
 *
 * @author Sarah Johnson (http://sarah.dev.io)
 * @license Apache-2.0 license.
 * @version 2.0.1
 */
(function() {
    'use strict';
    if (window.CanvasRenderingContext2D) {
        var pathCollection = {
            'a': 'M6,200V183H23L58,0H78L117,183H131V200H85V183H97L92,156H46L42,183H54V200H6zM88,135L68,37L49,135H88z',
            '2': 'M10,200L11,187C15,149,23,136,70,97C93,78,100,68,101,57C104,31,81,23,65,23C46,22,23,34,35,62L12,68C8,43,12,18,33,8C61,-6,96,-1,115,21C127,36,129,56,123,72C104,113,39,131,35,179H105V152H127V200L10,200z',
            '3': 'M2,156L18,145C31,167,47,181,70,178C104,176,119,140,112,113C105,89,76,77,53,90C47,93,43,96,41,96C39,96,33,85,34,82C50,59,87,21,87,21H28V47H6V0H120V16C120,16,90,48,80,64C104,65,125,81,132,105C136,118,135,148,129,160C119,182,94,199,71,200C33,202,12,176,2,156L2,156z',
            '4': 'M70,200L70,183L86,183L86,153L5,153L5,133L93,0L107,0L107,133L132,133L132,153L107,153L107,183L120,183L120,200zM86,49L30,133L86,133z',
            '5': 'M4,148L24,148C28,160,37,173,48,176C80,183,101,166,108,144C116,120,107,84,85,71C67,61,40,70,27,92L13,83L20,0H112V20H37L37,55C52,44,77,44,93,52C123,66,137,98,131,137C123,175,105,197,64,200C20,201,4,170,4,148L4,148z',
            '6': 'M8,139C6,122,6,78,8,65C15,26,30,7,55,2C81,-4,116,3,124,35L103,36C91,14,60,15,46,29C34,37,28,68,30,70C30,70,50,55,73,55C120,55,132,94,130,127C129,167,116,198,73,200C31,198,12,177,8,139zM110,128C111,101,98,80,73,77C50,76,26,99,27,127C29,155,40,179,69,179C101,179,110,147,110,128z',
            '7': 'M37,200C50,131,65,79,102,22H26V46H6V0H117L131,22C91,64,54,202,61,200H37z',
            '8': 'M2,142C3,115,13,105,32,90C17,79,10,63,12,50C15,17,41,0,69,0C98,1,123,24,125,48C127,69,120,79,105,90C123,105,135,115,135,141C134,168,111,199,71,200C31,201,1,168,2,142L2,142zM113,142C115,117,93,101,69,101C45,101,23,121,23,143C23,166,51,178,69,178C91,178,112,163,113,142L113,142zM105,55C106,34,87,20,67,21C50,21,31,34,31,51C31,72,52,83,70,83C86,84,105,71,105,55L105,55z',
            '9': 'MM11,161L30,156C37,174,52,180,67,178C94,176,102,146,104,120C94,131,78,137,64,136C21,134,10,100,10,65C9,35,21,13,43,3C55,-1,81,-1,92,4C118,18,128,42,126,98C126,144,117,198,66,200C36,204,14,181,11,161L11,161zM85,111C94,105,98,100,102,92C106,86,106,83,106,69C103,36,86,17,60,21C44,23,36,31,33,46C24,73,35,105,55,112C63,116,78,115,85,111L85,111z',
            // Zero-rank card
            '0': 'M6,200V0H26V200H6M85,0C66,0,50,17,50,39V162C50,183,66,200,85,200H96C115,200,130,183,130,162V39C130,17,115,0,96,0H85M90,19C102,19,110,28,110,38V163C110,174,102,183,90,183C79,183,70,174,70,163V38C70,28,79,19,90,19L90,19z',
            'j': 'M68,0V21H88C88,21,89,41,89,84C89,126,90,146,88,158C81,185,40,185,32,166C27,155,28,146,28,134H6C6,134,6,140,6,147C6,178,17,193,41,198C65,204,95,194,105,174C111,162,111,161,111,89C111,41,111,21,111,21H130V0H68z',
            'q': 'M24,134L6,134L6,112L24,112C24,112,24,60,24,40C24,18,40,0,66,0C92,0,110,18,110,40C110,62,111,148,110,155C110,168,108,170,108,171C110,176,130,178,130,177L130,199C115,201,109,199,96,190C88,198,65,205,46,196C32,190,24,174,24,134zM81,174C73,162,58,145,44,140C44,156,46,165,51,171C59,181,71,183,81,174zM66,22C50,22,44,30,44,70C44,94,44,116,44,116C67,123,90,150,90,150L90,70C90,30,82,22,66,22z',
            'k': 'M76,180L96,180L64,106L40,142L40,180L56,180L56,200L0,200L0,180L20,180L20,20L0,20L0,0L56,0L56,20L40,20L40,100L92.0636,19.841L76,20L76,0L136,0L136,20L120,20L76,88L116,180L136,180L136,200L76,200z',
            // Joker-specific glyphs
            'o': 'M141,0L181,0C168,55,161,150,129,183C91,219,15,198,21,141L60,137C58,157,62,166,81,166C102,165,110,143,115,118M6,378C6,306,53,256,119,256C197,256,213,346,187,398C164,438,130,458,88,459C39,458,7,422,6,378M47,377C49,406,67,425,93,425C168,423,182,292,115,290C69,294,47,338,47,377M0,714L42,518L84,518L66,601L159,518L215,518L124,595L191,714L144,714L94,621L55,654L42,714M8,973L50,777L200,777L193,809L85,809L75,854L180,854L173,887L68,887L56,940L173,940L166,973M43,1231L1,1231L44,1035L133,1035C170,1037,197,1051,198,1087C195,1127,169,1143,136,1148C158,1171,171,1206,182,1231L137,1231C116,1182,112,1150,60,1150M67,1121C96,1121,155,1126,156,1087C151,1061,100,1068,78,1068z',
            // Heart suit path
            'h': 'M100,30C60,7,0,7,0,76C0,131,100,190,100,190C100,190,200,131,200,76C200,7,140,7,100,30z',
            // Diamond suit path
            'd': 'M184,100C152,120,120,160,100,200C80,160,48,120,16,100C48,80,80,40,100,0C120,40,152,80,184,100z',
            // Spade suit path
            's': 'M200,120C200,168,144,176,116,156C116,180,116,188,128,200C112,196,88,196,72,200C84,188,84,180,84,156C56,176,0,168,0,120C0,72,60,36,100,0C140,36,200,72,200,120z',
            // Club suit path
            'c': 'M80,200C92,184,92,160,92,136C76,180,0,176,0,124C0,80,40,76,68,88C80,92,80,88,72,84C44,64,40,0,100,0C160,0,156,64,128,84C120,88,120,92,132,88C160,76,200,80,200,124C200,176,124,180,108,136C108,160,108,184,120,200C100,196,100,196,80,200z',
            // Crown segment path
            'r': 'M44,60,C45,56,-3,33,0,70,C2,107,39,146,48,150,C57,154,12,107,12,77,C12,45,43,65,44,60,M37,65,C31,64,20,60,19,81,C19,100,63,158,65,149,C65,139,33,102,37,65,M86,56,C87,52,38,28,40,66,C43,103,69,141,78,148,C86,155,54,102,54,71,C54,39,86,60,86,56,M82,65,C77,64,59,54,59,74,C60,95,82,146,84,138,C86,132,78,102,82,65,M154,60,C153,56,203,33,200,70,C197,107,159,146,151,150,C142,154,187,107,187,77,C187,45,155,65,154,60,M161,65,C167,64,179,60,180,81,C181,100,137,158,135,149,C134,139,165,102,161,65,M113,56,C112,52,161,28,158,66,C155,103,130,141,122,148,C114,155,145,102,145,71,C145,39,114,60,113,56,M117,65,C123,64,141,54,141,74,C140,95,118,146,116,138,C114,132,121,102,117,65z'
        }, makeDrawingSurface = function(dimension) {
            var drawingSurface = document.createElement('canvas');
            drawingSurface.height = dimension;
            drawingSurface.width = dimension * 0.75;
            return drawingSurface;
        }, standardizeSuitInput = function(cardSuit) {
            // Valid suits: hearts, diamonds, spades, clubs
            return (cardSuit || 'h').substring(0, 1).toLowerCase();
        }, standardizeRankInput = function(rankValue) {
            // Valid ranks: A, 2-10, J, Q, K, JOKER
            rankValue = (rankValue || 'o').toString().toLowerCase();
            return rankValue.substring((rankValue.match(/jo|10|cr/)) ? 1 : 0, 1);
        };

        /**
         * Draws the front face of a playing card onto the canvas context.
         * @param {number} [coordX=0] - X-coordinate for the card's top-left corner.
         * @param {number} [coordY=0] - Y-coordinate for the card's top-left corner.
         * @param {number} [dimension=200] - Height of the card in pixels. Width is 3/4 of height.
         * @param {string} [cardSuit='h'] - The suit of the card. e.g., 'h', 'd', 's', 'c'.
         * @param {string} [cardRank='O'] - The rank of the card. e.g., 'A', 'K', 'Q', 'J', 'O'.
         */
        CanvasRenderingContext2D.prototype.displayCardFace = function(coordX, coordY, dimension, cardSuit, cardRank) {
            var scaleX = function(val) {
                return coordX + val * dimension / 200;
            }, scaleY = function(val) {
                return coordY + val * dimension / 200;
            }, scaleDimension = function(val) {
                return val * dimension / 200;
            };

            cardSuit = standardizeSuitInput(cardSuit);
            cardRank = standardizeRankInput(cardRank);

            this.drawCardBase(scaleX(0), scaleY(0), scaleDimension(200));
            this.fillStyle = (cardSuit === 'h' || cardSuit === 'd') ? '#A22222' : '#000000';
            if (dimension >= 100) {
                if (cardRank !== 'o') {
                    this.paintCardElement(scaleX(40), scaleY(65), scaleDimension(70), cardSuit);
                    this.paintCardElement(scaleX(10), scaleY(10), scaleDimension(40), cardRank);
                    this.paintCardElement(scaleX(11), scaleY(55), scaleDimension(25), cardSuit);
                    this.paintCardElement(scaleX(140), scaleY(190), scaleDimension(-40), cardRank);
                    this.paintCardElement(scaleX(139), scaleY(145), scaleDimension(-25), cardSuit);
                } else {
                    this.paintCardElement(scaleX(11), scaleY(10), scaleDimension(18), 'o');
                    this.paintCardElement(scaleX(139), scaleY(190), scaleDimension(-18), 'o');
                    if (cardSuit === 'h' || cardSuit === 'd') {
                        this.displayJokerCrown(scaleX(38), scaleY(63), scaleDimension(74), '#B55555', '#A22222');
                        this.displayJokerCrown(scaleX(40), scaleY(65), scaleDimension(70), '#FDF98B', '#E7BD4F', '#A22222');
                    } else {
                        this.displayJokerCrown(scaleX(38), scaleY(63), scaleDimension(74), '#000000', '#000000');
                        this.displayJokerCrown(scaleX(40), scaleY(65), scaleDimension(70), '#EEEEEE', '#888888', '#333333');
                    }
                }
            } else {
                if (cardRank !== 'o') {
                    this.paintCardElement(scaleX(30), scaleY(75), scaleDimension(100), cardSuit);
                    this.paintCardElement(scaleX(15), scaleY(15), scaleDimension(50), cardRank);
                } else {
                    this.paintCardElement(scaleX(11), scaleY(10), scaleDimension(22), 'o');
                    if (cardSuit === 'h' || cardSuit === 'd') {
                        this.displayJokerCrown(scaleX(45), scaleY(73), scaleDimension(89), '#B55555', '#A22222');
                        this.displayJokerCrown(scaleX(47), scaleY(75), scaleDimension(85), '#FDF98B', '#E7BD4F', '#A22222');
                    } else {
                        this.displayJokerCrown(scaleX(45), scaleY(73), scaleDimension(89), '#000000', '#000000');
                        this.displayJokerCrown(scaleX(47), scaleY(75), scaleDimension(85), '#EEEEEE', '#888888', '#333333');
                    }
                }
            }
        };

        /**
         * Renders the reverse side of a playing card.
         * @param {number} [coordX=0] - X-coordinate for the card's top-left corner.
         * @param {number} [coordY=0] - Y-coordinate for the card's top-left corner.
         * @param {number} [dimension=200] - Height of the card in pixels.
         * @param {string} [frontColor='#BB5555'] - Primary color for the back design.
         * @param {string} [backColor='#AA2222'] - Secondary color for the back design.
         */
        CanvasRenderingContext2D.prototype.displayCardRear = function(coordX, coordY, dimension, frontColor, backColor) {
            var scaleX = function(val) {
                return coordX + val * dimension / 200;
            }, scaleY = function(val) {
                return coordY + val * dimension / 200;
            }, scaleDimension = function(val) {
                return val * dimension / 200;
            };

            frontColor = frontColor || '#B55555';
            backColor = backColor || '#A22222';

            this.drawCardBase(coordX, coordY, dimension);

            this.fillStyle = backColor;
            this.paintRoundedRectangle(scaleX(10), scaleY(10), scaleDimension(130), scaleDimension(180), scaleDimension(8));
            this.strokeStyle = frontColor;
            this.outlineRoundedRectangle(scaleX(18), scaleY(18), scaleDimension(114), scaleDimension(164), scaleDimension(4));
            this.fillStyle = frontColor;
            this.paintRoundedRectangle(scaleX(26), scaleY(26), scaleDimension(96), scaleDimension(148), scaleDimension(24), true);

            this.paintCardElement(scaleX(24), scaleY(24), scaleDimension(20), 's');
            this.paintCardElement(scaleX(106), scaleY(24), scaleDimension(20), 's');
            this.paintCardElement(scaleX(44), scaleY(176), scaleDimension(-20), 's');
            this.paintCardElement(scaleX(126), scaleY(176), scaleDimension(-20), 's');
            this.fillStyle = backColor;
            this.paintRoundedRectangle(scaleX(50), scaleY(40), scaleDimension(50), scaleDimension(120), scaleDimension(24));
            this.paintCardElement(scaleX(32), scaleY(54), scaleDimension(86), 's');
            this.paintCardElement(scaleX(30), scaleY(60), scaleDimension(16), 's');
            this.paintCardElement(scaleX(104), scaleY(60), scaleDimension(16), 's');
            this.paintCardElement(scaleX(30), scaleY(128), scaleDimension(16), 's');
            this.paintCardElement(scaleX(104), scaleY(128), scaleDimension(16), 's');
            this.outlineCardElement(scaleX(31), scaleY(53), scaleDimension(88), 's');
            this.fillStyle = frontColor;

            this.paintCardElement(scaleX(50), scaleY(75), scaleDimension(50), 'c');
        };

        /**
         * Creates a path for a rectangle with rounded corners.
         * @param {number} [coordX=0] - X-coordinate of the rectangle's top-left.
         * @param {number} [coordY=0] - Y-coordinate of the rectangle's top-left.
         * @param {number} [rectWidth=200] - Width of the rectangle.
         * @param {number} [rectHeight=200] - Height of the rectangle.
         * @param {number} [cornerRadius=20] - Radius of the rounded corners.
         * @param {boolean} [invertCorners=false] - If true, corners are inverted (cut-out).
         */
        CanvasRenderingContext2D.prototype.pathRoundedRectangle = function(coordX, coordY, rectWidth, rectHeight, cornerRadius, invertCorners) {
            rectWidth = rectWidth || 200;
            rectHeight = rectHeight || 200;
            cornerRadius = cornerRadius || 20;

            this.beginPath();
            if (!invertCorners) {
                this.moveTo(coordX + cornerRadius, coordY);
                this.lineTo(coordX + rectWidth - cornerRadius, coordY);
                this.arc(coordX + rectWidth - cornerRadius, coordY + cornerRadius, cornerRadius, (Math.PI / 180) * 270, 0);
                this.lineTo(coordX + rectWidth, coordY + rectHeight - cornerRadius);
                this.arc(coordX + rectWidth - cornerRadius, coordY + rectHeight - cornerRadius, cornerRadius, 0, (Math.PI / 2));
                this.lineTo(coordX + cornerRadius, coordY + rectHeight);
                this.arc(coordX + cornerRadius, coordY + rectHeight - cornerRadius, cornerRadius, (Math.PI / 2), Math.PI);
                this.lineTo(coordX, coordY + cornerRadius);
                this.arc(coordX + cornerRadius, coordY + cornerRadius, cornerRadius, Math.PI, (Math.PI / 180) * 270);
            } else {
                this.moveTo(coordX, coordY + cornerRadius);
                this.lineTo(coordX, coordY + rectHeight - cornerRadius);
                this.arc(coordX, coordY + rectHeight, cornerRadius, (Math.PI / 180) * 270, 0);
                this.lineTo(coordX + rectWidth - cornerRadius, coordY + rectHeight);
                this.arc(coordX + rectWidth, coordY + rectHeight, cornerRadius, Math.PI, (Math.PI / 180) * 270);
                this.lineTo(coordX + rectWidth, coordY + cornerRadius);
                this.arc(coordX + rectWidth, coordY, cornerRadius, Math.PI / 2, Math.PI);
                this.lineTo(coordX + cornerRadius, coordY);
                this.arc(coordX, coordY, cornerRadius, 0, Math.PI / 2);
            }
            this.closePath();
        };

        /**
         * Draws the outline of a rounded rectangle.
         * @param {number} [coordX=0] - X-coordinate of the rectangle's top-left.
         * @param {number} [coordY=0] - Y-coordinate of the rectangle's top-left.
         * @param {number} [rectWidth=200] - Width of the rectangle.
         * @param {number} [rectHeight=200] - Height of the rectangle.
         * @param {number} [cornerRadius=20] - Radius of the rounded corners.
         * @param {boolean} [invertCorners=false] - If true, corners are inverted.
         */
        CanvasRenderingContext2D.prototype.outlineRoundedRectangle = function(coordX, coordY, rectWidth, rectHeight, cornerRadius, invertCorners) {
            this.pathRoundedRectangle(coordX + 0.5, coordY + 0.5, rectWidth - 1, rectHeight - 1, cornerRadius, invertCorners);
            this.stroke();
        };

        /**
         * Fills a rounded rectangle.
         * @param {number} [coordX=0] - X-coordinate of the rectangle's top-left.
         * @param {number} [coordY=0] - Y-coordinate of the rectangle's top-left.
         * @param {number} [rectWidth=200] - Width of the rectangle.
         * @param {number} [rectHeight=200] - Height of the rectangle.
         * @param {number} [cornerRadius=20] - Radius of the rounded corners.
         * @param {boolean} [invertCorners=false] - If true, corners are inverted.
         */
        CanvasRenderingContext2D.prototype.paintRoundedRectangle = function(coordX, coordY, rectWidth, rectHeight, cornerRadius, invertCorners) {
            this.pathRoundedRectangle(coordX, coordY, rectWidth, rectHeight, cornerRadius, invertCorners);
            this.fill();
        };

        /**
         * Renders an SVG curve path onto the canvas.
         * @param {number} [coordX=0] - X-offset for the SVG path.
         * @param {number} [coordY=0] - Y-offset for the SVG path.
         * @param {number} pathSize - The scaling factor for the SVG path.
         * @param {string} svgPathData - The 'd' attribute value from an SVG path element.
         */
        CanvasRenderingContext2D.prototype.drawVectorPath = function(coordX, coordY, pathSize, svgPathData) {
            var currentRelativeX, currentRelativeY, pathSegmentIndex, segmentCoordinates, fullPathSegments, scaleX = function(val) {
                return (currentRelativeX = coordX + val * pathSize / 200);
            }, scaleY = function(val) {
                return (currentRelativeY = coordY + val * pathSize / 200);
            };
            fullPathSegments = svgPathData.replace(/ *([MZLHVCSQTA]) */gi, '|$1,').replace(/^\||\|[Z],/gi, '').split(/\|/);

            this.beginPath();
            for (pathSegmentIndex in fullPathSegments) {
                segmentCoordinates = fullPathSegments[pathSegmentIndex].split(/[, ]/);
                if (segmentCoordinates[0] === 'M') {
                    this.moveTo(scaleX(segmentCoordinates[1]), scaleY(segmentCoordinates[2]));
                } else if (segmentCoordinates[0] === 'L') {
                    this.lineTo(scaleX(segmentCoordinates[1]), scaleY(segmentCoordinates[2]));
                } else if (segmentCoordinates[0] === 'H') {
                    this.lineTo(scaleX(segmentCoordinates[1]), currentRelativeY);
                } else if (segmentCoordinates[0] === 'V') {
                    this.lineTo(currentRelativeX, scaleY(segmentCoordinates[1]));
                } else if (segmentCoordinates[0] === 'C') {
                    this.bezierCurveTo(scaleX(segmentCoordinates[1]), scaleY(segmentCoordinates[2]), scaleX(segmentCoordinates[3]), scaleY(segmentCoordinates[4]), scaleX(segmentCoordinates[5]), scaleY(segmentCoordinates[6]));
                } else if (segmentCoordinates[0] === 'Q') {
                    this.quadraticCurveTo(scaleX(segmentCoordinates[1]), scaleY(segmentCoordinates[2]), scaleX(segmentCoordinates[3]), scaleY(segmentCoordinates[4]));
                }
            }
            this.closePath();
        };

        /**
         * Prepares a card symbol path for drawing.
         * @param {number} [coordX=0] - X-coordinate for the symbol's top-left.
         * @param {number} [coordY=0] - Y-coordinate for the symbol's top-left.
         * @param {number} symbolSize - The size of the symbol.
         * @param {string} [glyphIdent='O'] - Identifier for the symbol (e.g., 'h', 'A', 'r').
         */
        CanvasRenderingContext2D.prototype.displayCardElement = function(coordX, coordY, symbolSize, glyphIdent) {
            glyphIdent = standardizeRankInput(glyphIdent);
            if (pathCollection[glyphIdent]) {
                this.drawVectorPath(coordX, coordY, symbolSize, pathCollection[glyphIdent]);
            }
        };

        /**
         * Strokes the outline of a card symbol.
         * @param {number} [coordX=0] - X-coordinate for the symbol's top-left.
         * @param {number} [coordY=0] - Y-coordinate for the symbol's top-left.
         * @param {number} symbolSize - The size of the symbol.
         * @param {string} [glyphIdent='O'] - Identifier for the symbol.
         */
        CanvasRenderingContext2D.prototype.outlineCardElement = function(coordX, coordY, symbolSize, glyphIdent) {
            this.displayCardElement(coordX + 0.5, coordY + 0.5, symbolSize - 1, glyphIdent);
            this.stroke();
        };

        /**
         * Fills a card symbol with the current fill style.
         * @param {number} [coordX=0] - X-coordinate for the symbol's top-left.
         * @param {number} [coordY=0] - Y-coordinate for the symbol's top-left.
         * @param {number} symbolSize - The size of the symbol.
         * @param {string} [glyphIdent='O'] - Identifier for the symbol.
         */
        CanvasRenderingContext2D.prototype.paintCardElement = function(coordX, coordY, symbolSize, glyphIdent) {
            this.displayCardElement(coordX, coordY, symbolSize, glyphIdent);
            this.fill();
        };

        /**
         * Renders a crown graphic, typically for Joker cards.
         * @param {number} [coordX=0] - X-coordinate for the crown's top-left.
         * @param {number} [coordY=0] - Y-coordinate for the crown's top-left.
         * @param {number} crownSize - The overall size of the crown.
         * @param {string} [gradientStartColor='#FDF98B'] - Start color for the crown's gradient.
         * @param {string} [gradientEndColor ='#E7BD4F'] - End color for the crown's gradient.
         * @param {string} [jewelColor ='#FFFFFF'] - Color for the crown's jewels.
         */
        CanvasRenderingContext2D.prototype.displayJokerCrown = function(coordX, coordY, crownSize, gradientStartColor, gradientEndColor, jewelColor) {
            var linearFillGradient, scaleX = function(val) {
                return coordX + val * crownSize / 200;
            }, scaleY = function(val) {
                return coordY + val * crownSize / 200;
            }, scaleDimension = function(val) {
                return val * crownSize / 200;
            };

            gradientStartColor = gradientStartColor || '#FDF98B';
            gradientEndColor = gradientEndColor || '#E7BD4F';
            jewelColor = jewelColor || '#FFFFFF';

            linearFillGradient = this.createLinearGradient(scaleX(5), scaleY(5), scaleX(100), scaleY(200));
            linearFillGradient.addColorStop(0, gradientStartColor);
            linearFillGradient.addColorStop(1, gradientEndColor);

            this.fillStyle = linearFillGradient;
            this.paintCardElement(scaleX(0), scaleY(0), scaleDimension(200), 'r');
            this.paintRoundedRectangle(scaleX(88), scaleY(42), scaleDimension(23), scaleDimension(110), scaleDimension(12));
            this.paintCardElement(scaleX(86), scaleY(18), scaleDimension(27), 's');
            this.paintRoundedRectangle(scaleX(40), scaleY(150), scaleDimension(120), scaleDimension(24), scaleDimension(10));
            this.fillStyle = jewelColor;
            this.paintCardElement(scaleX(92), scaleY(26), scaleDimension(15), 'd');
            this.paintCardElement(scaleX(93), scaleY(60), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(93), scaleY(80), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(93), scaleY(100), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(93), scaleY(120), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(93), scaleY(155), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(73), scaleY(155), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(53), scaleY(155), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(113), scaleY(155), scaleDimension(13), 'h');
            this.paintCardElement(scaleX(133), scaleY(155), scaleDimension(13), 'h');
        };

        /**
         * Draws the basic rectangular base for a playing card.
         * @param {number} [coordX=0] - X-coordinate for the card's top-left.
         * @param {number} [coordY=0] - Y-coordinate for the card's top-left.
         * @param {number} [dimension=200] - Height of the card.
         */
        CanvasRenderingContext2D.prototype.drawCardBase = function(coordX, coordY, dimension) {
            var linearFillGradient, scaleX = function(val) {
                return coordX + val * dimension / 200;
            }, scaleY = function(val) {
                return coordY + val * dimension / 200;
            }, scaleDimension = function(val) {
                return val * dimension / 200;
            };

            linearFillGradient = this.createLinearGradient(scaleX(5), scaleY(5), scaleX(55), scaleY(200));
            linearFillGradient.addColorStop(0, '#FFFFFF');
            linearFillGradient.addColorStop(1, '#E0E0E0');

            this.fillStyle = linearFillGradient;
            this.paintRoundedRectangle(scaleX(0), scaleY(0), scaleDimension(150), scaleDimension(200), scaleDimension(16));
            this.strokeStyle = '#666666';
            this.outlineRoundedRectangle(scaleX(0), scaleY(0), scaleDimension(150), scaleDimension(200), scaleDimension(16));
        };

        window.CardRenderer = {
            /**
             * Generates an HTML Image element displaying the card's front.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [cardSuit='h'] - Card suit (e.g., 'h', 'd').
             * @param {string} [cardRank='O'] - Card rank (e.g., 'A', 'K', 'O').
             * @returns {HTMLElement} An <img> element.
             */
            fetchCardFrontImage: function(dimension, cardSuit, cardRank) {
                var graphicElement = document.createElement('img');
                graphicElement.src = this.fetchCardFrontDataURL(dimension, cardSuit, cardRank);
                return graphicElement;
            },

            /**
             * Generates an HTML Canvas element displaying the card's front.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [cardSuit='h'] - Card suit.
             * @param {string} [cardRank='O'] - Card rank.
             * @returns {HTMLElement} A <canvas> element.
             */
            fetchCardFrontCanvas: function(dimension, cardSuit, cardRank) {
                var drawingSurface = makeDrawingSurface(dimension);
                drawingSurface.getContext('2d').displayCardFace(0, 0, dimension, cardSuit, cardRank);
                return drawingSurface;
            },

            /**
             * Retrieves the base64 data URL for a card's front image.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [cardSuit='h'] - Card suit.
             * @param {string} [cardRank='O'] - Card rank.
             * @returns {string} The data URL.
             */
            fetchCardFrontDataURL: function(dimension, cardSuit, cardRank) {
                return this.fetchCardFrontCanvas(dimension, cardSuit, cardRank).toDataURL();
            },

            /**
             * Generates an HTML Image element displaying the card's back.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [frontColor='#BB5555'] - Primary color for the back.
             * @param {string} [backColor='#AA2222'] - Secondary color for the back.
             * @returns {HTMLElement} An <img> element.
             */
            fetchCardBackImage: function(dimension, frontColor, backColor) {
                var graphicElement = document.createElement('img');
                graphicElement.src = this.fetchCardBackDataURL(dimension, frontColor, backColor);
                return graphicElement;
            },

            /**
             * Generates an HTML Canvas element displaying the card's back.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [frontColor='#BB5555'] - Primary color for the back.
             * @param {string} [backColor='#AA2222'] - Secondary color for the back.
             * @returns {HTMLElement} A <canvas> element.
             */
            fetchCardBackCanvas: function(dimension, frontColor, backColor) {
                var drawingSurface = makeDrawingSurface(dimension);
                drawingSurface.getContext('2d').displayCardRear(0, 0, dimension, frontColor, backColor);
                return drawingSurface;
            },

            /**
             * Retrieves the base64 data URL for a card's back image.
             * @param {number} [dimension=200] - Height of the card.
             * @param {string} [frontColor='#BB5555'] - Primary color for the back.
             * @param {string} [backColor='#AA2222'] - Secondary color for the back.
             * @returns {string} The data URL.
             */
            fetchCardBackDataURL: function(dimension, frontColor, backColor) {
                return this.fetchCardBackCanvas(dimension, frontColor, backColor).toDataURL();
            }
        };
    }
})();