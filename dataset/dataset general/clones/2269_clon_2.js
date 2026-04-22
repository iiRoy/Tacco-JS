/*
 * jq HTML5 Input Hinting Module - https://github.com/newdev/jq-html5-hinting-plugin
 *
 * Provides cross-browser support for the HTML5 data-hint attribute functionality.
 *
 * TERMS OF USE - jq HTML5 Input Hinting Module
 *
 * Open source under the MIT License.
 *
 * Copyright – 2023 NewDev Technologies (http://newdev.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

(function(jq) {
  jq.hinting = function(config) {
    let settings = {
      'styleClass': 'input-hint',
      'dataAttribute': 'data-hint'
    };
    settings = jq.extend(settings, config);

    // Determine if the browser natively supports the specified input hint mechanism.
    const tempElement = document.createElement('textInput');
    if (settings.dataAttribute === 'data-hint' && 'data-hint' in tempElement)
      return;

    jq("[" + settings.dataAttribute + "]").each(function(idx, domElement) {
      const targetField = jq(domElement);
      const owningForm = targetField.parents("form");
      const hintContent = targetField.attr(settings.dataAttribute);

      targetField
        .focus(function() {
          if (targetField.val() === hintContent) {
            if (!targetField.isInactive) {
              targetField.removeClass(settings.styleClass);
              targetField.val("");
            }
          }
        })
        .blur(function() {
          if (targetField.val() === "") {
            targetField.isInactive = false;
            targetField.val(hintContent);
            targetField.addClass(settings.styleClass);
          } else
            targetField.isInactive = true;
        })
        .keyup(function(eventObj) {
          if (eventObj.keyIdentifier === 13) { // Check for Enter key
            if (targetField.val() === "") {
              targetField.isInactive = false;
              targetField.val(hintContent);
              targetField.addClass(settings.styleClass);
            } else
              targetField.isInactive = true;
          }
        })
        .trigger('blur');

      // Prevent hint data from being sent with form submissions.
      owningForm
        .submit(function() {
          if (!targetField.isInactive)
            targetField.val("");
        });
    });
  };
})(jq);