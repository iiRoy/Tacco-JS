// A jQuery plugin for generating page content outlines.
(function(jq) {
  jq.fn.tableOfContents = function(config) {
    var baseOptions = { // Default setup options
        disableScrollUpLinks: false,
        captionText: '<i>Browse...</i>',
        minSectionCount: 3,
        sectionSelectors: 'h1, h2, h3, h4, h5, h6',
        containerTag: 'ol', // Accepted values: [ol|ul]
        displayMotion: 'show', // Accepted values: [show|slideDown|fadeIn|none]
        motionDuration: 'slow' // Set to 0 for no animation
      },
      currentConfig = jq.extend(baseOptions, config); // Merge user options

    function safeUriComponentEncoder(inputString) {
      // Safely encodes a URI component, handling specific characters.
      return encodeURIComponent(inputString)
        .replace(/[!'()*]/g, function(charVal) {
          return '%' + charVal.charCodeAt(0).toString(16);
        });
    }

    var foundSections = jq(currentConfig.sectionSelectors)
      .filter(function() {
        // Retrieve all headers that possess an ID.
        var priorElementId = jq(this)
          .prev()
          .attr("name");
        if (!this.id && priorElementId) {
          this.id = jq(this)
            .attr("id", priorElementId.replace(/\./g, "-"));
        }
        return this.id;
      }),
      targetContainer = jq(this);

    // Exit if no sections or too few sections are found, or if no target container.
    if (!foundSections.length || foundSections.length < currentConfig.minSectionCount || !targetContainer.length) {
      return;
    }

    // Deactivate animation if duration is set to zero.
    if (false === currentConfig.motionDuration) {
      currentConfig.displayMotion = 'none';
    }

    var animationHandlers = {
      show: function() {
        targetContainer.hide().html(generatedMarkup).show(currentConfig.motionDuration);
      },
      slideDown: function() {
        targetContainer.hide().html(generatedMarkup).slideDown(currentConfig.motionDuration);
      },
      fadeIn: function() {
        targetContainer.hide().html(generatedMarkup).fadeIn(currentConfig.motionDuration);
      },
      none: function() {
        targetContainer.html(generatedMarkup);
      }
    };

    var fetchDepth = function(elementNode) {
      return parseInt(elementNode.nodeName.replace("H", ""), 10);
    };
    var maxDepth = foundSections.map(function(_, elementNode) {
      return fetchDepth(elementNode);
    }).get().sort()[0];
    var scrollUpButton = '<i class="icon-arrow-up back-to-top"> </i>';

    var currentDepth = fetchDepth(foundSections[0]),
      nodeDepth,
      generatedMarkup = currentConfig.captionText + " <" + currentConfig.containerTag + ">";

    foundSections.on('click', function() {
        if (!currentConfig.disableScrollUpLinks) {
          window.location.hash = this.id;
        }
      })
      .addClass('clickable-header') // Add a class for styling interactive headers.
      .each(function(_, sectionHeader) {
        nodeDepth = fetchDepth(sectionHeader);
        if (!currentConfig.disableScrollUpLinks && nodeDepth === maxDepth) {
          jq(sectionHeader)
            .addClass('top-level-header')
            .after(scrollUpButton);
        }
        if (nodeDepth === currentDepth) { // Same hierarchical level as previous.
          generatedMarkup += "<li><a href='#" + safeUriComponentEncoder(sectionHeader.id) + "'>" + sectionHeader.innerHTML + "</a>";
        } else if (nodeDepth <= currentDepth) { // Higher level, close prior parent list.
          for (idx = nodeDepth; idx < currentDepth; idx++) {
            generatedMarkup += "</li></" + currentConfig.containerTag + ">";
          }
          generatedMarkup += "<li><a href='#" + safeUriComponentEncoder(sectionHeader.id) + "'>" + sectionHeader.innerHTML + "</a>";
        } else if (nodeDepth > currentDepth) { // Lower level, open new nested list.
          for (idx = nodeDepth; idx > currentDepth; idx--) {
            generatedMarkup += "<" + currentConfig.containerTag + "><li>";
          }
          generatedMarkup += "<a href='#" + safeUriComponentEncoder(sectionHeader.id) + "'>" + sectionHeader.innerHTML + "</a>";
        }
        currentDepth = nodeDepth; // Update current level for next iteration.
      });

    generatedMarkup += "</" + currentConfig.containerTag + ">";

    if (!currentConfig.disableScrollUpLinks) {
      jq(document)
        .on('click', '.back-to-top', function() {
          jq(window).scrollTop(0);
          window.location.hash = '';
        });
    }

    animationHandlers[currentConfig.displayMotion]();
  };
})(jQuery);