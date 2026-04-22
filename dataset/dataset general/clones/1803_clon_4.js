(function() {
    "use strict";

    // --- Application Constants & Identifiers ---
    const SECRET_PAYLOAD_LIMIT = 1000;
    const PIXEL_COMPONENT_COUNT = 4; // RGBA components per pixel
    const MAX_LSB_UTILIZATION_RATIO = 0.75; // Max capacity for message bits
    const CHARACTER_BIT_LENGTH = 16; // Each character is 16 bits (UTF-16 code unit)

    const DOM_ELEMENT_MAP = Object.freeze({
        FILE_UPLOAD_INPUT: 'file',
        CONCEAL_BUTTON: 'encode',
        REVEAL_BUTTON: 'decode',
        MEDIA_PREVIEW_DISPLAY: 'preview',
        SECRET_TEXT_ENTRY: 'message',
        ENCRYPTION_KEY_INPUT: 'password',
        DECRYPTION_KEY_INPUT: 'password2',
        UNVEILED_MESSAGE_OUTPUT: 'messageDecoded',
        GRAPHICS_CANVAS: 'canvas',
        PROCESSED_MEDIA_OUTPUT: 'output',
        INITIAL_VIEW_SECTION: 'choose',
        REVEALED_VIEW_SECTION: 'reveal'
    });

    const DISPLAY_STYLES = Object.freeze({
        HIDDEN: 'steg-hidden', // Assumes a CSS class: .steg-hidden { display: none; }
        VISIBLE: 'steg-visible' // Assumes a CSS class: .steg-visible { display: block; }
    });

    const USER_NOTIFICATIONS = Object.freeze({
        PAYLOAD_TOO_LARGE_FOR_IMAGE: 'Hidden content exceeds visual medium capacity.',
        PAYLOAD_EXCEEDS_SYSTEM_LIMIT: 'Hidden content is too lengthy.',
        CONCEALMENT_SUCCESS: 'Operation complete! Preserve and disseminate the modified visual.',
        KEY_MISMATCH_OR_NO_CONTENT: 'Decryption key incorrect or no hidden content present.'
    });

    // --- Bit Manipulation Utilities ---
    const BinaryOperations = Object.freeze({
        // Fetches a single bit at a given index from a number (0-indexed from LSB)
        fetchBit: (numericValue, bitPosition) => (numericValue >>> bitPosition) & 1,

        // Inserts a single bit (0 or 1) into a number at a given index
        insertBit: (numericValue, bitPosition, bitValue) =>
            (numericValue & ~(1 << bitPosition)) | (bitValue << bitPosition),

        // Converts a 16-bit number into an array of its individual bits
        decomposeNumberToBits: (val) =>
            Array.from({ length: CHARACTER_BIT_LENGTH }, (_, idx) => BinaryOperations.fetchBit(val, idx)),

        // Reconstructs a 16-bit number from an array of bits
        composeNumberFromBits: (bitArray) =>
            bitArray.reduce((acc, bit, idx) => BinaryOperations.insertBit(acc, idx, bit), 0)
    });

    // --- HTML Sanitization Utilities ---
    const MarkupCleaner = Object.freeze({
        _htmlEntities: Object.freeze({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;',
            '\n': '<br/>'
        }),

        // Converts special HTML characters in a string to their entity equivalents
        scrubContent: (textInput) =>
            String(textInput).replace(/[&<>"'\/\n]/g, (char) => MarkupCleaner._htmlEntities[char])
    });

    // --- Position Generation for Steganography ---
    function* PixelOffsetGenerator(totalComponentCount, cryptographicSeed) {
        const consumedOffsets = new Set();
        let currentSequenceStep = 0;

        while (true) {
            const seedSegment = cryptographicSeed[currentSequenceStep % cryptographicSeed.length];
            let calculatedOffset = Math.abs((seedSegment * (currentSequenceStep + 1) + 1729) % totalComponentCount);

            while (true) {
                if (calculatedOffset >= totalComponentCount) {
                    calculatedOffset = 0; // Wrap around to the beginning
                } else if (consumedOffsets.has(calculatedOffset)) {
                    calculatedOffset++; // Try the next sequential offset
                } else if ((calculatedOffset % PIXEL_COMPONENT_COUNT) === (PIXEL_COMPONENT_COUNT - 1)) {
                    // This is an alpha channel component; skip it
                    calculatedOffset++;
                } else {
                    consumedOffsets.add(calculatedOffset);
                    currentSequenceStep++;
                    yield calculatedOffset; // Provide the valid, unique offset
                    break; // Exit inner loop to continue generating
                }
            }
        }
    }

    // --- Core Steganography Processing ---
    class SteganographyEngine {
        // Converts a message string into a flat array of bits, prefixed by its length
        _messageToBitArray(messagePayload) {
            const lengthInBits = BinaryOperations.decomposeNumberToBits(messagePayload.length);
            return Array.from(messagePayload)
                .reduce((acc, char) => acc.concat(BinaryOperations.decomposeNumberToBits(char.charCodeAt(0))), lengthInBits);
        }

        // Embeds the bit stream into the image pixel components
        embedData(pixelComponentArray, cryptographicSeed, messageText) {
            const dataBitStream = this._messageToBitArray(messageText);

            const requiredBitSlots = dataBitStream.length;
            const availableSlots = pixelComponentArray.length * MAX_LSB_UTILIZATION_RATIO;

            if (requiredBitSlots > availableSlots) {
                throw new Error(USER_NOTIFICATIONS.PAYLOAD_TOO_LARGE_FOR_IMAGE);
            }
            if (messageText.length > SECRET_PAYLOAD_LIMIT) {
                throw new Error(USER_NOTIFICATIONS.PAYLOAD_EXCEEDS_SYSTEM_LIMIT);
            }

            const offsetIterator = PixelOffsetGenerator(pixelComponentArray.length, cryptographicSeed);

            for (let i = 0; i < dataBitStream.length; i++) {
                const bitToPlace = dataBitStream[i];
                const targetPixelOffset = offsetIterator.next().value;

                pixelComponentArray[targetPixelOffset] = BinaryOperations.insertBit(pixelComponentArray[targetPixelOffset], 0, bitToPlace);

                // Ensure the alpha component of the modified pixel is fully opaque
                const alphaComponentOffset = Math.floor(targetPixelOffset / PIXEL_COMPONENT_COUNT) * PIXEL_COMPONENT_COUNT + (PIXEL_COMPONENT_COUNT - 1);
                pixelComponentArray[alphaComponentOffset] = 255;
            }
        }

        // Extracts the bit stream from the image pixel components and reconstructs the message
        extractData(pixelComponentArray, cryptographicSeed) {
            const offsetIterator = PixelOffsetGenerator(pixelComponentArray.length, cryptographicSeed);

            // First, retrieve the length of the hidden message
            const payloadLengthBits = Array.from({ length: CHARACTER_BIT_LENGTH }, () => {
                const offset = offsetIterator.next().value;
                return BinaryOperations.fetchBit(pixelComponentArray[offset], 0);
            });
            const retrievedLength = BinaryOperations.composeNumberFromBits(payloadLengthBits);

            if (retrievedLength === 0 || retrievedLength > SECRET_PAYLOAD_LIMIT ||
                (retrievedLength * CHARACTER_BIT_LENGTH) > (pixelComponentArray.length * MAX_LSB_UTILIZATION_RATIO)) {
                return ''; // Indicates no valid message or an invalid size
            }

            // Next, retrieve the bits for each character of the message
            const characterCodeUnits = Array.from({ length: retrievedLength }, () => {
                const charBits = Array.from({ length: CHARACTER_BIT_LENGTH }, () => {
                    const offset = offsetIterator.next().value;
                    return BinaryOperations.fetchBit(pixelComponentArray[offset], 0);
                });
                return BinaryOperations.composeNumberFromBits(charBits);
            });

            return String.fromCharCode(...characterCodeUnits);
        }
    }

    // --- User Interface Management ---
    class DisplayManager {
        constructor() {
            this._uiElements = new Map();
            this._cacheAllElements();
            this._establishEventDelegation();
        }

        // Stores references to all required DOM elements
        _cacheAllElements() {
            Object.values(DOM_ELEMENT_MAP).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    this._uiElements.set(id, element);
                } else {
                    console.warn(`DOM element with ID '${id}' not found.`);
                }
            });
        }

        // Sets up a single event listener on the document for efficient event handling
        _establishEventDelegation() {
            document.addEventListener('change', this._delegateEvents.bind(this));
            document.addEventListener('click', this._delegateEvents.bind(this));
        }

        // Routes delegated events to specific handlers based on the element's ID
        _delegateEvents(domEvent) {
            const targetId = domEvent.target.id;
            switch (targetId) {
                case DOM_ELEMENT_MAP.FILE_UPLOAD_INPUT:
                    this.onFileSelectionAction && this.onFileSelectionAction(domEvent);
                    break;
                case DOM_ELEMENT_MAP.CONCEAL_BUTTON:
                    this.onConcealAction && this.onConcealAction(domEvent);
                    break;
                case DOM_ELEMENT_MAP.REVEAL_BUTTON:
                    this.onRevealAction && this.onRevealAction(domEvent);
                    break;
                default:
                    break;
            }
        }

        // --- Element Accessors ---
        getFileInputElement() { return this._uiElements.get(DOM_ELEMENT_MAP.FILE_UPLOAD_INPUT); }
        getSecretMessage() { return this._uiElements.get(DOM_ELEMENT_MAP.SECRET_TEXT_ENTRY).value; }
        getEncryptionKey() { return this._uiElements.get(DOM_ELEMENT_MAP.ENCRYPTION_KEY_INPUT).value; }
        getDecryptionKey() { return this._uiElements.get(DOM_ELEMENT_MAP.DECRYPTION_KEY_INPUT).value; }
        getCanvasContext2D() { return this._uiElements.get(DOM_ELEMENT_MAP.GRAPHICS_CANVAS).getContext('2d'); }
        getCanvasElement() { return this._uiElements.get(DOM_ELEMENT_MAP.GRAPHICS_CANVAS); }

        // --- Element Modifiers ---
        setMediaPreviewSource(srcURL) {
            this._uiElements.get(DOM_ELEMENT_MAP.MEDIA_PREVIEW_DISPLAY).src = srcURL;
            this.showElement(DOM_ELEMENT_MAP.MEDIA_PREVIEW_DISPLAY);
        }

        setProcessedImageSource(srcURL) {
            this._uiElements.get(DOM_ELEMENT_MAP.PROCESSED_MEDIA_OUTPUT).src = srcURL;
        }

        setUnveiledMessage(htmlString) {
            this._uiElements.get(DOM_ELEMENT_MAP.UNVEILED_MESSAGE_OUTPUT).innerHTML = htmlString;
        }

        resetInputControls() {
            this._uiElements.get(DOM_ELEMENT_MAP.SECRET_TEXT_ENTRY).value = '';
            this._uiElements.get(DOM_ELEMENT_MAP.ENCRYPTION_KEY_INPUT).value = '';
            this._uiElements.get(DOM_ELEMENT_MAP.DECRYPTION_KEY_INPUT).value = '';
            this.setUnveiledMessage('');
        }

        showElement(id) {
            const element = this._uiElements.get(id);
            element.classList.remove(DISPLAY_STYLES.HIDDEN);
            element.classList.add(DISPLAY_STYLES.VISIBLE);
        }

        hideElement(id) {
            const element = this._uiElements.get(id);
            element.classList.remove(DISPLAY_STYLES.VISIBLE);
            element.classList.add(DISPLAY_STYLES.HIDDEN);
        }

        presentNotification(message) {
            window.alert(message);
        }
    }

    // --- Application Workflow Orchestrator ---
    class ApplicationWorkflow {
        constructor(displayManager, steganoEngine) {
            this._display = displayManager;
            this._stegano = steganoEngine;

            // Link display manager events to controller actions
            this._display.onFileSelectionAction = this._onFileSelected.bind(this);
            this._display.onConcealAction = this._onConcealTriggered.bind(this);
            this._display.onRevealAction = this._onRevealTriggered.bind(this);
        }

        // Handles the event when a user selects a file
        _onFileSelected(domEvent) {
            const filesAvailable = domEvent.target.files;
            if (filesAvailable.length === 0) return;

            const mediaFileHandler = new FileReader();

            mediaFileHandler.onload = async (readResultEvent) => {
                this._display.setMediaPreviewSource(readResultEvent.target.result);
                this._display.resetInputControls();

                const visualAsset = new Image();
                visualAsset.onload = () => {
                    const renderContext = this._display.getCanvasContext2D();
                    renderContext.canvas.width = visualAsset.width;
                    renderContext.canvas.height = visualAsset.height;
                    renderContext.drawImage(visualAsset, 0, 0);

                    // Automatically attempt to reveal data after image load
                    this._onRevealTriggered();
                };
                visualAsset.src = readResultEvent.target.result;
            };

            mediaFileHandler.readAsDataURL(filesAvailable[0]);
        }

        // Handles the event when the conceal button is pressed
        _onConcealTriggered() {
            const secretMessage = this._display.getSecretMessage();
            const encryptionKey = this._display.getEncryptionKey();
            const renderContext = this._display.getCanvasContext2D();
            const canvasElement = this._display.getCanvasElement();

            let finalPayload;
            if (encryptionKey.length > 0) {
                finalPayload = sjcl.encrypt(encryptionKey, secretMessage);
            } else {
                finalPayload = JSON.stringify({ 'unencrypted_payload': secretMessage });
            }

            try {
                const pixelDataBuffer = renderContext.getImageData(0, 0, renderContext.canvas.width, renderContext.canvas.height);
                // Generate a cryptographic seed from the key for pseudo-random pixel selection
                const positioningHash = sjcl.hash.sha256.hash(encryptionKey);

                this._stegano.embedData(pixelDataBuffer.data, positioningHash, finalPayload);
                renderContext.putImageData(pixelDataBuffer, 0, 0);

                this._display.presentNotification(USER_NOTIFICATIONS.CONCEALMENT_SUCCESS);
                this._display.setProcessedImageSource(canvasElement.toDataURL());

            } catch (error) {
                this._display.presentNotification(error.message);
            }
        }

        // Handles the event when the reveal button is pressed
        _onRevealTriggered() {
            const decryptionKey = this._display.getDecryptionKey();
            const renderContext = this._display.getCanvasContext2D();
            const pixelDataBuffer = renderContext.getImageData(0, 0, renderContext.canvas.width, renderContext.canvas.height);
            const positioningHash = sjcl.hash.sha256.hash(decryptionKey);

            const recoveredPayload = this._stegano.extractData(pixelDataBuffer.data, positioningHash);

            let parsedContent = null;
            try {
                parsedContent = JSON.parse(recoveredPayload);
            } catch (e) {
                this._display.showElement(DOM_ELEMENT_MAP.INITIAL_VIEW_SECTION);
                this._display.hideElement(DOM_ELEMENT_MAP.REVEALED_VIEW_SECTION);
                if (decryptionKey.length > 0) {
                    this._display.presentNotification(USER_NOTIFICATIONS.KEY_MISMATCH_OR_NO_CONTENT);
                }
                return;
            }

            if (parsedContent) {
                this._display.hideElement(DOM_ELEMENT_MAP.INITIAL_VIEW_SECTION);
                this._display.showElement(DOM_ELEMENT_MAP.REVEALED_VIEW_SECTION);

                let finalDecipheredText = parsedContent.unencrypted_payload;
                if (parsedContent.ct) { // Check for encrypted content marker
                    try {
                        finalDecipheredText = sjcl.decrypt(decryptionKey, recoveredPayload);
                    } catch (e) {
                        this._display.presentNotification(USER_NOTIFICATIONS.KEY_MISMATCH_OR_NO_CONTENT);
                        this._display.setUnveiledMessage(''); // Clear output on decryption failure
                        return;
                    }
                }
                this._display.setUnveiledMessage(MarkupCleaner.scrubContent(finalDecipheredText));
            }
        }
    }

    // --- Application Entry Point ---
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize display states (hide preview, hide revealed section, show initial section)
        document.getElementById(DOM_ELEMENT_MAP.MEDIA_PREVIEW_DISPLAY).classList.add(DISPLAY_STYLES.HIDDEN);
        document.getElementById(DOM_ELEMENT_MAP.REVEALED_VIEW_SECTION).classList.add(DISPLAY_STYLES.HIDDEN);
        document.getElementById(DOM_ELEMENT_MAP.INITIAL_VIEW_SECTION).classList.add(DISPLAY_STYLES.VISIBLE);

        const uiManagerInstance = new DisplayManager();
        const steganoEngineInstance = new SteganographyEngine();
        new ApplicationWorkflow(uiManagerInstance, steganoEngineInstance); // Start the application logic
    });

})();