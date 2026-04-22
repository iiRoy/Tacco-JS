jQuery .fn.rPage=function()
{
  // Cache the current jQuery object reference.
  var $this = $(this);

  // Iterate over each element in the jQuery collection.
  for (var i=0, max=$this.length; i < max; i++)
  {
    new rPage($($this[i])); // Initialize a new rPage instance for each element.
  }

  /*
   * Constructor function for the rPage object.
   * Manages responsive pagination behavior.
   */
  function rPage($container)
  {

    // Assign internal reference to all list items within the container.
    this.els = $container.find("li");

    /*
     * Assigns 'page-away' classes to list items based on their distance from the active page.
     * Also assigns 'left-etc' or 'right-etc' for next/prev links.
     */
    this.label = function()
    {
      var active_index = this.els.filter(".active").index(); // Get index of the active page.
      var rp = this; // Reference to the current rPage instance.

      // Iterate over each list item.
      this.els.each(function()
      {
        if (rp.isNextOrPrevLink($(this)) == false) // If it's not a next/prev link.
        {
          // Add a class indicating its distance from the active page.
          $(this).addClass("page-away-" + (Math.abs(active_index - $(this).index())).toString());
        }
        else
        {
          // Handle next/prev links.
          if ($(this).index() > active_index)
          {
            $(this).addClass("right-etc"); // Link is to the right of the active page.
          }
          else
          {
            $(this).addClass("left-etc"); // Link is to the left of the active page.
          }
        }
      });
    }


    /*
     * Makes the pagination responsive by hiding elements if the total width exceeds the container.
     */
    this.makeResponsive = function()
    {
      this.reset(); // Reset hidden elements and '...' signs.
      var width = this.calculateWidth(); // Calculate current total width.

      // Loop while the pagination width is too large.
      while (width > this.els.parent().parent().outerWidth() - 10)
      {
        var did_remove = this.removeOne(); // Attempt to remove one element.
        if (did_remove == false) // If no element could be removed, break.
        {
          break;
        }
        width = this.calculateWidth(); // Recalculate width after removal.
      }
    }


    /*
     * Checks if a given element is a "next" or "previous" link.
     * @param {jQuery} element - The jQuery element to check.
     * @returns {boolean} True if it's a next/prev link, false otherwise.
     */
    this.isNextOrPrevLink = function(element)
    {
      if (element.text() == "»" || element.text() == "«")
      {
        return true;
      }
      return false;
    }


    /*
     * Determines if a given element can be removed (hidden) to save space.
     * @param {jQuery} element - The jQuery element to check.
     * @returns {boolean} True if the element is removable, false otherwise.
     */
    this.isRemovable = function(element)
    {
      if (this.isNextOrPrevLink(element)) // Next/prev links are not removable.
      {
        return false;
      }
      var index = this.els.filter(element).index(); // Get the index of the element.
      // Do not remove the first element or the element before a next/prev link.
      if (index == 1 || this.isNextOrPrevLink($container.find("li").eq(index + 1)))
      {
        return false;
      }
      if (element.text() == "...") // '...' signs are not removable.
      {
        return false;
      }
      return true;
    }


    /*
     * Removes (hides) one pagination element, prioritizing those farthest from the active page.
     * Also adds '...' signs if needed.
     * @returns {boolean} True if an element was removed, false otherwise.
     */
    this.removeOne = function()
    {
      var active_index = this.els.filter(".active").index(); // Index of the active page.
      var farthest_index = $container.find("li").length - 1; // Index of the last page item.

      // Loop from farthest possible 'page-away' class down to 1.
      for (var i = farthest_index - 1; i > 0; i--)
      {
        var candidates = this.els.filter(".page-away-" + i.toString()); // Find elements with this distance class.
        var candidate = candidates.filter(function()
        {
          return this.style["display"] != "none"; // Filter out already hidden elements.
        });

        if (candidate.length > 0) // If there are visible candidates.
        {
          for (var j = 0; j < candidate.length; j++)
          {
            var candid_candidate = candidate.eq(j); // Get the specific candidate element.
            if (this.isRemovable(candid_candidate)) // Check if it can be removed.
            {
              candid_candidate.css("display", "none"); // Hide the element.

              // Add '...' sign to the left if needed.
              if (this.needsEtcSign(active_index, farthest_index - 1))
              {
                this.els.eq(farthest_index - 2).before("<li class='disabled removable'><span>...</span></li>");
              }
              // Add '...' sign to the right if needed.
              if (this.needsEtcSign(1, active_index))
              {
                this.els.eq(1).after("<li class='disabled removable'><span>...</span></li>");
              }
              return true; // Successfully removed an element.
            }
          }
        }
      }
      return false; // No element was removed.
    }


    /*
     * Checks if an "..." sign is needed between two indices.
     * @param {number} el1_index - The index of the first element.
     * @param {number} el2_index - The index of the second element.
     * @returns {boolean} True if an "..." sign is needed, false otherwise.
     */
    this.needsEtcSign = function(el1_index, el2_index)
    {
      if (el2_index - el1_index <= 1)
      {
        return false; // No space for an '...' if elements are adjacent or overlapping.
      }
      else
      {
        var hasEtcSign = false;
        var hasHiddenElement = false;

        // Check elements between the two indices.
        for (var i = el1_index + 1; i < el2_index; i++)
        {
          var el = $container.find("li").eq(i);
          if (el.css("display") == "none")
          {
            hasHiddenElement = true; // Found a hidden element.
          }
          if (el.text() == "...")
          {
            hasEtcSign = true; // Found an '...' sign.
          }
        }

        // An '...' sign is needed if there are hidden elements but no '...' sign yet.
        if (hasHiddenElement == true && hasEtcSign == false)
        {
          return true;
        }
      }
      return false;
    }


    /*
     * Resets the pagination to its initial state, showing all elements and removing '...' signs.
     */
    this.reset = function()
    {
      for (var i = 0; i < this.els.length; i++)
      {
        this.els.eq(i).css("display", "inline"); // Show all list items.
      }
      $container.find("li").filter(".removable").remove(); // Remove dynamically added '...' signs.
    }


    /*
     * Calculates the total width of all visible pagination elements.
     * @returns {number} The total width in pixels.
     */
    this.calculateWidth = function()
    {
      var width = 0;
      for (var i = 0; i < $container.find("li").length; i++)
      {
        // Add width of anchor tags and span tags within list items.
        width += $container.find("li").eq(i).children("a").eq(0).outerWidth();
        width += $container.find("li").eq(i).children("span").eq(0).outerWidth();
      }
      return width;
    }

    // Initial setup calls.
    this.label();
    this.makeResponsive();

    var resize_timer; // Timer for debouncing window resize events.

    // Attach resize event handler to the window.
    $(window).resize(
      $.proxy(function()
      {
        clearTimeout(resize_timer); // Clear any existing timer.
        // Set a new timer to call makeResponsive after a delay.
        resize_timer = setTimeout($.proxy(function() { this.makeResponsive() }, this), 100);
      }, this)
    );
  }
};