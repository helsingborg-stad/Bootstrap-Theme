<?php

namespace Municipio\Helper;

class Customizer
{
  private $instanceName;
  private $InstanceSlug;

  private $panelId = null;
  private $sections = [];

  /**
   * Default setup of section
   */
  public function __construct($panelName, $sections) {
    
    try {

      //Main panel name
      $this->registerPanel($panelName); 

      //Register provided sections
      if(!empty($sections) && is_array($sections)) {
        foreach($sections as $section) {
          $this->registerSection($section); 
        }
      }

      //Run panel stack
      $this->runPanelStack();
      
    } catch (\Exception $e) {
      wp_die($e, __("Municipio customizer error", 'municipio'));
    }
  }

  /**
   * Register panel
   *
   * @return void
   */
  public function registerPanel($title) {
    if(function_exists('acf_add_customizer_panel')) {
      if(is_null($this->panelId)) {
        $this->panelId = acf_add_customizer_panel(array(
          'title' => $title,
        ));
      }
    } else {
      return new \Exception('Cound not run du to missing acf_add_customizer_panel'); 
    }
  }

  /**
   * Run registration of all panels in panel stack
   *
   * @param array $panels
   * @param int $panelId
   * @return bool
   */
  public function runPanelStack() {
    
    if(function_exists('acf_add_customizer_section')) {
      
      if(is_array($this->sections) && !empty($this->sections)) {
        foreach($this->sections as $section) {
          acf_add_customizer_section(array(
            'title'        => $section,
            'storage_type' => 'theme_mod',
            'panel'        => $this->panelId,
          ));
        }
        return true; 
      }
      return false; 

    } else {
      return new \Exception('Cound not run du to missing acf_add_customizer_panel'); 
    }
  }

  /**
   * Registers a new panel.
   *
   * @param string $name
   * @return void
   */
  public function registerSection($name) {
    if(!in_array($name, $this->sections)) {
      $this->sections[] = $name; 
    } else {
      return new \Exception('Panel name ' . $name . ' already registered in context ['. $this->InstanceSlug .'].');
    }
  }
}