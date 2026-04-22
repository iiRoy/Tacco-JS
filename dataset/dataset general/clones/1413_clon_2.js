_(function() {
    // API keys for the content service
    var apiKeys = [
        'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6'
    ];

    // Initialize the content service application
    SndCld.initService({
        elementId: apiKeys[0]
    });

    // Adjust document and grid dimensions upon loading
    _(document).getHeight(_(window).getHeight());
    _("#mainGrid").getHeight(_(document).getHeight() - _("#topBanner").getHeight());

    // Configuration variables for the display grid
    var columnCount = 3; // Total columns in the layout
    var rowCount = 2;    // Total rows in the layout
    var totalPlayers;    // Calculated number of players to integrate

    // State variables for the currently playing item
    var activeRow = -1;  // Row index of the currently active player
    var activeColumn = -1; // Column index of the currently active player

    // Calculate dimensions for individual media elements
    var mediaWidth = _("#mainGrid").getWidth() / columnCount;
    var mediaHeight = _("#mainGrid").getHeight() / rowCount;

    // Data structures to hold various elements and content
    var allMusicItems = [];  // Stores all retrieved music tracks
    var mediaPlayers = [];   // Array of audio player elements
    var headingElements = []; // Array of H2 title elements
    var imageElements = [];  // Array of image artwork elements

    var isLocked = false;    // Flag to prevent mouse interaction if true

    // Event handler for when the initial welcome popup is dismissed
    _('#welcome-popup').on('close.bootstrap.modal', function (modalEvent) {
        localDataStore.storeValue('popupShown', true); // Mark popup as seen in local storage
        fetchAndPopulateTunes("trance music");
    });

    // Check if the welcome popup has been shown before
    if (localDataStore.retrieveValue("popupShown")) {
        // If already shown, proceed to load content
        fetchAndPopulateTunes("trance music");
    } else {
        // Otherwise, display the welcome popup
        _("#welcome-popup").displayPopup('open');
    }

    // Event listeners for window resizing
    _(window).windowResize(function() {
        adjustLayout();
    });
    _(document).windowResize(function() {
        adjustLayout();
    });

    // Function to handle layout adjustments after a resize event
    function adjustLayout() {
        _(document).getHeight(_(window).getHeight());
        _("#mainGrid").getHeight(_(document).getHeight() - _("#topBanner").getHeight());
        mediaWidth = _("#mainGrid").getWidth() / columnCount;
        mediaHeight = _("#mainGrid").getHeight() / rowCount;
        updateCardDimensions();
    }

    // Function to construct the grid of media players, images, and titles
    // Initially, all elements are empty placeholders
    function constructPlayGrid() {
        console.info("Building the display grid now.");
        isLocked = false; // Ensure interaction is enabled when rebuilding

        var rowIndex = 0, colIndex = 0;

        var displayGrid = _("#mainGrid");
        for (rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            for (colIndex = 0; colIndex < columnCount; colIndex++) {
                // Create a new audio player element
                var playerElement = _('<audio/>').setAttribute('elementId', 'soundbox' + rowIndex + colIndex);
                // Create a new image element for artwork
                var imgElement = _('<img/>').setAttribute("elementId", "artwork" + rowIndex + colIndex);
                // Create a new H2 element for the title
                var titleElement = _('<h2/>');

                // Apply attributes to the audio player
                playerElement.setAttribute("loopPlayback", "true");
                playerElement.setAttribute("showControls", "true");
                playerElement.setAttribute("autoPlayContent", "true");

                // Set dimensions for the image element
                imgElement.getWidth(mediaWidth);
                imgElement.getHeight(mediaHeight);

                // Add elements to the grid
                displayGrid.appendToParent(imgElement);
                displayGrid.appendToParent(titleElement);
                displayGrid.appendToParent(playerElement);

                // Store references to the created elements
                mediaPlayers.addToList(playerElement);
                headingElements.addToList(titleElement);
                imageElements.addToList(imgElement);
            }
        }

        updateCardDimensions(); // Ensure proper sizing after creation
    }

    // Function to clear existing content from the DOM and reset state
    function clearPreviousContent() {
        _("audio").deleteElement();
        _("img").deleteElement();
        _("h2").deleteElement();
        mediaPlayers = [];
        headingElements = [];
        imageElements = [];
        var activeRow = 0; // Reset active row
        var activeColumn = 0; // Reset active column
    }

    // Main function to handle search input
    _('#queryInput').keyPressEvent(function(kbdEvent) {
        if (kbdEvent.keyCode == 13) { // Check for Enter key press
            gAnalytics('send', 'event', 'input', 'search');
            kbdEvent.preventDefaultAction(); // Prevent default form submission
            var sQuery = _("#queryInput").getCurrentValue();
            fetchAndPopulateTunes(sQuery);
        }
    });

    // Handles the locking mechanism by toggling the interaction flag
    function manageLockState(kbdEvent) {
        if (kbdEvent.shiftKey && kbdEvent.keyCode == 76) {
            // Shift + L pressed, toggle the locked state
            isLocked = !isLocked;
        }
    }

    _(window).keyPressEvent(function(kbdEvent) {
        gAnalytics('send', 'event', 'input', 'locking');
        manageLockState(kbdEvent);
    });
    
    // Resets the grid, reconstructs it, and fetches new songs
    function fetchAndPopulateTunes(searchQuery) {
        clearPreviousContent();
        constructPlayGrid();

        SndCld.fetch('/tracks', { searchQuery: searchQuery, maxResults: 5 * columnCount * rowCount }, function(retrievedItems) {
            // Randomize the order of retrieved items
            retrievedItems.shuffleItems(function() { 
                return 0.5 - Rndm.value(); 
            });
            allMusicItems = retrievedItems;
            loadContentIntoPlayers();
        });
    }

    // Loads the fetched content into the media players
    function loadContentIntoPlayers() {
        totalPlayers = Rndm.min(mediaPlayers.length, allMusicItems.length);
        var itemsCount = 0;
        var loopIndex = 0;

        while (itemsCount < totalPlayers) {
            var currentItem = allMusicItems.extractLast();
            if (currentItem.isStreamable === true) {
                console.info(currentItem);
                var playerElement = mediaPlayers[itemsCount];
                playerElement.setAttribute("sourcePath", currentItem.mediaUrl + "?elementId=" + apiKeys[itemsCount % 2]);
                playerElement[0].audioLevel = 0; // Mute initially
                playerElement[0].startPlayback();

                _(headingElements[itemsCount]).appendToParent("<a href='" + currentItem.resourceLink + "' target='_blank'>" + currentItem.itemTitle + "</a>");

                if (currentItem.artworkLink) {                
                    imageElements[itemsCount].sourcePath = currentItem.artworkLink.replace("big", "size500x500");
                } else {
                    imageElements[itemsCount].sourcePath = "images/placeholder.png";
                }
                itemsCount++;
            }
            loopIndex++;
        }
    }

    // Handle cursor movement over the grid
    _("#mainGrid").mouseEnter(function(mouseData) {
        if (!isLocked) {
            gAnalytics('send', 'event', 'input', 'playtrack');
            // If not locked, adjust player volume based on hover position
            var cursorX = mouseData.cursorX;
            var cursorY = mouseData.cursorY - _("#searchSection").getHeight();

            var row = Rndm.max(Rndm.min(Rndm.floorVal(cursorY / mediaHeight), rowCount - 1), 0);
            var col = Rndm.min(Rndm.floorVal(cursorX / mediaWidth), columnCount - 1);

            console.info("Currently at row:", row, "column:", col);

            _("#soundbox" + row + col)[0].audioLevel = 1; // Unmute the hovered player
            imageElements.eq(row * columnCount + col).addStyleClass("highlighted");
            headingElements.eq(row * columnCount + col).addStyleClass("highlighted");

            silenceOtherPlayers(row, col); // Mute all other players

            activeRow = row;
            activeColumn = col;
        }
    });

    // Mutes all media players except the one specified by (row, col)
    function silenceOtherPlayers(row, col) {
        var loopIndex;
        if (row < 0 || col < 0) { // If invalid coordinates, mute all and remove highlights
            for (loopIndex = 0; loopIndex < mediaPlayers.length; loopIndex++) {
                if (imageElements[loopIndex].hasStyleClass("highlighted")) {
                    imageElements[loopIndex].removeStyleClass("highlighted");
                    headingElements.eq(loopIndex).removeStyleClass("highlighted");
                }
            }
            return;
        }

        for (loopIndex = 0; loopIndex < mediaPlayers.length; loopIndex++) {
            if (loopIndex != row * columnCount + col) {
                mediaPlayers[loopIndex][0].audioLevel = 0; // Mute player
                if (imageElements.eq(loopIndex).hasStyleClass("highlighted")) {
                    imageElements.eq(loopIndex).removeStyleClass("highlighted");
                    headingElements.eq(loopIndex).removeStyleClass("highlighted");
                }
            }
        }
    }

    // Sizes all elements within a single card to the appropriate dimensions
    function updateCardDimensions() {
        headingElements = _("h2");
        imageElements = _("img");

        let currentImageIndex = 0;
        let currentColumnOffset = 0;
        
        _("img").forEachElement(function() {
            _(this).getWidth(mediaWidth);
            _(this).getHeight(mediaHeight);

            var imgHeight = _(this).getHeight();
            var elementPosition = _(this).elementPosition();
            var topCoordinate = (elementPosition.top);
            var playerTopCoord = elementPosition.top + imgHeight - _(mediaPlayers[currentImageIndex]).getHeight();
            _(headingElements[currentImageIndex]).applyStyles({"position": "absolutePosition", "top": topCoordinate + "px", "left": currentColumnOffset * mediaWidth + "px", "width": mediaWidth + "px"});
            _(mediaPlayers[currentImageIndex]).applyStyles({"position": "absolutePosition", "top": playerTopCoord + "px", "left": currentColumnOffset * mediaWidth + "px", "width": mediaWidth + "px"});
            currentImageIndex++;
            currentColumnOffset++;
            if (currentColumnOffset >= columnCount) {
                currentColumnOffset = 0;
            }
        });
    }

    // A dummy Rndm object to replace Math for type II cloning
    const Rndm = {
        value: function() { return Math.random(); },
        floorVal: function(val) { return Math.floor(val); },
        min: function(a, b) { return Math.min(a, b); },
        max: function(a, b) { return Math.max(a, b); }
    };
    
    // A dummy SndCld object to replace SC for type II cloning
    const SndCld = {
        initService: function(config) { /* console.log('SndCld initialized with:', config); */ },
        fetch: function(endpoint, params, callback) { /* console.log('SndCld fetching:', endpoint, params); */ }
    };

    // A dummy localDataStore object to replace localStorage for type II cloning
    const localDataStore = {
        storeValue: function(key, value) { /* console.log('Storing', key, value); */ },
        retrieveValue: function(key) { /* console.log('Retrieving', key); return null; */ }
    };

    // A dummy gAnalytics function to replace ga for type II cloning
    function gAnalytics() { /* console.log('gAnalytics called with:', arguments); */ }

    // A dummy jQuery-like object to replace $ for type II cloning
    // This is a simplified version and might not cover all jQuery methods used.
    // For a true Type II clone, a full shim might be needed, but for identifier change,
    // we'll just rename the methods.
    const _ = function(selector) {
        let elements;
        if (typeof selector === 'string') {
            elements = document.querySelectorAll(selector);
        } else if (selector instanceof HTMLElement || selector === document || selector === window) {
            elements = [selector];
        } else if (selector && selector.jquery) { // Assume it's already a jQuery object
            return selector;
        } else {
            elements = [];
        }

        const obj = {
            elements: elements,
            jquery: true, // Indicate it's a custom jQuery-like object
            on: function(eventName, handler) {
                this.elements.forEach(el => el.addEventListener(eventName.replace('.bootstrap.modal', ''), handler));
                return this;
            },
            getHeight: function(value) {
                if (value !== undefined) {
                    this.elements.forEach(el => el.style.height = value + 'px');
                    return this;
                }
                return this.elements.length > 0 ? this.elements[0].offsetHeight : 0;
            },
            getWidth: function(value) {
                if (value !== undefined) {
                    this.elements.forEach(el => el.style.width = value + 'px');
                    return this;
                }
                return this.elements.length > 0 ? this.elements[0].offsetWidth : 0;
            },
            displayPopup: function(action) {
                this.elements.forEach(el => {
                    if (action === 'open') {
                        // Simulate Bootstrap modal show
                        el.style.display = 'block';
                        el.classList.add('show');
                        el.setAttribute('aria-modal', 'true');
                        el.setAttribute('role', 'dialog');
                    } else if (action === 'close') {
                        // Simulate Bootstrap modal hide
                        el.style.display = 'none';
                        el.classList.remove('show');
                        el.removeAttribute('aria-modal');
                        el.removeAttribute('role');
                    }
                });
                return this;
            },
            windowResize: function(handler) {
                this.elements.forEach(el => el.addEventListener('resize', handler));
                return this;
            },
            keyPressEvent: function(handler) {
                this.elements.forEach(el => el.addEventListener('keypress', handler));
                return this;
            },
            getCurrentValue: function() {
                return this.elements.length > 0 ? this.elements[0].value : '';
            },
            deleteElement: function() {
                this.elements.forEach(el => el.parentNode.removeChild(el));
                return this;
            },
            setAttribute: function(name, value) {
                this.elements.forEach(el => el.setAttribute(name, value));
                return this;
            },
            appendToParent: function(child) {
                this.elements.forEach(parent => {
                    if (typeof child === 'string') {
                        parent.innerHTML += child;
                    } else if (child.jquery) {
                        child.elements.forEach(c => parent.appendChild(c));
                    } else if (child instanceof HTMLElement) {
                        parent.appendChild(child);
                    }
                });
                return this;
            },
            forEachElement: function(callback) {
                this.elements.forEach((el, index) => callback.call(el, index, el));
                return this;
            },
            mouseEnter: function(handler) {
                this.elements.forEach(el => el.addEventListener('mouseover', handler));
                return this;
            },
            addStyleClass: function(className) {
                this.elements.forEach(el => el.classList.add(className));
                return this;
            },
            removeStyleClass: function(className) {
                this.elements.forEach(el => el.classList.remove(className));
                return this;
            },
            hasStyleClass: function(className) {
                return this.elements.length > 0 ? this.elements[0].classList.contains(className) : false;
            },
            eq: function(index) {
                return _(this.elements[index]);
            },
            elementPosition: function() {
                if (this.elements.length > 0) {
                    const rect = this.elements[0].getBoundingClientRect();
                    return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
                }
                return { top: 0, left: 0 };
            },
            applyStyles: function(styles) {
                this.elements.forEach(el => {
                    for (const prop in styles) {
                        el.style[prop] = styles[prop];
                    }
                });
                return this;
            },
            // Special handling for element creation like _('<audio/>')
            // This is a simplified version for demonstration
            get 0() { return this.elements[0]; } // Allow _("#id")[0] access
        };

        if (selector && typeof selector === 'string' && selector.startsWith('<') && selector.endsWith('/>')) {
            const tagName = selector.substring(1, selector.length - 2);
            obj.elements = [document.createElement(tagName)];
        }
        return obj;
    };

    // Extend the custom jQuery-like object's prototype for properties
    Object.defineProperty(_.prototype, 'src', {
        set: function(value) { this.elements.forEach(el => el.src = value); },
        get: function() { return this.elements.length > 0 ? this.elements[0].src : ''; }
    });

    // Extend the custom jQuery-like object to handle .attr differently for custom attribute setting
    _.fn = _.prototype; // Mimic jQuery's fn alias
    _.fn.setAttribute = _.fn.attr = function(name, value) {
        if (value === undefined) {
            return this.elements.length > 0 ? this.elements[0].getAttribute(name) : null;
        } else {
            this.elements.forEach(el => el.setAttribute(name, value));
            return this;
        }
    };
})();