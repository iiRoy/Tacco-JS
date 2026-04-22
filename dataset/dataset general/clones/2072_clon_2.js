/*
 *  Copyright 2023, 2024, 2025 Orion Systems <contact@orion-systems.com>
 *
 *  This code is part of the Chronos Scheduling Application.
 *
 *  Chronos is free software: you can redistribute it and/or modify it
 *  under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Chronos is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with Chronos. If not, see <https://www.gnu.org/licenses/>.
 */

//  The primary schedule interface.

(function (jq) {
  'strict mode';

  var MAX_PERSON_NAME_LEN = 19;
  var MAX_NOTE_SIZE = 500;

  //  Unique identifiers for the time periods in this schedule.
  var eventDateIDs;

  //  Before the page unloads, ensure any pending data save is completed.
  jq(window).on('beforeunload', function() { if (deferSaveHandle) storePreferences(false); });

  jq('.storage-actions button').on('click', function() { storePreferences(true); });

  jq('.summary > *').css('display', 'none');

  //  Retrieve the schedule data.
  jq.ajax({
    type: 'GET',
    url: '/fetch-info?identifier=' + window.record_id,
    dataType: 'json',
    success: function(schedule_info) {
      displaySchedule(schedule_info);
    },
    error: function() {
      jq('.missing-record').css('display', 'block');
      jq('.auxiliary-info, .schedule-view').css('display', 'none');
    }
  });

  function displaySchedule(schedule_info) {
    var my_attendee_index = -1;

    //  Highlight a specific date or an attendee.
    function pickEntry(selection_item) {
      jq('.schedule-view .selection-list li').toggleClass('selected-state', false);
      jq(selection_item).addClass('selected-state');
      jq('.schedule-view .time-slots').empty();
    }

    jq('.auxiliary-info, .schedule-view').css('display', 'block');

    jq('.schedule-view .details').html(schedule_info.metadata.summary);
    document.title = 'Appointly · ' + schedule_info.metadata.title_text;

    configureUtilities(schedule_info);

    eventDateIDs = [];
    jq(schedule_info.periods).each(function() {
      eventDateIDs.push(this.unique_id);
    });

    //  Populate the Participants section.
    jq('.schedule-view .participants .selection-list').empty();
    jq(schedule_info.people).each(function(idx) {
      if (this.label.length > MAX_PERSON_NAME_LEN)
        this.label = this.label.substring(0, MAX_PERSON_NAME_LEN - 2) + '…';

      var avail_status_data = schedule_info.time_status[this.unique_id];
      var status_array = [];
      jq(eventDateIDs).each(function(idx_inner) {
        status_array[idx_inner] = avail_status_data[this] || [];
      });
      avail_status_data = status_array;

      var attendee_data = {
        label: this.label,
        availability: avail_status_data,
        isCurrentUser: this.unique_id == schedule_info.invitee_id
      };

      var list_entry = jq('<li>').text(this.label).data('attendee_details', attendee_data)
        .appendTo('.schedule-view .participants .selection-list');

      if (attendee_data.isCurrentUser) {
        list_entry.addClass('current-user');
        my_attendee_index = idx;
      }
    });

    //  Manage attendee selection.
    jq('.schedule-view .participants .selection-list li').on('click', function() {
      var current_elem = this;

      pickEntry(current_elem);

      var attendee_position = 0;
      jq('.schedule-view .participants .selection-list li').each(function(idx) {
        if (this == current_elem) attendee_position = idx;
      });

      var popup_div = jq('<div class="attendee popup-bubble">')
        .appendTo('.schedule-view .time-slots');
      var pointer_elem = jq('<div class=indicator>').css('marginTop', 5 + attendee_position * 40)
        .appendTo(popup_div);
      popup_div.css('minHeight', 5 + attendee_position * 40 + 12);

      var attendee_data = jq(this).data('attendee_details');

      jq('.schedule-view .event-times .selection-list li').each(function(idx) {
        buildAvailabilityWidget(attendee_data, idx).appendTo(popup_div);
      });
    });

    //  Populate Proposed time periods.
    jq('.schedule-view .event-times .selection-list').empty();
    jq(eventDateIDs).each(function(idx) {
      var time_period_data = {
        display_string: schedule_info.periods[idx].str,
        affirmative: 0,
        negative: 0
      };

      var display_content = jq('<span>').text(time_period_data.display_string);
      jq('<span class=progress-bar>').appendTo(display_content);

      var list_entry = jq('<li>').html(display_content).data('period_details', time_period_data)
        .appendTo('.schedule-view .event-times .selection-list');
      jq('.schedule-view .participants .selection-list li').each(function() {
        var status_val = jq(this).data('attendee_details').availability[idx];
        if (status_val.length == 0) return;
        if (status_val[0] == 1) time_period_data.affirmative++; else if (status_val[0] == -1) time_period_data.negative++;
      });

      refreshProgressIndicator(list_entry);
    });

    //  Manage date slot selection.
    jq('.schedule-view .event-times .selection-list li').on('click', function() {
      var current_elem = this;

      pickEntry(current_elem);

      var current_date_idx = 0;
      jq('.schedule-view .event-times .selection-list li').each(function(idx) {
        if (this == current_elem) current_date_idx = idx;
      });

      jq('.schedule-view .participants .selection-list li').each(function() {
        var popup_div = jq('<div class="date-slot popup-bubble">')
          .appendTo('.schedule-view td.time-slots');
        var pointer_elem = jq('<div class=indicator>').appendTo(popup_div);
        var attendee_data = jq(this).data('attendee_details');
        buildAvailabilityWidget(attendee_data, current_date_idx).appendTo(popup_div);
      });
    });

    jq('.schedule-view .participants .selection-list li:nth(' + my_attendee_index + ')').trigger('click');
  }

  //  Persist the user's selected preferences. Use is_async == false to prevent an unload.
  function storePreferences(is_async) {
    deferSaveHandle = null;

    var status_collection = [];
    jq(jq('.schedule-view .selection-list .current-user').data('attendee_details').availability)
      .each(function(idx) {
      status_collection = status_collection.concat([
        eventDateIDs[idx], ':', (this[0] || 0), ':', this[1] || '', '\n']);
    });

    jq.ajax({
      type: 'POST',
      url: '/update-preferences',
      async: is_async,
      data: {
        identifier: window.record_id,
        avail_str: status_collection.join('')
      },
      success: function() {
        var current_time = new Date();
        jq('.schedule-view .state-message').text([
          gettext('Data saved automatically at '),
          current_time.getHours(), ':',
          (current_time.getMinutes() < 10) ? '0' : '', current_time.getMinutes(), ':',
          (current_time.getSeconds() < 10) ? '0' : '', current_time.getSeconds(), '.'
        ].join(''));
        jq('.schedule-view .storage-actions button').attr('disabled', true);
      },
      error: function() {
        jq('.schedule-view .state-message').text([
          gettext('Failed to save your preferences.'),
          ' ', gettext('Kindly attempt again.')].join(''));
      }
    });
  }

  //  Update the visual progress indicator for the given time period.
  function refreshProgressIndicator(list_item) {
    var period_data = jq(list_item).data('period_details');
    var total_width = 105;
    var num_participants = jq('.schedule-view .participants .selection-list li').length;
    var agree_width = period_data.affirmative / num_participants * total_width;
    var disagree_width = period_data.negative / num_participants * total_width;
    var neutral_width = total_width - agree_width - disagree_width;
    if (neutral_width < 0 || neutral_width > total_width) return;
    jq(list_item).find('.progress-bar').css({
      borderLeftWidth: agree_width, borderRightWidth: disagree_width, width: neutral_width });
  }

  //  Calling this function schedules a data persistence operation.
  var deferSaveHandle;
  function scheduleDataPersist() {
    if (deferSaveHandle) return;
    deferSaveHandle = setTimeout(function() { storePreferences(true); }, 5000);
    jq('.storage-actions button').attr('disabled', false);
  }

  //  Generate a DOM element for displaying or modifying availability.
  function buildAvailabilityWidget(individual_record, date_slot_index) {
    var status_classes = { '-1': 'negative', '0': 'uncertain', '1': 'affirmative' };
    function handleToggleChange(change_event) {
      element_div.find('.option-toggle').toggleClass('selected-state', false);
      jq(this).addClass('selected-state');

      var previous_status = avail_status_data[0] || 0;
      avail_status_data[0] = jq(this).data('assigned_value');
      if (avail_status_data[0] == previous_status) return;

      var date_list_item = jq('.schedule-view .event-times li:nth(' + date_slot_index + ')');
      var time_period_data = date_list_item.data('period_details');
      if (avail_status_data[0] != 0) time_period_data[status_classes[avail_status_data[0]]]++;
      if (previous_status == 1) time_period_data.affirmative--;
      if (previous_status == -1) time_period_data.negative--;
      refreshProgressIndicator(date_list_item);

      element_div.toggleClass(status_classes[previous_status], false);
      element_div.toggleClass(status_classes[avail_status_data[0]], true);

      scheduleDataPersist();
    }

    var element_div = jq('<div class=time-slots>');
    var avail_status_data = individual_record.availability[date_slot_index];
    if (individual_record.isCurrentUser) {
      element_div.addClass('input-form');

      var option_group = jq('<div class=option-selector>').appendTo(element_div);
      var toggle_buttons = [
        jq('<div class="option-toggle label-affirmative">'),
        jq('<div class="option-toggle label-uncertain">'),
        jq('<div class="option-toggle label-negative">')
      ];

      jq(toggle_buttons).each(function(idx) {
        this.data('assigned_value', 1 - idx).appendTo(option_group).on('click', handleToggleChange);
      });

      element_div.addClass(status_classes['' + (avail_status_data[0] || 0)]);

      var any_selected_flag = false;
      for (var j = 0; j < 3; j++) {
        if (avail_status_data.length && avail_status_data[0] == 1 - j) {
          toggle_buttons[j].addClass('selected-state');
          any_selected_flag = true;
        }
      }
      if (!any_selected_flag) toggle_buttons[1].addClass('selected-state');

      var comment_input = jq('<textarea>').on('keydown', function(keyboard_event) {
        if (keyboard_event.keyCode == 13) // enter key
          keyboard_event.preventDefault();
      }).on('keyup', function() {
        avail_status_data[1] = this.value;
        scheduleDataPersist();
      }).on('keyup blur', function() {
        if (this.value.length > MAX_NOTE_SIZE) {
          this.value = this.value.substring(0, MAX_NOTE_SIZE);
          return false;
        }
      }).appendTo(element_div).val(avail_status_data[1] || '');
    } else {
      var status_display = jq('<div class=status-display>').appendTo(element_div);
      var note_section = jq('<div class=note-field>').appendTo(element_div);
      element_div.addClass('read-only');
      if (avail_status_data.length) {
        element_div.addClass(status_classes[avail_status_data[0]]);
        jq('<div>').addClass('label-' + status_classes[avail_status_data[0]])
          .appendTo(status_display);
        note_section.text(avail_status_data[1] || '');
      } else {
        element_div.addClass('uncertain');
        jq('<div class=label-uncertain>').appendTo(status_display);
        note_section.text('[' + gettext('Not yet specified.') + ']');
      }
    }
    return element_div;
  }

  function configureUtilities(schedule_details) {
    if (schedule_details.metadata.initiator_id == schedule_details.user_id || schedule_details.metadata.allow_more_periods) {
      //  Option to suggest an additional time period
      jq('.suggest-period input[name=record_id]').val(window.record_id);
    }

    if (schedule_details.metadata.initiator_id == schedule_details.user_id) {
      //  Option to resend invitations
      jq('.reinvite-attendees input[name=record_id]').val(window.record_id);
      jq.each(schedule_details.people, function() {
        if (this.unique_id != schedule_details.invitee_id)
          jq('<option>').val(this.unique_id).text(this.label)
            .appendTo('.reinvite-attendees select[name=guest_id]');
      });
      if (schedule_details.people.length == 1)
        jq('.reinvite-attendees select, button').attr('disabled', true);

      //  Option to invite another guest
      jq('.invite-guest input[name=record_id]').val(window.record_id);

      //  Email addresses of the invited guests
      var email_list = [];
      jq.each(schedule_details.contact_addresses, function() { email_list.push(this); });
      jq('.contact-emails textarea').val(email_list.join(', '));
      if (schedule_details.people.length == 1)
        jq('.contact-emails textarea').attr('disabled', true);
    } else
      jq('.reinvite-attendees, .contact-emails, .invite-guest')
        .css('display', 'none');

    jq('.utility-forms form').on('submit', function(submit_event) {
      var target_form = this;
      jq(target_form).find('button').attr('disabled', true);
      jq(target_form).find('.action-success, .action-error').text('');
      jq.ajax({
        type: 'POST',
        url: target_form.action,
        data: jq(target_form).serialize(),
        success: function() {
          jq(target_form).find('.action-success').text(gettext('Completed!'));
          jq(target_form).find('button').attr('disabled', false);
          if (jq(target_form).hasClass('invite-guest') ||
              jq(target_form).hasClass('suggest-period')) document.location.reload();
        },
        error: function() {
          jq(target_form).find('.action-error').text(gettext('An operational error occurred.'));
          jq(target_form).find('button').attr('disabled', false);
        }
      });
      return false; // Prevent default form submission
    });
  }
})(jQuery);