/**
 * PlayingCardGraphics.js
 * Advanced utility for rendering playing cards on HTML Canvas.
 *
 * @author Xiaole Tao (http://xiaole.happylive.org) - Original Author
 * @contributor GPT-4 - Type III Clone Generation
 * @license MIT - Retained
 * @version 2.0 (Type III Clone)
 */
(function(globalScope) {
	'use strict';

	// Check if CanvasRenderingContext2D is available, otherwise this library is not functional.
	// This guard is now more explicit and logs a message.
	if (!globalScope.CanvasRenderingContext2D) {
		console.warn("PlayingCardGraphics: CanvasRenderingContext2D not found. Card rendering features will be unavailable.");
		return;
	}

	// Constants for common card types and default values.
	const CardDefaults = Object.freeze({
		DEFAULT_CARD_HEIGHT: 200,
		DEFAULT_SUIT: 'h',
		DEFAULT_RANK: 'o',
		DEFAULT_FRONT_COLOR: '#BB5555',
		DEFAULT_BACK_COLOR: '#AA2222',
		DEFAULT_GRADIENT_START: '#fdf98b',
		DEFAULT_GRADIENT_END: '#e7bd4f',
		DEFAULT_JEWEL_COLOR: '#fff',
		CARD_RATIO_WIDTH_TO_HEIGHT: 0.75, // 3:4 ratio
		STANDARD_CARD_WIDTH_DIVISOR: 200, // Standard size for scaling
		JOKER_SUITS_RED: ['h', 'd'],
		JOKER_SUITS_BLACK: ['s', 'c']
	});

	// A comprehensive map of SVG path data for various card elements.
	// Standardized naming conventions for clarity.
	const cardGraphicPaths = {
		'a': 'M6,200V183H23L58,0H78L117,183H131V200H85V183H97L92,156H46L42,183H54V200H6zM88,135L68,37L49,135H88z',
		'2': 'M10,200L11,187C15,149,23,136,70,97C93,78,100,68,101,57C104,31,81,23,65,23C46,22,23,34,35,62L12,68C8,43,12,18,33,8C61,-6,96,-1,115,21C127,36,129,56,123,72C104,113,39,131,35,179H105V152H127V200L10,200z',
		'3': 'M2,156L18,145C31,167,47,181,70,178C104,176,119,140,112,113C105,89,76,77,53,90C47,93,43,96,41,96C39,96,33,85,34,82C50,59,87,21,87,21H28V47H6V0H120V16C120,16,90,48,80,64C104,65,125,81,132,105C136,118,135,148,129,160C119,182,94,199,71,200C33,202,12,176,2,156L2,156z',
		'4': 'M70,200L70,183L86,183L86,153L5,153L5,133L93,0L107,0L107,133L132,133L132,153L107,153L107,183L120,183L120,200zM86,49L30,133L86,133z',
		'5': 'M4,148L24,148C28,160,37,173,48,176C80,183,101,166,108,144C116,120,107,84,85,71C67,61,40,70,27,92L13,83L20,0H112V20H37L37,55C52,44,77,44,93,52C123,66,137,98,131,137C123,175,105,197,64,200C20,201,4,170,4,148L4,148z',
		'6': 'M8,139C6,122,6,78,8,65C15,26,30,7,55,2C81,-4,116,3,124,35L103,36C91,14,60,15,46,29C34,37,28,68,30,70C30,70,50,55,73,55C120,55,132,94,130,127C129,167,116,198,73,200C31,198,12,177,8,139zM110,128C111,101,98,80,73,77C50,76,26,99,27,127C29,155,40,179,69,179C101,179,110,147,110,128z',
		'7': 'M37,200C50,131,65,79,102,22H26V46H6V0H117L131,22C91,64,54,202,61,200H37z',
		'8': 'M2,142C3,115,13,105,32,90C17,79,10,63,12,50C15,17,41,0,69,0C98,1,123,24,125,48C127,69,120,79,105,90C123,105,135,115,135,141C134,168,111,199,71,200C31,201,1,168,2,142L2,142zM113,142C115,117,93,101,69,101C45,101,23,121,23,143C23,166,51,178,69,178C91,178,112,163,113,142L113,142zM105,55C106,34,87,20,67,21C50,21,31,34,31,51C31,72,52,83,70,83C86,84,105,71,105,55L105,55z',
		'9': 'MM11,161L30,156C37,174,52,180,67,178C94,176,102,146,104,120C94,131,78,137,64,136C21,134,10,100,10,65C9,35,21,13,43,3C55,-1,81,-1,92,4C118,18,128,42,126,98C126,144,117,198,66,200C36,204,14,181,11,161L11,161zM85,111C94,105,98,100,102,92C106,86,106,83,106,69C103,36,86,17,60,21C44,23,36,31,33,46C24,73,35,105,55,112C63,116,78,115,85,111L85,111z',
		'0': 'M6,200V0H26V200H6M85,0C66,0,50,17,50,39V162C50,183,66,200,85,200H96C115,200,130,183,130,162V39C130,17,115,0,96,0H85M90,19C102,19,110,28,110,38V163C110,174,102,183,90,183C79,183,70,174,70,163V38C70,28,79,19,90,19L90,19z', // 10
		'j': 'M68,0V21H88C88,21,89,41,89,84C89,126,90,146,88,158C81,185,40,185,32,166C27,155,28,146,28,134H6C6,134,6,140,6,147C6,178,17,193,41,198C65,204,95,194,105,174C111,162,111,161,111,89C111,41,111,21,111,21H130V0H68z',
		'q': 'M24,134L6,134L6,112L24,112C24,112,24,60,24,40C24,18,40,0,66,0C92,0,110,18,110,40C110,62,111,148,110,155C110,168,108,170,108,171C110,176,130,178,130,177L130,199C115,201,109,199,96,190C88,198,65,205,46,196C32,190,24,174,24,134zM81,174C73,162,58,145,44,140C44,156,46,165,51,171C59,181,71,183,81,174zM66,22C50,22,44,30,44,70C44,94,44,116,44,116C67,123,90,150,90,150L90,70C90,30,82,22,66,22z',
		'k': 'M76,180L96,180L64,106L40,142L40,180L56,180L56,200L0,200L0,180L20,180L20,20L0,20L0,0L56,0L56,20L40,20L40,100L92.0636,19.841L76,20L76,0L136,0L136,20L120,20L76,88L116,180L136,180L136,200L76,200z',
		'o': 'M141,0L181,0C168,55,161,150,129,183C91,219,15,198,21,141L60,137C58,157,62,166,81,166C102,165,110,143,115,118M6,378C6,306,53,256,119,256C197,256,213,346,187,398C164,438,130,458,88,459C39,458,7,422,6,378M47,377C49,406,67,425,93,425C168,423,182,292,115,290C69,294,47,338,47,377M0,714L42,518L84,518L66,601L159,518L215,518L124,595L191,714L144,714L94,621L55,654L42,714M8,973L50,777L200,777L193,809L85,809L75,854L180,854L173,887L68,887L56,940L173,940L166,973M43,1231L1,1231L44,1035L133,1035C170,1037,197,1051,198,1087C195,1127,169,1143,136,1148C158,1171,171,1206,182,1231L137,1231C116,1182,112,1150,60,1150M67,1121C96,1121,155,1126,156,1087C151,1061,100,1068,78,1068z', // Joker
		'h': 'M100,30C60,7,0,7,0,76C0,131,100,190,100,190C100,190,200,131,200,76C200,7,140,7,100,30z', // Hearts
		'd': 'M184,100C152,120,120,160,100,200C80,160,48,120,16,100C48,80,80,40,100,0C120,40,152,80,184,100z', // Diamonds
		's': 'M200,120C200,168,144,176,116,156C116,180,116,188,128,200C112,196,88,196,72,200C84,188,84,180,84,156C56,176,0,168,0,120C0,72,60,36,100,0C140,36,200,72,200,120z', // Spades
		'c': 'M80,200C92,184,92,160,92,136C76,180,0,176,0,124C0,80,40,76,68,88C80,92,80,88,72,84C44,64,40,0,100,0C160,0,156,64,128,84C120,88,120,92,132,88C160,76,200,80,200,124C200,176,124,180,108,136C108,160,108,184,120,200C100,196,100,196,80,200z', // Clubs
		'r': 'M44,60,C45,56,-3,33,0,70,C2,107,39,146,48,150,C57,154,12,107,12,77,C12,45,43,65,44,60,M37,65,C31,64,20,60,19,81,C19,100,63,158,65,149,C65,139,33,102,37,65,M86,56,C87,52,38,28,40,66,C43,103,69,141,78,148,C86,155,54,102,54,71,C54,39,86,60,86,56,M82,65,C77,64,59,54,59,74,C60,95,82,146,84,138,C86,132,78,102,82,65,M154,60,C153,56,203,33,200,70,C197,107,159,146,151,150,C142,154,187,107,187,77,C187,45,155,65,154,60,M161,65,C167,64,179,60,180,81,C181,100,137,158,135,149,C134,139,165,102,161,65,M113,56,C112,52,161,28,158,66,C155,103,130,141,122,148,C114,155,145,102,145,71,C145,39,114,60,113,56,M117,65,C123,64,141,54,141,74,C140,95,118,146,116,138,C114,132,121,102,117,65z' // Crown
	};

	/**
	 * Creates an offscreen canvas element with specified dimensions for card rendering.
	 * @param {number} desiredHeight - The target height of the canvas.
	 * @returns {HTMLCanvasElement} A new canvas element.
	 */
	const createCardCanvasElement = (desiredHeight) => {
		const canvasElem = document.createElement('canvas');
		canvasElem.height = desiredHeight;
		canvasElem.width = desiredHeight * CardDefaults.CARD_RATIO_WIDTH_TO_HEIGHT;
		return canvasElem;
	};

	/**
	 * Normalizes a given suit string to its single-character lowercase abbreviation.
	 * Defaults to 'h' (hearts) if an invalid or empty suit is provided.
	 * @param {string} inputSuit - The suit string (e.g., 'hearts', 'd', 'SpAdEs').
	 * @returns {string} Normalized suit character ('h', 'd', 's', 'c').
	 */
	const standardizeSuit = (inputSuit) => {
		const suitMap = {
			'h': 'h', 'hearts': 'h',
			'd': 'd', 'diamonds': 'd',
			's': 's', 'spades': 's',
			'c': 'c', 'clubs': 'c'
		};
		const lowerSuit = (inputSuit || CardDefaults.DEFAULT_SUIT).toLowerCase();
		return suitMap[lowerSuit] || suitMap[lowerSuit.charAt(0)] || CardDefaults.DEFAULT_SUIT;
	};

	/**
	 * Normalizes a given card rank/symbol string to its single-character lowercase abbreviation.
	 * Handles special cases like '10', 'JOKER', 'CROWN'. Defaults to 'o' (joker).
	 * @param {string|number} inputRank - The rank string or number (e.g., 'A', 7, 'Joker', '10').
	 * @returns {string} Normalized rank character (e.g., 'a', '2', 'j', 'o', 'r').
	 */
	const standardizeRank = (inputRank) => {
		let rankStr = String(inputRank || CardDefaults.DEFAULT_RANK).toLowerCase();

		// Handle multi-character ranks first
		if (rankStr === 'joker' || rankStr === 'o') return 'o';
		if (rankStr === 'crown' || rankStr === 'r') return 'r';
		if (rankStr === '10') return '0'; // '0' is used for 10 in graphic paths
		if (rankStr === 'nine' || rankStr === 'n') return 'n'; // If 'n' path is ever uncommented

		// For single-character ranks, just take the first char
		return rankStr.charAt(0);
	};

	/**
	 * Factory function to create coordinate and dimension scalers based on card height.
	 * This helps in abstracting the scaling logic across drawing functions.
	 * @param {number} drawX - The base X coordinate for the drawing operation.
	 * @param {number} drawY - The base Y coordinate for the drawing operation.
	 * @param {number} drawHeight - The height of the card for scaling.
	 * @returns {{scaleCoordX: function(number): number, scaleCoordY: function(number): number, scaleDimension: function(number): number}}
	 *          An object with three scaling functions.
	 */
	const createCoordinateScaler = (drawX, drawY, drawHeight) => {
		const scaleFactor = drawHeight / CardDefaults.STANDARD_CARD_WIDTH_DIVISOR;
		let currentRelativeX = 0;
		let currentRelativeY = 0;

		return {
			scaleCoordX: (val) => {
				currentRelativeX = drawX + val * scaleFactor;
				return currentRelativeX;
			},
			scaleCoordY: (val) => {
				currentRelativeY = drawY + val * scaleFactor;
				return currentRelativeY;
			},
			scaleDimension: (val) => val * scaleFactor,
			getCurrentRelativeX: () => currentRelativeX,
			getCurrentRelativeY: () => currentRelativeY
		};
	};

	/**
	 * Renders the front side of a playing card onto the canvas context.
	 * Includes the main suit symbol, rank, and corner indicators.
	 *
	 * @param {number} posX - The X coordinate of the top-left corner of the card.
	 * @param {number} posY - The Y coordinate of the top-left corner of the card.
	 * @param {number} cardDimension - The height of the card in pixels.
	 * @param {string} cardSuit - The suit of the card (e.g., 'h', 'd', 's', 'c').
	 * @param {string} cardRank - The rank of the card (e.g., 'A', 'K', 'Q', 'J', '10', '2', 'O').
	 */
	globalScope.CanvasRenderingContext2D.prototype.renderCardFace = function(posX, posY, cardDimension, cardSuit, cardRank) {
		const scaler = createCoordinateScaler(posX, posY, cardDimension);
		const { scaleCoordX, scaleCoordY, scaleDimension } = scaler;

		const normalizedSuit = standardizeSuit(cardSuit);
		const normalizedRank = standardizeRank(cardRank);

		// Draw the blank card background first
		this.renderBaseCardShape(scaleCoordX(0), scaleCoordY(0), scaleDimension(200));

		// Determine card color based on suit (red for hearts/diamonds, black for spades/clubs)
		this.fillStyle = (CardDefaults.JOKER_SUITS_RED.includes(normalizedSuit)) ? '#a22' : '#000';

		// Conditional rendering based on card size for detail level
		if (cardDimension >= 100) {
			if (normalizedRank !== 'o') { // Standard card (non-joker)
				this.fillGraphicElement(scaleCoordX(40), scaleCoordY(65), scaleDimension(70), normalizedSuit); // Main suit symbol
				this.fillGraphicElement(scaleCoordX(10), scaleCoordY(10), scaleDimension(40), normalizedRank); // Top-left rank
				this.fillGraphicElement(scaleCoordX(11), scaleCoordY(55), scaleDimension(25), normalizedSuit); // Top-left small suit
				this.fillGraphicElement(scaleCoordX(140), scaleCoordY(190), scaleDimension(-40), normalizedRank); // Bottom-right rank (rotated)
				this.fillGraphicElement(scaleCoordX(139), scaleCoordY(145), scaleDimension(-25), normalizedSuit); // Bottom-right small suit (rotated)
			} else { // Joker card
				this.fillGraphicElement(scaleCoordX(11), scaleCoordY(10), scaleDimension(18), 'o'); // Small joker symbol top
				this.fillGraphicElement(scaleCoordX(139), scaleCoordY(190), scaleDimension(-18), 'o'); // Small joker symbol bottom (rotated)

				// Render crown with appropriate colors for red/black jokers
				if (CardDefaults.JOKER_SUITS_RED.includes(normalizedSuit)) {
					this.renderJokerIcon(scaleCoordX(38), scaleCoordY(63), scaleDimension(74), '#b55', '#a22', null, true); // Shadow crown
					this.renderJokerIcon(scaleCoordX(40), scaleCoordY(65), scaleDimension(70), CardDefaults.DEFAULT_GRADIENT_START, CardDefaults.DEFAULT_GRADIENT_END, CardDefaults.DEFAULT_JEWEL_COLOR); // Main crown
				} else {
					this.renderJokerIcon(scaleCoordX(38), scaleCoordY(63), scaleDimension(74), '#000', '#000', null, true); // Shadow crown
					this.renderJokerIcon(scaleCoordX(40), scaleCoordY(65), scaleDimension(70), '#eee', '#888', '#333'); // Main crown
				}
			}
		} else { // Smaller card size, simplified rendering
			if (normalizedRank !== 'o') { // Standard card
				this.fillGraphicElement(scaleCoordX(30), scaleCoordY(75), scaleDimension(100), normalizedSuit); // Large suit symbol
				this.fillGraphicElement(scaleCoordX(15), scaleCoordY(15), scaleDimension(50), normalizedRank); // Top-left rank
			} else { // Joker card
				this.fillGraphicElement(scaleCoordX(11), scaleCoordY(10), scaleDimension(22), 'o'); // Small joker symbol
				// Render crown for smaller joker cards
				if (CardDefaults.JOKER_SUITS_RED.includes(normalizedSuit)) {
					this.renderJokerIcon(scaleCoordX(45), scaleCoordY(73), scaleDimension(89), '#b55', '#a22', null, true); // Shadow crown
					this.renderJokerIcon(scaleCoordX(47), scaleCoordY(75), scaleDimension(85), CardDefaults.DEFAULT_GRADIENT_START, CardDefaults.DEFAULT_GRADIENT_END, CardDefaults.DEFAULT_JEWEL_COLOR); // Main crown
				} else {
					this.renderJokerIcon(scaleCoordX(45), scaleCoordY(73), scaleDimension(89), '#000', '#000', null, true); // Shadow crown
					this.renderJokerIcon(scaleCoordX(47), scaleCoordY(75), scaleDimension(85), '#eee', '#888', '#333'); // Main crown
				}
			}
		}
	};

	/**
	 * Renders the back side of a playing card with a decorative pattern.
	 *
	 * @param {number} posX - The X coordinate of the top-left corner of the card.
	 * @param {number} posY - The Y coordinate of the top-left corner of the card.
	 * @param {number} cardDimension - The height of the card in pixels.
	 * @param {string} [primaryColor='#BB5555'] - The primary color for the pattern.
	 * @param {string} [secondaryColor='#AA2222'] - The secondary background color.
	 */
	globalScope.CanvasRenderingContext2D.prototype.renderCardReverse = function(posX, posY, cardDimension, primaryColor, secondaryColor) {
		const scaler = createCoordinateScaler(posX, posY, cardDimension);
		const { scaleCoordX, scaleCoordY, scaleDimension } = scaler;

		const currentPrimaryColor = primaryColor || CardDefaults.DEFAULT_FRONT_COLOR;
		const currentSecondaryColor = secondaryColor || CardDefaults.DEFAULT_BACK_COLOR;

		this.renderBaseCardShape(posX, posY, cardDimension);

		this.fillStyle = currentSecondaryColor;
		this.drawFilledRoundedRectangle(scaleCoordX(10), scaleCoordY(10), scaleDimension(130), scaleDimension(180), scaleDimension(8));
		this.strokeStyle = currentPrimaryColor;
		this.drawRoundedRectangleOutline(scaleCoordX(18), scaleCoordY(18), scaleDimension(114), scaleDimension(164), scaleDimension(4));
		this.fillStyle = currentPrimaryColor;
		this.drawFilledRoundedRectangle(scaleCoordX(26), scaleCoordY(26), scaleDimension(96), scaleDimension(148), scaleDimension(24), true); // Inward rounded rectangle

		// Decorative symbols on the card back
		this.fillGraphicElement(scaleCoordX(24), scaleCoordY(24), scaleDimension(20), 's'); // Top-left spade
		this.fillGraphicElement(scaleCoordX(106), scaleCoordY(24), scaleDimension(20), 's'); // Top-right spade
		this.fillGraphicElement(scaleCoordX(44), scaleCoordY(176), scaleDimension(-20), 's'); // Bottom-left spade (rotated)
		this.fillGraphicElement(scaleCoordX(126), scaleCoordY(176), scaleDimension(-20), 's'); // Bottom-right spade (rotated)

		this.fillStyle = currentSecondaryColor;
		this.drawFilledRoundedRectangle(scaleCoordX(50), scaleCoordY(40), scaleDimension(50), scaleDimension(120), scaleDimension(24));

		// Additional smaller spade outlines
		this.fillGraphicElement(scaleCoordX(32), scaleCoordY(54), scaleDimension(86), 's'); // Large central spade
		this.fillGraphicElement(scaleCoordX(30), scaleCoordY(60), scaleDimension(16), 's');
		this.fillGraphicElement(scaleCoordX(104), scaleCoordY(60), scaleDimension(16), 's');
		this.fillGraphicElement(scaleCoordX(30), scaleCoordY(128), scaleDimension(16), 's');
		this.fillGraphicElement(scaleCoordX(104), scaleCoordY(128), scaleDimension(16), 's');

		this.strokeGraphicElement(scaleCoordX(31), scaleCoordY(53), scaleDimension(88), 's'); // Outline for large central spade
		this.fillStyle = currentPrimaryColor;

		// Central club symbol
		this.fillGraphicElement(scaleCoordX(50), scaleCoordY(75), scaleDimension(50), 'c');
	};

	/**
	 * Generates the path for a rectangle with rounded corners. This is a path creation method, not a drawing method.
	 *
	 * @param {number} rectX - The X coordinate of the top-left corner of the rectangle.
	 * @param {number} rectY - The Y coordinate of the top-left corner of the rectangle.
	 * @param {number} rectWidth - The width of the rectangle.
	 * @param {number} rectHeight - The height of the rectangle.
	 * @param {number} cornerRadius - The radius of the rounded corners.
	 * @param {boolean} [inward=false] - If true, corners curve inward; otherwise, outward.
	 */
	globalScope.CanvasRenderingContext2D.prototype.generateRoundedRectanglePath = function(rectX, rectY, rectWidth, rectHeight, cornerRadius, inward = false) {
		const currentRadius = cornerRadius || 20; // Default radius
		const currentWidth = rectWidth || 200;
		const currentHeight = rectHeight || 200;

		this.beginPath();
		if (!inward) {
			this.moveTo(rectX + currentRadius, rectY);
			this.lineTo(rectX + currentWidth - currentRadius, rectY);
			this.arc(rectX + currentWidth - currentRadius, rectY + currentRadius, currentRadius, (Math.PI / 180) * 270, 0);
			this.lineTo(rectX + currentWidth, rectY + currentHeight - currentRadius);
			this.arc(rectX + currentWidth - currentRadius, rectY + currentHeight - currentRadius, currentRadius, 0, (Math.PI / 2));
			this.lineTo(rectX + currentRadius, rectY + currentHeight);
			this.arc(rectX + currentRadius, rectY + currentHeight - currentRadius, currentRadius, (Math.PI / 2), Math.PI);
			this.lineTo(rectX, rectY + currentRadius);
			this.arc(rectX + currentRadius, rectY + currentRadius, currentRadius, Math.PI, (Math.PI / 180) * 270);
		} else {
			this.moveTo(rectX, rectY + currentRadius);
			this.lineTo(rectX, rectY + currentHeight - currentRadius);
			this.arc(rectX, rectY + currentHeight, currentRadius, (Math.PI / 180) * 270, 0);
			this.lineTo(rectX + currentWidth - currentRadius, rectY + currentHeight);
			this.arc(rectX + currentWidth, rectY + currentHeight, currentRadius, Math.PI, (Math.PI / 180) * 270);
			this.lineTo(rectX + currentWidth, rectY + radius);
			this.arc(rectX + currentWidth, rectY, currentRadius, Math.PI / 2, Math.PI);
			this.lineTo(rectX + currentRadius, rectY);
			this.arc(rectX, rectY, currentRadius, 0, Math.PI / 2);
		}
		this.closePath();
	};

	/**
	 * Draws the outline of a rounded rectangle.
	 *
	 * @param {number} rectX - The X coordinate of the top-left corner.
	 * @param {number} rectY - The Y coordinate of the top-left corner.
	 * @param {number} rectWidth - The width of the rectangle.
	 * @param {number} rectHeight - The height of the rectangle.
	 * @param {number} cornerRadius - The radius of the rounded corners.
	 * @param {boolean} [inward=false] - If true, corners curve inward; otherwise, outward.
	 */
	globalScope.CanvasRenderingContext2D.prototype.drawRoundedRectangleOutline = function(rectX, rectY, rectWidth, rectHeight, cornerRadius, inward = false) {
		// Adjust coordinates for crisp 1px stroke (aligns to pixel grid)
		this.generateRoundedRectanglePath(rectX + 0.5, rectY + 0.5, rectWidth - 1, rectHeight - 1, cornerRadius, inward);
		this.stroke();
	};

	/**
	 * Fills a rounded rectangle with the current fill style.
	 *
	 * @param {number} rectX - The X coordinate of the top-left corner.
	 * @param {number} rectY - The Y coordinate of the top-left corner.
	 * @param {number} rectWidth - The width of the rectangle.
	 * @param {number} rectHeight - The height of the rectangle.
	 * @param {number} cornerRadius - The radius of the rounded corners.
	 * @param {boolean} [inward=false] - If true, corners curve inward; otherwise, outward.
	 */
	globalScope.CanvasRenderingContext2D.prototype.drawFilledRoundedRectangle = function(rectX, rectY, rectWidth, rectHeight, cornerRadius, inward = false) {
		this.generateRoundedRectanglePath(rectX, rectY, rectWidth, rectHeight, cornerRadius, inward);
		this.fill();
	};

	/**
	 * Interprets and draws an SVG path string onto the canvas.
	 * Scales the path data according to the provided size and offset.
	 *
	 * @param {number} offsetX - The X offset for drawing the SVG path.
	 * @param {number} offsetY - The Y offset for drawing the SVG path.
	 * @param {number} pathSize - The scaling factor for the SVG path.
	 * @param {string} svgPathData - The 'd' attribute value from an SVG path element.
	 */
	globalScope.CanvasRenderingContext2D.prototype.interpretSvgPathData = function(offsetX, offsetY, pathSize, svgPathData) {
		const scaler = createCoordinateScaler(offsetX, offsetY, pathSize);
		const { scaleCoordX, scaleCoordY, getCurrentRelativeX, getCurrentRelativeY } = scaler;

		// Regex to split SVG path commands and their arguments
		const pathSegments = svgPathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];

		this.beginPath();
		for (const segment of pathSegments) {
			const command = segment.charAt(0);
			const params = segment.substring(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);

			// Helper to get absolute coordinates, handling relative commands
			const getAbsoluteCoords = (paramIndex) => {
				const x = command === command.toLowerCase() ? getCurrentRelativeX() + params[paramIndex] : params[paramIndex];
				const y = command === command.toLowerCase() ? getCurrentRelativeY() + params[paramIndex + 1] : params[paramIndex + 1];
				return [scaleCoordX(x), scaleCoordY(y)];
			};

			switch (command.toUpperCase()) {
				case 'M': // MoveTo
					this.moveTo(scaleCoordX(params[0]), scaleCoordY(params[1]));
					break;
				case 'L': // LineTo
					this.lineTo(scaleCoordX(params[0]), scaleCoordY(params[1]));
					break;
				case 'H': // Horizontal LineTo
					this.lineTo(scaleCoordX(params[0]), getCurrentRelativeY());
					break;
				case 'V': // Vertical LineTo
					this.lineTo(getCurrentRelativeX(), scaleCoordY(params[0]));
					break;
				case 'C': // Bezier CurveTo
					this.bezierCurveTo(scaleCoordX(params[0]), scaleCoordY(params[1]),
									   scaleCoordX(params[2]), scaleCoordY(params[3]),
									   scaleCoordX(params[4]), scaleCoordY(params[5]));
					break;
				case 'Q': // Quadratic CurveTo
					this.quadraticCurveTo(scaleCoordX(params[0]), scaleCoordY(params[1]),
										  scaleCoordX(params[2]), scaleCoordY(params[3]));
					break;
				case 'Z': // ClosePath
					this.closePath();
					break;
				default:
					console.warn(`PlayingCardGraphics: Unsupported SVG path command '${command}' encountered.`);
			}
		}
		this.closePath(); // Ensure path is closed even if 'Z' is missing
	};

	/**
	 * Draws a specific card graphic element (suit, rank, joker, crown) using its SVG path data.
	 *
	 * @param {number} posX - The X coordinate for placing the graphic.
	 * @param {number} posY - The Y coordinate for placing the graphic.
	 * @param {number} graphicSize - The size (height) for scaling the graphic.
	 * @param {string} graphicIdentifier - The key identifying the graphic in `cardGraphicPaths`.
	 */
	globalScope.CanvasRenderingContext2D.prototype.drawGraphicElement = function(posX, posY, graphicSize, graphicIdentifier) {
		const normalizedId = standardizeRank(graphicIdentifier); // Using standardizeRank as it handles all symbol types
		const pathData = cardGraphicPaths[normalizedId];

		if (pathData) {
			this.interpretSvgPathData(posX, posY, graphicSize, pathData);
		} else {
			console.warn(`PlayingCardGraphics: No SVG path data found for graphic identifier '${graphicIdentifier}' (normalized to '${normalizedId}').`);
		}
	};

	/**
	 * Strokes the outline of a specific card graphic element.
	 *
	 * @param {number} posX - The X coordinate for placing the graphic.
	 * @param {number} posY - The Y coordinate for placing the graphic.
	 * @param {number} graphicSize - The size (height) for scaling the graphic.
	 * @param {string} graphicIdentifier - The key identifying the graphic.
	 */
	globalScope.CanvasRenderingContext2D.prototype.strokeGraphicElement = function(posX, posY, graphicSize, graphicIdentifier) {
		// Offset by 0.5px and reduce size by 1px for crisp 1px stroke
		this.drawGraphicElement(posX + 0.5, posY + 0.5, graphicSize - 1, graphicIdentifier);
		this.stroke();
	};

	/**
	 * Fills a specific card graphic element with the current fill style.
	 *
	 * @param {number} posX - The X coordinate for placing the graphic.
	 * @param {number} posY - The Y coordinate for placing the graphic.
	 * @param {number} graphicSize - The size (height) for scaling the graphic.
	 * @param {string} graphicIdentifier - The key identifying the graphic.
	 */
	globalScope.CanvasRenderingContext2D.prototype.fillGraphicElement = function(posX, posY, graphicSize, graphicIdentifier) {
		this.drawGraphicElement(posX, posY, graphicSize, graphicIdentifier);
		this.fill();
	};

	/**
	 * Renders the crown icon, typically used for Joker cards.
	 *
	 * @param {number} posX - The X coordinate for the crown's top-left corner.
	 * @param {number} posY - The Y coordinate for the crown's top-left corner.
	 * @param {number} crownDimension - The height of the crown graphic.
	 * @param {string} [gradientStart='#FDF98B'] - Start color for the crown's gradient fill.
	 * @param {string} [gradientEnd='#E7BD4F'] - End color for the crown's gradient fill.
	 * @param {string} [jewelColor='#FFFFFF'] - Color for the crown's jewels.
	 * @param {boolean} [isShadow=false] - If true, renders a simplified, solid color version for shadow effects.
	 */
	globalScope.CanvasRenderingContext2D.prototype.renderJokerIcon = function(posX, posY, crownDimension, gradientStart, gradientEnd, jewelColor, isShadow = false) {
		const scaler = createCoordinateScaler(posX, posY, crownDimension);
		const { scaleCoordX, scaleCoordY, scaleDimension } = scaler;

		const currentGradientStart = gradientStart || CardDefaults.DEFAULT_GRADIENT_START;
		const currentGradientEnd = gradientEnd || CardDefaults.DEFAULT_GRADIENT_END;
		const currentJewelColor = jewelColor || CardDefaults.DEFAULT_JEWEL_COLOR;

		// Create a linear gradient for the crown's body
		const crownGradient = this.createLinearGradient(scaleCoordX(5), scaleCoordY(5), scaleCoordX(100), scaleCoordY(200));
		crownGradient.addColorStop(0, currentGradientStart);
		crownGradient.addColorStop(1, currentGradientEnd);

		this.fillStyle = isShadow ? currentGradientEnd : crownGradient; // Use end color for shadow, gradient for main crown
		this.fillGraphicElement(scaleCoordX(0), scaleCoordY(0), scaleDimension(200), 'r'); // Main crown shape

		// Central vertical element of the crown
		this.drawFilledRoundedRectangle(scaleCoordX(88), scaleCoordY(42), scaleDimension(23), scaleDimension(110), scaleDimension(12));
		this.fillGraphicElement(scaleCoordX(86), scaleCoordY(18), scaleDimension(27), 's'); // Top spade on crown

		// Base band of the crown
		this.drawFilledRoundedRectangle(scaleCoordX(40), scaleCoordY(150), scaleDimension(120), scaleDimension(24), scaleDimension(10));

		if (!isShadow) { // Only draw jewels for the main crown, not the shadow
			this.fillStyle = currentJewelColor;
			const jewelPositions = [
				{ x: 92, y: 26, size: 15, shape: 'd' }, // Top diamond
				{ x: 93, y: 60, size: 13, shape: 'h' },
				{ x: 93, y: 80, size: 13, shape: 'h' },
				{ x: 93, y: 100, size: 13, shape: 'h' },
				{ x: 93, y: 120, size: 13, shape: 'h' },
				{ x: 93, y: 155, size: 13, shape: 'h' },
				{ x: 73, y: 155, size: 13, shape: 'h' },
				{ x: 53, y: 155, size: 13, shape: 'h' },
				{ x: 113, y: 155, size: 13, shape: 'h' },
				{ x: 133, y: 155, size: 13, shape: 'h' }
			];
			jewelPositions.forEach(jewel => {
				this.fillGraphicElement(scaleCoordX(jewel.x), scaleCoordY(jewel.y), scaleDimension(jewel.size), jewel.shape);
			});
		}
	};

	/**
	 * Draws the basic blank card shape with a white-to-grey gradient background and a subtle border.
	 *
	 * @param {number} posX - The X coordinate of the top-left corner of the card.
	 * @param {number} posY - The Y coordinate of the top-left corner of the card.
	 * @param {number} cardDimension - The height of the card in pixels.
	 */
	globalScope.CanvasRenderingContext2D.prototype.renderBaseCardShape = function(posX, posY, cardDimension) {
		const scaler = createCoordinateScaler(posX, posY, cardDimension);
		const { scaleCoordX, scaleCoordY, scaleDimension } = scaler;

		// Create a subtle gradient for the card background
		const cardBackgroundGradient = this.createLinearGradient(scaleCoordX(5), scaleCoordY(5), scaleCoordX(55), scaleCoordY(200));
		cardBackgroundGradient.addColorStop(0, '#fff');
		cardBackgroundGradient.addColorStop(1, '#e0e0e0');

		this.fillStyle = cardBackgroundGradient;
		this.drawFilledRoundedRectangle(scaleCoordX(0), scaleCoordY(0), scaleDimension(150), scaleDimension(200), scaleDimension(16));
		this.strokeStyle = '#666'; // A light grey border
		this.drawRoundedRectangleOutline(scaleCoordX(0), scaleCoordY(0), scaleDimension(150), scaleDimension(200), scaleDimension(16));
	};

	// --- Public API for Card Rendering ---

	globalScope.PlayingCardUtility = {
		/**
		 * Creates an HTML `<img>` element displaying the front face of a card.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card image in pixels.
		 * @param {string} [cardSuit='h'] - The suit of the card (e.g., 'h', 'd', 's', 'c').
		 * @param {string} [cardRank='o'] - The rank of the card (e.g., 'A', 'K', 'J', '10', 'O').
		 * @returns {HTMLImageElement} An image element containing the card face.
		 */
		getCardFaceAsImage: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, cardSuit = CardDefaults.DEFAULT_SUIT, cardRank = CardDefaults.DEFAULT_RANK) {
			const imageElement = document.createElement('img');
			imageElement.src = this.getCardFaceDataURL(cardHeight, cardSuit, cardRank);
			return imageElement;
		},

		/**
		 * Creates an HTML `<img>` element displaying the back face of a card.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card image in pixels.
		 * @param {string} [primaryColor='#BB5555'] - The primary color for the card back pattern.
		 * @param {string} [secondaryColor='#AA2222'] - The background color for the card back.
		 * @returns {HTMLImageElement} An image element containing the card back.
		 */
		getCardBackAsImage: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, primaryColor = CardDefaults.DEFAULT_FRONT_COLOR, secondaryColor = CardDefaults.DEFAULT_BACK_COLOR) {
			const imageElement = document.createElement('img');
			imageElement.src = this.getCardBackDataURL(cardHeight, primaryColor, secondaryColor);
			return imageElement;
		},

		/**
		 * Generates an HTML `Canvas` element with the front face of a card rendered on it.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card canvas in pixels.
		 * @param {string} [cardSuit='h'] - The suit of the card.
		 * @param {string} [cardRank='o'] - The rank of the card.
		 * @returns {HTMLCanvasElement} A canvas element with the card face drawn.
		 */
		getCardFaceAsCanvas: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, cardSuit = CardDefaults.DEFAULT_SUIT, cardRank = CardDefaults.DEFAULT_RANK) {
			const canvas = createCardCanvasElement(cardHeight);
			const ctx = canvas.getContext('2d');
			ctx.renderCardFace(0, 0, cardHeight, cardSuit, cardRank);
			return canvas;
		},

		/**
		 * Generates an HTML `Canvas` element with the back face of a card rendered on it.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card canvas in pixels.
		 * @param {string} [primaryColor='#BB5555'] - The primary color for the card back pattern.
		 * @param {string} [secondaryColor='#AA2222'] - The background color for the card back.
		 * @returns {HTMLCanvasElement} A canvas element with the card back drawn.
		 */
		getCardBackAsCanvas: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, primaryColor = CardDefaults.DEFAULT_FRONT_COLOR, secondaryColor = CardDefaults.DEFAULT_BACK_COLOR) {
			const canvas = createCardCanvasElement(cardHeight);
			const ctx = canvas.getContext('2d');
			ctx.renderCardReverse(0, 0, cardHeight, primaryColor, secondaryColor);
			return canvas;
		},

		/**
		 * Retrieves the data URL (base64 encoded image) of a card's front face.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card.
		 * @param {string} [cardSuit='h'] - The suit of the card.
		 * @param {string} [cardRank='o'] - The rank of the card.
		 * @returns {string} The data URL of the card face image.
		 */
		getCardFaceDataURL: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, cardSuit = CardDefaults.DEFAULT_SUIT, cardRank = CardDefaults.DEFAULT_RANK) {
			const canvas = this.getCardFaceAsCanvas(cardHeight, cardSuit, cardRank);
			return canvas.toDataURL();
		},

		/**
		 * Retrieves the data URL (base64 encoded image) of a card's back face.
		 *
		 * @param {number} [cardHeight=200] - The desired height of the card.
		 * @param {string} [primaryColor='#BB5555'] - The primary color for the card back pattern.
		 * @param {string} [secondaryColor='#AA2222'] - The background color for the card back.
		 * @returns {string} The data URL of the card back image.
		 */
		getCardBackDataURL: function(cardHeight = CardDefaults.DEFAULT_CARD_HEIGHT, primaryColor = CardDefaults.DEFAULT_FRONT_COLOR, secondaryColor = CardDefaults.DEFAULT_BACK_COLOR) {
			const canvas = this.getCardBackAsCanvas(cardHeight, primaryColor, secondaryColor);
			return canvas.toDataURL();
		}
	};

})(window);