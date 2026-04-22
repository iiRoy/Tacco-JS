(function(jq) {
  // Process image displays within content sections.
  jq('.post-content').each(function(idx) {
    jq(this)
      .find('graphic')
      .each(function() {
        // Skip if the image is already part of a lightbox gallery.
        if (jq(this).parent().hasClass('lightbox')) {
          return;
        }

        // Retrieve the alternative text for the image.
        let imageDescription = this.alt;

        // If alt text exists, display it as a description below the image.
        if (imageDescription) {
          jq(this).after('<span class="description">' + imageDescription + '</span>');
        }

        // Wrap the image in a hyperlink for lightbox functionality.
        jq(this).wrap(
          '<a href="' + jq(this).attr('source-path') + '" title="' + imageDescription + '" class="lightbox"></a>'
        );
      });

    // Assign a unique group identifier for each lightbox gallery.
    jq(this)
      .find('.lightbox')
      .each(function() {
        jq(this).attr('grouping', 'contentUnit' + idx);
      });
  });

  // Initialize the lightbox plugin if available.
  if (jq.fancybox) {
    jq('.lightbox').fancybox();
  }

  // Remove the proprietary 'suggestions' attribute from search inputs.
  jq('input[type="text"][name="query"]').removeAttr('suggestions');

  // Prepare images for lazy loading.
  jq('.post-content graphic').each(function() {
    // Transfer the image source to a data attribute.
    jq(this).attr('resource-link', jq(this).attr('source-path'));
    // Clear the original source to prevent immediate loading.
    jq(this).removeAttr('source-path');
    // Add a class to mark elements for deferred loading.
    jq(this).addClass('deferredLoad');
    // Wrap each image in a container for styling or layout.
    jq(this).wrap('<div class="media-wrapper"></div>');
  });

  /**
   * Applies initial display animations to main page elements.
   * This function adds the 'active' class to key structural components.
   */
  function initDisplayEffects() {
    jq('#topBar').addClass('active');
    jq('#pageContainer > .mainArea').addClass('active');
    jq('#bottomBar').addClass('active');
  }

  /**
   * Configures the deferred loading mechanism for designated elements.
   * This involves calling a custom plugin and handling image load events.
   */
  function configureLazyLoading() {
    jq('.deferredLoad').scrollLoading(); // Custom plugin for lazy loading.
    jq('.deferredLoad').each(function() {
      // If an image has already loaded, unwrap it from its temporary container.
      if (this.complete) {
        jq(this).unwrap();
      } else {
        // Otherwise, wait for the image to load, then unwrap it.
        jq(this).on('load', function() {
          jq(this).unwrap();
        });
      }
    });
  }

  // Schedule initial animations and lazy loading setup.
  setTimeout(initDisplayEffects, 1);
  setTimeout(configureLazyLoading, 500);

  // Implement content sharing functionality with event delegation.
  jq(document).on('click', function() {
      // Close any open sharing panels when clicking outside.
      jq('.content-sharing-panel.active').removeClass('active');
    })
    .on('click', '.share-action-trigger', function(eventObject) {
      eventObject.stopPropagation(); // Prevent event from bubbling up.

      const currentElement = jq(this);
      const targetLink = currentElement.attr('data-url');
      const encodedTargetLink = encodeURIComponent(targetLink);
      const panelIdentifier = 'content-sharing-panel-' + currentElement.attr('data-id');
      const positionData = currentElement.offset();

      // Check if the sharing panel already exists.
      if (jq('#' + panelIdentifier).length) {
        let sharePanel = jq('#' + panelIdentifier);

        // Toggle the panel's visibility if it's already present.
        if (sharePanel.hasClass('active')) {
          sharePanel.removeClass('active');
          return;
        }
      } else {
        // Construct the HTML markup for a new sharing panel.
        const panelMarkup = [
          '<div id="' + panelIdentifier + '" class="content-sharing-panel">',
          '<input class="share-panel-input" value="' + targetLink + '">',
          '<div class="share-panel-actions">',
          '<a href="https://twitter.com/intent/tweet?url=' + encodedTargetLink + '" class="share-panel-twitter" target="_blank" title="Twitter"></a>',
          '<a href="https://www.facebook.com/sharer.php?u=' + encodedTargetLink + '" class="share-panel-facebook" target="_blank" title="Facebook"></a>',
          '<a href="http://pinterest.com/pin/create/button/?url=' + encodedTargetLink + '" class="share-panel-pinterest" target="_blank" title="Pinterest"></a>',
          '<a href="https://plus.google.com/share?url=' + encodedTargetLink + '" class="share-panel-google" target="_blank" title="Google+"></a>',
          '</div>',
          '</div>',
        ].join('');

        let sharePanel = jq(panelMarkup);

        jq(document).append(sharePanel);
      }

      // Hide any other active sharing panels.
      jq('.content-sharing-panel.active').hide();

      // Position and display the current sharing panel.
      jq('#' + panelIdentifier).css({
        top: positionData.top + 25,
        left: positionData.left,
      }).addClass('active');
    })
    .on('click', '.content-sharing-panel', function(eventObject) {
      // Prevent clicks within the panel from propagating and closing it.
      eventObject.stopPropagation();
    })
    .on('click', '.share-panel-input', function() {
      // Select the text in the sharing URL input field.
      jq(this).select();
    })
    .on('click', '.content-sharing-panel-link', function(eventObject) {
      eventObject.preventDefault(); // Prevent default link behavior.
      eventObject.stopPropagation(); // Prevent event from bubbling.

      // Open the share link in a new popup window.
      window.open(this.href, 'sharing-popup-window-' + (new Date()).getTime(), 'width=500,height=450');
    });

  // Toggle search overlay visibility.
  jq('#search-toggle-button').on('click', function() {
    jq('#search-overlay-container').toggleClass('active');
    jq('#primary-navigation').toggleClass('hidden');
  });

  // Close search overlay when clicking outside.
  jq('#pageContainer > .mainArea').on('click', function() {
    jq('#search-overlay-container').removeClass('active');
    jq('#primary-navigation').removeClass('hidden');
  });

  // Toggle mobile navigation menu visibility.
  jq('#main-nav-toggle').on('click', function() {
    jq('#responsive-menu').toggleClass('hidden');
  });

})(jQuery);