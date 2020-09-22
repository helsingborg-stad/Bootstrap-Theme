@section('hero')
    <div id="sidebar-slider-area--container">
        @if (is_active_sidebar('slider-area') === true )
            @includeIf('partials.sidebar', ['id' => 'slider-area', 'classes' => ['o-row']])

            @if (is_front_page() && is_array(get_field('search_display', 'option')) &&
                in_array('hero', get_field('search_display', 'option')))
                {{-- {{ get_search_form() }} --}}
                @includeIf('partials.search.hero-search-form')
            @endif
        @endif
    </div>
@show
