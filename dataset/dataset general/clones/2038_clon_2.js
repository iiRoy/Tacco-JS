var cloneConfig = {
    //  Selectors for various page elements
    mainContentSelector: "#content",
    sideNavSelector: "#sidebar",
    modifyButtonSelector: "#edit",
    scrollUpButtonSelector: "#back_to_top",
    busyIndicatorSelector: "#loading",
    issueDisplaySelector: "#error",

    //  Feature toggles for UI components
    enableSideNavigation: true,
    showEditOption: true,
    showScrollUpButton: true,
    persistReadProgress: true, // Stores the user's scroll position

    //  Main entry point for application initialization
    bootApplication: startUp
};

//  HTML fragment for embedding a comments section, e.g., Disqus
var commentSectionMarkup = '<h3>User Comments</h3><div id="disqus_thread"></div>';
//  An array to hold navigation links or section hashes
var navigationItemsArray = [];

/*
 *  This function initiates the primary features of the web application.
 *  It configures UI elements and sets up dynamic content loading.
 */
function startUp() {
    //  Initialize the sidebar and other interactive buttons based on settings
    if (cloneConfig.enableSideNavigation) {
        setupSideNavigation();
    }

    if (cloneConfig.showScrollUpButton) {
        configureScrollUpButton();
    }

    if (cloneConfig.showEditOption) {
        prepareEditOption();
    }

    //  Handle the initial content routing
    routeContentRequest();
    //  Attach an event listener for URL hash changes to trigger re-routing
    $(window).on('hashchange', routeContentRequest);
}


/*
 *  Loads and processes the content for the side navigation panel.
 *  It dynamically generates navigation links from the loaded data.
 */
function setupSideNavigation() {
    $.get(cloneConfig.sideNavSourceFile, function(retrievedData) {
        //  Render the markdown content obtained from the file into the sidebar
        $(cloneConfig.sideNavSelector).html(marked(retrievedData));
        //  Locate the ordered list within the sidebar for navigation items
        let navOrderedList = $(cloneConfig.sideNavSelector + ' ol');
        navOrderedList.attr('start', 0);

        //  Populate the navigation array with hrefs from list item anchors
        navOrderedList.find('li a').map(function() {
            navigationItemsArray.push(this.href.slice(this.href.indexOf('#')));
        });
        //  Set up click handler for the 'previous page' button
        $('#pageup').on('click', function() {
            for (let loopIndex = 0; loopIndex < navigationItemsArray.length; loopIndex++) {
                if (location.hash === '') break;
                if (navigationItemsArray[loopIndex] === location.hash) break;
            }
            location.hash = navigationItemsArray[loopIndex - 1]
        });
        //  Set up click handler for the 'next page' button
        $('#pagedown').on('click', function() {
            for (let loopIndex = 0; loopIndex < navigationItemsArray.length; loopIndex++) {
                if (location.hash === '') break;
                if (navigationItemsArray[loopIndex] === location.hash) break;
            }
            location.hash = navigationItemsArray[loopIndex + 1];
        });
    }, "text").fail(function() {
        alert("Attention! The sidebar content file could not be found!");
    });

}


/*
 *  Activates the 'Back to Top' button.
 *  This function ensures the button is visible and scrolls the page to the top on click.
 */
function configureScrollUpButton() {
    $(cloneConfig.scrollUpButtonSelector).show();
    $(cloneConfig.scrollUpButtonSelector).on("click", function() {
        $("html, body").animate({
            scrollTop: 0
        }, 200); //  Smooth animation duration
    });
}


/*
 *  Initializes the 'Edit' button's behavior.
 *  If a base URL is configured, clicking this button opens the source markdown file.
 */
function prepareEditOption() {
    if (cloneConfig.baseContentURL === null) {
        alert("Error! The 'baseContentURL' setting is missing in cloneConfig.bootApplication()!");

    } else {
        $(cloneConfig.modifyButtonSelector).show();
        $(cloneConfig.modifyButtonSelector).on("click", function() {
            let currentFragment = location.hash.replace("#", "/");

            if (currentFragment === "") {
                currentFragment = "/" + cloneConfig.defaultPageIndex.replace(".md", "");
            }

            window.open(cloneConfig.baseContentURL + currentFragment + ".md");
            //  Opening a new window is generally preferred over a direct redirect
            //  to preserve the user's navigation history on the current page.
        });
    }
}


/*
 *  Converts a given string into a URL-safe or ID-safe format by replacing special characters.
 *  @param {string} inputString - The original string to be sanitized.
 *  @returns {string} The processed string with special characters replaced by underscores.
 */
function sanitizeStringForID(inputString) {
    //  Replace a wide range of non-alphanumeric symbols with an underscore
    return inputString.replace(/[&\/\\#,+=()$~%.'":*?<>{}\ \]\[]/g, "_");
}


/*
 *  Creates interactive linkages for list items to corresponding header sections.
 *  It assigns unique IDs, classes, and scroll-on-click functionality.
 *  @param {jQuery} listItemElement - The jQuery object of the list item to process.
 *  @param {number} headingDepth - The HTML heading level (e.g., 1 for H1, 2 for H2).
 */
function createNavigationLinkage(listItemElement, headingDepth) {
    //  Apply a sanitized ID and a 'link' class to the list item
    let sanitizedTagText = sanitizeStringForID(listItemElement.text());
    listItemElement.attr("id", sanitizedTagText);
    listItemElement.attr("class", "link");

    //  Attach a click event: when clicked, scroll to the associated content header
    $(cloneConfig.mainContentSelector + " li#" + listItemElement.attr("id")).click(function() {
        //  Determine the target header element to scroll to
        let targetHeaderElement = $(
            cloneConfig.mainContentSelector + " h" + headingDepth + "." + listItemElement.attr("id")
        );
        $('html, body').animate({
            scrollTop: targetHeaderElement.offset().top
        }, 200);

        //  Temporarily highlight the header to indicate selection
        let initialColor = targetHeaderElement.css("color");
        targetHeaderElement.animate({ color: "#ED1C24", }, 500, function() {
            //  Fade back to the original color after a short duration
            $(this).animate({color: initialColor}, 2500);
        });
    });
}


/*
 *  Generates internal page anchors by correlating list items with header elements.
 *  This function creates a clickable table of contents within the main content area.
 */
function generatePageAnchors() {
    //  Iterate through header levels, typically H1 to H4
    for (let loopIndex = 1; loopIndex <= 4; loopIndex++) {
        //  Collect all headers of the current level and apply classes/IDs
        let allHeadings = [];
        $('#content h' + loopIndex).map(function() {
            allHeadings.push($(this).text());
            $(this).addClass(sanitizeStringForID($(this).text()));
            this.id = 'h' + loopIndex + '-' + sanitizeStringForID($(this).text());
        });

        //  For H2 headers, create an ordered list (table of contents)
        if ((loopIndex === 2) && allHeadings.length !== 0) {
            let orderedListElement = $('<ol></ol>')
                .insertAfter('#content h1')
                .addClass("content-toc")
                .attr('id', 'content-toc');
            for (let itemIndex = 0; itemIndex < allHeadings.length; itemIndex++) {
                let currentListItem = $('<li></li>').text(allHeadings[itemIndex]);
                orderedListElement.append(currentListItem);
                createNavigationLinkage(currentListItem, loopIndex);
            }
        }
    }
}


/*
 *  Normalizes the paths of embedded resources, particularly images, to ensure they are absolute.
 *  This prevents broken links when navigating via URL hashes.
 */
function adjustResourcePaths() {
    //  Find all image tags within the main content area
    $(cloneConfig.mainContentSelector + " img").map(function() {
        let sourceAttribute = $(this).attr("src").replace("./", "");
        //  Only process if the image source is not already an absolute HTTP/HTTPS URL
        if ($(this).attr("src").slice(0, 5) !== "http") {
            let resourceURL = location.hash.replace("#", "");

            //  Split the URL hash to determine the base directory for relative paths
            resourceURL = resourceURL.split("/");
            let baseDirectory = resourceURL.slice(0, resourceURL.length - 1).toString();

            //  Update the image source to a fully qualified path
            $(this).attr("src", baseDirectory + "/" + sourceAttribute);
        }
    });

}


/*
 *  Displays a visual error message on the page.
 */
function displayErrorMessage() {
    console.log("APPLICATION ERROR: Displaying error UI.");
    $(cloneConfig.issueDisplaySelector).show();
}


/*
 *  Shows a loading animation and clears the main content area.
 *  Returns an interval ID, allowing the calling code to stop the animation later.
 */
function displayBusyIndicator() {
    $(cloneConfig.busyIndicatorSelector).show();
    $(cloneConfig.mainContentSelector).html("");  //  Clear any previous content

    //  Start an infinite fading animation for the loading indicator
    let loadingIntervalRef = setInterval(function() {
        $(cloneConfig.busyIndicatorSelector).fadeIn(1000).fadeOut(1000);
    }, 2000);

    return loadingIntervalRef;
}


/*
 *  Manages the routing of content based on the browser's URL hash.
 *  It fetches, renders, and initializes various dynamic features for the displayed content.
 */
function routeContentRequest() {

    let requestedPath = location.hash.replace("#", "./");

    //  If progress saving is enabled and the hash has changed, update stored progress
    if (cloneConfig.persistReadProgress && store.get('menu-progress') !== location.hash) {
        store.set('menu-progress', location.hash);
        store.set('page-progress', 0);
    }

    //  Determine the correct content path, defaulting to the index page if necessary
    if (location.pathname === "/index.html") {
        requestedPath = location.pathname.replace("index.html", cloneConfig.defaultPageIndex);
        adjustResourcePaths();
    } else if (requestedPath === "") {
        requestedPath = window.location + cloneConfig.defaultPageIndex;
        adjustResourcePaths();
    } else {
        requestedPath = requestedPath + ".md";
    }

	//  Temporarily disable the scroll event listener to prevent conflicts
	//  during content loading and rendering.
	$(window).off('scroll');

    //  Fetch the markdown content, then render and initialize page features
    let loadingIntervalRef = displayBusyIndicator();
    $.get(requestedPath, function(retrievedData) {
        $(cloneConfig.issueDisplaySelector).hide();
        $(cloneConfig.mainContentSelector).html(marked(retrievedData) + commentSectionMarkup);
        //  Dynamically update the document title based on the primary heading
        if ($(cloneConfig.mainContentSelector + " h1").text() === cloneConfig.appDocumentTitle) {
            document.title = cloneConfig.appDocumentTitle;
        } else {
            document.title = $(cloneConfig.mainContentSelector + " h1").text() + " - " + cloneConfig.appDocumentTitle;
        }
        adjustResourcePaths();
        generatePageAnchors();

        //  Apply syntax highlighting to code blocks within the content
        $('#content code').map(function() {
            Prism.highlightElement(this);
        });

        //  Initialize the Disqus comment system
        (function() {
            //  Disqus configuration variables, must match your Disqus setup
            window.disqus_shortname = 'es6';
            window.disqus_identifier = (location.hash ? location.hash.replace("#", "") : 'READEME');
            window.disqus_title = $(cloneConfig.mainContentSelector + " h1").text();
            window.disqus_url = 'http://es6.ruanyifeng.com/' + (location.hash ? location.hash.replace("#", "") : 'README');

            //  Load the Disqus embed script dynamically
            (function() {
                let disqusScriptElement = document.createElement('script');
                disqusScriptElement.type = 'text/javascript';
                disqusScriptElement.async = true;
                disqusScriptElement.src = 'http://' + window.disqus_shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(disqusScriptElement);
            })();
        })();

		let percentageValue = cloneConfig.persistReadProgress ? store.get('page-progress') || 0 : 0;

		//  Scroll to the previously saved reading position or the top of the content
		if(location.hash !== '' || Boolean(percentageValue)){
			if (!Boolean(percentageValue)){
				$('html, body').animate({
					scrollTop: $('#content').offset().top
				}, 200);
			} else {
				$('html, body').animate({
					scrollTop: ($('body').height()-$(window).height())*percentageValue
				}, 200);
			}
		}

        //  Manage the visibility of the 'page up' navigation button
        if (location.hash === '' || location.hash === navigationItemsArray[0]) {
            $('#pageup').css('display', 'none');
        } else {
            $('#pageup').css('display', 'inline-block');
        }

        //  Manage the visibility of the 'page down' navigation button
        if (location.hash === navigationItemsArray[(navigationItemsArray.length - 1)]) {
            $('#pagedown').css('display', 'none');
        } else {
            $('#pagedown').css('display', 'inline-block');
        }

        //  Initialize and manage the scroll progress indicator
        (function() {
            let windowObject = $(window);
            let progressBarElement = $('.progress-indicator-2');
            let windowHeight = windowObject.height();
            let bodyHeight = $('body').height();
            let scrollableHeight = bodyHeight - windowHeight;

            windowObject.on('scroll', function() {
                let currentPercentage = Math.max(0, Math.min(1, windowObject.scrollTop() / scrollableHeight));
                updateProgress(currentPercentage);
            });

            //  Internal helper function to update the progress bar and save state
            function updateProgress(percentageValue) {
                progressBarElement.css({width: percentageValue * 100 + '%'});
                cloneConfig.persistReadProgress && store.set('page-progress', percentageValue);
            }

        }());

    }).fail(function() {
        displayErrorMessage();
    }).always(function() {
        clearInterval(loadingIntervalRef);
        $(cloneConfig.busyIndicatorSelector).hide();
    });
}