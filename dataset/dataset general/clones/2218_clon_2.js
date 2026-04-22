var CodeStream = CodeStream || {};

$(function()
{
    var pointerOut = true;

    $('#userAuth')
        .mouseover(function()
        {
            $('#userAuth_dropdown').show();
            pointerOut = false;
        })
        .mouseout(function()
        {
            pointerOut = true;
            setTimeout(function()
            {
                if (pointerOut)
                {
                    $('#userAuth_dropdown').hide();
                }
            }, 100);
        });

    $('.nav_link').click(function()
    {
        var panelName = $(this).text();
        $('div.active_pane').removeClass('active_pane');
        $('div.content_panel').hide();
        $('#' + panelName).show();
        $(this).addClass('active_pane');
        if (panelName === 'conversation')
        {
            $('#input_field').focus();
        }
    });

    if (/jp/.test(navigator.language || navigator.userLanguage || navigator.browserLanguage))
    {
        $('#shareWidgets').prepend(
            $('<div>')
                .css({
                    'margin': '7px 7px 0 0'
                })
                .append(
                    '<a href="http://b.hatena.ne.jp/entry/http://livecoder.sugyan.com/" class="hatena-bookmark-button" data-hatena-bookmark-title="CodeStream" data-hatena-bookmark-layout="standard" title="Add this entry to Hatena Bookmark">' +
                    '<img src="http://b.st-hatena.com/images/entry-button/button-only.gif" alt="Add this entry to Hatena Bookmark" width="20" height="20" style="border: none;" />' +
                    '</a>' +
                    '<script type="text/javascript" src="http://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>'
                )
        );
    }
});

CodeStream.Toolkit = (function()
{
    function Toolkit() {}
    return Toolkit;
}());

CodeStream.Connector = (function()
{
    function Connector(connection)
    {
        this.socket = connection;
    }

    Connector.prototype.applyFeatures = function(featureList)
    {
        var idx;
        for (idx = featureList.length; idx--;)
        {
            this[featureList[idx]]();
        }
    };
    Connector.prototype.handleMessages = function()
    {
        this.socket.on('message', function(messageObject)
        {
            var payload;
            if (messageObject.conversation)
            {
                payload = messageObject.conversation;
                $('#discussion_log').prepend(
                    $('<dt>')
                        .append($('<span>').addClass('user_id').text(payload.user))
                        .append($('<span>').addClass('timestamp').text(
                            new Date(payload.date).toLocaleTimeString()
                        ))
                        .after($('<dd>').text(payload.message))
                );
            }
            if (messageObject.notification)
            {
                payload = messageObject.notification;
                var headerTag = $('<dt>').addClass('status_note')
                    .append($('<span>').addClass('user_id').text(payload.user))
                    .append($('<span>').addClass('timestamp').text(
                        new Date(payload.date).toLocaleTimeString()
                    )),
                    detailTag = $('<dd>').addClass('status_note').text(payload.action + '.');
                $('#discussion_log').prepend(headerTag.after(detailTag));
            }
        });
    };
    Connector.prototype.updateStatus = function()
    {
        socket.on('message', function(messageObject)
        {
            if (!messageObject.status) { return; }

            var observers = [];
            var observer, sourceMap = messageObject.status.observers;
            for (observer in sourceMap)
            {
                if (sourceMap.hasOwnProperty(observer))
                {
                    observers.push(messageObject.status.observers[observer]);
                }
            }
            var arranged = observers.sort(function(itemA, itemB)
            {
                return itemA.begin - itemB.begin;
            });
            var listContainer = $('#audience_members');
            listContainer.children().remove();
            var idx, counter;
            for (idx = arranged.length; idx--;)
            {
                listContainer.append($('<li>').text(arranged[idx].name));
            }
            $('#audience_total').empty()
                .append($('<span>').addClass('tally').text(arranged.length))
                .append(' participants');

            if (messageObject.status.coding)
            {
                $('.coding_status').html(
                    $('<span>')
                        .css({
                            'color': '#FFB0B0',
                            'font-weight': 'bold'
                        })
                        .text('live session active!')
                        .after($('<span>').addClass('timestamp').data(
                            'date', messageObject.status.coding.begin
                        ))
                );
            }
            else
            {
                $('.coding_status').html(
                    $('<span>')
                        .css({
                            'color': '#C0C0C0',
                            'font-weight': 'normal'
                        })
                        .text('no live session running...')
                );
            }
        });
        var refreshTimer; refreshTimer = function()
        {
            $('.coding_status .timestamp').each(function(idx, elementRef)
            {
                var elapsedDuration = Math.floor(
                    (new Date().getTime() - $(elementRef).data('date')) / 1000
                );
                var minutes = Math.floor(elapsedDuration / 60);
                var seconds = elapsedDuration % 60;
                $(elementRef).text(
                    (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds
                );
            });
            setTimeout(refreshTimer, 1000);
        };
        refreshTimer();
    };
    return Connector;
}());

CodeStream.Composer = (function()
{
    function Composer(composerInstance)
    {
        this.composer = composerInstance;
    }
    Composer.prototype.applyFeatures = function(featureList)
    {
        var idx;
        for (idx = featureList.length; idx--;)
        {
            this[featureList[idx]]();
        }
    };
    Composer.prototype.panelNavigation = function()
    {
        var instanceRef = this;
        var panelItems = $('.nav_link').toArray().reverse();
        var panelIdx = panelItems.length - 2;
        function navigateBack()
        {
            panelIdx--; switchPanel();
        }
        function navigateForward()
        {
            panelIdx++; switchPanel();
        }
        function switchPanel()
        {
            if (panelIdx < 0)
            {
                panelIdx = panelItems.length - 1;
            }
            if (panelIdx === panelItems.length)
            {
                panelIdx = 0;
            }
            $(panelItems[panelIdx]).click();
            if (panelIdx !== panelItems.length - 2 && (!instanceRef.composer.readOnly))
            {
                setTimeout(function()
                {
                    instanceRef.composer.focus();
                }, 0);
            }
        }

        this.composer.setAction('navigateBack', navigateBack);
        this.composer.setAction('navigateForward', navigateForward);
        this.composer.setKeyBinding(
            new orion.textview.KeyBinding(219, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'navigateBack'
        );
        this.composer.setKeyBinding(
            new orion.textview.KeyBinding(221, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'navigateForward'
        );
        $(document).bind('keydown', function(eventData)
        {
            if (eventData.ctrlKey)
            {
                if (eventData.keyCode === 219)
                {
                    navigateBack();
                }
                if (eventData.keyCode === 221)
                {
                    navigateForward();
                }
            }
        });
    };
    return Composer;
}());

/*
  Derived from: http://git.eclipse.org/c/e4/org.eclipse.orion.client.git/tree/bundles/org.eclipse.orion.client.editor/web/examples/textview/textStyler.js
  Adapted by sugyan
 */

/*******************************************************************************
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

CodeStream.SyntaxHighlighter = (function()
{
    var TOKEN_UNKNOWN = 1;
    var TOKEN_KEYWORD = 2;
    var TOKEN_STRING_LITERAL = 3;
    var TOKEN_COMMENT_BLOCK = 4;
    var TOKEN_WHITESPACE = 5;
    var TOKEN_TAB_SPACE = 6;
    var TOKEN_SINGLE_SPACE = 7;

    var noteStyle = { styleClass: "token_comment" };
    var literalStyle = { styleClass: "token_string" };
    var reservedStyle = { styleClass: "token_keyword" };
    var cursorLineStyle = { styleClass: "line_cursor" };

    var Lexer = (function()
    {
        function Lexer(reservedWords, noteBeginMarkers)
        {
            var idx;
            this.reservedWords = reservedWords;
            this.noteBeginMarkers = {};
            if (noteBeginMarkers)
            {
                for (idx = noteBeginMarkers.length; idx--;)
                {
                    this.noteBeginMarkers[noteBeginMarkers[idx]] = true;
                }
            }
            this.setSourceText("");
        }

        Lexer.prototype = {
            getCurrentPosition: function()
            {
                return this.pos;
            },
            getInitialPosition: function()
            {
                return this.startPos;
            },
            extractSegment: function()
            {
                return this.text.substring(this.startPos, this.pos);
            },
            getSegmentLength: function()
            {
                return this.pos - this.startPos;
            },
            _consumeChar: function()
            {
                if (this.pos < this.text.length)
                {
                    return this.text.charCodeAt(this.pos++);
                }
                return -1;
            },
            _revertChar: function(charVal)
            {
                if (charVal !== -1) { this.pos--; }
            },
            scanNextToken: function()
            {
                this.startPos = this.pos;
                while (true)
                {
                    var charVal = this._consumeChar();
                    switch (charVal)
                    {
                    case -1: return null;
                    case 47:
                        if (this.noteBeginMarkers["//"])
                        {
                            charVal = this._consumeChar();
                            if (charVal === 47)
                            {
                                while (true)
                                {
                                    charVal = this._consumeChar();
                                    if ((charVal === -1) || (charVal === 10))
                                    {
                                        this._revertChar(charVal);
                                        return TOKEN_COMMENT_BLOCK;
                                    }
                                }
                            }
                            this._revertChar(charVal);
                            return TOKEN_UNKNOWN;
                        }
                        break;
                    case 35:
                        if (this.noteBeginMarkers["#"])
                        {
                            while (true)
                            {
                                charVal = this._consumeChar();
                                if ((charVal === -1) || (charVal === 10))
                                {
                                    this._revertChar(charVal);
                                    return TOKEN_COMMENT_BLOCK;
                                }
                            }
                        }
                        break;
                    case 39:
                        while(true)
                        {
                            charVal = this._consumeChar();
                            switch (charVal)
                            {
                            case 39:
                                return TOKEN_STRING_LITERAL;
                            case -1:
                                this._revertChar(charVal);
                                return TOKEN_STRING_LITERAL;
                            case 92:
                                charVal = this._consumeChar();
                                break;
                            }
                        }
                        break;
                    case 34:
                        while(true)
                        {
                            charVal = this._consumeChar();
                            switch (charVal)
                            {
                            case 34:
                                return TOKEN_STRING_LITERAL;
                            case -1:
                                this._revertChar(charVal);
                                return TOKEN_STRING_LITERAL;
                            case 92:
                                charVal = this._consumeChar();
                                break;
                            }
                        }
                        break;
                    case 32:
                    case 9:
                        do {
                            charVal = this._consumeChar();
                        } while(charVal === 32 || charVal === 9);
                        this._revertChar(charVal);
                        return TOKEN_WHITESPACE;
                    default:
                        var idx, isCSSContext = this.isCSS;
                        if ((97 <= charVal && charVal <= 122) || (65 <= charVal && charVal <= 90) || charVal === 95 || (48 <= charVal && charVal <= 57) || (0x2d === charVal && isCSSContext))
                        {
                            var currentOffset = this.pos - 1;
                            do {
                                charVal = this._consumeChar();
                            } while((97 <= charVal && charVal <= 122) || (65 <= charVal && charVal <= 90) || charVal === 95 || (48 <= charVal && charVal <= 57) || (0x2d === charVal && isCSSContext));
                            this._revertChar(charVal);
                            var tokenText = this.text.substring(currentOffset, this.pos);
                            for (idx = 0; idx < this.reservedWords.length; idx++)
                            {
                                if (this.reservedWords[idx] === tokenText) { return TOKEN_KEYWORD; }
                            }
                        }
                        return TOKEN_UNKNOWN;
                    }
                }
            },
            setSourceText: function(text)
            {
                this.text = text;
                this.pos = 0;
                this.startPos = 0;
            }
        };
        return Lexer;
    }());

    function Stylist(displayView)
    {
        this.noteOffset = 0;
        this.noteOffsets = [];
        this.highlightCursorLine = true;

        var reservedWords = [];
        this.displayView = displayView;
        this._lexer = new Lexer(reservedWords);

        displayView.addEventListener("Selection", this, this._handleSelectionChange);
        displayView.addEventListener("ModelChanged", this, this._handleModelUpdate);
        displayView.addEventListener("LineStyle", this, this._onLineStyle);
        displayView.redrawLines();
    }
    Stylist.prototype = {
        _handleSelectionChange: function(eventData)
        {
            var priorSelection = eventData.oldValue;
            var currentSelection = eventData.newValue;
            var displayView = this.displayView;
            var model = displayView.getModel();
            var linePos;
            if (this.highlightCursorLine)
            {
                var priorLinePos = model.getLineAtOffset(priorSelection.start);
                linePos = model.getLineAtOffset(currentSelection.start);
                var currentEmpty = currentSelection.start === currentSelection.end;
                var priorEmpty = priorSelection.start === priorSelection.end;
                if (!(priorLinePos === linePos && priorEmpty && currentEmpty))
                {
                    if (priorEmpty)
                    {
                        displayView.redrawLines(priorLinePos, priorLinePos + 1);
                    }
                    if ((priorLinePos !== linePos || !priorEmpty) && currentEmpty)
                    {
                        displayView.redrawLines(linePos, linePos + 1);
                    }
                }
            }
        },
        _handleModelUpdate: function(eventData)
        {
            var startPos = eventData.start;
            var charsRemoved = eventData.removedCharCount;
            var charsAdded = eventData.addedCharCount;
            if (this._matchingBracket && startPos < this._matchingBracket) { this._matchingBracket += charsAdded + charsRemoved; }
            if (this._currentBracket && startPos < this._currentBracket) { this._currentBracket += charsAdded + charsRemoved; }
            if (startPos >= this.noteOffset) { return; }
            var model = this.displayView.getModel();

            if (!(this.noteBeginMarkers && this.noteEndMarkers))
            {
                return;
            }

            var noteCount = this.noteOffsets.length;
            var padding = Math.max(this.noteBeginMarkers.length - 1, this.noteEndMarkers.length - 1);
            if (noteCount === 0)
            {
                this.noteOffset = Math.max(0, startPos - padding);
                return;
            }
            var totalChars = model.getCharCount();
            var priorTotalChars = totalChars - charsAdded + charsRemoved;
            var noteStart = this._findBoundary(this.noteOffsets, startPos, -1, noteCount);
            var endPos = startPos + charsRemoved;
            var noteEnd = this._findBoundary(this.noteOffsets, endPos, noteStart - 1, noteCount);
            var tempStart;
            if (noteStart > 0)
            {
                tempStart = this.noteOffsets[--noteStart];
            } else
            {
                tempStart = Math.max(0, Math.min(this.noteOffsets[noteStart], startPos) - padding);
                --noteStart;
            }
            var tempEnd;
            var repaintEnd = totalChars;
            if (noteEnd + 1 < this.noteOffsets.length)
            {
                tempEnd = this.noteOffsets[++noteEnd];
                if (endPos > (tempEnd - this.noteEndMarkers.length))
                {
                    if (noteEnd + 2 < this.noteOffsets.length)
                    {
                        noteEnd += 2;
                        tempEnd = this.noteOffsets[noteEnd];
                        repaintEnd = tempEnd + 1;
                        if (repaintEnd > startPos) { repaintEnd += charsAdded - charsRemoved; }
                    } else
                    {
                        tempEnd = Math.min(priorTotalChars, endPos + padding);
                        this.noteOffset = tempEnd;
                    }
                }
            } else
            {
                tempEnd = Math.min(priorTotalChars, endPos + padding);
                this.noteOffset = tempEnd;
                if (noteEnd > 0 && noteEnd === this.noteOffsets.length)
                {
                    noteEnd = this.noteOffsets.length - 1;
                }
            }
            if (tempStart > startPos) { tempStart += charsAdded - charsRemoved; }
            if (tempEnd > startPos) { tempEnd += charsAdded - charsRemoved; }

            if (this.noteOffsets.length > 1 && this.noteOffsets[this.noteOffsets.length - 1] === priorTotalChars)
            {
                this.noteOffsets.length--;
            }

            var pos = 0;
            var newNotes = [];
            var segmentText = model.getText(tempStart, tempEnd);
            if (this.noteOffset < tempEnd) { this.noteOffset = tempEnd; }
            while (pos < segmentText.length)
            {
                var isStart = ((noteStart + 1 + newNotes.length) & 1) === 0;
                var pattern = isStart ? this.noteBeginMarkers : this.noteEndMarkers;
                var matchIndex = segmentText.indexOf(pattern, pos);
                if (matchIndex !== -1)
                {
                    newNotes.push(tempStart + (isStart ? matchIndex : matchIndex + pattern.length));
                } else
                {
                    break;
                }
                pos = matchIndex + pattern.length;
            }
            var needsRepaint = (noteEnd - noteStart) !== newNotes.length;
            if (!needsRepaint)
            {
                var idx;
                for (idx = 0; idx < newNotes.length; idx++)
                {
                    pos = this.noteOffsets[noteStart + 1 + idx];
                    if (pos > startPos) { pos += charsAdded - charsRemoved; }
                    if (pos !== newNotes[idx])
                    {
                        needsRepaint = true;
                        break;
                    }
                }
            }

            var loopVar, spliceArgs = [noteStart + 1, (noteEnd - noteStart)].concat(newNotes);
            Array.prototype.splice.apply(this.noteOffsets, spliceArgs);
            for (loopVar = noteStart + 1 + newNotes.length; loopVar < this.noteOffsets.length; loopVar++)
            {
                this.noteOffsets[loopVar] += charsAdded - charsRemoved;
            }

            if ((this.noteOffsets.length & 1) === 1) { this.noteOffsets.push(totalChars); }

            if (needsRepaint)
            {
                this.displayView.redrawRange(startPos + charsAdded, repaintEnd);
            }
        },
        _findBoundary: function(array, value, low, high) {
            var mid;
            while (low <= high) {
                mid = Math.floor((high + low) / 2);
                if (value < array[mid]) {
                    high = mid - 1;
                } else if (value > array[mid]) {
                    low = mid + 1;
                } else {
                    return mid;
                }
            }
            return low;
        }
    };
    return Stylist;
}());