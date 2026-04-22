/** This is a Type I clone of the responsiveImage JavaScript library.
 *  All identifiers, variable names, function names, operators, and expressions remain identical.
 *  Only whitespace (indentation, spacing, blank lines) and comments have been modified extensively
 *  to create a visually distinct, but functionally equivalent, version of the original code.
 */
// Original jslint directives were here, but are now removed for visual difference.

document.createElement("responsive-image"); // Create a custom element for potential future use.

/*
 *  The main object encapsulating all responsive image functionalities.
 *  It handles image resizing, lazy loading, and configuration management.
 */
var responsiveImage = {

	// Configuration settings for the responsive images.
    config: {
        className: "responsive", // Default class name to identify responsive images.
        lazyDelay: 200,          // Delay in milliseconds for lazy loading updates.
        useNoScript: false,      // Flag to determine if noscript tags are used or custom elements.

        // Default options for image handling.
        default: {
            sizes: [320, 480, 720, 100000],                               // Available image widths.
            fileNames: {320: 320, 480: 480, 720: 720, 100000: 100000}, // Mapping for file names.
            imagePath: "^(.+\\-)(\\d+)(\\.[a-z]+)$",                     // Regex for image path parsing.
            imagePathSizeField: 2,                                       // Index of the size field in the regex match.
            lazy: true,                                                  // Enable lazy loading by default.
            lazyPrePx: 200                                               // Pixels before image becomes visible to start loading.
        }
    },


    // Stores the current width of the viewport.
    screenWidth: document.documentElement.clientWidth,

    // Stores the calculated width of the scrollbar.
    scrollbarWidth: 0,

    // Flag indicating if the responsiveImage system has been initialized.
    hasInited: false,

    /*
     *  Controls the execution frequency of the Scroll() function.
     *  Set to true to allow Scroll() to run, then set to false immediately after.
     */
    allowLazyUpdate: true,

    /*
     *  A flag addressing a specific Chrome bug (version 33 and possibly others).
     *  When true, forces a slight scroll to ensure getBoundingClientRect calculates correctly
     *  after a page refresh where scroll position might not reset visually.
     */
    forcedScrollUpdate: true,

    /*
     *  Initializes the responsiveImage system.
     *  It updates configuration, calculates scrollbar width, and sets up event listeners.
     *
     *  @param config An object to override or extend the default configuration.
     */
    Init: function	(config) {
        // Update the configuration settings.
        this.config = this.UpdateConfig(config);

        // Determine the scrollbar width for accurate screen size calculations.
        this.CalcScrollWidth();

        // Attach necessary event listeners to the window.
        this.InitEvents();
    },

    /*
     *  Sets up event listeners for window resize, load, and scroll events.
     *  It uses either `attachEvent` for older IE or `addEventListener` for modern browsers.
     */
    InitEvents: function () {
        if (typeof (window.attachEvent) === "object") { // Check for IE's proprietary event model.
            window.attachEvent("onresize", this.Resize);
            window.attachEvent("onload", this.Resize);
            window.attachEvent("onscroll", this.Scroll);
        }
        else { // Use standard W3C event model.
            window.addEventListener("resize", this.Resize, false);
            window.addEventListener("load", this.Resize, false);
            window.addEventListener("scroll", this.Scroll, false);
        }
    },

    /*
     *  Merges provided configuration options with the default settings.
     *  Ensures all necessary fields are present and correctly ordered.
     *
     *  @param config The custom configuration object provided by the user.
     *  @return The merged and validated configuration object.
     */
    UpdateConfig: function (config) {
        // Initialize local variables for use within this function.
        var key, sizeKey, fileNames = {}, sortFunction;

        // Ensure config is an object; if not, initialize it as an empty object.
        if (typeof config !== "object") {config = {}; }
        // If 'default' property is missing, use the system's default config.
        if (config.default === undefined) {config.default = this.config.default; }

        // Define a sort function for numerical ordering of sizes.
        sortFunction = function (first, second) {return first - second; };

        // Iterate through all top-level keys in the configuration.
        for (key in config) {
            // Process only own properties that are objects themselves.
            if (config.hasOwnProperty(key) && typeof config[key] === "object") {
                // If 'fileNames' is missing but 'sizes' is present, generate 'fileNames'.
                if (config[key].fileNames === undefined && config[key].sizes !== undefined) {
                    for (sizeKey in config[key].sizes) {
                        if (config[key].sizes.hasOwnProperty(sizeKey)) {
                            fileNames[config[key].sizes[sizeKey]] = config[key].sizes[sizeKey];
                        }
                    }
                    config[key].fileNames = fileNames; // Assign generated fileNames.
                }

                // Ensure all default properties are present for each custom config.
                if (config[key].sizes === undefined) {config[key].sizes = this.config.default.sizes; }
                if (config[key].fileNames === undefined) {config[key].fileNames = this.config.default.fileNames; }
                if (config[key].imagePath === undefined) {config[key].imagePath = this.config.default.imagePath; }
                if (config[key].imagePathSizeField === undefined) {config[key].imagePathSizeField = this.config.default.imagePathSizeField; }
                if (config[key].lazy === undefined) {config[key].lazy = this.config.default.lazy; }
                if (config[key].lazyPrePx === undefined) {config[key].lazyPrePx = this.config.default.lazyPrePx; }
                config[key].sizes.sort(sortFunction); // Sort sizes numerically.
            }
        }

        // Override or set global configuration options if they are not explicitly defined.
        if (config.className === undefined) {config.className = this.config.className; }
        if (config.lazyDelay === undefined) {config.lazyDelay = this.config.lazyDelay; }
        if (config.useNoScript === undefined) {config.useNoScript = this.config.useNoScript; }

        return config; // Return the final, updated configuration.
    },

    /*
     *  Determines the appropriate configuration options for a given image
     *  based on its class names. It looks for a "responsive" class or a namespaced class.
     *
     *  @param className A string containing all class names associated with the image.
     *  @return null if no relevant responsive class is found, otherwise an object
     *          containing the specific configuration options for that image.
     */
    GetOptions: function (className) {
        // Initialize variables.
        var selected = "", classes, i, option, regex, namespace;

        // Split the input className string into individual classes.
        classes = className.split(" ");
        for (i in classes) {
            // Ensure processing only own properties of the 'classes' array.
            if (classes.hasOwnProperty(i)) {
                // Trim whitespace from the current class option.
                option = classes[i].replace(/^\s+|\s+$/g, "");

                // If no specific option is selected yet and the default responsive class is found.
                if (selected === "" && option === this.config.className) {
                    selected = "default"; // Use the default configuration.
                }

                // Check for namespaced options (e.g., "responsive-mobile").
                regex = new RegExp("^" + this.config.className + "-", "g");
                namespace = option.replace(regex, "");
                // If a matching namespaced configuration exists, select it.
                if (this.config[namespace] !== undefined) {
                    selected = namespace;
                }
            }
        }

        // Return the selected configuration or null if none was found.
        return selected === "" ? null : this.config[selected];
    },

    /*
     *  Calculates the width of the browser's scrollbar.
     *  This is crucial for accurate viewport width calculations, as some browsers
     *  include the scrollbar width in `document.documentElement.clientWidth`.
     */
    CalcScrollWidth: function () {
        // Only calculate if the scrollbar width hasn't been determined yet.
        if (this.scrollbarWidth === 0) {
            // Create a temporary div element to measure scrollbar width.
            var div = document.createElement("div");
            div.style.width = "200px";     // Give it a fixed width.
            div.style.overflow = "scroll"; // Force scrollbars to appear.
            document.body.appendChild(div); // Append to the body to render it.

            // If both offsetWidth and clientWidth are available, the difference
            // is the scrollbar width. Exclude WebKit workaround for incorrect calculation.
            if (div.offsetWidth && div.clientWidth && !(new RegExp(" AppleWebKit/").test(navigator.userAgent))) {
                this.scrollbarWidth = div.offsetWidth - div.clientWidth;
            }

            // Remove the temporary div from the DOM.
            div.parentNode.removeChild(div);
        }
    },

    /*
     *  Checks if the screen size has changed and, if so, triggers a rebuild
     *  of responsive images.
     *
     *  @param force A boolean flag: if true, forces an image resize even if
     *               the screen width hasn't changed (e.g., on initial load).
     */
    Resize: function (force) {
        // Initialize local variables.
        var clientWidth, $this = responsiveImage; // Use a reference to 'this' for clarity in callbacks.

        // Recalculate clientWidth, adding scrollbar width for a more accurate total width.
        clientWidth = document.documentElement.clientWidth + $this.scrollbarWidth;

        // Determine if a resize should be forced (either first init or explicit force).
        force = $this.hasInited === false || force === true ? true : false;
        $this.hasInited = true; // Mark as initialized after this first run.

        // If the window width is unchanged and not forced, exit early.
        if ($this.screenWidth === clientWidth && !force) {
            return;
        }

        // Store the new, updated screen width.
        $this.screenWidth = clientWidth;

        // Trigger the image rebuilding process.
        $this.Rebuild();

        // Call Scroll() to check for any images that might need lazy-loading due to new layout.
        $this.Scroll();
    },

    /*
     *  Iterates through all responsive image placeholders and generates or updates
     *  the appropriate `<img>` tags based on the current screen width.
     */
    Rebuild: function () {
        // Initialize variables for the loop.
        var scripts, i, script, options, image, prefix, foundImage, newImage;

        // Get all responsive image placeholders (either <noscript> or custom element).
        scripts = document.getElementsByTagName(this.config.useNoScript ? "noscript" : "responsive-image");
        for (i = 0; i < scripts.length; i++) {
            script = scripts[i];
            options = this.GetOptions(script.className); // Get config options for the current image.
            if (!options) {
                continue; // Skip if no responsive options are found for this element.
            }

            // Retrieve image properties (src, size, alt, title, classes) based on options.
            image = this.GetBoundary(script, options);

            // Construct the data attribute prefix.
            prefix = "data-" + this.config.className + "-";

            // If the image doesn't have a unique ID yet, create one and assign it.
            if (!script.getAttribute(prefix + "image-id")) {
                script.setAttribute(prefix + "image-id", prefix + "image-" + Math.floor(Math.random() * 10000000));
            }

            // If lazy loading is enabled and not already marked, set the lazy attribute.
            if (options.lazy === true && !script.getAttribute(prefix + "lazy")) {
                script.setAttribute(prefix + "lazy", String(options.lazyPrePx));
            }

            // Check if an image element for this placeholder already exists.
            foundImage = document.getElementById(script.getAttribute(prefix + "image-id"));
            if (foundImage) {
                // If the existing image is already the correct size, skip rebuilding.
                if (parseInt(foundImage.getAttribute(prefix + "used-size"), 10) === parseInt(image.size, 10)) {
                    continue;
                }

                // Otherwise, remove the old image and clear the lazy-loaded flag to rebuild.
                foundImage.parentNode.removeChild(foundImage);
                script.removeAttribute(prefix + "lazy-loaded");
            }

            // Create a new <img> element.
            newImage = document.createElement("img");
            // Set attributes if they exist.
            if (image.alt !== undefined) {newImage.setAttribute("alt", image.alt); }
            if (image.title !== undefined) {newImage.setAttribute("title", image.title); }
            if (image.class !== undefined) {newImage.setAttribute("class", image.class); }
            newImage.setAttribute("id", script.getAttribute(prefix + "image-id"));
            newImage.setAttribute(prefix + "used-size", image.size);

            // Set src either directly or as a data attribute for lazy loading.
            if (options.lazy) {
                newImage.setAttribute(prefix + "lazy-src", image.src);
            } else {
                newImage.setAttribute("src", image.src);
            }

            // Insert the newly created image just before the placeholder element.
            script.parentNode.insertBefore(newImage, script);
        }
    },

    /*
     *  Determines the optimal image source and size based on current screen width
     *  and available image sizes defined in the options. It selects the largest
     *  available image that is not wider than the current screen.
     *
     *  @param element The placeholder element (noscript or responsive-image)
     *                 from which to extract image data.
     *  @param options The configuration options for this specific image.
     *  @return An object containing the chosen image size, its source URL,
     *          and other attributes like alt, title, and class.
     */
    GetBoundary: function (element, options) {
        // Initialize variables.
        var closestSize, size, testElement, foundElement, src, matches, i, imageSrc = "";

        // Find the closest size that is not larger than the current screen width.
        // Start with the largest size as the default 'closest'.
        closestSize = options.sizes[options.sizes.length - 1];
        for (size in options.sizes) {
            if (options.sizes.hasOwnProperty(size)) {
                size = parseInt(options.sizes[size], 10); // Ensure size is an integer.
                if (this.screenWidth <= size && closestSize >= size) {
                    closestSize = size; // Update closestSize if a better match is found.
                }
            }
        }

        // Extract the original image source from the placeholder element.
        if (this.config.useNoScript) {
            // For noscript, content is within childNodes[0].data, needing a temp div.
            testElement = document.createElement("div");
            testElement.innerHTML = element.childNodes[0].data;
            foundElement = testElement.getElementsByTagName("img")[0];
            src = foundElement.src;
        } else {
            // For custom elements, source is directly on a data attribute.
            foundElement = element;
            src = element.getAttribute('data-src');
        }

        // Parse the image source to rebuild it with the selected size.
        matches = /^(.+\-)(\d+)(\.[a-z]+)$/.exec(src);

        // Reconstruct the image source with the determined closest size.
        for (i = 1; i < matches.length; i++) {
            if (i === options.imagePathSizeField) {
                imageSrc += options.fileNames[closestSize]; // Insert the chosen size.
            } else {
                imageSrc += matches[i]; // Append other parts of the path.
            }
        }

        // Return an object with all relevant image properties.
        return {
            size: closestSize,
            src: imageSrc,
            alt: foundElement.getAttribute('alt'),
            title: foundElement.getAttribute('title'),
            class: foundElement.getAttribute('data-class')
        };
    },

    /*
     *  Handles the window scroll event to lazy-load images that come into view.
     *  Includes a mechanism to prevent excessive calls and address a Chrome bug.
     *
     *  @return undefined This function does not return any value.
     */
    Scroll: function () {
        // Initialize variables for the function.
        var noscripts, i, screenHeight, prefix, rect, image, moveScrollInterval, $this = responsiveImage;

        // If lazy updates are currently disallowed, exit to prevent too frequent execution.
        if ($this.allowLazyUpdate === false) {
            return;
        }
        $this.allowLazyUpdate = false; // Immediately disallow further updates until timeout.

        // Get the current viewport height.
        screenHeight = window.innerHeight || document.documentElement.clientHeight;

        // Retrieve all responsive image placeholders that are potential candidates for lazy loading.
        if (typeof document.getElementsByClassName === "function") {
            noscripts = document.getElementsByClassName($this.config.className);
        } else {
            noscripts = document.getElementsByTagName(this.config.useNoScript ? "noscript" : "responsive-image");
        }

        // Chrome 33 bug workaround: if `forcedScrollUpdate` is true,
        // slightly scroll the page if not at top to ensure `getBoundingClientRect` is accurate.
        if ($this.forcedScrollUpdate) {
            moveScrollInterval = window.setInterval(function () {
                if (document.documentElement.scrollTop !== 0) {
                    window.clearInterval(moveScrollInterval);
                    $this.allowLazyUpdate = true; // Allow updates again.
                    $this.forcedScrollUpdate = false; // Mark workaround as done.
                    $this.Scroll(); // Re-call scroll to process images.
                } else {
                    $this.forcedScrollUpdate = false; // If at top, no need to scroll.
                }
            }, 50);
        }

        // Construct the data attribute prefix for lazy loading.
        prefix = "data-" + $this.config.className + "-";
        for (i = 0; i < noscripts.length; i++) {
            // Check if the current placeholder is marked for lazy loading and not yet loaded.
            if (noscripts[i].getAttribute(prefix + "lazy") && !noscripts[i].getAttribute(prefix + "lazy-loaded")) {
                // Get the bounding rectangle of the actual image element.
                rect = document.getElementById(noscripts[i].getAttribute(prefix + "image-id")).getBoundingClientRect();

                // If the image's top edge is within the viewport plus lazyPrePx buffer.
                if (rect.top - parseInt(noscripts[i].getAttribute(prefix + "lazy"), 10) <= screenHeight) {
                    image = document.getElementById(noscripts[i].getAttribute(prefix + "image-id"));
                    image.setAttribute("src", image.getAttribute(prefix + "lazy-src")); // Set the actual src.
                    noscripts[i].setAttribute(prefix + "lazy-loaded", "1"); // Mark as lazy-loaded.
                }
            }
        }

        // Set a timeout to allow the Scroll function to run again after a delay,
        // preventing it from firing too rapidly during continuous scrolling.
        window.setTimeout(function () {
            $this.allowLazyUpdate = true; // Re-enable lazy updates.
            $this.Scroll(); // Call Scroll again to ensure any newly visible images are caught.
        }, $this.config.lazyDelay);
    }
};