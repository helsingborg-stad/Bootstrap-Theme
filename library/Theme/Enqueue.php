<?php

namespace Municipio\Theme;

use \Municipio\Helper\CacheBust;
use \Municipio\Helper\Styleguide;

class Enqueue
{
    public $defaultPrimeName = 'hbg-prime';

    public function __construct()
    {
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'style'), 5);
        add_action('wp_enqueue_scripts', array($this, 'script'), 5);

        // Admin style
        add_action('admin_enqueue_scripts', array($this, 'adminStyle'), 999);

        //Customizer Style
        add_action('customize_controls_enqueue_scripts', array($this, 'customizerStyle'));

        add_action('wp_enqueue_scripts', array($this, 'googleTagManager'), 999);
        add_action('wp_enqueue_scripts', array($this, 'googleReCaptcha'), 999);

        // Removes version querystring from scripts and styles
        add_filter('script_loader_src', array($this, 'removeScriptVersion'), 15, 1);
        add_filter('style_loader_src', array($this, 'removeScriptVersion'), 15, 1);

        // Removes generator tag
        add_filter('the_generator', function($a, $b) {
            return '';
        }, 9, 2);


        //Move scripts to footer
        add_action('wp_print_scripts', array($this, 'moveScriptsToFooter'));

        //Enable defered loading
        add_filter('script_loader_tag', array($this, 'deferedLoadingJavascript'), 10, 2);

        // Plugin filters (script/style related)
        add_filter('gform_init_scripts_footer', '__return_true');
        add_filter('gform_cdata_open', array($this, 'wrapGformCdataOpen'));
        add_filter('gform_cdata_close', array($this, 'wrapGformCdataClose'));
    }

    public function customizerStyle()
    {
        $distUrl = get_template_directory_uri() . '/assets/dist/';
        $enqueueBem = apply_filters('Municipio/Theme/Enqueue/Bem', false);

        if ($enqueueBem) {
            wp_register_style('municipio-customizer', $distUrl . CacheBust::name('css/customizer.css'), '', null);
            wp_enqueue_style('municipio-customizer');
        }
    }

    public function wrapGformCdataOpen($content)
    {
        $content = 'document.addEventListener( "DOMContentLoaded", function() { ';
        return $content;
    }

    public function wrapGformCdataClose($content)
    {
        $content = ' }, false );';
        return $content;
    }

    /**
     * Enqueue admin style
     * @return void
     */
    public function adminStyle()
    {
        $distUri = get_template_directory_uri() . '/assets/dist/';

        wp_register_style('helsingborg-se-admin', $distUri . CacheBust::name('css/admin.css'));
        wp_enqueue_style('helsingborg-se-admin');

        wp_register_script('helsingborg-se-admin', $distUri . CacheBust::name('js/admin.js'));
        wp_enqueue_script('helsingborg-se-admin');
    }

    /**
     * Enqueue styles
     * @return void
     */
    public function style()
    {
        $distUri = get_template_directory_uri(). '/assets/dist/';

        // Tell jquery dependents to wait for prime instead.
        if (!apply_filters('Municipio/load-wp-jquery', false)) {
            wp_deregister_script('jquery');
            add_action('wp_enqueue_scripts', array($this, 'waitForPrime'));
        }

        wp_register_style($this->defaultPrimeName, Styleguide::getStylePath(false));
        wp_register_style($this->defaultPrimeName . '-bem', Styleguide::getStylePath(true));
        wp_enqueue_style($this->defaultPrimeName);

        $enqueueBem = apply_filters('Municipio/Theme/Enqueue/Bem', false);
        if ($enqueueBem) {
            wp_enqueue_style($this->defaultPrimeName . '-bem');
        }

        wp_register_style('municipio', $distUri . CacheBust::name('css/app.css'));
        wp_enqueue_style('municipio');
    }

    /**
     * Enqueue scripts
     * @return void
     */
    public function script()
    {
        $distUri = get_template_directory_uri() . '/assets/dist/';
        wp_register_script($this->defaultPrimeName, Styleguide::getScriptPath());

        //Localization
        wp_localize_script($this->defaultPrimeName, 'HbgPrimeArgs', array(
            'api' => array(
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
                'postTypeRestUrl' => \Municipio\Helper\PostType::postTypeRestUrl()
            ),
            'cookieConsent' => array(
                'show'      => get_field('cookie_consent_active', 'option'),
                'message'   => get_field('cookie_consent_message', 'option'),
                'button'    => get_field('cookie_consent_button', 'option'),
                'placement' => get_field('cookie_consent_placement', 'option')
            ),
            'googleTranslate' => array(
                'gaTrack' => get_field('google_translate_ga_track', 'option'),
                'gaUA'    => get_field('google_analytics_ua', 'option')
            ),
            'scrollElevator' => array(
                'cta' => get_field('scroll_elevator_text', 'option'),
                'tooltip' => get_field('scroll_elevator_tooltio', 'option'),
                'tooltipPosition' => get_field('scroll_elevator_tooltio_position', 'option')
            ),
            'tableFilter' => array(
                'empty' => apply_filters('municipio/tablefilter/empty', __('No matching content found…', 'municipio'))
            )
        ));
        wp_enqueue_script($this->defaultPrimeName);

        wp_register_script('municipio', $distUri . CacheBust::name('js/app.js'));
        wp_localize_script('municipio', 'MunicipioLang', array(
            'printbreak' => array(
                'tooltip' => __('Insert Print Page Break tag', 'municipio')
            ),
            'messages' => array(
                'deleteComment' => __('Are you sure you want to delete the comment?', 'municipio'),
                'onError' => __('Something went wrong, please try again later', 'municipio'),
            )
        ));
        wp_enqueue_script('municipio');

        //Load polyfill SAAS
        wp_enqueue_script('polyfill', 'https://cdn.polyfill.io/v3/polyfill.min.js', 'municipio');

        //Comment reply
        if (is_singular() && get_option('thread_comments')) {
            wp_enqueue_script('comment-reply');
        }
    }

    public function moveScriptsToFooter()
    {
        global $wp_scripts;
        $notInFooter = array_diff($wp_scripts->queue, $wp_scripts->in_footer);
        $wp_scripts->in_footer = array_merge($wp_scripts->in_footer, $notInFooter);
    }

    /**
     * Enqueue Google reCAPTCHA
     * @return void
     */
    public function googleReCaptcha()
    {
        if (defined('G_RECAPTCHA_KEY') && defined('G_RECAPTCHA_SECRET')) {
            wp_enqueue_script('google-recaptcha', 'https://www.google.com/recaptcha/api.js?onload=CaptchaCallback&render=explicit', '', '1.0.0', true);
            wp_add_inline_script( 'google-recaptcha', '
            var CaptchaCallback = function() {
                jQuery(\'.g-recaptcha\').each(function(index, el) {
                    grecaptcha.render(el, {\'sitekey\' : \'' . G_RECAPTCHA_KEY . '\'});
                });
            };', 'before');
        }
    }

    /**
     * Enqueues Google Tag Manager
     * @return void
     */
    public function googleTagManager()
    {
        $user = get_field('google_tag_manager_id', 'option');

        if (empty($user)) {
            return;
        }

        add_action('wp_footer', function () use ($user) {
            echo "<noscript><iframe src=\"//www.googletagmanager.com/ns.html?id={$user}\"
                    height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>
                <script>
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','{$user}');
                </script>";
        }, 999);
    }

    /**
     * Removes querystring from any scripts/styles internally
     * @param  string $src The soruce path
     * @return string      The source path without any querystring
     */
    public function removeScriptVersion($src)
    {
        $siteUrlComponents = parse_url(get_site_url());
        $urlComponents = parse_url($src);
        // Check if the URL is internal or external
        if (!empty($siteUrlComponents['host'])
            && !empty($urlComponents['host'])
            && strcasecmp($urlComponents['host'], $siteUrlComponents['host']) === 0
            && !is_admin_bar_showing()) {
            $src = !empty($urlComponents['query']) ? str_replace('?' . $urlComponents['query'], '', $src) : $src;
            return $src;
        } else {
            return $src;
        }
    }

    /**
     * Making deffered loading of scripts a posibillity (removes unwanted renderblocking js)
     * @param  string $tag    HTML Script tag
     * @param  string $handle Script handle
     * @return string         The script tag
     */
    public function deferedLoadingJavascript($tag, $handle)
    {
        if (is_admin()) {
            return $tag;
        }

        if (isset($_GET['preview']) && $_GET['preview'] == 'true') {
            return $tag;
        }

        $scriptsHandlesToIgnore = apply_filters('Municipio/Theme/Enqueue/deferedLoadingJavascript/handlesToIgnore', array('readspeaker'), $handle);

        if (in_array($handle, $scriptsHandlesToIgnore)) {
            return $tag;
        }

       return str_replace(' src', ' defer="defer" src', $tag);
    }

    /**
     * Change jquery deps to hbgprime deps
     * @return void
     */
    public function waitForPrime()
    {
        $wp_scripts = wp_scripts();

        if (!is_admin() && isset($wp_scripts->registered)) {
            foreach ($wp_scripts->registered as $key => $item) {
                if (is_array($item->deps) && !empty($item->deps)) {
                    foreach ($item->deps as $depkey => $depencency) {
                        $item->deps[$depkey] = str_replace("jquery", $this->defaultPrimeName, strtolower($depencency));
                    }
                }
            }
        }
    }
}
