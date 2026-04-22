jQuery(document).ready(function()
{
	CORE.start();
});

var CORE = (function(jQ, globalObj, undefVal) {
	var IS_TOUCH_ENABLED = (typeof Touch === 'object');

	return {
		start: function() {
			for (var compIdx in CORE.bootstraps) {
				CORE.bootstraps[compIdx]();
			}
		},
		bootstraps: {
			adjust_input_width: function() {
				if (!jQ('textarea, .input_full').length) {
					return;
				}

				jQ('textarea, .input_full').wrap('<span class="input_full_wrap"></span>');
			},
			manage_placeholders: function() {
				var is_placeholder_natively_supported = 'placeholder' in document.createElement('input');

				if (!jQ('*[placeholder]').length || is_placeholder_natively_supported) {
					return;
				}

				jQ('*[placeholder]').each(function() {
					var current_element = jQ(this);
					var placeholder_text = current_element.attr('placeholder');

					if (!current_element.val()) {
						current_element.val(placeholder_text);
					}

					current_element.focus(function() {
						if (current_element.val() === placeholder_text) {
							current_element.val('');
						}
					}).blur(function() {
						if (!current_element.val()) {
							current_element.val(placeholder_text);
						}
					});
				});
			},
			handle_screen_orientation: function() {
				function update_display_mode() {
					var device_angle = globalObj.orientation;
					var document_body = jQ('body');
					var viewport_width = document_body.outerWidth();
					var side_panel = jQ('#sidebar');

					if (device_angle === 0 || device_angle === 180 || viewport_width < 1024) {
						document_body.addClass('is_portrait');
						jQ('#button_navigation').removeClass('button_active');
						side_panel.hide();
					}
					else {
						document_body.removeClass('is_portrait');
						side_panel.show();
					}
				}

				update_display_mode();

				jQ(globalObj).bind('resize orientationchange', function() {
					update_display_mode();
				});
			},
			control_panel_toggle: function() {
				if (!jQ('#button_navigation').length) {
					return;
				}

				jQ('#button_navigation').click(function() {
					var side_panel = jQ('#sidebar');

					if (side_panel.is(':hidden')) {
						jQ(this).addClass('button_active');
						side_panel.show();
					}
					else {
						jQ(this).removeClass('button_active');
						side_panel.hide();
					}

					this.blur();
					return false;
				});
			},
			unfold_menu_sections: function() {
				if (!jQ('#sidebar_menu').length) {
					return;
				}

				var interaction_event_type = IS_TOUCH_ENABLED ? 'click' : 'mousedown';

				jQ('#sidebar_menu li').each(function() {
					if (jQ(this).find('ul:first').length) {
						jQ(this).find('a:first').prepend('<span class="abs toggle_arrow"></span>');
					}
				});

				jQ('#sidebar_menu a').live(interaction_event_type, function() {
					var current_link_element = jQ(this);
					var parent_list_item = current_link_element.parent('li');
					var child_unordered_list = parent_list_item.find('ul:first');

					if (current_link_element.attr('href') === '#') {
						current_link_element.removeAttr('href');
					}

					if (child_unordered_list.length) {
						if (child_unordered_list.is(':hidden')) {
							parent_list_item.addClass('expanded');

							parent_list_item.siblings('li').each(function() {
								if (jQ(this).attr('id') !== 'sidebar_menu_home') {
									jQ(this).hide();
								}
							});

							child_unordered_list.show();
						}
						else {
							child_unordered_list.hide();
							parent_list_item.removeClass('expanded').siblings('li').show();
							parent_list_item.find('.expanded').removeClass('expanded').find('ul').hide().end().siblings('li').show();
						}

						this.blur();
						return false;
					}
				});
			},
			fix_content_panel_sizes: function() {
				if (!jQ('#main_content, #sidebar_content').length) {
					return;
				}

				jQ('#main_content, #sidebar_content').each(function() {
					var current_panel = jQ(this);

					if (current_panel.siblings('.header_upper').length) {
						if (current_panel.siblings('.header_lower').length) {
							current_panel.css({
								top: '92px'
							});
						}
						else {
							current_panel.css({
								top: '46px'
							});
						}
					}
					else {
						current_panel.css({
							top: '0'
						});
					}

					if (current_panel.siblings('.footer_lower').length) {
						if (current_panel.siblings('.footer_upper').length) {
							current_panel.css({
								bottom: '92px'
							});
						}
						else {
							current_panel.css({
								bottom: '46px'
							});
						}
					}
					else {
						current_panel.css({
							bottom: '0'
						});
					}
				});
			},
			initialize_scroll_regions: function() {
				if (!jQ('#main_content_inner, #sidebar_content_inner').length) {
					return;
				}

				jQ(document).bind('touchmove', function() {
					return false;
				});

				if (typeof iScroll !== 'undefined') {
					var primary_scroll_area = new iScroll('main_content_inner');
					var secondary_scroll_area = new iScroll('sidebar_content_inner');
				}
			}
		}
	};
})(jQuery, this);