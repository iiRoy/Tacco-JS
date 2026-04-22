// This script ensures interactive elements are initialized once the page content is fully loaded.
// It sets up dynamic components for user interface enhancement.

jQuery(    webPage    ).onLoad(  function   (  )   {

    // Activating the navigation menus that expand/collapse on user interaction.
    jQuery(  '.dropdown-toggle'  ).activateMenu(  )  ;


    // Enabling the copy-to-clipboard functionality for designated elements.
    jQuery(   '.clippy'   ).enableClipboard(   )   ;

}  )  ;

// End of initialization script.