/*
 * Copyright 2009-2010 Hugo Camboulive <hugo DOT camboulive AT gmail DOT com>
 * Licensed under a BSD license
 */

/*
 * Note on rendering text across multiple lines within a graphical context:
 * It's rather inconvenient that the standard canvas API lacks native
 * multi-line text functions. This current implementation assumes text
 * character widths are uniformly distributed. A phrase like "ALPHA BRAVO"
 * when split might present layout challenges. A future refactor is needed,
 * but it's not a top priority right now.
 */
/*
 * This utility function determines the minimum number of lines required to
 * display a given string without exceeding a specified maximum pixel width.
 * While most accurate for monospaced fonts, it provides a reasonable estimate
 * for general use cases. Consider adding a small margin for safety.
 */
CanvasRenderingContext2D.prototype.calculateTextLineCount = function(inputText, maximumPixelWidth) {
	let totalPixelWidth = this.measureText(inputText).width;
	if (totalPixelWidth < maximumPixelWidth) {
		return 1;
	}
	return inputText.divideIntoLines(parseInt(maximumPixelWidth * inputText.length / totalPixelWidth))[0];
};

/*
 * This function renders text onto the canvas, automatically wrapping it
 * into multiple lines to fit within a given maximum width. It's primarily
 * designed for monospaced fonts but offers sufficient accuracy for typical
 * scenarios. A slight padding is recommended.
 */
CanvasRenderingContext2D.prototype.drawWrappedText = function(sourceText, startX, startY, maxTextWidth, lineSpacing) {
	lineSpacing = lineSpacing || 12; // Default vertical space between lines is 12 pixels
	let measuredWidth = this.measureText(sourceText).width;
	let textParts = sourceText.divideIntoLines(parseInt(maxTextWidth * sourceText.length / measuredWidth))[1];
	let lineFragments = textParts.split("\n");
	for (let currentLineIndex = 0; currentLineIndex < lineFragments.length; currentLineIndex++) {
		startY += lineSpacing;
		this.fillText(lineFragments[currentLineIndex], startX, startY);
	}
};

/*
 * Text Line Segmentation Function
 * Copyright Stephen Chapman, 19th April 2006
 * You are free to copy and use this code, but please retain the original copyright notice.
 */
String.prototype.divideIntoLines = function(segmentLength) {
	let outputBuffer = '';
	let remainingString = this;
	let numberOfLines = 1;
	while (remainingString.length > segmentLength) {
		let currentSegment = remainingString.substring(0, segmentLength);
		let lastSpacePos = currentSegment.lastIndexOf(' ');
		let lastNewlinePos = currentSegment.lastIndexOf('\n');
		if (lastNewlinePos !== -1) {
			lastSpacePos = lastNewlinePos;
		}
		if (lastSpacePos === -1) {
			lastSpacePos = segmentLength;
		}
		outputBuffer += currentSegment.substring(0, lastSpacePos) + '\n';
		numberOfLines += 1;
		remainingString = remainingString.substring(lastSpacePos + 1);
	}
	return [numberOfLines, outputBuffer + remainingString];
};

/*
 * Constructor for the graphical network visualization. Requires
 * the ID of the HTML canvas element.
 */
GraphDisplay = function(displayElementId, visualWidth, visualHeight, labelColumnWidth, metadata, commitData) {
	this.displaySurface = $(`#${displayElementId}`).get(0); // Using jQuery to get the DOM element
	this.visualHeight = visualHeight || 600;
	this.visualWidth = visualWidth || 920;
	this.displaySurface.width = this.visualWidth;
	this.displaySurface.height = this.visualHeight;

	this.labelColumnWidth = labelColumnWidth || 100;
	/* Additional configuration members */
	this.horizontalShift = this.labelColumnWidth; /* The left column displaying names is 100 pixels wide */
	this.verticalShift = 40; /* The two timeline bars at the top occupy 40 pixels */

	this.interactivePoints = []; /* Stores data points available for hover interaction */
	this.userPortraits = {}; /* Caches images loaded from Gravatar services */

	this.renderTags = true;

	this.maxXExtent = -this.visualWidth + (this.horizontalShift * 2);
	/* The +100 acts as a buffer in case we need to render HEAD indicators */
	this.maxYExtent = -this.visualHeight + (this.verticalShift * 2) + 100;
	this.isLoading = false;
	/* These colors are cycled through when drawing commit branches; more will be added later */
	this.flowPathColors = ["#000000", "#FF0000", "#0000FF", "#7CFC00", "#FF00FF", "#FFFF00", "#FFA500", "#00FFFF", "#FF69B4", "#CD853F"];
	this.spaceAllocatedUsers = [];

	/* Initialize the mouse event handler */
	this.pointerHandler = new GraphDisplay.PointerController(this);
	this.pointerHandler.initialize();
	/* Initialize the keyboard input handler */
	this.keyHandler = new GraphDisplay.KeyInputController(this);
	this.keyHandler.initialize();

	/* Initialize the data loading and management component */
	this.contentManager = new GraphDisplay.ContentManager(this);
	this.contentManager.initialize(metadata, commitData);
};

GraphDisplay.prototype = {
	/* The primary rendering method. It obtains the 2D rendering context
	 * from the canvas and draws all visual elements. This method is
	 * invoked whenever the graphical display needs an update. */
	renderCanvas: function() {
		/* If the underlying data hasn't been loaded yet, defer drawing */
		if (!this.contentManager.metadata)
			return;
		if (!this.contentManager.commitData)
			return;

		/* Retrieve the 2D rendering context from the canvas element */
		if (this.displaySurface.getContext) {
			var renderContext = this.displaySurface.getContext('2d');
			renderContext.font = "12px sans-serif"; // Changed font size for variety
			this.renderBackgroundBlocks(renderContext);
			/* Draw the individual data points and connecting lines */
			this.renderCommitData(renderContext);
			/* Draw the user names in the left-hand column */
			this.renderUserLabels(renderContext);
			/* Draw the monthly timeline bar */
			this.renderMonthlyBar(renderContext);
			/* Draw the daily timeline bar */
			this.renderDailyBar(renderContext);
			/* Populate the months and days within the two timeline bars */
			this.renderTimeMarkers(renderContext);
			/* Obscure the initial 100 pixels of the timeline bars */
			renderContext.fillStyle = "darkslategray"; // Changed color
			renderContext.fillRect(0, 0, this.labelColumnWidth, 20);
			renderContext.fillStyle = "rgb(80,80,80)"; // Changed color
			renderContext.fillRect(0, 20, this.labelColumnWidth, 20);
			if (this.highlightedPoint)
				this.renderTooltip(renderContext, this.highlightedPoint);
		}
	},
	/* Renders a 'tooltip' when a data point is hovered by the mouse.
	 * This typically involves a rounded rectangular box containing
	 * a user's Gravatar image, name, commit hash, and message. */
	renderTooltip: function(renderContext, tooltipInfo) {
		let posX = (this.labelColumnWidth * 2) + (20 * tooltipInfo.timeIndex) - this.horizontalShift + 10;
		let posY = 80 + 20 * tooltipInfo.spaceIndex - this.verticalShift - 10;
		/* Calculate the necessary height for the tooltip box */
		renderContext.font = "12px sans-serif"; // Changed font
		renderContext.fillStyle = "black";
		let textLineCount = renderContext.calculateTextLineCount(tooltipInfo.commitMessage, 400 - 30); // Adjusted padding
		let maxHeight = 70 + textLineCount * 15 + 5;
		/* Adjust the tooltip's horizontal position if it goes off-screen */
		if (posX + 10 + 400 > this.visualWidth) {
			posX = this.visualWidth - 400 - 10;
		} else if (posX + 10 < this.labelColumnWidth) {
			posX = this.labelColumnWidth + 10;
		} else {
			posX += 10;
		}
		/* Adjust the tooltip's vertical position if it goes off-screen */
		if (posY + 10 + maxHeight > this.visualHeight) {
			/* Not enough vertical room below the point */
			posY = Math.max(40, posY - 10 - maxHeight);
		} else if (posY < 40) {
			posY = 40 + 10;
		} else {
			posY += 10;
		}
		/* Draw the rounded rectangle shape */
		renderContext.beginPath();
		renderContext.strokeStyle = "#333333"; // Changed color
		renderContext.fillStyle = "#F0F0F0"; // Changed color
		renderContext.lineWidth = "2.5"; // Changed line width
		renderContext.moveTo(posX, posY + 5);
		renderContext.quadraticCurveTo(posX, posY, posX + 5, posY);
		renderContext.lineTo(posX + 400 - 5, posY);
		renderContext.quadraticCurveTo(posX + 400, posY, posX + 400, posY + 5);
		renderContext.lineTo(posX + 400, posY + maxHeight - 5);
		renderContext.quadraticCurveTo(posX + 400, posY + maxHeight, posX + 395, posY + maxHeight);
		renderContext.lineTo(posX + 5, posY + maxHeight);
		renderContext.quadraticCurveTo(posX, posY + maxHeight, posX, posY + maxHeight - 5);
		renderContext.lineTo(posX, posY + 5);
		renderContext.fill();
		renderContext.stroke();
		/* Pre-load the user portrait if it's not already in cache */
		if (!this.userPortraits[tooltipInfo.gravatarID]) {
			this.userPortraits[tooltipInfo.gravatarID] = new Image();
			this.userPortraits[tooltipInfo.gravatarID].src = "https://www.gravatar.com/avatar/" + tooltipInfo.gravatarID + "?s=32"; // Changed protocol
			let selfRef = this;
			this.userPortraits[tooltipInfo.gravatarID].onload = function() {
				if (tooltipInfo === selfRef.highlightedPoint)
					renderContext.drawImage(selfRef.userPortraits[tooltipInfo.gravatarID], posX + 15, posY + 15);
			};
		} else {
			renderContext.drawImage(this.userPortraits[tooltipInfo.gravatarID], posX + 15, posY + 15);
		}
		/* Display the author's name */
		renderContext.fillStyle = "#000000"; // Changed color
		renderContext.font = "14px sans-serif"; // Changed font
		renderContext.fillText(tooltipInfo.authorName, posX + 15 + 32 + 15, posY + 35);
		/* Display the commit identifier hash */
		renderContext.font = "10px sans-serif"; // Changed font
		renderContext.fillStyle = "lightslategrey"; // Changed color
		renderContext.fillText(tooltipInfo.idHash, posX + 15, posY + 65);
		/* Display the commit message, wrapped across multiple lines */
		renderContext.font = "10px sans-serif"; // Changed font
		renderContext.fillStyle = "#000000"; // Changed color
		renderContext.drawWrappedText(tooltipInfo.commitMessage, posX + 15, posY + 70, 400 - 30); // Adjusted padding
	},
	/* Renders the top-most monthly timeline bar with a dark background */
	renderMonthlyBar: function(renderContext) {
		renderContext.fillStyle = "darkblue"; // Changed color
		renderContext.fillRect(0, 0, this.visualWidth, 20);
	},
	/* Renders the daily timeline bar, positioned directly below the monthly bar */
	renderDailyBar: function(renderContext) {
		renderContext.fillStyle = "rgb(70,70,70)"; // Changed color
		renderContext.fillRect(0, 20, this.visualWidth, 20);
	},
	/* Renders an individual name block within the left-hand display area */
	renderNamePanel: function(renderContext, blockIndex) {
		let shadeArray = ["#EBEBFF", "#E0E0FF"]; // Changed colors
		let currentItem = this.contentManager.metadata.blocks[blockIndex];
		let startYPos = 80 + currentItem.startPosition * 20;
		let endYPos = startYPos + currentItem.itemCount * 20;

		if ((startYPos - this.verticalShift >= 40 && startYPos - this.verticalShift <= this.visualHeight) ||
			(endYPos - this.verticalShift >= 40 && endYPos - this.verticalShift <= this.visualHeight)) {
			/* Render the background fill */
			if (this.pointerHandler.lastClickPosition.y > startYPos - this.verticalShift &&
				this.pointerHandler.lastClickPosition.y <= endYPos - this.verticalShift &&
				this.pointerHandler.lastClickPosition.x <= this.labelColumnWidth) {
				/* If currently hovered */
				renderContext.fillStyle = "#DEDEDF"; // Changed color
				renderContext.fillRect(0, startYPos - this.verticalShift, this.labelColumnWidth, currentItem.itemCount * 20);
			} else if (blockIndex % 2 === 1) {
				/* For odd-numbered rows */
				renderContext.fillStyle = "#E0E0FF"; // Changed color
				renderContext.fillRect(0, startYPos - this.verticalShift, this.labelColumnWidth, currentItem.itemCount * 20);
			}
			/* Render the border lines */
			renderContext.strokeStyle = "#DDDDDD"; // Changed color
			renderContext.lineWidth = "1.0"; // Changed line width
			renderContext.beginPath();
			renderContext.moveTo(this.labelColumnWidth, startYPos - this.verticalShift + 0.5);
			renderContext.lineTo(0.5, startYPos - this.verticalShift + 0.5);
			renderContext.lineTo(0.5, endYPos - this.verticalShift + 0.5);
			renderContext.lineTo(this.labelColumnWidth, endYPos - this.verticalShift + 0.5);
			renderContext.stroke();
			/* Render the name text */
			renderContext.fillStyle = "#000000"; // Changed color
			renderContext.fillText(currentItem.userName, 5, (startYPos + endYPos) / 2 - this.verticalShift + 5, this.labelColumnWidth - 10);
		}
	},
	/* Renders the user names associated with each repository in the left-hand column */
	renderUserLabels: function(renderContext) {
		renderContext.save();
		renderContext.fillStyle = "#F0F0FF"; // Changed color
		renderContext.fillRect(0, 40, this.labelColumnWidth, this.visualHeight - 40);
		for (let idx = 0; idx < this.contentManager.metadata.blocks.length; idx++) {
			this.renderNamePanel(renderContext, idx);
		}
		renderContext.restore();
	},
	/* Renders the background blocks to the right of each name in the main display area */
	renderBackgroundBlocks: function(renderContext) {
		let shadeArray = ["#F5F5FF", "#F0F0FF"]; // Changed colors
		let currentY = 80;
		renderContext.save();
		renderContext.fillStyle = shadeArray[0];
		renderContext.fillRect(this.labelColumnWidth, 40, this.visualWidth - this.labelColumnWidth, this.visualHeight - 40);
		for (let idx = 0; idx < this.contentManager.metadata.blocks.length; idx++) {
			let currentItem = this.contentManager.metadata.blocks[idx];
			let destinationY = currentY + currentItem.itemCount * 20;
			if ((currentY - this.verticalShift >= 40 && currentY - this.verticalShift <= this.visualHeight) ||
				(destinationY - this.verticalShift >= 40 && destinationY - this.verticalShift <= this.visualHeight)) {
				if (idx % 2 === 1) {
					renderContext.fillStyle = shadeArray[1];
					renderContext.fillRect(this.labelColumnWidth, currentY - this.verticalShift, this.visualWidth - this.labelColumnWidth, currentItem.itemCount * 20);
				}
				renderContext.lineWidth = "1.0"; // Changed line width
				renderContext.strokeStyle = "#DCDCDC"; // Changed color
				renderContext.strokeRect(0.5, currentY - this.verticalShift + 0.5, this.visualWidth - 0.5, currentItem.itemCount * 20);
			}
			currentY += currentItem.itemCount * 20;
		}
		renderContext.restore();
	},
	/* Renders the date information within the two timeline bars at the top of the canvas.
	 * (Months in the upper bar, days in the lower bar) */
	renderTimeMarkers: function(renderContext) {
		/* A mapping to convert month numbers into three-character abbreviations */
		let monthMap = {
			"01": "Jan",
			"02": "Feb",
			"03": "Mar",
			"04": "Apr",
			"05": "May",
			"06": "Jun",
			"07": "Jul",
			"08": "Aug",
			"09": "Sep",
			"10": "Oct",
			"11": "Nov",
			"12": "Dec"
		};
		let previousDate;
		let currentDate;
		let minIndex = parseInt((this.horizontalShift - this.labelColumnWidth) / 20);
		if (minIndex <= 0)
			previousDate = [1970, 1, 1];
		else
			previousDate = this.contentManager.metadata.dates[minIndex - 1].split("-");

		for (let idx = parseInt((this.horizontalShift - this.labelColumnWidth) / 20); idx <= parseInt((this.horizontalShift - this.labelColumnWidth + this.visualWidth) / 20); idx++) {
			let currentItem = this.contentManager.metadata.dates[idx];
			if (!currentItem)
				continue;
			currentDate = currentItem.split("-");
			let posX = (2 * this.labelColumnWidth) + 20 * idx - this.horizontalShift;
			/* Check if a new month needs to be displayed */
			if (currentDate[0] !== previousDate[0] || currentDate[1] !== previousDate[1]) {
				renderContext.fillStyle = "cornsilk"; // Changed color
				renderContext.fillText(monthMap[currentDate[1]], posX, 15);
			}
			/* Check if a new day needs to be displayed */
			if (currentDate[0] !== previousDate[0] || currentDate[1] !== previousDate[1] || currentDate[2] !== previousDate[2]) {
				renderContext.fillStyle = "rgb(200,200,200)"; // Changed color
				renderContext.fillText(currentDate[2], posX, 35);
			}
			previousDate = currentDate;
		}
	},
	/* Renders a small branch head tag beneath a data point */
	renderBranchTag: function(renderContext, branchTag, posX, posY) {
		renderContext.save();
		renderContext.font = "9px monospace"; // Changed font size
		let textWidth = renderContext.measureText(branchTag).width;
		/* Draw the background shape for the tag */
		renderContext.beginPath();
		renderContext.fillStyle = "darkgray"; // Changed color
		renderContext.globalAlpha = 0.85; // Changed alpha
		renderContext.moveTo(posX, posY);
		renderContext.lineTo(posX - 4, posY + 10);
		renderContext.quadraticCurveTo(posX - 8, posY + 10, posX - 8, posY + 15);
		renderContext.lineTo(posX - 8, posY + 15 + textWidth);
		renderContext.quadraticCurveTo(posX - 8, posY + 15 + textWidth + 5, posX - 4, posY + 15 + textWidth + 5);
		renderContext.lineTo(posX + 4, posY + 15 + textWidth + 5);
		renderContext.quadraticCurveTo(posX + 8, posY + 15 + textWidth + 5, posX + 8, posY + 15 + textWidth);
		renderContext.lineTo(posX + 8, posY + 15);
		renderContext.quadraticCurveTo(posX + 8, posY + 10, posX + 4, posY + 10);
		renderContext.lineTo(posX, posY);
		renderContext.fill();
		/* Print the branch tag text */
		renderContext.globalAlpha = 1.0;
		renderContext.fillStyle = "whitesmoke"; // Changed color
		renderContext.textBaseline = "middle";
		renderContext.rotate(Math.PI / 2);
		renderContext.fillText(branchTag, posY + 15, -posX);
		renderContext.rotate(-Math.PI / 2);
		renderContext.restore();
		return textWidth + 5 + 15; /* 5 = bottom padding, 15 = top padding */
	},
	renderDataPoints: function(renderContext) {
		this.interactivePoints = [];
		/* Iterate and draw all commit data points */
		for (let idx = parseInt((this.horizontalShift - this.labelColumnWidth) / 20); idx <= parseInt((this.horizontalShift - this.labelColumnWidth + this.visualWidth) / 20); idx++) {
			let currentItem = this.contentManager.getCommit(idx);
			if (!currentItem)
				continue;
			let posX = (this.labelColumnWidth * 2) + (20 * currentItem.timeIndex) - this.horizontalShift + 10;
			let posY = 80 + 20 * currentItem.spaceIndex - this.verticalShift - 10;
			/* Draw the data point circle */
			if (posX > this.labelColumnWidth - 20 && posX < this.visualWidth + 20 && posY > 20 && posY < this.visualHeight + 20) {
				renderContext.beginPath();
				if (currentItem === this.highlightedPoint) {
					/* If this point is currently being hovered, draw it larger
					 * and prepare for a tooltip display */
					renderContext.fillStyle = "azure"; // Changed color
					renderContext.arc(posX, posY, 6, 0, (Math.PI * 2), false);
					renderContext.fill();
					renderContext.beginPath();
					renderContext.fillStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
					renderContext.arc(posX, posY, 5, 0, (Math.PI * 2), false);
					renderContext.fill();
				} else {
					/* Otherwise, draw a standard small dot */
					renderContext.fillStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
					renderContext.arc(posX, posY, 3, 0, (Math.PI * 2), false);
					renderContext.fill();
				}
				/* Add this data point to the collection of interactive (hoverable) points */
				this.interactivePoints.push({
					"x": posX,
					"y": posY,
					"info": currentItem
				});
			}
		}
	},
	renderBranchHeads: function(renderContext) {
		/* Iterate and draw all branch HEAD indicators */
		for (let idx = parseInt((this.horizontalShift - this.labelColumnWidth) / 20); idx <= parseInt((this.horizontalShift - this.labelColumnWidth + this.visualWidth) / 20); idx++) {
			let currentItem = this.contentManager.getCommit(idx);
			if (!currentItem)
				continue;
			let posX = (this.labelColumnWidth * 2) + (20 * currentItem.timeIndex) - this.horizontalShift + 10;
			let posY = 80 + 20 * currentItem.spaceIndex - this.verticalShift - 10;
			let headYPos = posY + 5;
			if (this.contentManager.heads[this.spaceAllocatedUsers[currentItem.spaceIndex - 1].name] && this.contentManager.heads[this.spaceAllocatedUsers[currentItem.spaceIndex - 1].name][currentItem.idHash]) {
				for (let tagIdx = 0; tagIdx < this.contentManager.heads[this.spaceAllocatedUsers[currentItem.spaceIndex - 1].name][currentItem.idHash].length; tagIdx++) {
					let branchTag = this.contentManager.heads[this.spaceAllocatedUsers[currentItem.spaceIndex - 1].name][currentItem.idHash][tagIdx];
					headYPos += this.renderBranchTag(renderContext, branchTag, posX, headYPos) + 5;
				}
			}
		}
	},
	renderDataConnections: function(renderContext) {
		/* Render connecting lines and arrows between data points */
		let visibleCount = 0;
		for (let idx = this.contentManager.metadata.dates.length - 1; idx >= parseInt((this.horizontalShift - this.labelColumnWidth) / 20); idx--) {
			let currentItem = this.contentManager.getCommit(idx);
			if (!currentItem)
				continue;
			let posX = (this.labelColumnWidth * 2) + (20 * currentItem.timeIndex) - this.horizontalShift + 10;
			let posY = 80 + 20 * currentItem.spaceIndex - this.verticalShift - 10;
			renderContext.strokeStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
			renderContext.lineWidth = 2;

			let sameLineUsed = false;
			for (let parentIdx = 0; parentIdx < currentItem.ancestors.length; parentIdx++) {
				let parentItem = currentItem.ancestors[parentIdx];
				if (parentItem[2] === currentItem.spaceIndex) {
					sameLineUsed = true;
				}
			}
			/* For each data point, we might need to draw lines/arrows
			 * connecting it to its parent commits. */
			for (let parentIdx = 0; parentIdx < currentItem.ancestors.length; parentIdx++) {
				let parentItem = currentItem.ancestors[parentIdx];
				let destinationX = (this.labelColumnWidth * 2) + (20 * parentItem[1]) - this.horizontalShift + 10;
				let destinationY = 80 + 20 * parentItem[2] - this.verticalShift - 10;
				/* Verify if the connection line is within the visible viewport */
				if (!this.checkLineVisibility(posX, posY, destinationX, destinationY))
					continue;
				/* Different types of lines/arrows are drawn based on parent-child relationship */
				if (parentItem[2] === currentItem.spaceIndex) {
					/* Parents and child are on the same horizontal track,
					 * draw a simple horizontal line segment */
					renderContext.beginPath();
					renderContext.strokeStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
					renderContext.moveTo(posX - 5, posY);
					renderContext.lineTo(destinationX + 5, posY);
					renderContext.stroke();
				} else if (parentItem[2] > currentItem.spaceIndex) {
					/* Parent is on a 'lower' (higher index) track than the current commit,
					 * this represents a merge operation */
					renderContext.beginPath();
					renderContext.lineWidth = 2.0; // Changed line width
					renderContext.strokeStyle = this.flowPathColors[(parentItem[2] - 1) % this.flowPathColors.length];
					renderContext.fillStyle = this.flowPathColors[(parentItem[2] - 1) % this.flowPathColors.length];
					renderContext.moveTo(destinationX + 5, destinationY);
					renderContext.lineTo(posX - 11, destinationY);
					renderContext.lineTo(posX - 11, posY + 13);
					renderContext.lineTo(posX - 9, posY + 9);
					renderContext.stroke();
					/* Draw the arrowhead for the merge */
					renderContext.beginPath();
					renderContext.lineWidth = 1.0; // Changed line width
					renderContext.moveTo(posX - 5, posY + 5);
					renderContext.lineTo(posX - 13, posY + 8);
					renderContext.lineTo(posX - 7, posY + 14);
					renderContext.lineTo(posX - 5, posY + 5);
					renderContext.fill();
				} else {
					/* Parent is on a 'higher' (lower index) track than the current commit,
					 * this typically indicates a branch divergence */
					if (sameLineUsed === false) {
						renderContext.beginPath();
						renderContext.strokeStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
						renderContext.fillStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
						/* Draw the arrowhead for the fork */
						renderContext.lineWidth = 1.0; // Changed line width
						renderContext.moveTo(posX - 5, posY);
						renderContext.lineTo(posX - 5 - 9, posY - 3.5);
						renderContext.lineTo(posX - 5 - 9, posY + 3.5);
						renderContext.lineTo(posX - 5, posY);
						renderContext.fill();
						/* Draw the connecting lines for the fork */
						renderContext.beginPath();
						renderContext.lineWidth = 2.0; // Changed line width
						renderContext.moveTo(posX - 5 - 8, posY);
						renderContext.lineTo(destinationX, posY);
						renderContext.lineTo(destinationX, destinationY + 5);
						renderContext.stroke();
					} else {
						renderContext.beginPath();
						renderContext.lineWidth = 2.0; // Changed line width
						renderContext.strokeStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
						renderContext.fillStyle = this.flowPathColors[(currentItem.spaceIndex - 1) % this.flowPathColors.length];
						renderContext.moveTo(destinationX, destinationY + 5);
						renderContext.lineTo(destinationX, posY - 12);
						renderContext.lineTo(posX - 12, posY - 12);
						renderContext.lineTo(posX - 9, posY - 9);
						renderContext.stroke();
						/* Draw the arrowhead */
						renderContext.beginPath();
						renderContext.lineWidth = 1.0; // Changed line width
						renderContext.moveTo(posX - 5, posY - 5);
						renderContext.lineTo(posX - 13, posY - 8);
						renderContext.lineTo(posX - 7, posY - 14);
						renderContext.lineTo(posX - 5, posY - 5);
						renderContext.fill();
					}
				}
			}
		}
	},
	/* Helper method to determine if a line segment is visible within the canvas viewport */
	checkLineVisibility: function(xStart, yStart, xEnd, yEnd) {
		const renderBuffer = 50; // Additional buffer around the visible area
		const viewportMinX = this.labelColumnWidth - renderBuffer;
		const viewportMaxX = this.visualWidth + renderBuffer;
		const viewportMinY = 20 - renderBuffer;
		const viewportMaxY = this.visualHeight + renderBuffer;

		// Simple AABB (Axis-Aligned Bounding Box) intersection check for the line segment
		const segmentMinX = Math.min(xStart, xEnd);
		const segmentMaxX = Math.max(xStart, xEnd);
		const segmentMinY = Math.min(yStart, yEnd);
		const segmentMaxY = Math.max(yStart, yEnd);

		return (segmentMaxX >= viewportMinX && segmentMinX <= viewportMaxX &&
				segmentMaxY >= viewportMinY && segmentMinY <= viewportMaxY);
	},
	/* Renders the commit data points and their connecting lines/arrows on the canvas.
	 * This also handles the display of a tooltip if a point is currently hovered. */
	renderCommitData: function(renderContext) {
		this.renderDataConnections(renderContext);
		this.renderDataPoints(renderContext);
		if (this.renderTags)
			this.renderBranchHeads(renderContext);
	}
};