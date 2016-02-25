<header id="site-header" class="site-header">
    <div class="container">
        <div class="grid">
            <div class="grid-md-6 text-center-xs text-center-sm">
                {!! municipio_get_logotype(get_field('header_logotype', 'option'), get_field('logotype_tooltip', 'option')) !!}
                <a href="#mobile-menu" class="hidden-md hidden-lg menu-trigger" data-target="#mobile-menu"><span class="menu-icon"></span> Meny</a>
            </div>
            <div class="grid-md-6 text-center-sm text-center-xs text-right">
                <nav>
                    <ul class="nav nav-help nav-horizontal">
                        @if (get_field('show_google_translate', 'option') == 'header')
                            <li><a href="#translate">Translate</a></li>
                        @endif

                        {!!
                            wp_nav_menu(array(
                                'theme_location' => 'help-menu',
                                'container' => false,
                                'container_class' => 'menu-{menu-slug}-container',
                                'container_id' => '',
                                'menu_class' => '',
                                'menu_id' => 'help-menu-top',
                                'echo' => false,
                                'before' => '',
                                'after' => '',
                                'link_before' => '',
                                'link_after' => '',
                                'items_wrap' => '%3$s',
                                'depth' => 1,
                                'fallback_cb' => '__return_false'
                            ));
                        !!}
                    </ul>
                </nav>
                <nav>
                    <ul class="nav nav-tabs">
                        <li><a href="#">Besökare</a></li>
                        <li><a href="#">Företagare</a></li>
                        <li><a href="#">Självservice</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>

    <nav class="navbar navbar-mainmenu hidden-xs hidden-sm">
        <div class="container">
            <div class="grid">
                <div class="grid-sm-12">
                    {!!
                        wp_nav_menu(array(
                            'theme_location' => 'main-menu',
                            'container' => false,
                            'container_class' => 'menu-{menu-slug}-container',
                            'container_id' => '',
                            'menu_class' => 'nav nav-justify',
                            'menu_id' => 'main-menu',
                            'echo' => false,
                            'before' => '',
                            'after' => '',
                            'link_before' => '',
                            'link_after' => '',
                            'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                            'depth' => 1,
                            'fallback_cb' => '__return_false'
                        ));
                    !!}
                </div>
            </div>
        </div>
    </nav>

    <nav id="mobile-menu" class="nav-mobile-menu nav-toggle nav-toggle-expand hidden-md hidden-lg">
        {!!
            wp_nav_menu(array(
                'theme_location' => 'main-menu',
                'container' => false,
                'container_class' => 'menu-{menu-slug}-container',
                'container_id' => '',
                'menu_class' => 'nav-mobile',
                'menu_id' => '',
                'echo' => false,
                'before' => '',
                'after' => '',
                'link_before' => '',
                'link_after' => '',
                'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                'depth' => -1,
            ));
        !!}
    </nav>
</header>

@include('partials.hero')
