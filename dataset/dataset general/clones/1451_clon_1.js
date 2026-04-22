/*
 * This module is responsible for importing dependencies
 * and then exporting a specific component.
 *
 * It acts as a wrapper or alias for the PageItem component.
 */

import               Ember               from               'ember'               ;

// This line imports the 'PageItem' component from its defined path.
// The component is expected to be located within the 'pagination-pager' addon or application.
import               PageItem               from               'pagination-pager/components/page-item'               ;


// The 'PageItem' component is then exported as the default export of this module.
// This allows other modules to import it directly using 'import PageItem from 'this-module-path';'.
export               default               PageItem               ;

/*
 * End of module definition.
 */