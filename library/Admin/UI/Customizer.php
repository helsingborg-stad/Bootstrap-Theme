<?php

namespace Municipio\Admin\UI;

/**
 * Class Customizer
 * @package Municipio\Admin\UI
 */
class Customizer
{
    /**
     * Customizer constructor.
     */
    public function __construct()
    {
        add_action('init', function () {
            if (is_customize_preview() && !class_exists('ACFCustomizer\Core\Core')) {
                
                $pluginInstalled = $this->installPlugin();

                if(!$pluginInstalled) {
                    $this->throwNotice();
                }
                
            }
        });
    }

    /**
     * Install plugin
     *
     * @return bool
     */
    private function installPlugin() {

        if(isset($_GET['installAcfCustomizer'])) {
            shell_exec("cd " . ABSPATH . " && composer require mcguffin/acf-customizer && wp plugin activate acf-customizer");
            return true; 
        }

        return false; 
    }

    /**
     * Create a error message with installation instructions
     *
     * @return void
     */
    public function throwNotice()
    {
        wp_die(
            __("<h1>Plugin install required </h1> <p>To use the customizer with municipio its required to use ACFCustomizer plugin. Please install this plugin by running <code>composer require mcguffin/acf-customizer</code> in the root folder and activate or just click the link below.</p>"),
            __("Plugin install required"),
            [
                'link_url' => admin_url("customize.php?url=" . home_url(). "&installAcfCustomizer"), 
                'link_text' => __("Install plugin", 'municipio')
            ]
        );        
    }
}
