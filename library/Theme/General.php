<?php

namespace Municipio\Theme;

class General
{
    public function __construct()
    {
        add_filter('body_class', array($this, 'isChildTheme'));

        add_filter('private_title_format', array($this, 'titleFormat'));
        add_filter('protected_title_format', array($this, 'titleFormat'));

        add_filter('accessibility_items', array($this, 'accessibilityItems'), 10, 1);
        add_filter('the_lead', array($this, 'theLead'));
        add_filter('the_content', array($this, 'removeEmptyPTag'));

        add_filter('acf/get_field_group', array($this, 'fixFieldgroupLocationPath'));
    }

    /**
     * Fixes fieldgroups page-template path
     * @param  array $fieldgroup Fieldgroup
     * @return array
     */
    public function fixFieldgroupLocationPath($fieldgroup)
    {
        if (!isset($fieldgroup['location'])) {
            return $fieldgroup;
        }

        foreach ($fieldgroup['location'] as &$locations) {
            foreach ($locations as &$location) {
                if ($location['param'] !== 'page_template') {
                    return $fieldgroup;
                }

                $location['value'] = basename($location['value']);
            }
        }

        return $fieldgroup;
    }

    public function titleFormat($format)
    {
        return '%s';
    }

    /**
     * Creates a lead paragraph
     * @param  string $text Text
     * @return string       Markup
     */
    public function theLead($text)
    {
        $text = strip_shortcodes($text);
        return '<p class="lead">' . $text . '</p>';
    }

    /**
     * Removes empty p-tags
     * @param  string $content Text
     * @return string       Markup
     */
    public function removeEmptyPTag($content)
    {
        $content    = force_balance_tags($content);
        $content    = preg_replace('#<p>\s*+(<br\s*/*>)?\s*</p>#i', '', $content);
        $content    = preg_replace('~\s?<p>(\s|&nbsp;)+</p>\s?~', '', $content);

        return $content;
    }

    /**
     * is-child-theme body class
     * @param  array  $classes Default classes
     * @return array           Modified calsses
     */
    public function isChildTheme($classes)
    {
        if (is_child_theme()) {
            $classes[] = "is-child-theme";
        }

        return $classes;
    }

    /**
     * Filter for adding accessibility items
     * @param  array $items Default item array
     * @return array        Modified item array
     */
    public function accessibilityItems($items)
    {
        $items[] = '<a href="#" onclick="window.print();return false;" class=""><i class="pricon pricon-print"></i> ' . __('Print', 'municipio') . '</a>';

        return $items;
    }
}