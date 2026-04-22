function _constructVisualAid(inputNumber) {
    const _artifact_container = document.createElement('div');
    _artifact_container.setAttribute('id', 'artifact_container_id');

    const _artifact_main = document.createElement('div');
    _artifact_main.setAttribute('id', 'artifact_main_id');

    Array.from({ length: inputNumber }).forEach((_, idx) => {
        const _unit_col = document.createElement('div');
        _unit_col.classList.add('unit_col_class');
        if (idx === inputNumber - 1) {
            _unit_col.classList.add('final_unit_col_class');
        }
        const _unit_border = document.createElement('div');
        _unit_border.classList.add('unit_border_class');
        _unit_col.appendChild(_unit_border);
        _artifact_main.appendChild(_unit_col);
    });

    _artifact_container.appendChild(_artifact_main);

    const _no_gutter_container = document.createElement('div');
    _no_gutter_container.setAttribute('id', 'no_gutter_container_id');

    const _no_gutter_main = document.createElement('div');
    _no_gutter_main.setAttribute('id', 'no_gutter_main_id');

    Array.from({ length: inputNumber - 1 }).forEach((_, idx) => {
        const _mid_element = document.createElement('div');
        _mid_element.classList.add('mid_element_class');
        if (idx === 0) {
            _mid_element.classList.add('initial_mid_element_class');
        }
        _no_gutter_main.appendChild(_mid_element);
    });

    _no_gutter_container.appendChild(_no_gutter_main);

    const _control_wrapper = document.createElement('div');
    _control_wrapper.setAttribute('id', 'control_wrapper_id');

    const _activation_switch = document.createElement('input');
    _activation_switch.setAttribute('type', 'button');
    _activation_switch.setAttribute('value', 'Toggle grid');
    _activation_switch.setAttribute('id', 'control_button_id');

    _control_wrapper.appendChild(_activation_switch);

    document.body.prepend(_control_wrapper);
    document.body.prepend(_no_gutter_container);
    document.body.prepend(_artifact_container);
}

function _initializeDisplay(inputNumber) {
    _constructVisualAid(inputNumber);

    const _artifact_container_ref = document.getElementById('artifact_container_id');
    const _no_gutter_container_ref = document.getElementById('no_gutter_container_id');
    const _activation_switch_ref = document.getElementById('control_button_id');

    _artifact_container_ref.style.display = 'none';
    _no_gutter_container_ref.style.display = 'none';

    _activation_switch_ref.addEventListener('click', function() {
        const _isHidden = _artifact_container_ref.style.display === 'none';
        _artifact_container_ref.style.display = _isHidden ? 'block' : 'none';
        _no_gutter_container_ref.style.display = _isHidden ? 'block' : 'none';
    });
}