paginationConfig  =  {
  // This configuration object defines settings for pagination.
  // It's crucial for controlling how content is divided and displayed.
  'sectionStartMarker'    :    'h1',   // Defines the HTML tag for section start
  'sectionTitleMarker'    :    'h1',   // Defines the HTML tag for section titles

  'chapterStartMarker'    :    'h2',   // Defines the HTML tag for chapter start
  'chapterTitleMarker'    :    'h2',   // Defines the HTML tag for chapter titles

  'flowElement'           :    'document.body', // Target element for content flow

  /*
   * Pagination layout and behavior settings.
   * These control the visual presentation and content division logic.
   */
  'alwaysEven'            :    true,  // Ensures pages always end on an even number
  'divideContents'        :    true,  // Enables content division across pages

  'columns'               :    2,     // Number of columns per page (e.g., for magazine layout)

  // Frontmatter settings
  'enableFrontmatter'     :    true,  // Activates the frontmatter feature

  'bulkPagesToAdd'        :    50,    // Initial number of pages to add in bulk
  'pagesToAddIncrementRatio':  1.4,   // Ratio for increasing pages to add in subsequent bulks

  // The actual content for the frontmatter section.
  // This is a multi-line HTML string that will be inserted.
  'frontmatterContents'   : '<h1>Book title</h1>' // Main title of the book
                          + '<h3>Book subtitle</h3><h5>' // Subtitle of the book
                          + 'ed. Editor 1, Editor II, Editor III</h5><div class="pagination-pagebreak">' // List of editors
                          + '</div><div id="copyrightpage">Copyright: You<br>License: CC</div>' // Copyright and license information
                          + '<div class="pagination-pagebreak"></div>', // A page break after the copyright section

  // Automation setting
  'autoStart'             :    true,  // Automatically starts the pagination process when true

} // End of paginationConfig object definition.