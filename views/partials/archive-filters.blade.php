@if (!empty($enabledHeaderFilters) || !empty($enabledTaxonomyFilters))

@if (get_field('archive_' . sanitize_title($postType) . '_filter_position', 'option') == 'content')
    <section class="u-mb-4 sidebar-content-area archive-filters grid-xs-12">
@else
    <section class="creamy creamy-border-bottom gutter-lg gutter-vertical sidebar-content-area archive-filters">
@endif

    <form method="get" action="{{ $archiveUrl }}" class="container" id="archive-filter">

        <input id="hidden-translate" type="hidden" name="translate" value="" />  
        <!-- {{ var_dump($archiveUrl) }} -->
        @if (isset($enabledTaxonomyFilters->highlighted) && !empty($enabledTaxonomyFilters->highlighted))
        @foreach ($enabledTaxonomyFilters->highlighted as $taxKey => $taxonomy)
        @if(count($taxonomy->values) > 1)
        <div class="gutter gutter-top">
        <div class="grid">
            <div class="grid-xs-12">
                <ul>
                    <li class="highlighted-title"><h3>{{ $taxonomy->label }}</h3></li>
                    <ul class="nav nav-pills nav-horizontal nav-pills--badge">
                    @foreach ($taxonomy->values as $term)
                        <li>
                            <input id="segment-id-{{ $taxKey }}-{{ $term->slug }}" type="checkbox" name="filter[{{ $taxKey }}][]" value="{{ $term->slug }}" {{ checked(true, isset($_GET['filter'][$taxKey]) && is_array($_GET['filter'][$taxKey]) && in_array($term->slug, $_GET['filter'][$taxKey])) }}>
                            <a>
                                <label for="segment-id-{{ $taxKey }}-{{ $term->slug }}" class="checkbox inline-block">{{ $term->name }}</label>
                            </a>
                        </li>
                    @endforeach
                    </ul>
                </ul>
            </div>
        </div>
        </div>
        @endif
        @endforeach
        @endif

        <div class="grid">
            @if (in_array('text_search', $enabledHeaderFilters))
            <div class="grid-sm-12 grid-md-auto">
                <label for="filter-keyword" class="text-sm sr-only"><strong><?php _e('Search', 'municipio'); ?>:</strong></label>
                <div class="input-group">
                    <span class="input-group-addon"><i class="fa fa-search"></i></span>
                    <input type="text" name="s" id="filter-keyword" class="form-control" value="{{ $searchQuery }}" placeholder="<?php _e('Search', 'municipio'); ?>">
                </div>
            </div>
            @endif

            @if (in_array('date_range', $enabledHeaderFilters))
            <div class="grid-sm-12 grid-md-auto">
                <label for="filter-date-from" class="text-sm sr-only"><strong><?php _e('Date published', 'municipio'); ?>:</strong></label>
                <div class="input-group">
                    <span class="input-group-addon"><?php _e('From', 'municipio'); ?>:</span>
                    <input type="text" name="from" placeholder="<?php _e('From date', 'municipio'); ?>…" id="filter-date-from" class="form-control datepicker-range datepicker-range-from" value="{{ isset($_GET['from']) && !empty($_GET['from']) ? sanitize_text_field($_GET['from']) : '' }}" readonly>
                    <span class="input-group-addon"><?php _e('To', 'municipio'); ?>:</span>
                    <input type="text" name="to" placeholder="<?php _e('To date', 'municipio'); ?>" class="form-control datepicker-range datepicker-range-to" value="{{ isset($_GET['to']) && !empty($_GET['to']) ? sanitize_text_field($_GET['to']) : '' }}" readonly>
                </div>
            </div>
            @endif   

            <script>
                const urlParams = new URLSearchParams(window.location.search);
                // If there's an translate parameter, then we need to make sure there's also a translate anchor tag.
                if(urlParams.get('translate') && urlParams.get('translate') !== '' && !window.location.hash){
                        window.location.hash='translate';
                }

                function processForm(e) {
                    const oldUrlParams = new URLSearchParams(window.location.search);
                    if(oldUrlParams.get('translate')){
                        document.getElementById('hidden-translate').value = oldUrlParams.get('translate');
                    }
                    return true;
                }
                
                // Hack to have the translate link(s) in the footer keep all search parameters.
                // Relies on the link having the class 'translate-link-js'. 
                function rewriteTranslateLink(){
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('translate', true);
                    const linkElements = document.getElementsByClassName('translate-link-js');
                    Array.from(linkElements).forEach( el => {
                        if(el.firstChild){
                            el.firstChild.href = '?' + urlParams.toString() + '#translate';
                        }
                    });
                }
                
                document.getElementById('archive-filter').addEventListener("submit", processForm);
                window.addEventListener('DOMContentLoaded', () => { 
                    document.getElementById('ui-datepicker-div')?.classList.add('notranslate');
                    rewriteTranslateLink(); 
                })
            </script>

            @if (isset($enabledTaxonomyFilters->primary) && !empty($enabledTaxonomyFilters->primary))
                @foreach ($enabledTaxonomyFilters->primary as $taxKey => $tax)
                <div class="grid-sm-12 {{ $tax->type == 'multi' ? 'grid-md-fit-content' : 'grid-md-auto' }}">
                    <label for="filter-{{ $taxKey }}" class="text-sm sr-only">{{ $tax->label }}</label>
                    @if ($tax->type === 'single')
                        @include('partials.archive-filters.select')
                    @else
                        @include('partials.archive-filters.button-dropdown')
                    @endif
                </div>
                @endforeach
            @endif

            @if($queryString)
                <div class="grid-sm-12 hidden-sm hidden-xs grid-md-fit-content">
                    <a class="btn btn-block pricon pricon-close pricon-space-right" href="{{ $archiveUrl }}"><?php _e('Clear filters', 'municipio'); ?></a>
                </div>
            @endif
            <div class="grid-sm-12 grid-md-fit-content">
                <input type="submit" value="<?php _e('Search', 'municipio'); ?>" class="btn btn-primary btn-block">
            </div>
        </div>

        @if (isset($enabledTaxonomyFilters->row) && !empty($enabledTaxonomyFilters->row))
        @foreach ($enabledTaxonomyFilters->row as $taxKey => $taxonomy)
        @if(count($taxonomy->values) > 1)
        <div class="gutter gutter-top">
        <div class="grid">
            <div class="grid-xs-12">
                <ul class="segmented-control">
                    <li class="title">{{ $taxonomy->label }}:</li>
                    @foreach ($taxonomy->values as $term)
                        <li>
                            <input id="segment-id-{{ $taxKey }}-{{ $term->slug }}" type="{{ $taxonomy->type === 'single' ? 'radio' : 'checkbox' }}" name="filter[{{ $taxKey }}][]" value="{{ $term->slug }}" {{ checked(true, isset($_GET['filter'][$taxKey]) && is_array($_GET['filter'][$taxKey]) && in_array($term->slug, $_GET['filter'][$taxKey])) }}>
                            <label for="segment-id-{{ $taxKey }}-{{ $term->slug }}" class="checkbox inline-block">{{ $term->name }}</label>
                        </li>
                    @endforeach
                </ul>
            </div>
        </div>
        </div>
        @endif
        @endforeach
        @endif

        @if (isset($enabledTaxonomyFilters->folded) && !empty($enabledTaxonomyFilters->folded))
        <div class="gutter gutter-top" id="options" style="display: none;">
            <div class="grid" data-equal-container>
            @foreach ($enabledTaxonomyFilters->folded as $taxKey => $taxonomy)
                <div class="grid-md-4">
                    <div class="box box-panel box-panel-secondary" data-equal-item>
                        <h4 class="box-title">{{ $taxonomy->label }}</h4>
                        <div class="box-content">
                            <?php $taxonomy->slug = $taxKey; $dropdown = \Municipio\Content\PostFilters::getMultiTaxDropdown($taxonomy, 0, 'list-hierarchical'); ?>
                            {!! $dropdown !!}
                        </div>
                    </div>
                </div>
            @endforeach
            </div>
        </div>
        @endif

        @if (isset($enabledTaxonomyFilters->folded) && !empty($enabledTaxonomyFilters->folded))
        <div class="grid no-margin gutter gutter-top gutter-sm">
            <div class="grid-xs-12">
                <button type="button" data-toggle="#options" class="btn btn-plain pricon pricon-plus-o pricon-space-right" data-toggle-text="Visa färre sökalternativ…" data-toggle-class="btn btn-plain pricon pricon-minus-o pricon-space-right">Visa fler sökalternativ…</a>
            </div>
        </div>
        @endif

    </form>
</section>
@endif
