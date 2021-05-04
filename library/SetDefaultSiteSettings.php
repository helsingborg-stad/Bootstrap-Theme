<?php

namespace Municipio;

/**
 * Class SetDefaultSiteSettings
 * @package Municipio
 */
class SetDefaultSiteSettings
{
    /**
     * @var array|string[]
     */
    private static $settings;

    /**
     * SetDefaultSiteSettings constructor.
     */
    public function __construct()
    {
        self::$settings = self::defaultSettings();
        add_action('init', array($this, 'setSiteOptions'));
    }

    /**
     * Set default Site options
     * @return void
     */
    public function setSiteOptions(): void
    {
        foreach (self::$settings as $optionKey => $optionValue) {
            add_filter("option_{$optionKey}", function ($optionValue, $optionKey) {

                if (array_key_exists($optionKey, self::$settings)) {
                    return self::$settings[$optionKey];
                }

                return $optionValue;

            }, 10, 2);

            apply_filters("option_{$optionKey}", $optionValue, $optionKey);
        }
    }

    /**
     * Settings - Default options
     * @return array|string[]
     */
    public static function defaultSettings()
    {
        return [
            'template' => "municipio",
            'stylesheet' => "municipio",
            'current_theme' => "municipio",
            'options_header_layout' => "casual",
        ];
    }
}