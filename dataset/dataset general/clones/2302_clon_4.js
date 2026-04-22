const GLYPH_CATALOG = [
    "adjust", "align-center", "align-justify", "align-left", "align-right", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "asterisk", "backward", "ban-circle", "barcode", "bell", "bold", "book", "bookmark", "briefcase", "bullhorn", "calendar", "camera", "certificate", "check", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "circle-arrow-down", "circle-arrow-left", "circle-arrow-right", "circle-arrow-up", "cloud", "cloud-download", "cloud-upload", "cog", "collapse-down", "collapse-up", "comment", "compressed", "copyright-mark", "credit-card", "cutlery", "dashboard", "download", "download-alt", "earphone", "edit", "eject", "envelope", "euro", "exclamation-sign", "expand", "export", "eye-close", "eye-open", "facetime-video", "fast-backward", "fast-forward", "file", "film", "filter", "fire", "flag", "flash", "floppy-disk", "floppy-open", "floppy-remove", "floppy-save", "floppy-saved", "folder-close", "folder-open", "font", "forward", "fullscreen", "gbp", "gift", "glass", "globe", "hand-down", "hand-left", "hand-right", "hand-up", "hd-video", "hdd", "header", "headphones", "heart", "heart-empty", "home", "import", "inbox", "indent-left", "indent-right", "info-sign", "italic", "leaf", "link", "list", "list-alt", "lock", "log-in", "log-out", "magnet", "map-marker", "minus", "minus-sign", "move", "music", "new-window", "off", "ok", "ok-circle", "ok-sign", "open", "paperclip", "pause", "pencil", "phone", "phone-alt", "picture", "plane", "play", "play-circle", "plus", "plus-sign", "print", "pushpin", "qrcode", "question-sign", "random", "record", "refresh", "registration-mark", "remove", "remove-circle", "remove-sign", "repeat", "resize-full", "resize-horizontal", "resize-small", "resize-vertical", "retweet", "road", "save", "saved", "screenshot", "sd-video", "search", "send", "share", "share-alt", "shopping-cart", "signal", "sort", "sort-by-alphabet", "sort-by-alphabet-alt", "sort-by-attributes", "sort-by-attributes-alt", "sort-by-order", "sort-by-order-alt", "sound-5-1", "sound-6-1", "sound-7-1", "sound-dolby", "sound-stereo", "star", "star-empty", "stats", "step-backward", "step-forward", "stop", "subtitles", "tag", "tags", "tasks", "text-height", "text-width", "th", "th-large", "th-list", "thumbs-down", "thumbs-up", "time", "tint", "tower", "transfer", "trash", "tree-conifer", "tree-deciduous", "unchecked", "upload", "usd", "user", "volume-down", "volume-off", "volume-up", "warning-sign", "wrench", "zoom-in", "zoom-out"
];

class GlyphSelectorKit {
    #originInput;
    #panelContainer;
    #triggerButton;
    #inputGroupWrapper;
    #currentSearchQuery = "";
    #currentPageIndex = 0;
    #itemsPerPage = 30;
    #closeHandler;

    constructor(targetElement, configuration = {}) {
        if (!(targetElement instanceof HTMLInputElement)) {
            console.error("GlyphSelectorKit must be initialized with an HTML input element.");
            return;
        }

        if (targetElement.dataset.glyphKitAttached) {
            return;
        }

        this.#originInput = targetElement;
        this.#originInput.dataset.glyphKitAttached = "true";

        const shouldAddButton = configuration.buttonOnly !== true;

        if (shouldAddButton) {
            this.#initiateInterface();
        }
    }

    #initiateInterface() {
        this.#originInput.classList.add("form-control");

        this.#inputGroupWrapper = document.createElement("div");
        this.#inputGroupWrapper.classList.add("glyph-wrapper");

        this.#originInput.parentNode.insertBefore(this.#inputGroupWrapper, this.#originInput);
        this.#inputGroupWrapper.appendChild(this.#originInput);

        this.#triggerButton = document.createElement("span");
        this.#triggerButton.classList.add("glyph-activator");
        this.#triggerButton.classList.add("pointer");
        this.#triggerButton.innerHTML = '<i class="glyph-icon glyph-icon-picture"></i>';

        this.#inputGroupWrapper.appendChild(this.#triggerButton);

        this.#triggerButton.addEventListener("click", this.#handleTriggerClick.bind(this));
    }

    #handleTriggerClick(evt) {
        evt.preventDefault();
        this.#constructPanel();
        this.#populateList(GLYPH_CATALOG);
    }

    #constructPanel() {
        if (this.#panelContainer) {
            this.#dismissPanel();
        }

        this.#panelContainer = document.createElement("div");
        this.#panelContainer.classList.add("glyph-panel", "dropdown-menu-override");

        const inputRect = this.#originInput.getBoundingClientRect();
        this.#panelContainer.style.top = `${inputRect.top + window.scrollY + inputRect.height + 6}px`;
        this.#panelContainer.style.left = `${inputRect.left + window.scrollX}px`;

        this.#panelContainer.innerHTML = `
            <div class="panel-controls">
                <ul>
                    <li><a href="#" class="control-pager" data-page-nav="-1"><span class="glyph-icon glyph-icon-fast-backward"></span></a></li>
                    <li><input type="text" class="control-search glyph-icon glyph-icon-search" placeholder="Locate Glyph..." /></li>
                    <li><a href="#" class="control-pager" data-page-nav="1"><span class="glyph-icon glyph-icon-fast-forward"></span></a></li>
                </ul>
            </div>
            <div class="panel-list"></div>
        `;
        document.body.appendChild(this.#panelContainer);

        const searchInput = this.#panelContainer.querySelector(".control-search");
        searchInput.addEventListener("input", this.#handleSearchUpdate.bind(this));

        const pagerButtons = this.#panelContainer.querySelectorAll(".control-pager");
        pagerButtons.forEach(button => {
            button.addEventListener("click", this.#handlePageChange.bind(this));
        });

        this.#closeHandler = this.#handleExternalClick.bind(this);
        document.addEventListener("mouseup", this.#closeHandler);
    }

    #dismissPanel() {
        if (this.#panelContainer && this.#panelContainer.parentNode) {
            this.#panelContainer.parentNode.removeChild(this.#panelContainer);
            this.#panelContainer = null;
            this.#currentSearchQuery = "";
            this.#currentPageIndex = 0;
            document.removeEventListener("mouseup", this.#closeHandler);
        }
    }

    #handleSearchUpdate(evt) {
        this.#currentSearchQuery = evt.target.value;
        this.#currentPageIndex = 0;
        this.#populateList(GLYPH_CATALOG);
    }

    #handlePageChange(evt) {
        evt.preventDefault();
        const direction = parseInt(evt.currentTarget.dataset.pageNav, 10);
        
        const filteredGlyphs = GLYPH_CATALOG.filter(name =>
            name.toLowerCase().includes(this.#currentSearchQuery.toLowerCase())
        );
        const maxPageIndex = Math.ceil(filteredGlyphs.length / this.#itemsPerPage) - 1;

        this.#currentPageIndex += direction;
        this.#currentPageIndex = Math.max(0, Math.min(this.#currentPageIndex, maxPageIndex));
        
        this.#populateList(GLYPH_CATALOG);
    }

    #populateList(sourceList) {
        const listDisplayArea = this.#panelContainer.querySelector(".panel-list");
        listDisplayArea.innerHTML = "";

        const filteredGlyphs = sourceList.filter(name =>
            name.toLowerCase().includes(this.#currentSearchQuery.toLowerCase())
        );

        const startIndex = this.#currentPageIndex * this.#itemsPerPage;
        const endIndex = startIndex + this.#itemsPerPage;
        const glyphsToDisplay = filteredGlyphs.slice(startIndex, endIndex);

        const listElement = document.createElement("ul");
        glyphsToDisplay.forEach(glyphName => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.title = glyphName;
            link.dataset.glyphName = glyphName;
            link.innerHTML = `<span class="glyph-icon glyph-icon-${glyphName}"></span>`;
            
            link.addEventListener("click", this.#handleOptionSelect.bind(this));
            listItem.appendChild(link);
            listElement.appendChild(listItem);
        });
        listDisplayArea.appendChild(listElement);
    }

    #handleOptionSelect(evt) {
        evt.preventDefault();
        const selectedGlyph = evt.currentTarget.dataset.glyphName;
        this.#originInput.value = `glyph-icon glyph-icon-${selectedGlyph}`;
        this.#dismissPanel();
    }

    #handleExternalClick(evt) {
        const clickedElement = evt.target;
        if (this.#panelContainer && !this.#panelContainer.contains(clickedElement) &&
            !this.#originInput.contains(clickedElement) &&
            (!this.#triggerButton || !this.#triggerButton.contains(clickedElement))) {
            this.#dismissPanel();
        }
    }
}