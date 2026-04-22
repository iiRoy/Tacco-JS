/* Copyright 2023 Acme Corp. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/*
 * NOTE: This implementation attempts to provide multi-line text rendering
 * on a Canvas, a feature not natively supported. It assumes a monospace
 * font for accurate line breaking. For proportional fonts, results will be
 * approximate, so padding and careful design are recommended.
 * A more robust solution might involve binary search for line breaks or
 * pre-calculating character widths, but that is beyond the scope here.
 */
CanvasRenderingContext2D.prototype.calculateLineCount = function(inputString, maxRenderWidth) {
    if (!inputString || inputString.length === 0) {
        return 0; // No string, no lines.
    }
    const measuredWidth = this.measureText(inputString).width;
    if (measuredWidth <= maxRenderWidth) {
        return 1; // Fits on a single line.
    }
    // Estimate character limit per line based on total width and desired max width.
    const estimatedCharLimit = Math.floor(maxRenderWidth * inputString.length / measuredWidth);
    // Use the custom line division utility to get the actual line count.
    const divisionResult = inputString.divideIntoLines(estimatedCharLimit);
    return divisionResult.lineCount;
};

/*
 * This method facilitates drawing text that spans multiple lines within a
 * specified maximum width on a Canvas context. Similar to `calculateLineCount`,
 * it works best with monospaced fonts but provides a reasonable approximation
 * for others.
 */
CanvasRenderingContext2D.prototype.renderMultilineText = function(inputString, posX, posY, maxRenderWidth, lineSpacingPx) {
    // Ensure a default line height if none is provided or if it's invalid.
    const effectiveLineHeight = (typeof lineSpacingPx === 'number' && lineSpacingPx > 0) ? lineSpacingPx : 12;

    const measuredWidth = this.measureText(inputString).width;
    const estimatedCharLimit = Math.floor(maxRenderWidth * inputString.length / measuredWidth);

    // Split the string into an array of lines.
    const divisionResult = inputString.divideIntoLines(estimatedCharLimit);
    const lineSegments = divisionResult.formattedText.split("\n");

    let currentPosY = posY;
    for (let idx = 0; idx < lineSegments.length; idx++) {
        currentPosY += effectiveLineHeight; // Increment Y for each new line.
        this.fillText(lineSegments[idx], posX, currentPosY);
    }
};

/*
 * Utility function to split a long string into multiple lines based on a
 * character limit. It tries to break at spaces or newlines to avoid
 * splitting words.
 *
 * This function is adapted from Stephen Chapman's original work.
 */
String.prototype.divideIntoLines = function(charLimit) {
    if (typeof charLimit !== 'number' || charLimit <= 0) {
        // Handle invalid character limit gracefully.
        return { lineCount: 1, formattedText: this.toString() };
    }

    let resultBuffer = '';
    let remainingString = this.toString();
    let currentLineCount = 0;

    while (remainingString.length > charLimit) {
        let segment = remainingString.substring(0, charLimit);
        let breakPoint = segment.lastIndexOf(' '); // Try to break at a space.
        let newlinePoint = segment.lastIndexOf('\n'); // Check for explicit newlines.

        if (newlinePoint !== -1) {
            breakPoint = newlinePoint; // Prioritize explicit newlines.
        }

        if (breakPoint === -1) {
            breakPoint = charLimit; // No space or newline, force break at charLimit.
        }

        resultBuffer += segment.substring(0, breakPoint) + '\n';
        currentLineCount++;
        remainingString = remainingString.substring(breakPoint + 1); // Move past the breakpoint.
    }

    // Add the last remaining segment and increment line count.
    resultBuffer += remainingString;
    currentLineCount++;

    return { lineCount: currentLineCount, formattedText: resultBuffer };
};

// --- Constants for the Commit Graph Renderer ---
const DEFAULT_CANVAS_WIDTH = 920;
const DEFAULT_CANVAS_HEIGHT = 600;
const DEFAULT_SIDEBAR_WIDTH = 100;
const TOP_BAR_HEIGHT = 40; // Combined height of month and day bars
const COMMIT_POINT_SPACING = 20; // Vertical and horizontal spacing for commit points
const DEFAULT_LINE_SPACING = 12; // Default line height for text rendering
const TOOLTIP_PANEL_WIDTH = 400;
const AVATAR_DISPLAY_SIZE = 32;
const TOOLTIP_PADDING = 15;
const TOOLTIP_CORNER_RADIUS = 5;

const MONTH_ABBREVIATIONS = Object.freeze({
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
});

const BRANCH_VISUAL_COLORS = Object.freeze([
    "black", "red", "blue", "lawngreen", "magenta", "yellow", "orange", "cyan", "hotpink", "peru"
]);

/*
 * Constructor function for the Commit Graph Renderer.
 * Initializes the canvas element and sets up various rendering parameters
 * and sub-components like input handlers and data managers.
 *
 * @param {string} containerId - The ID of the HTML canvas element.
 * @param {number} [canvasWidth] - Desired width of the canvas.
 * @param {number} [canvasHeight] - Desired height of the canvas.
 * @param {number} [sidebarWidth] - Width of the left sidebar for names.
 * @param {object} [metadataObj] - Initial metadata for the graph.
 * @param {object} [commitData] - Initial commit data for the graph.
 */
const CommitGraphRenderer = function(containerId, canvasWidth, canvasHeight, sidebarWidth, metadataObj, commitData) {
    this.displaySurface = document.getElementById(containerId);
    if (!this.displaySurface || !(this.displaySurface instanceof HTMLCanvasElement)) {
        console.error(`CommitGraphRenderer: Canvas element with ID '${containerId}' not found or is not a canvas.`);
        return; // Early exit if canvas is invalid.
    }

    this.surfaceWidth = canvasWidth || DEFAULT_CANVAS_WIDTH;
    this.surfaceHeight = canvasHeight || DEFAULT_CANVAS_HEIGHT;

    this.displaySurface.width = this.surfaceWidth;
    this.displaySurface.height = this.surfaceHeight;

    this.leftColumnWidth = sidebarWidth || DEFAULT_SIDEBAR_WIDTH;

    // Rendering offsets for scrolling/panning.
    this.horizontalOffset = this.leftColumnWidth; // Initial offset to account for name column.
    this.verticalOffset = TOP_BAR_HEIGHT;       // Initial offset for top date bars.

    // Data structures for interactive elements.
    this.interactivePoints = []; // Stores commit points that can be hovered.
    this.userAvatars = {};       // Cache for loaded Gravatar images.

    this.showBranchLabels = true; // Flag to control visibility of branch head labels.

    // Maximum translation limits for panning.
    // The +100 margin is for potential display of HEAD labels extending downwards.
    this.maxTranslateX = -this.surfaceWidth + (this.leftColumnWidth * 2);
    this.maxTranslateY = -this.surfaceHeight + (this.verticalOffset * 2) + 100;

    this.isDataLoading = false; // Flag to indicate if data is currently being loaded.

    // Color palette for different branches.
    this.branchColors = BRANCH_VISUAL_COLORS;
    this.sortedUsers = []; // Stores user data mapped to 'space' index.

    // Initialize input and data management subsystems.
    this._initializeSubsystems();
    this.dataModel.initializeData(metadataObj, commitData);
};

CommitGraphRenderer.prototype = {
    /**
     * Initializes the mouse and keyboard input handlers and the data manager.
     * This is a private helper method called during construction.
     */
    _initializeSubsystems: function() {
        this.inputManager = new CommitGraphRenderer.InputHandler(this);
        this.inputManager.init();

        this.keyListener = new CommitGraphRenderer.KeyProcessor(this);
        this.keyListener.init();

        this.dataModel = new CommitGraphRenderer.DataStore(this);
    },

    /**
     * Determines if a line segment between two points is within the visible canvas area.
     * This helps in culling off-screen elements for performance.
     *
     * @param {number} x1 - Start X coordinate.
     * @param {number} y1 - Start Y coordinate.
     * @param {number} x2 - End X coordinate.
     * @param {number} y2 - End Y coordinate.
     * @returns {boolean} True if any part of the line is visible, false otherwise.
     */
    _isLineVisible: function(x1, y1, x2, y2) {
        const minX = this.leftColumnWidth - COMMIT_POINT_SPACING; // Allow some margin for lines entering from left
        const maxX = this.surfaceWidth + COMMIT_POINT_SPACING;
        const minY = TOP_BAR_HEIGHT - COMMIT_POINT_SPACING; // Allow margin for lines from top
        const maxY = this.surfaceHeight + COMMIT_POINT_SPACING;

        // Simple AABB intersection check for the line segment's bounding box
        return !((Math.max(x1, x2) < minX) ||
                 (Math.min(x1, x2) > maxX) ||
                 (Math.max(y1, y2) < minY) ||
                 (Math.min(y1, y2) > maxY));
    },

    /**
     * The primary rendering function. Retrieves the 2D rendering context
     * and orchestrates all drawing operations. It's invoked whenever the
     * graph needs to be updated.
     */
    draw: function() {
        // Do not draw if essential data is not yet loaded.
        if (!this.dataModel.metadataObj || !this.dataModel.commitData) {
            console.log("Rendering skipped: Data not fully loaded.");
            return;
        }

        if (this.displaySurface.getContext) {
            const renderContext = this.displaySurface.getContext('2d');
            if (!renderContext) {
                console.error("Failed to get 2D rendering context.");
                return;
            }

            renderContext.font = "12px sans-serif"; // Default font for most text.
            renderContext.textBaseline = "alphabetic"; // Reset baseline.

            this._drawBackgroundGrid(renderContext); // Draw the checkerboard background.
            this._drawCommitLinks(renderContext);    // Draw all connecting lines/arrows.
            this._drawCommitNodes(renderContext);    // Draw commit dots.
            this._drawLeftSidebar(renderContext);    // Draw user names sidebar.
            this._drawTopBars(renderContext);        // Draw month and day bars.
            this._drawDateLabels(renderContext);     // Populate dates in the top bars.

            // Overlay to hide parts of the date bars that overlap the name sidebar.
            renderContext.fillStyle = "black";
            renderContext.fillRect(0, 0, this.leftColumnWidth, 20);
            renderContext.fillStyle = "rgb(64,64,64)";
            renderContext.fillRect(0, 20, this.leftColumnWidth, 20);

            // If a commit node is hovered, display its detailed tooltip.
            if (this.activeTooltipCommit) {
                this._drawCommitTooltip(renderContext, this.activeTooltipCommit);
            }
        }
    },

    /**
     * Draws a detailed tooltip when a commit node is hovered.
     * Includes commit author, hash, message, and Gravatar image.
     *
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     * @param {object} tooltipInfo - Data about the hovered commit.
     */
    _drawCommitTooltip: function(renderContext, tooltipInfo) {
        // Calculate initial tooltip position relative to the commit dot.
        let panelPosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * tooltipInfo.time) - this.horizontalOffset + 10;
        let panelPosY = 80 + (COMMIT_POINT_SPACING * tooltipInfo.space) - this.verticalOffset - 10;

        renderContext.font = "12px sans-serif";
        const messageLineCount = renderContext.calculateLineCount(tooltipInfo.message, TOOLTIP_PANEL_WIDTH - (TOOLTIP_PADDING * 2));
        const tooltipHeight = 70 + (messageLineCount * DEFAULT_LINE_SPACING) + 5; // Base height + message lines + padding.

        // Adjust horizontal position to keep tooltip within canvas bounds.
        if (panelPosX + 10 + TOOLTIP_PANEL_WIDTH > this.surfaceWidth) {
            panelPosX = this.surfaceWidth - TOOLTIP_PANEL_WIDTH - 10;
        } else if (panelPosX + 10 < this.leftColumnWidth) {
            panelPosX = this.leftColumnWidth + 10;
        } else {
            panelPosX += 10;
        }

        // Adjust vertical position to keep tooltip within canvas bounds.
        if (panelPosY + 10 + tooltipHeight > this.surfaceHeight) {
            panelPosY = Math.max(TOP_BAR_HEIGHT, panelPosY - 10 - tooltipHeight); // Move above if no space below.
        } else if (panelPosY < TOP_BAR_HEIGHT) {
            panelPosY = TOP_BAR_HEIGHT + 10;
        } else {
            panelPosY += 10;
        }

        // Draw the rounded background rectangle for the tooltip.
        renderContext.beginPath();
        renderContext.strokeStyle = "black";
        renderContext.fillStyle = "white";
        renderContext.lineWidth = 2;
        renderContext.moveTo(panelPosX, panelPosY + TOOLTIP_CORNER_RADIUS);
        renderContext.quadraticCurveTo(panelPosX, panelPosY, panelPosX + TOOLTIP_CORNER_RADIUS, panelPosY);
        renderContext.lineTo(panelPosX + TOOLTIP_PANEL_WIDTH - TOOLTIP_CORNER_RADIUS, panelPosY);
        renderContext.quadraticCurveTo(panelPosX + TOOLTIP_PANEL_WIDTH, panelPosY, panelPosX + TOOLTIP_PANEL_WIDTH, panelPosY + TOOLTIP_CORNER_RADIUS);
        renderContext.lineTo(panelPosX + TOOLTIP_PANEL_WIDTH, panelPosY + tooltipHeight - TOOLTIP_CORNER_RADIUS);
        renderContext.quadraticCurveTo(panelPosX + TOOLTIP_PANEL_WIDTH, panelPosY + tooltipHeight, panelPosX + TOOLTIP_PANEL_WIDTH - TOOLTIP_CORNER_RADIUS, panelPosY + tooltipHeight);
        renderContext.lineTo(panelPosX + TOOLTIP_CORNER_RADIUS, panelPosY + tooltipHeight);
        renderContext.quadraticCurveTo(panelPosX, panelPosY + tooltipHeight, panelPosX, panelPosY + tooltipHeight - TOOLTIP_CORNER_RADIUS);
        renderContext.lineTo(panelPosX, panelPosY + TOOLTIP_CORNER_RADIUS);
        renderContext.fill();
        renderContext.stroke();

        // Load and display the Gravatar image.
        if (tooltipInfo.gravatar) {
            this._ensureAvatarLoaded(renderContext, tooltipInfo, panelPosX, panelPosY);
        }

        // Add author name.
        renderContext.fillStyle = "black";
        renderContext.font = "14px sans-serif"; // Slightly larger for name.
        renderContext.fillText(tooltipInfo.author, panelPosX + TOOLTIP_PADDING + AVATAR_DISPLAY_SIZE + TOOLTIP_PADDING, panelPosY + TOOLTIP_PADDING + AVATAR_DISPLAY_SIZE / 2 + 5);

        // Add commit hash.
        renderContext.font = "12px sans-serif";
        renderContext.fillStyle = "grey";
        renderContext.fillText(tooltipInfo.id, panelPosX + TOOLTIP_PADDING, panelPosY + 65);

        // Add commit message.
        renderContext.fillStyle = "black";
        renderContext.renderMultilineText(tooltipInfo.message, panelPosX + TOOLTIP_PADDING, panelPosY + 70 - DEFAULT_LINE_SPACING, TOOLTIP_PANEL_WIDTH - (TOOLTIP_PADDING * 2), DEFAULT_LINE_SPACING);
    },

    /**
     * Ensures an avatar image is loaded and draws it if available.
     * Handles caching and asynchronous loading.
     *
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     * @param {object} tooltipInfo - Commit data containing gravatar hash.
     * @param {number} panelPosX - X position of the tooltip panel.
     * @param {number} panelPosY - Y position of the tooltip panel.
     */
    _ensureAvatarLoaded: function(renderContext, tooltipInfo, panelPosX, panelPosY) {
        const avatarHash = tooltipInfo.gravatar;
        if (!this.userAvatars[avatarHash]) {
            const avatarImage = new Image();
            avatarImage.src = `https://www.gravatar.com/avatar/${avatarHash}?s=${AVATAR_DISPLAY_SIZE}`;
            this.userAvatars[avatarHash] = avatarImage; // Cache the image object.

            // Use a closure to capture `this` for the onload event.
            const selfRef = this;
            avatarImage.onload = function() {
                // Only redraw the avatar if the same commit is still being hovered.
                if (tooltipInfo === selfRef.activeTooltipCommit) {
                    renderContext.drawImage(avatarImage, panelPosX + TOOLTIP_PADDING, panelPosY + TOOLTIP_PADDING);
                }
            };
        } else if (this.userAvatars[avatarHash].complete) {
            // Image is already loaded and cached, draw it immediately.
            renderContext.drawImage(this.userAvatars[avatarHash], panelPosX + TOOLTIP_PADDING, panelPosY + TOOLTIP_PADDING);
        }
    },

    /**
     * Draws the black month bar at the very top of the canvas.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawMonthBar: function(renderContext) {
        renderContext.fillStyle = "black";
        renderContext.fillRect(0, 0, this.surfaceWidth, 20);
    },

    /**
     * Draws the grey day bar just beneath the month bar.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawDayBar: function(renderContext) {
        renderContext.fillStyle = "rgb(64,64,64)";
        renderContext.fillRect(0, 20, this.surfaceWidth, 20);
    },

    /**
     * Combines drawing of both top bars.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawTopBars: function(renderContext) {
        this._drawMonthBar(renderContext);
        this._drawDayBar(renderContext);
    },

    /**
     * Draws a single name block within the left sidebar.
     * Handles background colors, hover states, and text rendering.
     *
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     * @param {number} blockIndex - The index of the block in the metadata.
     */
    _drawNameBlock: function(renderContext, blockIndex) {
        const backgroundShades = ["rgb(235,235,255)", "rgb(224,224,255)"];
        const blockData = this.dataModel.metadataObj.blocks[blockIndex];
        if (!blockData) return;

        const blockStartY = 80 + (blockData.start * COMMIT_POINT_SPACING);
        const blockEndY = blockStartY + (blockData.count * COMMIT_POINT_SPACING);

        // Check if the block is within the visible vertical range.
        const isVisibleVertically = (blockStartY - this.verticalOffset >= TOP_BAR_HEIGHT && blockStartY - this.verticalOffset <= this.surfaceHeight) ||
                                    (blockEndY - this.verticalOffset >= TOP_BAR_HEIGHT && blockEndY - this.verticalOffset <= this.surfaceHeight);

        if (isVisibleVertically) {
            const currentBlockHeight = blockData.count * COMMIT_POINT_SPACING;
            const renderY = blockStartY - this.verticalOffset;

            // Determine background color based on hover state or alternating rows.
            let fillColor = backgroundShades[0];
            const isHovered = this.inputManager.lastPoint.y > renderY &&
                              this.inputManager.lastPoint.y <= renderY + currentBlockHeight &&
                              this.inputManager.lastPoint.x <= this.leftColumnWidth;

            if (isHovered) {
                fillColor = "rgb(223,223,243)"; // Hover color.
            } else if (blockIndex % 2 !== 0) {
                fillColor = backgroundShades[1]; // Alternate color for odd blocks.
            }

            // Draw the background rectangle.
            renderContext.fillStyle = fillColor;
            renderContext.fillRect(0, renderY, this.leftColumnWidth, currentBlockHeight);

            // Draw border lines for the block.
            renderContext.strokeStyle = "rgb(222,222,222)";
            renderContext.lineWidth = 1;
            renderContext.beginPath();
            renderContext.moveTo(this.leftColumnWidth, renderY + 0.5);
            renderContext.lineTo(0.5, renderY + 0.5);
            renderContext.lineTo(0.5, blockEndY - this.verticalOffset + 0.5);
            renderContext.lineTo(this.leftColumnWidth, blockEndY - this.verticalOffset + 0.5);
            renderContext.stroke();

            // Draw the user name text, centered vertically.
            renderContext.fillStyle = "black";
            renderContext.fillText(blockData.name, 5, (blockStartY + blockEndY) / 2 - this.verticalOffset + 5, this.leftColumnWidth - 10);
        }
    },

    /**
     * Draws the entire left sidebar containing user names/repository owners.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawLeftSidebar: function(renderContext) {
        renderContext.save(); // Isolate context changes.
        renderContext.fillStyle = "rgb(235,235,255)";
        renderContext.fillRect(0, TOP_BAR_HEIGHT, this.leftColumnWidth, this.surfaceHeight - TOP_BAR_HEIGHT);

        if (this.dataModel.metadataObj && this.dataModel.metadataObj.blocks) {
            for (let idx = 0; idx < this.dataModel.metadataObj.blocks.length; idx++) {
                this._drawNameBlock(renderContext, idx);
            }
        }
        renderContext.restore(); // Restore previous context state.
    },

    /**
     * Draws the background grid for the commit graph area.
     * This typically involves alternating row colors.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawBackgroundGrid: function(renderContext) {
        const rowShades = ["rgb(245,245,255)", "rgb(240,240,255)"];
        let currentY = 80; // Starting Y position for the first block.

        renderContext.save();
        // Fill the entire graph area with the first background color initially.
        renderContext.fillStyle = rowShades[0];
        renderContext.fillRect(this.leftColumnWidth, TOP_BAR_HEIGHT, this.surfaceWidth - this.leftColumnWidth, this.surfaceHeight - TOP_BAR_HEIGHT);

        if (this.dataModel.metadataObj && this.dataModel.metadataObj.blocks) {
            for (let idx = 0; idx < this.dataModel.metadataObj.blocks.length; idx++) {
                const blockData = this.dataModel.metadataObj.blocks[idx];
                const blockRenderHeight = blockData.count * COMMIT_POINT_SPACING;
                const blockVisibleY = currentY - this.verticalOffset;
                const blockVisibleEndY = blockVisibleY + blockRenderHeight;

                // Check for vertical visibility to avoid drawing off-screen blocks.
                const isBlockPartiallyVisible = (blockVisibleY >= TOP_BAR_HEIGHT && blockVisibleY <= this.surfaceHeight) ||
                                                 (blockVisibleEndY >= TOP_BAR_HEIGHT && blockVisibleEndY <= this.surfaceHeight) ||
                                                 (blockVisibleY < TOP_BAR_HEIGHT && blockVisibleEndY > this.surfaceHeight);

                if (isBlockPartiallyVisible) {
                    if (idx % 2 !== 0) { // Apply alternate color for odd rows.
                        renderContext.fillStyle = rowShades[1];
                        renderContext.fillRect(this.leftColumnWidth, blockVisibleY, this.surfaceWidth - this.leftColumnWidth, blockRenderHeight);
                    }
                    // Draw horizontal separator lines.
                    renderContext.lineWidth = 1;
                    renderContext.strokeStyle = "rgb(222,222,222)";
                    renderContext.beginPath();
                    renderContext.moveTo(this.leftColumnWidth, blockVisibleY + 0.5);
                    renderContext.lineTo(this.surfaceWidth, blockVisibleY + 0.5);
                    renderContext.stroke();
                }
                currentY += blockRenderHeight;
            }
        }
        renderContext.restore();
    },

    /**
     * Populates the month and day bars at the top of the canvas with date labels.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawDateLabels: function(renderContext) {
        if (!this.dataModel.metadataObj || !this.dataModel.metadataObj.dates || this.dataModel.metadataObj.dates.length === 0) {
            return;
        }

        // Calculate the starting index for visible dates based on horizontal offset.
        const minDateIndex = Math.floor((this.horizontalOffset - this.leftColumnWidth) / COMMIT_POINT_SPACING);
        const maxDateIndex = Math.ceil((this.horizontalOffset - this.leftColumnWidth + this.surfaceWidth) / COMMIT_POINT_SPACING);

        let previousDateArr = [1970, 1, 1]; // Initialize with a very old date.
        if (minDateIndex > 0 && this.dataModel.metadataObj.dates[minDateIndex - 1]) {
            previousDateArr = this.dataModel.metadataObj.dates[minDateIndex - 1].split("-");
        }

        renderContext.font = "12px sans-serif";

        for (let idx = minDateIndex; idx <= maxDateIndex; idx++) {
            const dateString = this.dataModel.metadataObj.dates[idx];
            if (!dateString) continue;

            const currentDateArr = dateString.split("-");
            const datePosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * idx) - this.horizontalOffset;

            // Draw month label if month or year has changed.
            if (currentDateArr[0] !== previousDateArr[0] || currentDateArr[1] !== previousDateArr[1]) {
                renderContext.fillStyle = "white";
                renderContext.fillText(MONTH_ABBREVIATIONS[currentDateArr[1]], datePosX, 15);
            }

            // Draw day label if day, month, or year has changed.
            if (currentDateArr[0] !== previousDateArr[0] || currentDateArr[1] !== previousDateArr[1] || currentDateArr[2] !== previousDateArr[2]) {
                renderContext.fillStyle = "rgb(192,192,192)";
                renderContext.fillText(currentDateArr[2], datePosX, 35);
            }
            previousDateArr = currentDateArr;
        }
    },

    /**
     * Draws a small vertical branch head label under a commit dot.
     *
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     * @param {string} headLabelText - The text for the label (e.g., "master", "HEAD").
     * @param {number} dotPosX - The X coordinate of the commit dot.
     * @param {number} headLabelPosY - The Y coordinate where the label should start drawing.
     * @returns {number} The vertical space consumed by the label.
     */
    _drawBranchHeadLabel: function(renderContext, headLabelText, dotPosX, headLabelPosY) {
        renderContext.save();
        renderContext.font = "10px monospace";
        const labelWidth = renderContext.measureText(headLabelText).width;

        const arrowBaseWidth = 8;
        const arrowHeight = 10;
        const labelMargin = 5;
        const totalLabelHeight = arrowHeight + labelMargin + labelWidth + labelMargin;

        // Draw the dark background shape for the label.
        renderContext.beginPath();
        renderContext.fillStyle = "black";
        renderContext.globalAlpha = 0.8;
        renderContext.moveTo(dotPosX, headLabelPosY);
        renderContext.lineTo(dotPosX - (arrowBaseWidth / 2), headLabelPosY + arrowHeight);
        renderContext.quadraticCurveTo(dotPosX - arrowBaseWidth, headLabelPosY + arrowHeight, dotPosX - arrowBaseWidth, headLabelPosY + arrowHeight + labelMargin);
        renderContext.lineTo(dotPosX - arrowBaseWidth, headLabelPosY + arrowHeight + labelMargin + labelWidth);
        renderContext.quadraticCurveTo(dotPosX - arrowBaseWidth, headLabelPosY + totalLabelHeight, dotPosX - (arrowBaseWidth / 2), headLabelPosY + totalLabelHeight);
        renderContext.lineTo(dotPosX + (arrowBaseWidth / 2), headLabelPosY + totalLabelHeight);
        renderContext.quadraticCurveTo(dotPosX + arrowBaseWidth, headLabelPosY + totalLabelHeight, dotPosX + arrowBaseWidth, headLabelPosY + arrowHeight + labelMargin + labelWidth);
        renderContext.lineTo(dotPosX + arrowBaseWidth, headLabelPosY + arrowHeight + labelMargin);
        renderContext.quadraticCurveTo(dotPosX + arrowBaseWidth, headLabelPosY + arrowHeight, dotPosX + (arrowBaseWidth / 2), headLabelPosY + arrowHeight);
        renderContext.lineTo(dotPosX, headLabelPosY);
        renderContext.fill();

        // Print the white label text rotated.
        renderContext.globalAlpha = 1.0;
        renderContext.fillStyle = "white";
        renderContext.textBaseline = "middle";
        renderContext.translate(dotPosX, headLabelPosY + arrowHeight + labelMargin); // Translate to the rotation point.
        renderContext.rotate(Math.PI / 2); // Rotate 90 degrees clockwise.
        renderContext.fillText(headLabelText, 0, 0); // Draw at the new origin.
        renderContext.rotate(-Math.PI / 2); // Rotate back.
        renderContext.translate(-dotPosX, -(headLabelPosY + arrowHeight + labelMargin)); // Translate back.

        renderContext.restore();
        return totalLabelHeight + labelMargin; // Return total vertical space used + extra margin.
    },

    /**
     * Draws all commit dots on the canvas.
     * Also populates the `interactivePoints` array for mouse interaction.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawCommitNodes: function(renderContext) {
        this.interactivePoints = []; // Clear previous interactive points.
        const commitDotRadiusSmall = 3;
        const commitDotRadiusLarge = 5; // For hovered dots.

        // Iterate through dates to find commits to draw.
        const minDateIdx = Math.floor((this.horizontalOffset - this.leftColumnWidth) / COMMIT_POINT_SPACING);
        const maxDateIdx = Math.ceil((this.horizontalOffset - this.leftColumnWidth + this.surfaceWidth) / COMMIT_POINT_SPACING);

        for (let idx = minDateIdx; idx <= maxDateIdx; idx++) {
            const commitEntry = this.dataModel.getCommit(idx);
            if (!commitEntry) continue;

            const dotPosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * commitEntry.time) - this.horizontalOffset + 10;
            const dotPosY = 80 + (COMMIT_POINT_SPACING * commitEntry.space) - this.verticalOffset - 10;

            // Check if the dot is within the visible canvas area (with some padding).
            if (dotPosX > this.leftColumnWidth - 20 && dotPosX < this.surfaceWidth + 20 &&
                dotPosY > TOP_BAR_HEIGHT - 20 && dotPosY < this.surfaceHeight + 20) {

                renderContext.beginPath();
                const branchColor = this.branchColors[(commitEntry.space - 1) % this.branchColors.length];

                if (commitEntry === this.activeTooltipCommit) {
                    // Draw a larger, outlined dot for the hovered commit.
                    renderContext.fillStyle = "white";
                    renderContext.arc(dotPosX, dotPosY, commitDotRadiusLarge + 1, 0, (Math.PI * 2), false);
                    renderContext.fill();
                    renderContext.beginPath();
                    renderContext.fillStyle = branchColor;
                    renderContext.arc(dotPosX, dotPosY, commitDotRadiusLarge, 0, (Math.PI * 2), false);
                    renderContext.fill();
                } else {
                    // Draw a standard small dot.
                    renderContext.fillStyle = branchColor;
                    renderContext.arc(dotPosX, dotPosY, commitDotRadiusSmall, 0, (Math.PI * 2), false);
                    renderContext.fill();
                }
                // Store dot information for mouse interaction.
                this.interactivePoints.push({ x: dotPosX, y: dotPosY, commitData: commitEntry, radius: commitDotRadiusLarge });
            }
        }
    },

    /**
     * Draws branch head labels (e.g., "master", "HEAD") for relevant commits.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawBranchHeads: function(renderContext) {
        if (!this.showBranchLabels || !this.dataModel.heads || !this.sortedUsers) {
            return;
        }

        const minDateIdx = Math.floor((this.horizontalOffset - this.leftColumnWidth) / COMMIT_POINT_SPACING);
        const maxDateIdx = Math.ceil((this.horizontalOffset - this.leftColumnWidth + this.surfaceWidth) / COMMIT_POINT_SPACING);

        for (let idx = minDateIdx; idx <= maxDateIdx; idx++) {
            const commitEntry = this.dataModel.getCommit(idx);
            if (!commitEntry) continue;

            const dotPosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * commitEntry.time) - this.horizontalOffset + 10;
            const dotPosY = 80 + (COMMIT_POINT_SPACING * commitEntry.space) - this.verticalOffset - 10;

            if (dotPosX > this.leftColumnWidth && dotPosX < this.surfaceWidth &&
                dotPosY > TOP_BAR_HEIGHT && dotPosY < this.surfaceHeight) { // Check visibility.

                const userName = this.sortedUsers[commitEntry.space - 1] ? this.sortedUsers[commitEntry.space - 1].name : null;
                if (userName && this.dataModel.heads[userName] && this.dataModel.heads[userName][commitEntry.id]) {
                    let currentLabelPosY = dotPosY + 5; // Start drawing labels slightly below the dot.
                    for (const labelText of this.dataModel.heads[userName][commitEntry.id]) {
                        currentLabelPosY += this._drawBranchHeadLabel(renderContext, labelText, dotPosX, currentLabelPosY) + 5;
                    }
                }
            }
        }
    },

    /**
     * Draws all connecting lines and arrows between commit nodes.
     * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
     */
    _drawCommitLinks: function(renderContext) {
        let visibleLinkCount = 0;
        renderContext.lineWidth = 2; // Default line width for links.

        // Iterate backward through dates to draw links (parents are older).
        for (let idx = this.dataModel.metadataObj.dates.length - 1; idx >= 0; idx--) {
            const commitEntry = this.dataModel.getCommit(idx);
            if (!commitEntry || !commitEntry.parents || commitEntry.parents.length === 0) {
                continue;
            }

            const dotPosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * commitEntry.time) - this.horizontalOffset + 10;
            const dotPosY = 80 + (COMMIT_POINT_SPACING * commitEntry.space) - this.verticalOffset - 10;

            const currentBranchColor = this.branchColors[(commitEntry.space - 1) % this.branchColors.length];
            renderContext.strokeStyle = currentBranchColor;

            let hasSameBranchParent = false;
            for (const parentRef of commitEntry.parents) {
                if (parentRef[2] === commitEntry.space) { // Parent is on the same branch/space.
                    hasSameBranchParent = true;
                    break;
                }
            }

            for (const parentRef of commitEntry.parents) {
                const parentPosX = (this.leftColumnWidth * 2) + (COMMIT_POINT_SPACING * parentRef[1]) - this.horizontalOffset + 10;
                const parentPosY = 80 + (COMMIT_POINT_SPACING * parentRef[2]) - this.verticalOffset - 10;

                // Skip drawing if the line segment is entirely off-screen.
                if (!this._isLineVisible(dotPosX, dotPosY, parentPosX, parentPosY)) {
                    continue;
                }
                visibleLinkCount++;

                const parentBranchColor = this.branchColors[(parentRef[2] - 1) % this.branchColors.length];
                renderContext.strokeStyle = parentBranchColor;
                renderContext.fillStyle = parentBranchColor;

                if (parentRef[2] === commitEntry.space) {
                    // Parent is on the same "space" (branch line). Draw a simple horizontal line.
                    renderContext.beginPath();
                    renderContext.moveTo(dotPosX - 5, dotPosY); // Start slightly left of current dot.
                    renderContext.lineTo(parentPosX + 5, dotPosY); // End slightly right of parent dot.
                    renderContext.stroke();
                } else if (parentRef[2] > commitEntry.space) {
                    // Parent is on a "lower" space (merge scenario). Draw a merge arrow.
                    renderContext.beginPath();
                    renderContext.moveTo(parentPosX + 5, parentPosY);
                    renderContext.lineTo(dotPosX - 11, parentPosY);
                    renderContext.lineTo(dotPosX - 11, dotPosY + 13);
                    renderContext.lineTo(dotPosX - 9, dotPosY + 9);
                    renderContext.stroke();

                    // Draw arrowhead pointing towards the current commit.
                    renderContext.beginPath();
                    renderContext.lineWidth = 1;
                    renderContext.moveTo(dotPosX - 5, dotPosY + 5);
                    renderContext.lineTo(dotPosX - 13, dotPosY + 8);
                    renderContext.lineTo(dotPosX - 7, dotPosY + 14);
                    renderContext.closePath(); // Connects last point to first for a filled shape.
                    renderContext.fill();
                } else { // parentRef[2] < commitEntry.space
                    // Parent is on a "higher" space (fork/split scenario). Draw a fork arrow.
                    if (!hasSameBranchParent) {
                        // If no other parent is on the same line, draw a direct fork.
                        renderContext.beginPath();
                        // Draw arrowhead pointing towards the current commit.
                        renderContext.lineWidth = 1;
                        renderContext.moveTo(dotPosX - 5, dotPosY);
                        renderContext.lineTo(dotPosX - 5 - 9, dotPosY - 3.5);
                        renderContext.lineTo(dotPosX - 5 - 9, dotPosY + 3.5);
                        renderContext.closePath();
                        renderContext.fill();

                        // Draw lines for the fork.
                        renderContext.beginPath();
                        renderContext.lineWidth = 2;
                        renderContext.moveTo(dotPosX - 5 - 8, dotPosY);
                        renderContext.lineTo(parentPosX, dotPosY);
                        renderContext.lineTo(parentPosX, parentPosY + 5);
                        renderContext.stroke();
                    } else {
                        // If there's a parent on the same line, this is a more complex merge/rebase.
                        renderContext.beginPath();
                        renderContext.lineWidth = 2;
                        renderContext.moveTo(parentPosX, parentPosY + 5);
                        renderContext.lineTo(parentPosX, dotPosY - 12);
                        renderContext.lineTo(dotPosX - 12, dotPosY - 12);
                        renderContext.lineTo(dotPosX - 9, dotPosY - 9);
                        renderContext.stroke();

                        // Draw arrowhead.
                        renderContext.beginPath();
                        renderContext.lineWidth = 1;
                        renderContext.moveTo(dotPosX - 5, dotPosY - 5);
                        renderContext.lineTo(dotPosX - 13, dotPosY - 8);
                        renderContext.lineTo(dotPosX - 7, dotPosY - 14);
                        renderContext.closePath();
                        renderContext.fill();
                    }
                }
            }
        }
        if (visibleLinkCount > 0 && this.showBranchLabels) {
            this._drawBranchHeads(renderContext); // Draw heads after all links, so they overlap correctly.
        }
    }
};