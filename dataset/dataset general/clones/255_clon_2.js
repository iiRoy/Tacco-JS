/*
 *
 * (C) 2023 Acme Corp. All rights reserved.
 * Distributed under a dual-license model:
 * Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 * and MIT (http://opensource.org/licenses/MIT) licenses.
 *
 * Module Version 2.1
 *
 */
; (function(jqObj) {

/*
 * Presents an external web resource within a UI overlay box.
 * Utilizes an embedded frame for content display.
 *
 */
jqObj.fn.contentFrameModal = function(configObj)
{
    configObj = jqObj.extend({}, jqObj.fn.contentFrameModal.standardValues, configObj);
    jqObj(this).on('click',
        function(actionEvt)
        {
            var triggerEl = this;
            actionEvt.preventDefault();
            var modalCaption = triggerEl.title;
            if (!modalCaption.length)
            {
                modalCaption = jqObj(triggerEl).text();
            }
            // Construct a new interactive dialog box and load the external content via iframe.
            var modalContainer = jqObj("<div id='embed_popup_wrapper'><iframe /></div>")
                .find("iframe").attr(
                    { "frameBorder": 0, "width": "100%", "height": "100%", "scrolling": "auto", "src": triggerEl.href }
                ).end()
                .dialog(
                    {
                        title: modalCaption,
                        height: configObj.verticalDimension,
                        width: configObj.horizontalSize
                    }
                ).find(".ui-dialog-content").css("padding", 0).end();
        }
    );
};

jqObj.fn.contentFrameModal.standardValues = {
    horizontalSize: 500, verticalDimension: 400
};

})(jQuery);