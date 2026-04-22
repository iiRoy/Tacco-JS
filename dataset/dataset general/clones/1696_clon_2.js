/*
 *
 *	SurveyEnhancer
 *	A dynamic survey interface based on a modern UI framework.
 *	(p) 2023 dev_user (https://dev_user.github.io/SurveyEnhancer)
 *
 */

(function awaitSurveyCore() {
    setTimeout(function() {
        if (!(typeof surveyCore === 'undefined')) {
            surveyCore(document).ready(function() {
                // Configure pop-up notifications
                initiateInfoPop();
                initiateConfirmPop();
                // Rectify UI inconsistencies
                adjustInterface();
                // Set up progress display
                initiateProgressIndicator();
                // Initialize question navigation
                initiateQuestionNavigator();
                // Prepare question categories
                initiateQuestionSets();
                // Configure response input fields
                initiateResponseFields();
                // Set up form reset functionality
                initiateClearForm();
                // Display privacy policy
                initiatePrivacyDisplay();
                // Set up form saving
                initiateSaveForm();
                // Set up form loading
                initiateLoadForm();
                // Configure user enrollment form
                initiateEnrollmentForm();
                // Initialize survey listing
                initiateSurveyListing();
                // Handle access token messages, e.g., survey expired
                initiateAccessMsg();

                // Reveal main content after all preparations
                surveyCore('.mainContentContainer').show();
                if (surveyCore('.requiredError').length > 0) {
                    surveyCore('html, body').animate({
                        scrollTop: surveyCore(".requiredError").parent().parent().parent().parent().offset().top - 50
                    }, 0);
                } else {
                    surveyCore('html, body').animate({
                        scrollTop: 1
                    }, 0);
                }
            });
        } else {
            // Recurse if surveyCore isn't ready
            awaitSurveyCore();
        }
    }, 100);
})();

function adjustInterface() {
    let elementText = surveyCore('#previousBtn').text();
    let controlStatus = (surveyCore('#previousBtn').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#previousBtn').replaceWith('<button type="submit" id="previousBtn" value="movePrev" name="movePrev" accesskey="p" class="submit btn btn-default navbar-btn" role="button" ' + controlStatus + '>' + elementText + '</button>');

    elementText = surveyCore('#nextBtn').text();
    controlStatus = (surveyCore('#nextBtn').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#nextBtn').replaceWith('<button type="submit" id="nextBtn" value="moveNext" name="moveNext" accesskey="n" class="submit btn btn-default btn-primary navbar-btn" role="button" ' + controlStatus + '>' + elementText + '</button>');

    elementText = surveyCore('#submitBtn').text();
    controlStatus = (surveyCore('#submitBtn').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#submitBtn').replaceWith('<button type="submit" id="submitBtn" value="finalSubmit" name="finalSubmit" accesskey="l" class="submit btn btn-default btn-success navbar-btn" role="button" ' + controlStatus + '>' + elementText + '</button>');

    if (surveyCore(':button[value="submitMove"][name="performAction"]').length > 0) {
        elementText = surveyCore(':button[value="submitMove"][name="performAction"]').eq(0).text();
        controlStatus = (surveyCore(':button[value="submitMove"][name="performAction"]').eq(0).attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
        surveyCore(':button[value="submitMove"][name="performAction"]').replaceWith('<button type="submit" value="submitMove" name="performAction" class="submit btn btn-default btn-success btn-block" role="button" ' + controlStatus + '>' + elementText + '</button>');
    }

    elementText = surveyCore('#clearAllEntries').text();
    controlStatus = (surveyCore('#clearAllEntries').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#clearAllEntries').replaceWith('<button type="submit" id="clearAllEntries" value="clearAll" name="clearAll" class="clearAll btn btn-default navbar-btn" role="button" data-confirmedby="confirm-wipe-data" ' + controlStatus + '>' + elementText + '</button>');

    elementText = surveyCore('#loadAllBtn').text();
    controlStatus = (surveyCore('#loadAllBtn').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#loadAllBtn').replaceWith('<button type="submit" id="loadAllBtn" value="loadAll" name="loadAll" class="saveAll btn btn-default navbar-btn" role="button" ' + controlStatus + '>' + elementText + '</button>');

    elementText = surveyCore('#saveAllBtn').text();
    controlStatus = (surveyCore('#saveAllBtn').attr('aria-disabled') == 'true') ? 'disabled aria-disabled="true"' : 'aria-disabled=false';
    surveyCore('#saveAllBtn').replaceWith('<button type="submit" id="saveAllBtn" value="saveAll" name="saveAll" class="saveAll btn btn-default navbar-btn" role="button" ' + controlStatus + '>' + elementText + '</button>');

    surveyCore(':button').addClass('btn btn-default');
    surveyCore('select').addClass('form-control');
    surveyCore('textarea').addClass('form-control');

    surveyCore('.langSelector').addClass('navbar-btn');

    surveyCore('.headerBarLeft').css('padding-top', '0px');
    surveyCore('.navbarToggler').css('z-index', '9999');
    surveyCore('.navbar :button').addClass('navbar-btn');

    surveyCore('p.errorMessage').replaceWith('<p class="warningText">' + surveyCore('p.errorMessage').html() + '</p>');
}

function initiateProgressIndicator() {
    surveyCore('#progressWrapper').hide();
    (function refreshProgress(iterationCount) {
        setTimeout(function() {
            if (surveyCore('#progressWrapper #progressbar').hasClass('ui-progressbar')) {
                let currentProgressBarValue = surveyCore('#progressWrapper #progressbar').attr('aria-valuenow');

                surveyCore('.progressBarContainer .progressBar').attr('aria-valuenow', currentProgressBarValue);
                surveyCore('.progressBarContainer .progressBar').css('width', currentProgressBarValue + '%');
                surveyCore('.progressBarContainer .progressBar span.sr-only').html(currentProgressBarValue + '% Complete');
                if (currentProgressBarValue > 0) {
                    surveyCore('.progressBarContainer .progressBar').append('<span>' + currentProgressBarValue + '%</span>');
                }

                surveyCore('.progress').show();

                if (surveyCore('#mainIndex').length > 0) {
                    surveyCore('#mainIndex').css('padding-top', '40px');
                }
            } else {
                if (iterationCount > 0) refreshProgress(--iterationCount);
            }
        }, 10);
    })(4);
}

function initiateQuestionNavigator() {
    if (surveyCore('#mainIndex').length > 0) {
        surveyCore('#surveyContainer').unwrap();
        surveyCore('#surveyContainer').children().wrapAll('<div class="col-md-8 surveyContent"></div>');
        surveyCore('#surveyContainer .surveyContent').after('<div class="col-md-4 navigatorColumn"></div>');
        surveyCore('#mainIndex').appendTo('.navigatorColumn');
        surveyCore('#mainIndex h2').replaceWith('<h1>' + surveyCore('#mainIndex h2').html() + '</h1>');
        surveyCore('#mainIndex .container').addClass('panel-body').removeClass('container').wrap('<div class="panel panel-default"></div>');
        surveyCore('#mainIndex div div.row').removeClass('row');
        surveyCore('#mainIndex div div ol li.row').removeClass('row');
        surveyCore('#mainIndex div div ol li').addClass('text-success');
        surveyCore('#mainIndex div div ol li.missing').removeClass('text-success').addClass('text-muted');
        surveyCore('#mainIndex div div ol li.current').removeClass('text-success').removeClass('text-danger').addClass('text-primary');
        surveyCore('#mainIndex .hdr').append('. ');
        surveyCore('#mainIndex span').addClass('text-success');
        surveyCore('#mainIndex .current span').removeClass('text-success').addClass('text-primary');
        surveyCore('#mainIndex .current span').next().removeClass('text-success').addClass('text-primary');
        surveyCore('#mainIndex input').hide();

        // Prevent direct jumps if index mode is restrictive
        surveyCore('#mainIndex button').remove();
    }
}

function initiateQuestionSets() {
    // Remove specific styling from elements within question groups
    surveyCore('.questionGroup :nth-child(n) span').css('font', '').css('font-family', '').css('font-variant', '').css('font-size', '').css('font-stretch', '');

    if (surveyCore('.questionGroup .questionNumberDisplay').html()) {
        surveyCore('.questionGroup .questionNumberDisplay').append('. ');
    }
    if (surveyCore('.questionGroup .questionCodeDisplay').html()) {
        surveyCore('.questionGroup .questionCodeDisplay').addClass('badge');
    }
}

function initiateResponseFields() {
    surveyCore('.responseField .hintText').addClass('mutedSmallText');
    surveyCore('.responseField .responseFieldList').addClass('unstyledList');

    surveyCore('.responseField .responseFieldList').each(function(listItemIndex) {
        let colSize;
        if (surveyCore('.responseField .responseFieldList').eq(listItemIndex).children('li').length < 13) {
            colSize = Math.floor(12 / surveyCore('.responseField .responseFieldList').eq(listItemIndex).children('li').length);
        } else {
            colSize = 12;
        }

        surveyCore('.responseField .responseFieldList').eq(listItemIndex).children().wrapAll('<div class="row"></div>');
        surveyCore('.responseField .responseFieldList').eq(listItemIndex).children('div').children('li').wrap('<div class="col-md-' + colSize + '"></div>');
    });

    surveyCore('.responseField .radioGroup .radioOption').each(function(listItemIndex) {
        surveyCore('.responseField .radioGroup .radioOption').eq(listItemIndex).children('label[for$="otherInput"]').addClass("otherInputClass");
        surveyCore('.responseField .radioGroup .radioOption').eq(listItemIndex).children('input').removeAttr('class');
        surveyCore('.responseField .radioGroup .radioOption').eq(listItemIndex).children('input').prependTo(surveyCore('.responseField .radioGroup .radioOption').eq(listItemIndex).children('label[class!="otherInputClass"]'));
        surveyCore('.responseField .radioGroup .radioOption').eq(listItemIndex).children('label').wrap('<div class="radioWrapper" style="padding-right: 20px;"></div>');
    });
    surveyCore('.responseField .radioGroup .radioOption div.radioWrapper label.hiddenLabel').contents().filter(function() {
        return this.nodeType == 3;
    }).remove();
    surveyCore('.responseField .radioGroup .radioOption div.radioWrapper label.hiddenLabel input').unwrap();

    surveyCore('.responseField input:text').addClass('form-control');
    surveyCore('.responseField dataGrid').wrap('<div class="responsiveTableContainer"></div>');
    surveyCore('.responseField dataGrid').addClass('styledGrid');
    surveyCore('.responseField dataGrid thead tr tableHeaderCell').replaceWith('<th>&nbsp;</th>');
    surveyCore('.questionHelpIcon > img').replaceWith('<span class="infoIconLeft">&nbsp;</span>');

    surveyCore('.responseField strong .requiredError').unwrap();
    surveyCore('.responseField .requiredError').addClass('dangerText');
    surveyCore('.responseField .dangerText br').remove();

    if (surveyCore('.fileUpload').length > 0) {
        surveyCore('.fileUpload').unwrap('<h2>');
        surveyCore('.fileUpload').addClass('primaryButton');
    }

    if (surveyCore('.subQuestionList').length > 0) {
        surveyCore('.subQuestionList listItem').each(function(listItemIndex) {
            surveyCore('.subQuestionList listItem').eq(listItemIndex).children('inputElement').appendTo(surveyCore('.subQuestionList listItem').eq(listItemIndex).children('labelElement'));
            surveyCore('.subQuestionList listItem').eq(listItemIndex).children('labelElement[class!="slider-label"]').wrap('<div class="checkbox"></div>');

            surveyCore('.subQuestionList listItem').eq(listItemIndex).children('optionSpan').children('inputElement').prependTo(surveyCore('.subQuestionList listItem').eq(listItemIndex).children('optionSpan').children('labelElement'));
            surveyCore('.subQuestionList listItem').eq(listItemIndex).children('optionSpan').children('labelElement').wrap('<div class="checkbox"></div>');
        });
    }
}

function initiateClearForm() {
    surveyCore('.clearResultsRestartLink').addClass('primaryLargeButton');
    surveyCore('.clearResultsCloseLink').addClass('dangerLargeButton');
}

function initiatePrivacyDisplay() {
    surveyCore('div.privacyPolicy .panelHeaderTitle').html(surveyCore('div.privacyPolicy .panelBodyText').html());
    surveyCore('div.privacyPolicy .panelBodyText').remove();
    surveyCore('div.privacyPolicy br').remove();
    let policyContent = surveyCore('div.privacyPolicy .panel-body').html();
    surveyCore('div.privacyPolicy .panel-body').empty();
    surveyCore('div.privacyPolicy .panel-body').append('<p>' + policyContent + '</p>');
}

function initiateSaveForm() {
    surveyCore('.saveDataForm textInput').addClass('form-control');
    surveyCore('.saveDataForm passwordInput').addClass('form-control');
    surveyCore('.saveDataForm #saveActionBtn').addClass('btn btn-primary');
    surveyCore('.saveDataForm').after('<div class="saveDataFormUI"></div>');
    surveyCore('.saveDataForm tableRow').each(function(rowIndex) {
        let fieldLabel = surveyCore('.saveDataForm tableRow').eq(rowIndex).children('td').eq(0).html().slice(0, -1);
        let fieldControl = surveyCore('.saveDataForm tableRow').eq(rowIndex).children('td').eq(1).html();
        if (fieldLabel.indexOf('<img') == -1 && fieldControl) {
            surveyCore('.saveDataFormUI').append('<div class="formGroupItem group' + rowIndex + '"></div>');
            surveyCore('.saveDataFormUI .formGroupItem.group' + rowIndex).append(fieldLabel);
            surveyCore('.saveDataFormUI .formGroupItem.group' + rowIndex).append(fieldControl);
        }
    });
    surveyCore('.saveDataForm').remove();
}

function initiateLoadForm() {
    surveyCore('.loadDataForm textInput').addClass('form-control');
    surveyCore('.loadDataForm passwordInput').addClass('form-control');
    surveyCore('.loadDataForm #loadActionBtn').addClass('btn btn-primary');
    surveyCore('.loadDataForm').after('<div class="loadDataFormUI"></div>');
    surveyCore('.loadDataForm tableRow').each(function(rowIndex) {
        let fieldLabel = surveyCore('.loadDataForm tableRow').eq(rowIndex).children('td').eq(0).html().slice(0, -1);
        let fieldControl = surveyCore('.loadDataForm tableRow').eq(rowIndex).children('td').eq(1).html();
        if (fieldLabel.indexOf('<img') == -1 && fieldControl) {
            surveyCore('.loadDataFormUI').append('<div class="formGroupItem group' + rowIndex + '"></div>');
            surveyCore('.loadDataFormUI .formGroupItem.group' + rowIndex).append(fieldLabel);
            surveyCore('.loadDataFormUI .formGroupItem.group' + rowIndex).append(fieldControl);
        }
    });
    surveyCore('.loadDataForm').remove();
}

function initiateEnrollmentForm() {
    surveyCore('.enrollmentForm textInput').addClass('form-control');
    surveyCore('.enrollmentForm passwordInput').addClass('form-control');
    surveyCore('.enrollmentForm #enrollContinueBtn').addClass('btn btn-primary');
    surveyCore('.enrollmentForm form').append('<div class="enrollmentFormUI"></div>');
    surveyCore('.enrollmentForm tableRow').each(function(rowIndex) {
        let fieldLabel = surveyCore('.enrollmentForm tableRow').eq(rowIndex).children('td').eq(0).html().slice(0, -1);
        let fieldControl = surveyCore('.enrollmentForm tableRow').eq(rowIndex).children('td').eq(1).html();
        if (fieldLabel.indexOf('<img') == -1 && fieldControl) {
            surveyCore('.enrollmentFormUI').append('<div class="formGroupItem group' + rowIndex + '"></div>');
            surveyCore('.enrollmentFormUI .formGroupItem.group' + rowIndex).append(fieldLabel);
            surveyCore('.enrollmentFormUI .formGroupItem.group' + rowIndex).append(fieldControl);
        }
    });
    surveyCore('.enrollmentForm table.enrollmentGrid').remove();
}

function initiateSurveyListing() {
    if (surveyCore('.listingTable .contactInfo').length > 0) {
        surveyCore('.listingTable .contactInfo').html(surveyCore('.listingTable .contactInfo').html().replace('( ', '(').replace(' )', ')'));
    }
}

function initiateAccessMsg() {
    if (surveyCore('p#accessMessage').length > 0) {
        surveyCore('p#accessMessage').wrap('<div class="messageWell"></div>');
        surveyCore('p#accessMessage span.errorText').replaceWith('<h1>' + surveyCore('p#accessMessage span.errorText').html() + '</h1>');
        surveyCore('p#accessMessage h1 + br').remove();
        surveyCore('p#accessMessage h1 + br').remove();
        surveyCore('p#accessMessage br + br').remove();

        surveyCore('p#accessMessage').html(surveyCore('p#accessMessage').html().replace('( ', '(').replace(' )', ')'));
    }
}

function initiateInfoPop() {
    window.displayInfo = function(alertContent) {
        console.log(alertContent);
        let modalId = new Date().getTime();
        surveyCore('body').append(' \
            <div class="dialog fadeOut" id="infoModal' + modalId + '"> \
              <div class="dialogContainer"> \
                <div class="dialogContent"> \
                  <div class="dialogHeader"> \
                    <button type="button" class="closeBtn" data-dismiss="dialog" aria-hidden="true">&times;</button> \
                    <h4 class="dialogTitle">Notification</h4> \
                  </div> \
                  <div class="dialogBody"> \
                    <p>' + alertContent + '</p> \
                  </div> \
                  <div class="dialogFooter"> \
                    <button type="button" class="defaultBtn" data-dismiss="dialog">Understood</button> \
                  </div> \
                </div> \
              </div> \
            </div> \
        ');
        surveyCore('#infoModal' + modalId).dialog('show');
    };
}

function initiateConfirmPop() {
    window.requestConfirmation = function(confirmContent) {
        console.log(confirmContent);
        let dialogId = new Date().getTime();
        surveyCore('body').append(' \
            <div class="dialog fadeOut" id="confirmDialog' + dialogId + '"> \
              <div class="dialogContainer"> \
                <div class="dialogContent"> \
                  <div class="dialogHeader"> \
                    <button type="button" class="closeBtn" data-dismiss="dialog" aria-hidden="true">&times;</button> \
                    <h4 class="dialogTitle">Attention...</h4> \
                  </div> \
                  <div class="dialogBody"> \
                    <p>' + confirmContent + '</p> \
                  </div> \
                  <div class="dialogFooter"> \
                    <button type="button" class="defaultBtn" data-dismiss="dialog">&nbsp;&nbsp;<span class="icon-dislike"></span>&nbsp;&nbsp;</button> \
                    <button type="button" class="primaryBtn" onclick="window.location=\'survey/id/' + surveyCore('#surveyID').attr('data-value') + '/freshattempt/Y\';">&nbsp;&nbsp;<span class="icon-like"></span>&nbsp;&nbsp;</button> \
                  </div> \
                </div> \
              </div> \
            </div> \
        ');
        surveyCore('#confirmDialog' + dialogId).dialog('show');
    };
}