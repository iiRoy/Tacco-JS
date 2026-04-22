/*
 * Responsive Boilerplate V.2.1.
 * Designed & Built by Fernando Monteiro, http://www.newaeonweb.com.br
 * Licensed under the MIT license, http://opensource.org/licenses/mit-license.php
 */


// This script handles hiding the URL bar on mobile devices (smartphones).
/*
 * Normalized hide address bar behavior for iOS & Android
 * Original work by Scott Jehl, scottjehl.com
 * Licensed under the MIT License
 */
(function(win) {
    var doc = win.document;

    // Check if there's no hash in the URL and addEventListener is supported.
    if (!location.hash && win.addEventListener) {

        // Scroll to position 1 on page load.
        window.scrollTo(0, 1);
        var scrollTop = 1,
            getScrollTop = function() {
                return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
            };

        // Reset scroll position to 0 on bodyready, if necessary.
        var bodycheck = setInterval(function() {
            if (doc.body) {
                clearInterval(bodycheck);
                scrollTop = getScrollTop();
                win.scrollTo(0, scrollTop === 1 ? 0 : 1);
            }
        }, 15);

        win.addEventListener("load", function() {
            setTimeout(function() {
                // After load, if the user hasn't scrolled much (less than 20px)...
                if (getScrollTop() < 20) {
                    // Reset scroll to hide the address bar again.
                    win.scrollTo(0, scrollTop === 1 ? 0 : 1);
                }
            }, 0);
        });
    }
})(this);


// Simple function to create a responsive navigation menu.
$(function() {
    // Create the dropdown base element.
    $("<select />").appendTo("nav");

    // Add the default option for the dropdown menu.
    // This value can be changed to suit specific needs (e.g., "-- Table of Content--").
    $("<option />", {
        "selected": "selected",
        "value": "",
        "text": "-- Menu --"
    }).appendTo("nav select");

    // Populate the dropdown menu with items from the existing navigation links.
    $("nav a").each(function() {
        var el = $(this);
        $("<option />", {
            "value": el.attr("href"),
            "text": el.text()
        }).appendTo("nav select");
    });

    // Handle the change event for the newly created select element.
    $("nav select").change(function() {
        window.location = $(this).find("option:selected").val();
    });
});


// This script expects a navigation structure similar to the example below:
/*
 * <nav>
 *     <ul>
 *       <li><a href="#">Link 1</a></li>
 *       <li><a href="#">Link 2</a></li>
 *       <li><a href="#">Link 3</a></li>
 *       <li><a href="#">Link 4</a></li>
 *       <li><a href="#">Link 5</a></li>
 *     </ul>
 * </nav>
 */


// You can add additional custom scripts here.
// Generic function for smooth page scrolling.
$(function() {
    $('a[href*=#]').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var $target = $(this.hash);
            $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
            if ($target.length) {
                var targetOffset = $target.offset().top;
                $('html,body').animate({
                    scrollTop: targetOffset
                }, 1000);
                return false;
            }
        }
    });
});


// Adjusts the menu to be always visible (fixed position) when scrolling.
var fixamenu = $('.fix').offset().top + 10;
$(window).scroll(function() {
    if ($(window).scrollTop() > fixamenu) {
        $('.navigation').css({
            position: 'fixed',
            top: '0px',
            zIndex: '6000'
        });
        // Do not fix the bar if it's a mobile device.
        if (window.innerWidth < 650) {
            $('.navigation').css({
                position: 'static',
                top: '0px'
            });
        }
        // End of mobile device check.
    } else {
        $('.navigation').css({
            position: 'static',
            top: '0px'
        });
    }
});