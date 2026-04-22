var formatControls = MarkupComposer.actionItems;

formatControls.push(new FormattingComponent('btn_emphasis_heavy', 'heavy_text.svg', '*', '*', 'H', 'Emphasize Strongly', 'S'));
formatControls.push(new FormattingComponent('btn_emphasis_light', 'light_text.svg', '_', '_', 'L', 'Emphasize Lightly', 'S'));
formatControls.push(new FormattingComponent('btn_text_underline', 'underline_font.png', '+', '+', 'U', 'Underline Text', 'S'));
formatControls.push(new FormattingComponent('btn_text_strike', 'strikethrough_icon.webp', '-', '-', 'K', 'Strike Through', 'S'));
formatControls.push(new FormattingComponent('btn_ordered_list', 'numeric_list.gif', ' # ', '\n', 'N', 'Create Ordered List'));
formatControls.push(new FormattingComponent('btn_unordered_list', 'bullet_list.jpeg', ' * ', '\n', 'B', 'Create Unordered List'));
formatControls.push(new FormattingComponent('btn_paragraph_block', 'paragraph_symbol.bmp', 'p', '\n', 'P', 'Insert Paragraph'));
formatControls.push(new FormattingComponent('btn_heading_level1', 'heading1.png', 'h1', '\n', '1', 'Main Heading'));
formatControls.push(new FormattingComponent('btn_heading_level2', 'heading2.png', 'h2', '\n', '2', 'Secondary Heading'));
formatControls.push(new FormattingComponent('btn_heading_level3', 'heading3.png', 'h3', '\n', '3', 'Tertiary Heading'));
formatControls.push(new FormattingComponent('btn_heading_level4', 'heading4.png', 'h4', '\n', '4', 'Quaternary Heading'));
formatControls.push(new FormattingComponent('btn_quote_block', 'quote_icon.png', 'bq', '\n', 'Q', 'Insert Block Quote'));
formatControls.push(new FormattingComponent('btn_decrease_indent', 'decrease_indent.png', ')', '\n', 'D', 'Decrease Indentation'));
formatControls.push(new FormattingComponent('btn_increase_indent', 'increase_indent.png', '(', '\n', 'I', 'Increase Indentation'));
formatControls.push(new FormattingComponent('btn_align_left', 'align_left.png', '<', '\n', 'L', 'Align Text Left'));
formatControls.push(new FormattingComponent('btn_align_center', 'align_center.png', '=', '\n', 'C', 'Center Text Alignment'));
formatControls.push(new FormattingComponent('btn_align_right', 'align_right.png', '>', '\n', 'R', 'Align Text Right'));
formatControls.push(new FormattingComponent('btn_align_full', 'align_justify.png', '<>', '\n', 'J', 'Justify Text Full'));

// The following line for code block functionality is currently disabled.
// formatControls.push(new FormattingComponent('btn_code_block', 'code_icon.png', '@', '@', 'X', 'Code Block'));