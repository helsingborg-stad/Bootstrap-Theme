<?php 

if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
    'key' => 'group_60361b6d86d9d',
    'title' => __('Colors', 'municipio'),
    'fields' => array(
        0 => array(
            'key' => 'field_60361bcb76325',
            'label' => __('Primary Color', 'municipio'),
            'name' => 'municipio_color_primary',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#ae0b05', 'municipio'),
        ),
        1 => array(
            'key' => 'field_60364d06dc120',
            'label' => __('Primary Dark Color', 'municipio'),
            'name' => 'municipio_color_primary_dark',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#770000', 'municipio'),
        ),
        2 => array(
            'key' => 'field_603fba043ab30',
            'label' => __('Primary Light Color', 'municipio'),
            'name' => 'municipio_color_primary_light',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#e84c31', 'municipio'),
        ),
        3 => array(
            'key' => 'field_603fba3ffa851',
            'label' => __('Secondary Color', 'municipio'),
            'name' => 'municipio_color_secondary',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#ec6701', 'municipio'),
        ),
        4 => array(
            'key' => 'field_603fbb7ad4ccf',
            'label' => __('Secondary Dark Color', 'municipio'),
            'name' => 'municipio_color_secondary_dark',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#b23700', 'municipio'),
        ),
        5 => array(
            'key' => 'field_603fbbef1e2f8',
            'label' => __('Secondary Light Color', 'municipio'),
            'name' => 'municipio_color_secondary_light',
            'type' => 'color_picker',
            'instructions' => '',
            'required' => 1,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => __('#ff983e', 'municipio'),
        ),
    ),
    'location' => array(
        0 => array(
            0 => array(
                'param' => 'customizer',
                'operator' => '==',
                'value' => 'colors',
            ),
        ),
    ),
    'menu_order' => 0,
    'position' => 'normal',
    'style' => 'default',
    'label_placement' => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen' => '',
    'active' => true,
    'description' => '',
));
}