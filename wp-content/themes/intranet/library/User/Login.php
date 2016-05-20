<?php

namespace Intranet\User;

class Login
{
    public function __construct()
    {
        add_action('wp_login_failed', array($this, 'frontendLoginFailed'));
        add_action('wp_logout', array($this, 'frontendLogout'));
    }

    /**
     * Handles logout from frontend
     * @return void
     */
    public function frontendLogout()
    {
        $referrer = $_SERVER['HTTP_REFERER'];

        if (!empty($referrer) && !strstr($referrer, 'wp-login') && !strstr($referrer, 'wp-admin')) {
            // let's append some information (loggedout=true) to the URL for the theme to use
            wp_redirect($referer);
            exit;
        }

        die($referrer);
    }

    /**
     * Handles incorrect logins on frontend
     * @param  string $username
     * @return void
     */
    public function frontendLoginFailed($username)
    {
        // Where did the submit come from
        $referrer = $_SERVER['HTTP_REFERER'];

        // If there's a valid referrer, and it's not the default log-in screen
        if (!empty($referrer) && !strstr($referrer, 'wp-login') && !strstr($referrer, 'wp-admin')) {
            // let's append some information (login=show) to the URL for the theme to use
            wp_redirect(strstr($referrer, '?login=failed') ? $referrer : $referrer . '?login=failed');
            exit;
        }

        die($referrer);
    }
}
