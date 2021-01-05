<?php

namespace Municipio\Content;

class CustomPostType
{
    public function __construct()
    {
        //Registration of Custom Post Types
        add_action('init', array($this, 'registerCustomPostTypes'));

        //Flush rewrite-rules on data update & sanitize post type name
        add_filter('acf/update_value/key=field_56b347f3ffb6c', function ($value, $post_id, $field) {
            flush_rewrite_rules(true);
            return $value;
        }, 10, 3);

        //Sanitize permalinks
        add_filter('acf/update_value/key=field_56b36c01e0619', function ($value, $post_id, $field) {
            return sanitize_title($value, $value);
        }, 10, 3);

        //Use page or single template
        add_filter('single_template', array($this, 'setPageTemplate'), 10);

        //Disable filled fields
        add_action('admin_head', function () {
            echo '<script>';
                echo '
                    jQuery(function(){
                        jQuery(".acf-field-56b3619c5defc").each(function(index,item){
                            if(jQuery("input",item).val() != "" ) {
                                jQuery("input",item).attr("readonly","readonly");
                            }
                        })
                    });
                ';
            echo '</script>';
        });
    }

    /**
     * Registers post type
     * @return void
     */
    public function registerCustomPostTypes()
    {
        if (function_exists('get_field')) {
            $type_definitions = get_field('avabile_dynamic_post_types', 'option');

            if (is_array($type_definitions) && !empty($type_definitions)) {
                foreach ($type_definitions as $type_definition_key => $type_definition) {
                    $labels = array(
                        'name'               => $type_definition['post_type_name'],
                        'singular_name'      => $type_definition['post_type_name'],
                        'menu_name'          => $type_definition['post_type_name'],
                        'name_admin_bar'     => $type_definition['post_type_name'],
                        'add_new'            => __('Add new', 'municipio'),
                        'add_new_item'       => sprintf(__('Add new %s', 'municipio'), $type_definition['post_type_name']),
                        'new_item'           => sprintf(__('New %s', 'municipio'), $type_definition['post_type_name']),
                        'edit_item'          => sprintf(__('Edit %s', 'municipio'), $type_definition['post_type_name']),
                        'view_item'          => sprintf(__('View %s', 'municipio'), $type_definition['post_type_name']),
                        'all_items'          => sprintf(__('All %s', 'municipio'), $type_definition['post_type_name']),
                        'search_items'       => sprintf(__('Search %s', 'municipio'), $type_definition['post_type_name']),
                        'parent_item_colon'  => sprintf(__('Parent %s', 'municipio'), $type_definition['post_type_name']),
                        'not_found'          => sprintf(__('No %s found', 'municipio'), $type_definition['post_type_name']),
                        'not_found_in_trash' => sprintf(__('No %s found in trash', 'municipio'), $type_definition['post_type_name'])
                    );

                    $supports = array('title', 'editor');
                    if (!empty($type_definition['supports'])) {
                        $supports = array_merge($type_definition['supports'], $supports);
                    }

                    $args = array(
                        'labels'             => $labels,
                        'description'        => __('Auto generated cpt from user iterface.', 'municipio'),
                        'public'             => $type_definition['public'],
                        'show_in_menu'       => $type_definition['show_in_nav_menus'],
                        'rewrite'            => array(
                                                    'with_front' => isset($type_definition['with_front']) ? $type_definition['with_front'] : true,
                                                    'slug' => sanitize_title($type_definition['slug'])
                                                ),
                        'capability_type'    => 'post',
                        'hierarchical'       => $type_definition['hierarchical'],
                        'supports'           => $supports,
                        'menu_position'      => (int) $type_definition['menu_position'],
                        'has_archive'        => true,
                        'show_in_rest'       => true,
                        'rest_base'          => sanitize_title($type_definition['slug'])
                    );

                    //Get custom menu icon
                    if (isset($type_definition['menu_icon']) && isset($type_definition['menu_icon']['id']) && is_numeric($type_definition['menu_icon']['id'])) {
                        $image_filepath = get_attached_file($type_definition['menu_icon']['id']);

                        if (file_exists($image_filepath)) {
                            $args['menu_icon'] = 'data:image/svg+xml;base64,'. base64_encode(
                                file_get_contents($image_filepath)
                            );
                        }
                    }

                    register_post_type(sanitize_title(substr($type_definition['post_type_name'], 0, 19)), $args);
                }
            }
        }
    }

    /**
     * Use page template for hierarchical custom post types
     * @param  string $template_path Path to post type template
     * @return string
     */
    public function setPageTemplate($template_path)
    {
        // Exclude post types
        $excludedPostTypes = array();
        if (has_filter('Municipio/CustomPostType/ExcludedPostTypes')) {
            $excludedPostTypes = apply_filters('Municipio/CustomPostType/ExcludedPostTypes', $excludedPostTypes);
        }

        if ($post_type = get_post_type()) {
            $post_type_object = get_post_type_object($post_type);

            if (is_object($post_type_object) && $post_type_object->hierarchical == true && $post_type_object->_builtin == false && !in_array($post_type_object->name, $excludedPostTypes)) {
                $template_path = \Municipio\Helper\Template::locateTemplate('page');
            }
        }

        return($template_path);
    }
}
