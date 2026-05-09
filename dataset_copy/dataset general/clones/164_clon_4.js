// Helper for event.preventDefault()
function preventDefaultAction(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    return false;
}

// A minimal replacement for the highlight effect (original used Effect.Highlight)
function applyHighlight(elementIdentifier, options) {
    const targetElement = document.getElementById(elementIdentifier);
    if (targetElement) {
        const initialColor = options.startcolor || '#ffff99';
        const finalColor = options.endcolor || '#ffffff';
        const transitionDuration = options.duration || 0.5; // seconds

        targetElement.style.transition = `background-color ${transitionDuration}s ease-in-out`;
        targetElement.style.backgroundColor = initialColor;

        setTimeout(() => {
            targetElement.style.backgroundColor = finalColor;
            setTimeout(() => {
                targetElement.style.transition = ''; // Remove transition after effect
                targetElement.style.backgroundColor = ''; // Reset to default
            }, transitionDuration * 1000);
        }, 10); // Small delay to ensure transition starts
    }
}

// Placeholder for `SegEdit` class (external dependency, not part of the cloning task)
function SegEdit(lineData, visualHandler, lineElement, managerInstance) {
    console.log("SegEdit initiated for line:", lineData.id);
    // This would contain the actual segmentation editing logic
    // For the purpose of cloning, we just need to know it's called.
}

class DocumentSectionManager {
    constructor(docData, visualHandler, contentElementId, searchWords, zoomConfiguration) {
        this.documentDataSource = docData;
        this.visualDisplayHandler = visualHandler;
        this.contentDisplayElement = document.getElementById(contentElementId);
        this.searchTerms = (searchWords ? searchWords.toLowerCase().split(" ") : []);
        this.visualBlockOverlays = [];
        this.pendingModifications = {};
        this.sequentialTextUnits = [];
        this.activeEditSession = null;
        this.preventLineInteraction = false;
        this.maximumLineExtent = 0;
        this.currentLineMarker = null;
        this.currentWordMarker = null;

        this.populateTextAreas();
    }

    populateTextAreas() {
        this.documentDataSource.blocks.forEach(dataBlock => {
            this.processTextSegment(dataBlock);
            this.visualBlockOverlays.push(this.visualDisplayHandler.addOverlay(
                dataBlock.hpos,
                dataBlock.vpos,
                dataBlock.width,
                dataBlock.height,
                "red",
                true,
                dataBlock.id + "_region",
                (event) => {
                    const targetId = event.currentTarget.id.replace("_region", "");
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        // Check for IE compatibility, similar to original Prototype.Browser.IE
                        const isIE = window.ActiveXObject || "ActiveXObject" in window;
                        this.contentDisplayElement.scrollTop = targetElement.offsetTop - (isIE ? 0 : this.contentDisplayElement.offsetTop);
                        applyHighlight(targetId, { startcolor: '#ffff99', endcolor: '#ffffff' });
                        this.visualDisplayHandler.setPosition(dataBlock.hpos * this.visualDisplayHandler.getZoom(), (dataBlock.vpos * this.visualDisplayHandler.getZoom()));
                        this.visualDisplayHandler.render();
                    }
                }
            ));
        });
    }

    processTextSegment(segmentData) {
        const segmentElement = document.createElement("div");
        segmentElement.id = segmentData.id;

        segmentData.lines.forEach(dataLine => {
            const lineElement = document.createElement("div");
            lineElement.id = dataLine.id;
            lineElement.className = "altoLineDiv";

            lineElement.addEventListener("mouseover", (event) => {
                lineElement.style.backgroundColor = "#dfd";
                lineElement.style.cursor = "pointer";
                this.markTextLine(dataLine);
            });

            lineElement.addEventListener("mousemove", (event) => {
                document.querySelectorAll('.seg_corrector').forEach(el => el.style.display = 'none');
                const rect = lineElement.getBoundingClientRect();
                if (event.clientX > (rect.left + rect.width - 40)) {
                    const corrector = document.getElementById(lineElement.id + ":corrector1");
                    if (corrector) corrector.style.display = 'block';
                }
            });

            this.attachDynamicCorrectionTool(lineElement);

            dataLine.strings.forEach(textUnit => {
                if (!textUnit["delete"]) {
                    const wordIdentifier = `${segmentData.id}:${dataLine.id}:${textUnit.id}`;
                    this.sequentialTextUnits.push(wordIdentifier);
                    const wordElement = document.createElement("span");
                    wordElement.id = wordIdentifier;
                    wordElement.textContent = textUnit.content;
                    if (textUnit.updated) {
                        wordElement.style.color = "green";
                    }

                    lineElement.appendChild(wordElement);
                    lineElement.insertAdjacentHTML('beforeend', '\u00A0'); // Non-breaking space

                    wordElement.addEventListener("click", (event) => {
                        this.initiateWordEdit(wordElement);
                    });
                    wordElement.addEventListener("mouseover", (event) => {
                        wordElement.style.backgroundColor = "#ddf";
                        wordElement.style.cursor = "pointer";
                        this.markWord(textUnit);
                    });
                    wordElement.addEventListener("mouseout", (event) => {
                        wordElement.style.backgroundColor = "transparent";
                    });
                }
            });

            lineElement.addEventListener("click", (event) => {
                this.adjustViewportForLine(dataLine, segmentData, this.getRelativeScrollPosition(lineElement));
                this.markTextLine(dataLine);
                const hasInputField = Array.from(lineElement.children).some(child => child.id && child.id.endsWith('_edit_field'));
                if (!hasInputField && !this.preventLineInteraction) {
                    const firstWordElement = Array.from(lineElement.children).find(child => child.tagName === 'SPAN');
                    if (firstWordElement) {
                        this.initiateWordEdit(firstWordElement);
                    }
                }
            });

            lineElement.addEventListener("mouseout", (event) => {
                lineElement.style.backgroundColor = "transparent";
            });

            this.maximumLineExtent = Math.max(this.maximumLineExtent, dataLine.width);
            segmentElement.appendChild(lineElement);

            if (!this.verifySegmentIntegrity(lineElement)) {
                this.attachSegmentationCorrectionTool(lineElement);
            }
        });
        this.contentDisplayElement.appendChild(segmentElement);
        this.contentDisplayElement.insertAdjacentHTML('beforeend', '<br>');
    }

    locateLineById(lineIdentifier) {
        return this.documentDataSource.blocks.flatMap(block => block.lines)
                   .find(line => line.id === lineIdentifier);
    }

    locateWordById(wordIdentifier) {
        const actualWordId = wordIdentifier.split(":").pop();
        return this.documentDataSource.blocks.flatMap(block => block.lines)
                   .flatMap(line => line.strings)
                   .find(word => word.id === actualWordId);
    }

    getRelativeScrollPosition(targetElement) {
        return targetElement.offsetTop - this.getCurrentScrollOffset();
    }

    getCurrentScrollOffset() {
        const isIE = window.ActiveXObject || "ActiveXObject" in window;
        return this.contentDisplayElement.scrollTop + (isIE ? 0 : this.contentDisplayElement.offsetTop);
    }

    adjustViewportForLine(dataLine, segmentData, atRelativePosition) {
        let newZoomFactor = 1.0 - ((this.maximumLineExtent + 60) / this.documentDataSource.page_width);

        if (newZoomFactor < 0.5) {
            newZoomFactor = 0.5;
        }
        // Assuming visualDisplayHandler provides a way to get container width
        const containerWidth = parseInt(this.visualDisplayHandler.getContainerWidth(), 10);
        if (newZoomFactor * dataLine.width > containerWidth + 60) {
            newZoomFactor *= containerWidth / (newZoomFactor * (this.maximumLineExtent + 60));
        }
        this.visualDisplayHandler.setZoom(newZoomFactor);
        this.visualDisplayHandler.setPosition((dataLine.hpos * this.visualDisplayHandler.getZoom()) - 20, (dataLine.vpos * this.visualDisplayHandler.getZoom()) - atRelativePosition);
        this.visualDisplayHandler.render();
    }

    markTextLine(dataLine) {
        if (this.currentLineMarker) {
            this.visualDisplayHandler.dropOverlay(this.currentLineMarker);
        }
        this.currentLineMarker = this.visualDisplayHandler.addOverlay(dataLine.hpos, dataLine.vpos, dataLine.width, dataLine.height, "blue");
    }

    markWord(textUnit, customColor) {
        if (this.currentWordMarker) {
            this.visualDisplayHandler.dropOverlay(this.currentWordMarker);
        }
        this.currentWordMarker = this.visualDisplayHandler.addOverlay(textUnit.hpos, textUnit.vpos, textUnit.width, textUnit.height, (customColor || "blue"));
    }

    attachSegmentationCorrectionTool(lineElement) {
        const correctionLink = document.createElement("a");
        correctionLink.style.cssText = "color: red; font-weight: bold; margin-right: 40px; text-decoration: underline";
        correctionLink.id = lineElement.id + ":correction_tool";
        correctionLink.textContent = "!!!";
        lineElement.appendChild(correctionLink);

        correctionLink.addEventListener("click", (event) => {
            this.persistActiveEdit();
            this.preventLineInteraction = true;
            new SegEdit(this.locateLineById(lineElement.id), this.visualDisplayHandler, lineElement, this);
        });
    }

    attachDynamicCorrectionTool(lineElement) {
        const dynamicLink = document.createElement("a");
        dynamicLink.style.cssText = "float: right; color: blue; font-weight: bold; margin-right: 3px; text-decoration: underline";
        dynamicLink.className = "seg_corrector";
        dynamicLink.id = lineElement.id + ":corrector1";
        dynamicLink.textContent = "...";
        lineElement.appendChild(dynamicLink);

        dynamicLink.addEventListener("click", (event) => {
            this.persistActiveEdit();
            this.preventLineInteraction = true;
            new SegEdit(this.locateLineById(lineElement.id), this.visualDisplayHandler, lineElement, this);
        });
        dynamicLink.style.display = 'none';
    }

    applySegmentModifications(deletedUnits, resizedUnits, insertedUnits, contentUpdates, lineElement) {
        const dataLine = this.locateLineById(lineElement.id);
        if (!dataLine) return;

        insertedUnits.forEach(insertData => {
            const wordElements = Array.from(lineElement.children).filter(el => el.tagName === 'SPAN');
            let insertionIndex = -1;

            for (let i = 0; i < wordElements.length; ++i) {
                const currentWord = this.locateWordById(wordElements[i].id);
                const nextWord = (i === wordElements.length - 1 ? null : this.locateWordById(wordElements[i+1].id));

                if (currentWord && currentWord.hpos < insertData.hpos && (!nextWord || nextWord.hpos > insertData.hpos)) {
                    insertionIndex = i + 1;
                    break;
                }
                if (currentWord && !nextWord && currentWord.hpos < insertData.hpos) {
                    insertionIndex = i + 1;
                    break;
                }
            }
            if (insertionIndex === -1) insertionIndex = wordElements.length;

            const newSpanId = `${lineElement.parentElement.id}:${lineElement.id}:${insertData.id}`;
            const newSpan = document.createElement("span");
            newSpan.id = newSpanId;
            newSpan.style.color = "green";
            newSpan.textContent = insertData.content;

            if (insertionIndex < wordElements.length) {
                lineElement.insertBefore(newSpan, wordElements[insertionIndex]);
                lineElement.insertBefore(document.createTextNode('\u00A0'), newSpan); // Non-breaking space
            } else {
                lineElement.appendChild(document.createTextNode('\u00A0'));
                lineElement.appendChild(newSpan);
            }

            dataLine.strings.splice(insertionIndex, 0, insertData);
            const prevWordId = (insertionIndex > 0 && wordElements[insertionIndex-1]) ? wordElements[insertionIndex-1].id : null;
            const prevWordSeqIndex = prevWordId ? this.sequentialTextUnits.indexOf(prevWordId) : -1;
            this.sequentialTextUnits.splice(prevWordSeqIndex + 1, 0, newSpanId);

            newSpan.addEventListener("click", (event) => this.initiateWordEdit(newSpan));
            newSpan.addEventListener("mouseover", (event) => { newSpan.style.backgroundColor = "#ddf"; newSpan.style.cursor = "pointer"; this.markWord(insertData); });
            newSpan.addEventListener("mouseout", (event) => newSpan.style.backgroundColor = "transparent");

            this.recordChangeEntry("insert", newSpanId, "after", prevWordId || "");
            this.recordChangeEntry("insert", newSpanId, "width", insertData.width);
            this.recordChangeEntry("insert", newSpanId, "hpos", insertData.hpos);
            this.recordChangeEntry("insert", newSpanId, "vpos", insertData.vpos);
            this.recordChangeEntry("insert", newSpanId, "height", insertData.height);
            this.recordChangeEntry("insert", newSpanId, "content", insertData.content);
        });

        contentUpdates.forEach(updateData => {
            const targetSpan = document.getElementById(`${lineElement.parentElement.id}:${lineElement.id}:${updateData.id}`);
            if (targetSpan) {
                targetSpan.textContent = updateData.content;
                this.recordChangeEntry("update", targetSpan.id, "content", updateData.content);
            }
        });

        resizedUnits.forEach(resizeData => {
            const word = this.locateWordById(resizeData.id);
            if (word) {
                word.hpos += resizeData.left;
                word.width += resizeData.width;
                this.recordChangeEntry("update", resizeData.id, "width", word.width);
                this.recordChangeEntry("update", resizeData.id, "hpos", word.hpos);
            }
        });

        deletedUnits.forEach(deletedId => {
            const deletedElement = document.getElementById(deletedId);
            if (deletedElement) {
                deletedElement.remove();
                const indexInSequence = this.sequentialTextUnits.indexOf(deletedId);
                if (indexInSequence > -1) {
                    this.sequentialTextUnits.splice(indexInSequence, 1);
                }
                this.recordChangeEntry("update", deletedId, "delete", "true");
            }
        });

        if (this.verifySegmentIntegrity(lineElement)) {
            const correctorLink = document.getElementById(lineElement.id + ":correction_tool");
            if (correctorLink) correctorLink.remove();
        }
    }

    recordChangeEntry(actionType, elementId, keyName, valueData) {
        const form = document.getElementById('update_form');
        if (!form) {
            console.warn("Update form with ID 'update_form' not found. Cannot record change.");
            return;
        }

        const inputName = `${actionType}[${elementId}][${keyName}]`;
        let existingInput = form.querySelector(`input[name="${inputName}"]`);

        if (existingInput) {
            existingInput.value = valueData;
        } else {
            const newInput = document.createElement("input");
            newInput.setAttribute("name", inputName);
            newInput.setAttribute("value", valueData);
            newInput.setAttribute("type", "hidden");
            form.appendChild(newInput);
        }
    }

    verifySegmentIntegrity(lineElement) {
        const wordSpans = Array.from(lineElement.children).filter(el => el.tagName === 'SPAN');
        for (const span of wordSpans) {
            const content = span.textContent;
            // Check for empty string, multiple spaces, or a string with multiple words
            if (content.trim() === "" || /\s{2,}/.test(content) || (content.length > 1 && content.includes(' '))) {
                return false;
            }
        }
        return true;
    }

    persistActiveEdit() {
        if (this.activeEditSession) {
            const editField = this.activeEditSession.input;
            const originalSpan = document.getElementById(editField.name);
            const lineElement = originalSpan.closest(".altoLineDiv");

            editField.removeEventListener("mouseover", this.activeEditSession.mouseoverHandler);
            editField.removeEventListener("keydown", this.activeEditSession.keydownHandler);

            const fieldValue = editField.value === "" ? "\u00A0" : editField.value; // Non-breaking space for empty

            if (fieldValue !== originalSpan.textContent) {
                this.pendingModifications[editField.name] = fieldValue;
                this.recordChangeEntry("update", editField.name, "content", fieldValue);
                originalSpan.style.color = "green";
            }
            originalSpan.textContent = fieldValue;
            originalSpan.style.display = ''; // Show the span

            if (this.verifySegmentIntegrity(lineElement)) {
                const corrector = document.getElementById(lineElement.id + ":correction_tool");
                if (corrector) corrector.remove();
            } else if (!document.getElementById(lineElement.id + ":correction_tool")) {
                this.attachSegmentationCorrectionTool(lineElement);
            }

            editField.remove();
            this.activeEditSession = null;
        }
        return true;
    }

    initiateWordEdit(wordElement) {
        if (this.persistActiveEdit()) {
            const editField = document.createElement("input");
            editField.setAttribute("type", "text");
            editField.value = wordElement.textContent === '\u00A0' ? "" : wordElement.textContent;
            editField.name = wordElement.id;
            editField.style.width = `${Math.max(10 * editField.value.length, 50)}px`;
            editField.style.color = wordElement.style.color;
            editField.id = wordElement.id + "_edit_field";

            this.markWord(this.locateWordById(wordElement.id), "#2A2");
            wordElement.style.display = 'none';
            wordElement.insertAdjacentElement('afterend', editField);

            const keydownHandler = (event) => {
                const k = event.keyCode || event.which;
                if (k === 9) { // Tab
                    this.persistActiveEdit();
                    this.navigateEditHorizontally(editField.name, event.shiftKey ? -1 : 1);
                    return preventDefaultAction(event);
                } else if (k === 13) { // Enter
                    this.persistActiveEdit();
                    return preventDefaultAction(event);
                } else if (k === 38) { // Up arrow
                    this.navigateEditVertically(editField.closest(".altoLineDiv").id, -1);
                    return preventDefaultAction(event);
                } else if (k === 40) { // Down arrow
                    this.navigateEditVertically(editField.closest(".altoLineDiv").id, 1);
                    return preventDefaultAction(event);
                } else if (k === 39 || k === 37) { // Left or Right arrow
                    let caretPos = editField.selectionStart;

                    if (caretPos === 0 && k === 37) { // Left at start
                        this.navigateEditHorizontally(editField.name, -1);
                        return preventDefaultAction(event);
                    } else if (caretPos === editField.value.length && k === 39) { // Right at end
                        this.navigateEditHorizontally(editField.name, 1);
                        return preventDefaultAction(event);
                    }
                }
            };

            const mouseoverHandler = (event) => {
                this.markWord(this.locateWordById(event.target.name));
            };

            editField.addEventListener("mouseover", mouseoverHandler);
            editField.addEventListener("keydown", keydownHandler);

            this.activeEditSession = {
                input: editField,
                mouseoverHandler: mouseoverHandler,
                keydownHandler: keydownHandler
            };

            setTimeout(() => {
                editField.focus();
                editField.select();
            }, 50);
        }
    }

    navigateEditHorizontally(currentWordIdentifier, direction) {
        const currentIndex = this.sequentialTextUnits.indexOf(currentWordIdentifier);
        const nextIndex = currentIndex + direction;

        if (this.sequentialTextUnits[nextIndex]) {
            const targetWordElement = document.getElementById(this.sequentialTextUnits[nextIndex]);
            if (targetWordElement) {
                this.initiateWordEdit(targetWordElement);
                const currentLineElement = document.getElementById(currentWordIdentifier).closest(".altoLineDiv");
                const targetLineElement = targetWordElement.closest(".altoLineDiv");

                if (currentLineElement && targetLineElement && currentLineElement.id !== targetLineElement.id) {
                    this.adjustViewportForLine(this.locateLineById(targetLineElement.id), null, this.getRelativeScrollPosition(targetLineElement));
                }
            }
        }
    }

    navigateEditVertically(currentLineIdentifier, direction) {
        const allLineElements = Array.from(document.querySelectorAll("#" + this.contentDisplayElement.id + " div.altoLineDiv"));
        const lineIdentifiers = allLineElements.map(el => el.id);

        const currentIndex = lineIdentifiers.indexOf(currentLineIdentifier);
        const nextIndex = currentIndex + direction;

        if (lineIdentifiers[nextIndex]) {
            const targetLineElement = document.getElementById(lineIdentifiers[nextIndex]);
            if (targetLineElement) {
                const firstWordInLine = Array.from(targetLineElement.children).find(child => child.tagName === 'SPAN');
                if (firstWordInLine) {
                    this.initiateWordEdit(firstWordInLine);
                    this.adjustViewportForLine(this.locateLineById(targetLineElement.id), null, this.getRelativeScrollPosition(targetLineElement));
                }
            }
        }
    }
}