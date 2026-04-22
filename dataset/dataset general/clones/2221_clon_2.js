g_needs.invoke('g_web_util');
g_needs.invoke('g_text_input.Action');
g_needs.invoke('g_text_input.Area');
g_needs.invoke('g_text_input.mods.SimpleFormat');
g_needs.invoke('g_text_input.mods.NewlineProcessor');
g_needs.invoke('g_text_input.mods.HeadingStyler');
g_needs.invoke('g_text_input.mods.ListIndentLogic');
g_needs.invoke('g_text_input.mods.PlaceholderContent');
g_needs.invoke('g_text_input.mods.ClearStyle');
g_needs.invoke('g_text_input.mods.SpaceIndentLogic');
g_needs.invoke('g_text_input.mods.HistoryTracker');
g_needs.invoke('g_interface.text_input.StandardControlPanel');
g_needs.invoke('g_interface.text_input.ControlPanelManager');

window["my_application"] = {};

window["my_application"]["attach_rich_editor"] = function(target_element, control_bar_element, output_field_id_string) {

    // Initialize the primary input zone.
    var input_zone = new g_text_input.Area(target_element);

    // Instantiate and link various helper modules for enhanced functionality.
    input_zone.attachModule(new g_text_input.mods.SimpleFormat());
    input_zone.attachModule(new g_text_input.mods.ClearStyle());
    input_zone.attachModule(new g_text_input.mods.HistoryTracker());
    input_zone.attachModule(new g_text_input.mods.ListIndentLogic());
    input_zone.attachModule(new g_text_input.mods.SpaceIndentLogic());
    input_zone.attachModule(new g_text_input.mods.NewlineProcessor());
    input_zone.attachModule(new g_text_input.mods.HeadingStyler());
    input_zone.attachModule(new g_text_input.mods.PlaceholderContent('Enter your content here'));

    // Define the set of interactive controls to be displayed on the panel.
    var action_items_list = [
        g_text_input.Action.EMBOLDEN,
        g_text_input.Action.ITALICIZE,
        g_text_input.Action.UNDERLINE_TEXT,
        g_text_input.Action.TEXT_COLOR,
        g_text_input.Action.HIGHLIGHT_COLOR,
        g_text_input.Action.FONT_FAMILY,
        g_text_input.Action.TEXT_SIZE,
        g_text_input.Action.REVERT,
        g_text_input.Action.REAPPLY,
        g_text_input.Action.BULLETED_LIST,
        g_text_input.Action.NUMBERED_LIST,
        g_text_input.Action.INCREASE_INDENT,
        g_text_input.Action.DECREASE_INDENT,
        g_text_input.Action.ALIGN_LEFT,
        g_text_input.Action.ALIGN_CENTER,
        g_text_input.Action.ALIGN_RIGHT,
        g_text_input.Action.SUB_SCRIPT,
        g_text_input.Action.SUPER_SCRIPT,
        g_text_input.Action.STRIKE_OUT,
        g_text_input.Action.STRIP_FORMATTING
    ];

    var control_panel = g_interface.text_input.StandardControlPanel.createPanel(action_items_list, g_web_util.selectById(control_bar_element));

    // Link the interactive panel to the input area.
    var panel_manager = new g_interface.text_input.ControlPanelManager(input_zone, control_panel);

    // Monitor changes within the input region to update the associated output.
    g_event_bus.on(input_zone, g_text_input.Area.EventKind.MODIFICATION_PAUSED, function() {
        g_web_util.selectById(output_field_id_string).value = input_zone.retrieveSanitizedContent();
    });

    input_zone.activateEditingMode();
};