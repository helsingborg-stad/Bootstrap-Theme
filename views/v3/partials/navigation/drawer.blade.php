<div class="c-drawer c-drawer--right c-drawer--primary js-drawer u-display--none@lg" data-js-toggle-item="js-drawer">
    <div class="c-drawer__header">
        <button class="hamburger hamburger--drawer hamburger--stacked@sm hamburger--reverse@md hamburger--slider is-active js-close-drawer" type="button"
        aria-label="Menu" aria-controls="navigation">
            <span class="hamburger-box">
                <span class="hamburger-inner"></span>
            </span>
            <span class="hamburger-label">
                Stäng
            </span>
        </button>
    </div>

    <div class="c-drawer__body">
        @includeIf('partials.navigation.mobile', ['menuItems' => $mobileMenuItems])
    </div>

    @if($tabMenuItems)
        <div class="c-drawer__footer u-width--100">
            @foreach($tabMenuItems as $item)
                @link([
                    'href'  => $item['href'],
                    'classList' => ['u-margin__right--2'] 
                ])
                    @typography(['element' => 'span','variant' => 'meta'])
                        {{ $item['label'] }}
                    @endtypography
                @endlink
            @endforeach
        </div>
    @endif
</div>
<div class="drawer-overlay js-close-drawer u-display--none@lg"></div>