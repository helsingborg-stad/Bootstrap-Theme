<?php

namespace Municipio\Customizer;

/**
 * Class Design
 * @package Municipio\Customizer
 */
class Design
{
    /**
     * @var
     */
    private $dataFieldStack;

    /**
     * @var
     */
    public $modifiers;

    /**
     * @var array|string[]
     */
    private $configurationFiles = [
        'vars' => [
            'Colors' => MUNICIPIO_PATH . 'library/AcfFields/json/customizer-color.json',
            'Radius' => MUNICIPIO_PATH . 'library/AcfFields/json/customizer-radius.json'
        ],
        'modifiers' => [
            'Header' => MUNICIPIO_PATH . 'library/AcfFields/json/customizer-header-modifiers.json',
            'Footer' => MUNICIPIO_PATH . 'library/AcfFields/json/customizer-footer-modifiers.json',
            //'Card' => MUNICIPIO_PATH . 'library/AcfFields/json/customizer-card.json'
        ]

    ];

    /**
     * Design constructor.
     * @return void
     */
    public function __construct()
    {
        add_action('init', array($this, 'initPanels'));
        add_action('wp_head', array($this, 'getAcfCustomizerFields'), 5);
        add_action('wp_head', array($this, 'renderCssVariables'), 10);
        add_action('wp_head', array($this, 'addFilters'), 10);
    }

    /**
     * Inits a new panel structure.
     * @return void
     */
    public function initPanels()
    {
        foreach($this->configurationFiles as $index => $conf){
            new \Municipio\Helper\Customizer(
                __('Design', 'municipio'),
                array_flip($this->configurationFiles[$index])
            );
        }

    }

    /**
     * Parses the acf config
     * @return \WP_Error|void
     */
    public function getAcfCustomizerFields()
    {
        if (is_array($this->configurationFiles) && !empty($this->configurationFiles)) {
            foreach($this->configurationFiles as $typeIndex => $conf) {

                foreach ($this->configurationFiles[$typeIndex] as $key => $config) {

                    $data = file_get_contents($config);
                    $themeMods = get_theme_mod(sanitize_title($key));

                    if (file_exists($config) && $data = json_decode($data)) {

                        if (count($data) != 1) {
                            return new \WP_Error("Configuration file should not contain more than one group " . $config);
                        }

                        $data = array_pop($data);

                        if (isset($data->fields) && !empty($data->fields)) {

                            foreach ($data->fields as $index => $field) {
                                $this->dataFieldStack[$typeIndex][sanitize_title($data->title)][$index] = [
                                    $field->key => [
                                        'key' => $key,
                                        'group-id' => sanitize_title($data->title),
                                        'name' => str_replace(['municipio_', '_'], ['', '-'], $field->name),
                                        'default' => $field->default_value,
                                        'value' => $themeMods[$field->key],
                                        'prepend' => $field->prepend ?? null,
                                        'append' => $field->append ?? null
                                    ]
                                ];
                            }
                        }

                    } else {
                        return new \WP_Error("Could not read configuration file " . $config);
                    }
                }
            }
        }
    }

    /**
     * Add Filters with CSS modifiers
     * @return void
     */
    public function addFilters() {
        $modifiers = [];

        foreach($this->dataFieldStack['modifiers'] as $key => $stackItems) {
            foreach ($stackItems as $index => $prop) {
                $itemKey = key($stackItems[$index]);
                $this->modifiers[$index] = (!empty($prop[$itemKey]['value']) ? $prop[$itemKey]['value'] : $prop[$itemKey]['default']);
                $filterKey = $prop[$itemKey]['key'];
            }

            add_filter('ComponentLibrary/Component/'.ucfirst($filterKey) .'/Modifier', function() {
                return $this->modifiers;
            });
        }
    }

    /**
     * Render root css variables
     * @return void
     */
    public function renderCssVariables()
    {
        $inlineStyle = null;
        foreach ($this->dataFieldStack['vars'] as $key => $stackItems) {

            $inlineStyle .= PHP_EOL . '  /* Variables: ' . ucfirst($key) . ' */' . PHP_EOL;

            foreach ($stackItems as $index => $prop) {
                $itemKey = key($stackItems[$index]);
                $inlineStyle .= '  --' . $prop[$itemKey]['name'] . ': ' .
                    (isset($prop[$itemKey]['prepend']) &&
                    !empty($prop[$itemKey]['prepend']) ? $prop[$itemKey]['prepend'] : null) .
                    (isset($prop[$itemKey]['value']) &&
                    !empty($prop[$itemKey]['value']) ? $prop[$itemKey]['value'] : $prop[$itemKey]['default']) .
                    (isset($prop[$itemKey]['append']) &&
                    !empty($prop[$itemKey]['append']) ? $prop[$itemKey]['append'] : null) . ';' . PHP_EOL;
            }
        }

        wp_dequeue_style('municipio-css-vars');
        wp_register_style('municipio-css-vars', false);
        wp_enqueue_style('municipio-css-vars');
        wp_add_inline_style('municipio-css-vars', ":root {{$inlineStyle}}");
    }
}