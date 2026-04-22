(function (globalScope) {

    const defaultConfiguration = {
        outerContainerClass: 'visualWrapper',
        sheetWidth: 500,
        sheetHeight: 375,
        movementEase: 0.5,
        framesPerSecond: 20,
        baseSheetColor: 'white',
        backgroundShade: 'white', // Not directly used in drawing logic, but kept for configuration
        edgeGrabSize: 50
    };

    class BookAnimator {
        constructor(hostElement, customConfig) {
            this.config = Object.assign({}, defaultConfiguration, customConfig);

            this.config.refreshInterval = 1000 / this.config.framesPerSecond;
            this.config.displaySpanWidth = this.config.sheetWidth * 2;
            this.config.sheetHypotenuse = Math.hypot(this.config.sheetWidth, this.config.sheetHeight);
            this.config.clippingWidth = this.config.sheetWidth;
            this.config.clippingHeight = this.config.sheetWidth * 10;
            this.config.verticalOffset = this.config.sheetHypotenuse - this.config.sheetHeight;

            this.mainContainer = null;
            this.primaryCanvas = null;
            this.overlayCanvas = null;
            this.primaryBrush = null;
            this.overlayBrush = null;

            this.pointerCoordinates = null;
            this.guideCoordinates = null;
            this.sheetAngle = 0;
            this.isGrabbing = false;
            this.isPageTurning = false;
            this.leftSheetActive = false;
            this.nextInteractionIsClick = false;
            this.turnCompletionCallback = null;

            this.contentBank = [];
            this.contentBankLength = 0;
            this.currentContentIndex = 0;
            this.defaultContent = null;

            this.animationFrameId = null;

            this.spineX = this.config.sheetWidth;
            this.spineYTop = 0;
            this.spineYBottom = this.config.sheetHeight;

            this._setupVisualElements(hostElement);
            this._initializeInteractionHandlers();
            this._loadContent(hostElement);
            this._startAnimationCycle();
            this._drawVisibleSheets();
        }

        _setupVisualElements(targetHost) {
            this.mainContainer = document.createElement('div');
            this.mainContainer.id = 'displayFrame';
            this.mainContainer.classList.add(this.config.outerContainerClass);
            this.mainContainer.style.width = `${this.config.displaySpanWidth}px`;
            this.mainContainer.style.height = `${this.config.sheetHeight + this.config.verticalOffset * 2}px`;

            targetHost.parentNode.insertBefore(this.mainContainer, targetHost.nextSibling);

            this.primaryCanvas = document.createElement('canvas');
            this.primaryCanvas.id = 'mainDisplay';
            this.primaryCanvas.width = this.config.displaySpanWidth;
            this.primaryCanvas.height = this.config.sheetHeight + this.config.verticalOffset * 2;
            this.mainContainer.appendChild(this.primaryCanvas);
            this.primaryBrush = this.primaryCanvas.getContext('2d');

            this.overlayCanvas = document.createElement('canvas');
            this.overlayCanvas.id = 'overlayDisplay';
            this.overlayCanvas.style.position = 'absolute';
            this.overlayCanvas.style.top = `${this.primaryCanvas.offsetTop}px`;
            this.overlayCanvas.style.left = `${this.primaryCanvas.offsetLeft}px`;
            this.overlayCanvas.width = this.primaryCanvas.width;
            this.overlayCanvas.height = this.primaryCanvas.height;
            this.mainContainer.appendChild(this.overlayCanvas);
            this.overlayBrush = this.overlayCanvas.getContext('2d');

            this.primaryBrush.strokeStyle = "#aaaaaa";
            this.primaryBrush.beginPath();
            this.primaryBrush.moveTo(this.config.sheetWidth, this.config.verticalOffset);
            this.primaryBrush.lineTo(this.config.sheetWidth, this.config.sheetHeight + this.config.verticalOffset);
            this.primaryBrush.stroke();

            this.pointerCoordinates = { y: this.config.sheetHeight, x: this.config.sheetWidth * 2 };
            this.guideCoordinates = { y: this.config.sheetHeight, x: this.config.sheetWidth * 2 };
            this.leftSheetActive = false;
        }

        _loadContent(hostElement) {
            this.defaultContent = document.createElement('canvas');
            this.defaultContent.width = this.config.sheetWidth;
            this.defaultContent.height = this.config.sheetHeight;
            const defaultCtx = this.defaultContent.getContext('2d');
            defaultCtx.fillStyle = this.config.baseSheetColor;
            defaultCtx.fillRect(0, 0, this.config.sheetWidth, this.config.sheetHeight);

            const imageElements = hostElement.querySelectorAll('li img');
            this.contentBankLength = imageElements.length + 2;
            
            for (let i = 0; i < this.contentBankLength; i++) {
                this.contentBank[i] = { element: this.defaultContent, loaded: true, type: 'canvas' };
            }

            imageElements.forEach((img, idx) => {
                const imgObj = new Image();
                imgObj.onload = () => {
                    const imgCanvas = document.createElement('canvas');
                    imgCanvas.width = this.config.sheetWidth;
                    imgCanvas.height = this.config.sheetHeight;
                    const imgCtx = imgCanvas.getContext('2d');
                    imgCtx.drawImage(imgObj, 0, 0, this.config.sheetWidth, this.config.sheetHeight);

                    this.contentBank[idx] = { element: imgCanvas, loaded: true, type: 'canvas' };
                    this._drawVisibleSheets();
                };
                imgObj.onerror = () => {
                    console.warn(`Failed to load image: ${img.src}`);
                };
                imgObj.src = img.src;
                this.contentBank[idx] = { element: this.defaultContent, loaded: false, type: 'canvas' };
            });

            if (imageElements.length % 2 === 1) {
                this.contentBank.push({ element: this.defaultContent, loaded: true, type: 'canvas' });
                this.contentBankLength++;
            }
        }

        _initializeInteractionHandlers() {
            this.overlayCanvas.addEventListener('mousemove', this._handlePointerMotion.bind(this));
            this.overlayCanvas.addEventListener('mouseout', this._handlePointerExit.bind(this));
            this.overlayCanvas.addEventListener('mousedown', this._startInteraction.bind(this));
            this.overlayCanvas.addEventListener('touchstart', this._startInteraction.bind(this));

            document.addEventListener('mousemove', this._handleDocumentPointerMove.bind(this));
            document.addEventListener('touchmove', this._handleDocumentTouchMove.bind(this));
            document.addEventListener('mouseup', this._endInteraction.bind(this));
            document.addEventListener('touchend', this._endInteraction.bind(this));
        }

        _getRelativePointerPosition(event) {
            const containerRect = this.mainContainer.getBoundingClientRect();
            let clientX, clientY;

            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            return {
                x: clientX - containerRect.left,
                y: clientY - containerRect.top
            };
        }

        _handlePointerMotion(evt) {
            this.nextInteractionIsClick = false;
            if (!this.isGrabbing && !this.isPageTurning) {
                const relativePos = this._getRelativePointerPosition(evt);
                const adjustedY = relativePos.y - this.config.verticalOffset;

                if (adjustedY >= 0 && adjustedY < this.config.sheetHeight) {
                    if (relativePos.x >= 0 && relativePos.x < this.config.sheetWidth) {
                        this.pointerCoordinates = { x: this.config.edgeGrabSize, y: this.config.sheetHeight - this.config.edgeGrabSize };
                        if (!this.leftSheetActive) {
                            this.leftSheetActive = true;
                            this.guideCoordinates = { x: 0, y: this.config.sheetHeight };
                        }
                    } else if (relativePos.x >= this.config.sheetWidth && relativePos.x < this.config.displaySpanWidth) {
                        this.pointerCoordinates = { x: this.config.displaySpanWidth - this.config.edgeGrabSize, y: this.config.sheetHeight - this.config.edgeGrabSize };
                        if (this.leftSheetActive) {
                            this.leftSheetActive = false;
                            this.guideCoordinates = { x: this.config.displaySpanWidth, y: this.config.sheetHeight };
                        }
                    } else {
                        this.pointerCoordinates = { x: this.leftSheetActive ? 0 : this.config.displaySpanWidth, y: this.config.sheetHeight };
                    }
                } else {
                    this.pointerCoordinates = { x: this.leftSheetActive ? 0 : this.config.displaySpanWidth, y: this.config.sheetHeight };
                }
            }
        }

        _handlePointerExit(evt) {
            if (!this.isGrabbing && !this.isPageTurning) {
                this.pointerCoordinates = { x: this.leftSheetActive ? 0 : this.config.displaySpanWidth, y: this.config.sheetHeight };
            }
        }

        _startInteraction(evt) {
            this.nextInteractionIsClick = true;
            if (!this.isPageTurning) {
                const relativePos = this._getRelativePointerPosition(evt);
                const adjustedY = relativePos.y - this.config.verticalOffset;

                if (adjustedY >= 0 && adjustedY < this.config.sheetHeight) {
                    if (relativePos.x >= 0 && relativePos.x < this.config.sheetWidth) {
                        this.pointerCoordinates = { x: this.config.edgeGrabSize, y: this.config.sheetHeight - this.config.edgeGrabSize };
                        if (!this.leftSheetActive) {
                            this.leftSheetActive = true;
                            this.guideCoordinates = { x: 0, y: this.config.sheetHeight };
                        }
                    } else if (relativePos.x >= this.config.sheetWidth && relativePos.x < this.config.displaySpanWidth) {
                        this.pointerCoordinates = { x: this.config.displaySpanWidth - this.config.edgeGrabSize, y: this.config.sheetHeight - this.config.edgeGrabSize };
                        if (this.leftSheetActive) {
                            this.leftSheetActive = false;
                            this.guideCoordinates = { x: this.config.displaySpanWidth, y: this.config.sheetHeight };
                        }
                    } else {
                        this.pointerCoordinates = { x: this.leftSheetActive ? 0 : this.config.displaySpanWidth, y: this.config.sheetHeight };
                    }

                    evt.preventDefault();
                    this.isGrabbing = true;
                }
            }
        }

        _handleDocumentPointerMove(evt) {
            this.nextInteractionIsClick = false;
            if (!this.isPageTurning && this.isGrabbing) {
                const containerRect = this.mainContainer.getBoundingClientRect();
                this.pointerCoordinates = {
                    x: evt.pageX - containerRect.left,
                    y: evt.pageY - containerRect.top - this.config.verticalOffset
                };
            }
        }

        _handleDocumentTouchMove(evt) {
            this.nextInteractionIsClick = false;
            if (!this.isPageTurning && this.isGrabbing && evt.touches && evt.touches.length === 1) {
                evt.preventDefault();
                const containerRect = this.mainContainer.getBoundingClientRect();
                const touch = evt.touches[0];
                this.pointerCoordinates = {
                    x: touch.clientX - containerRect.left,
                    y: touch.clientY - containerRect.top - this.config.verticalOffset
                };
            }
        }

        _endInteraction(evt) {
            if (this.nextInteractionIsClick) {
                this._handlePageClick();
                return;
            }

            if (!this.isPageTurning) {
                this.isGrabbing = false;

                const isLastPage = this.leftSheetActive ? this.currentContentIndex === 0 : this.currentContentIndex === this.contentBankLength - 2;
                if (isLastPage) {
                    return;
                }

                const currentPointerX = this._getRelativePointerPosition(evt).x;
                const releaseInFlipZone = this.leftSheetActive ? currentPointerX > this.config.sheetWidth : currentPointerX < this.config.sheetWidth;

                if (releaseInFlipZone) {
                    this.pointerCoordinates = { x: this.leftSheetActive ? this.config.displaySpanWidth : 0, y: this.config.sheetHeight };
                    this.isPageTurning = true;
                    this.turnCompletionCallback = this._createTurnCompletionHandler(this.leftSheetActive);
                } else {
                    this.pointerCoordinates = { x: this.leftSheetActive ? this.config.edgeGrabSize : this.config.displaySpanWidth - this.config.edgeGrabSize, y: this.config.sheetHeight - this.config.edgeGrabSize };
                }
            }
        }

        _handlePageClick() {
            if (this.isPageTurning) {
                this._finalizePageTurn();
                this._clearOverlayCanvas();
                this._requestRedraw();
            }

            const isLastPage = this.leftSheetActive ? this.currentContentIndex === 0 : this.currentContentIndex === this.contentBankLength - 2;
            if (isLastPage) {
                return;
            }

            const canTurnPage = this.leftSheetActive ? this.currentContentIndex > 0 : this.currentContentIndex < this.contentBankLength - 2;
            if (canTurnPage) {
                this.pointerCoordinates = { y: this.config.sheetHeight, x: this.leftSheetActive ? this.config.sheetWidth * 2 : 0 };
                this.guideCoordinates = { x: this.leftSheetActive ? 1 : this.config.sheetWidth * 2 - 1, y: this.config.sheetHeight - 1 };
                
                this.isPageTurning = true;
                this.turnCompletionCallback = this._createTurnCompletionHandler(this.leftSheetActive);
            }
        }

        _createTurnCompletionHandler(isLeftTurn) {
            return () => {
                this.currentContentIndex += isLeftTurn ? -2 : 2;
                this.pointerCoordinates = { x: isLeftTurn ? 0 : this.config.displaySpanWidth, y: this.config.sheetHeight };
                this.guideCoordinates = { ...this.pointerCoordinates };
                this._drawVisibleSheets();
                this._clearOverlayCanvas();
                this.isGrabbing = false;
            };
        }

        _finalizePageTurn() {
            if (this.turnCompletionCallback) {
                this.turnCompletionCallback();
                this.turnCompletionCallback = null;
            }
            this.isPageTurning = false;
        }

        _startAnimationCycle() {
            const animate = () => {
                this._updateAnimationState();
                this.animationFrameId = requestAnimationFrame(animate);
            };
            this.animationFrameId = requestAnimationFrame(animate);
        }

        _updateAnimationState() {
            if (this.pointerCoordinates === null) {
                return;
            }

            const deltaY = (this.pointerCoordinates.y - this.guideCoordinates.y) * this.config.movementEase;
            const deltaX = (this.pointerCoordinates.x - this.guideCoordinates.x) * this.config.movementEase;

            if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
                if (this.isPageTurning) {
                    this._finalizePageTurn();
                    this._clearOverlayCanvas();
                    this._requestRedraw();
                }
                return;
            }

            this.guideCoordinates.y += deltaY;
            this.guideCoordinates.x += deltaX;

            this._recalculatePageGeometry();
        }

        _requestRedraw() {
            this._drawVisibleSheets();
        }

        _recalculatePageGeometry() {
            const currentGuideX = this.guideCoordinates.x;
            const currentGuideY = this.guideCoordinates.y;

            let cornerPointX, cornerPointY;

            const sbToGuideDeltaX = currentGuideX - this.spineX;
            const sbToGuideDeltaY = this.spineYBottom - currentGuideY;

            const sbToGuideAngle = Math.atan2(sbToGuideDeltaY, sbToGuideDeltaX);

            const radiusPointX = Math.cos(sbToGuideAngle) * this.config.sheetWidth + this.spineX;
            const radiusPointY = this.spineYBottom - Math.sin(sbToGuideAngle) * this.config.sheetWidth;

            const distToGuideSq = sbToGuideDeltaX * sbToGuideDeltaX + sbToGuideDeltaY * sbToGuideDeltaY;
            const distToRadiusSq = (this.spineYBottom - radiusPointY) * (this.spineYBottom - radiusPointY) + (radiusPointX - this.spineX) * (radiusPointX - this.spineX);

            if (distToRadiusSq < distToGuideSq) {
                cornerPointX = radiusPointX;
                cornerPointY = radiusPointY;
            } else {
                cornerPointX = currentGuideX;
                cornerPointY = currentGuideY;
            }

            const stToCornerDeltaX = this.spineX - cornerPointX;
            const stToCornerDeltaY = cornerPointY - this.spineYTop;

            const distStToCornerSq = stToCornerDeltaX * stToCornerDeltaX + stToCornerDeltaY * stToCornerDeltaY;
            const stToCornerAngle = Math.atan2(stToCornerDeltaY, stToCornerDeltaX);

            if (distStToCornerSq > this.config.sheetHypotenuse * this.config.sheetHypotenuse) {
                cornerPointX = -Math.cos(stToCornerAngle) * this.config.sheetHypotenuse + this.spineX;
                cornerPointY = this.spineYTop + Math.sin(stToCornerAngle) * this.config.sheetHypotenuse;
            }

            const bisectorX = this.leftSheetActive ? cornerPointX / 2 : ((this.config.displaySpanWidth - cornerPointX) / 2 + cornerPointX);
            const bisectorY = (this.config.sheetHeight - cornerPointY) / 2 + cornerPointY;

            const bisectorAngle = Math.atan2(this.config.sheetHeight - bisectorY, this.leftSheetActive ? bisectorX : this.config.displaySpanWidth - bisectorX);
            const bisectorTangentX = bisectorX + Math.tan(bisectorAngle) * (this.config.sheetHeight - bisectorY) * (this.leftSheetActive ? 1 : -1);
            
            const pageAngleDeltaY = this.spineYBottom - cornerPointY;
            const pageAngleDeltaX = bisectorTangentX - cornerPointX;
            this.sheetAngle = this.leftSheetActive ? Math.atan2(-pageAngleDeltaY, -pageAngleDeltaX) : Math.atan2(pageAngleDeltaY, pageAngleDeltaX);

            const pageCenterX = cornerPointX + this.config.sheetWidth / 2 * Math.cos(this.sheetAngle) * (this.leftSheetActive ? -1 : 1)
                + this.config.sheetHeight / 2 * Math.sin(this.sheetAngle);
            const pageCenterY = cornerPointY - this.config.sheetHeight / 2 * Math.cos(this.sheetAngle)
                + this.config.sheetWidth / 2 * Math.sin(this.sheetAngle) * (this.leftSheetActive ? -1 : 1);
            
            const maskTangentAngle = Math.atan2(this.config.sheetHeight - bisectorY, bisectorX - bisectorTangentX);
            const maskRotationAngle = (90 * (maskTangentAngle / Math.abs(maskTangentAngle)) - maskTangentAngle * 180 / Math.PI) * Math.PI / 180;

            const xCoeff = this.spineYBottom - bisectorY;
            const yCoeff = bisectorX - bisectorTangentX;
            const freeCoeff = bisectorTangentX * bisectorY - bisectorX * this.spineYBottom;

            const halfSheetClipX = -(yCoeff * this.config.sheetHeight / 2 + freeCoeff) / xCoeff;
            const halfSheetClipOffset = this.config.clippingWidth / 2 / Math.cos(maskRotationAngle);

            const clipOriginX = halfSheetClipX + halfSheetClipOffset * (this.leftSheetActive ? 1 : -1);
            const clipOriginY = this.config.sheetHeight / 2;

            const backCoverClipOriginX = clipOriginX + (this.leftSheetActive ? -halfSheetClipOffset * 3 : halfSheetClipOffset);

            this._drawFlippingSheet(
                pageCenterX, pageCenterY, this.sheetAngle,
                clipOriginX, clipOriginY, maskRotationAngle,
                backCoverClipOriginX
            );
        }

        _drawFlippingSheet(
            sheetCenterX, sheetCenterY, sheetRotation,
            clipX, clipY, clipRotation,
            backClipX
        ) {
            this._clearOverlayCanvas();

            this.overlayBrush.save();
            this.overlayBrush.translate(clipX, clipY + this.config.verticalOffset);
            this.overlayBrush.rotate(clipRotation);
            this.overlayBrush.beginPath();
            this.overlayBrush.rect(-this.config.clippingWidth / 2, -this.config.clippingHeight / 2, this.config.clippingWidth, this.config.clippingHeight);
            this.overlayBrush.clip();
            this.overlayBrush.rotate(-clipRotation);
            this.overlayBrush.translate(-clipX, -clipY - this.config.verticalOffset);
            this.overlayBrush.translate(sheetCenterX, sheetCenterY + this.config.verticalOffset);
            this.overlayBrush.rotate(sheetRotation);
            this._renderContent(this.overlayBrush, this._getFlippingContent(), -this.config.sheetWidth / 2, -this.config.sheetHeight / 2);
            this.overlayBrush.restore();

            this.overlayBrush.save();
            this.overlayBrush.translate(backClipX, clipY + this.config.verticalOffset);
            this.overlayBrush.rotate(clipRotation);
            this.overlayBrush.beginPath();
            this.overlayBrush.rect(0, -this.config.sheetHypotenuse, this.config.clippingWidth, this.config.clippingHeight);
            this.overlayBrush.clip();
            this.overlayBrush.rotate(-clipRotation);
            this.overlayBrush.translate(-backClipX, -clipY - this.config.verticalOffset);
            this.overlayBrush.translate(0, 0);
            this._renderContent(this.overlayBrush, this._getIncomingContent(), this.leftSheetActive ? 0 : this.config.sheetWidth, this.config.verticalOffset);
            this.overlayBrush.restore();
        }

        _clearOverlayCanvas() {
            this.overlayBrush.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }

        _drawVisibleSheets() {
            this.primaryBrush.clearRect(0, 0, this.primaryCanvas.width, this.primaryCanvas.height);
            this.primaryBrush.strokeStyle = "#aaaaaa";
            this.primaryBrush.beginPath();
            this.primaryBrush.moveTo(this.config.sheetWidth, this.config.verticalOffset);
            this.primaryBrush.lineTo(this.config.sheetWidth, this.config.sheetHeight + this.config.verticalOffset);
            this.primaryBrush.stroke();

            const leftContent = this._getLeftVisibleContent();
            const rightContent = this._getRightVisibleContent();

            if (leftContent && leftContent.loaded) {
                this._renderContent(this.primaryBrush, leftContent, 0, this.config.verticalOffset);
            } else {
                this.primaryBrush.fillStyle = this.config.baseSheetColor;
                this.primaryBrush.fillRect(0, this.config.verticalOffset, this.config.sheetWidth, this.config.sheetHeight);
            }
            
            if (rightContent && rightContent.loaded) {
                this._renderContent(this.primaryBrush, rightContent, this.config.sheetWidth, this.config.verticalOffset);
            } else {
                this.primaryBrush.fillStyle = this.config.baseSheetColor;
                this.primaryBrush.fillRect(this.config.sheetWidth, this.config.verticalOffset, this.config.sheetWidth, this.config.sheetHeight);
            }
        }

        _renderContent(drawingContext, contentObject, drawX, drawY) {
            if (contentObject && contentObject.element) {
                drawingContext.drawImage(contentObject.element, drawX, drawY, this.config.sheetWidth, this.config.sheetHeight);
            }
        }

        _getFlippingContent() {
            return this.contentBank[this.currentContentIndex + (this.leftSheetActive ? 0 : 1)];
        }

        _getIncomingContent() {
            return this.contentBank[this.currentContentIndex + (this.leftSheetActive ? -1 : 2)];
        }

        _getLeftVisibleContent() {
            return this.contentBank[this.currentContentIndex];
        }

        _getRightVisibleContent() {
            return this.contentBank[this.currentContentIndex + 1];
        }
    }

    if (typeof jQuery !== 'undefined') {
        jQuery.fn.bookTurner = function (userSettings) {
            return this.each(function () {
                if (!jQuery.data(this, 'bookTurner')) {
                    jQuery.data(this, 'bookTurner', new BookAnimator(this, userSettings));
                }
            });
        };
    } else {
        globalScope.BookAnimator = BookAnimator;
    }

})(window);