
<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@2.7.2"></script>
<div id="ais-wrapper">

    {{-- Hides auto generated UI elements --}}
    <style scoped="scoped">
        .ais-search-box--magnifier-wrapper,
        .ais-search-box--reset-wrapper {
            display: none !important;
        }
        .suggestion-post-content {
            padding: 10px 0;
        }
    </style>

    <section class="creamy gutter-vertical gutter-lg clearfix">
        <div class="container">
            <div class="grid">
                <div class="grid-lg-12">
                    <div id="ais-wrapper">
                        <main id="ais-main">
                            <div id="algolia-search-box"></div>
                                <div class="grid">
                                    <div class="grid-xs-6">
                                        <div id="algolia-stats" class="gutter gutter-sm gutter-top"></div>
                                    </div>
                                    <div class="grid-xs-6">
                                        @if(get_option('algolia_powered_by_enabled') != "no")
                                            <div class="gutter gutter-sm gutter-top text-right">
                                                <a href="http://algolia.com" rel="nofollow" class="algolia-powered-by-link" title="Algolia">
                                                    <svg style="height: 18px;" viewBox="0 0 130 21" xmlns="http://www.w3.org/2000/svg"><title>search-by-algolia-white</title><path d="M96.667 15.57c0 1.719-.44 2.974-1.327 3.773-.887.799-2.24 1.197-4.066 1.197-.666 0-2.051-.129-3.159-.373l.408-1.997c.925.193 2.15.245 2.79.245 1.017 0 1.741-.206 2.175-.618.433-.412.647-1.023.647-1.835v-.413a7.533 7.533 0 0 1-.99.374c-.408.123-.88.186-1.411.186-.7 0-1.333-.11-1.91-.328a4 4 0 0 1-1.482-.966 4.424 4.424 0 0 1-.958-1.596c-.227-.637-.343-1.778-.343-2.615 0-.785.123-1.77.363-2.427a4.638 4.638 0 0 1 1.068-1.694c.466-.47 1.035-.83 1.703-1.094a6.276 6.276 0 0 1 2.299-.431c.822 0 1.58.103 2.317.225a18.7 18.7 0 0 1 1.877.393v9.993h-.001zm-7.037-4.971c0 1.055.233 2.227.7 2.717.466.489 1.068.733 1.806.733.402 0 .783-.057 1.139-.167.356-.11.64-.24.867-.393V7.237c-.18-.039-.938-.192-1.67-.212-.919-.026-1.617.347-2.11.946-.486.6-.732 1.649-.732 2.628zm19.051 0a6.07 6.07 0 0 1-.376 2.195 5.186 5.186 0 0 1-1.068 1.797c-.46.496-1.01.881-1.657 1.152-.648.27-1.644.425-2.143.425-.498-.005-1.489-.147-2.13-.425a4.831 4.831 0 0 1-1.65-1.152 5.302 5.302 0 0 1-1.074-1.797 5.953 5.953 0 0 1-.39-2.195c0-.85.118-1.668.377-2.363a5.233 5.233 0 0 1 1.087-1.783 4.855 4.855 0 0 1 1.657-1.147c.64-.27 1.346-.4 2.11-.4.764 0 1.47.136 2.117.4.648.271 1.204.65 1.657 1.147.46.496.815 1.088 1.074 1.783.272.695.408 1.513.408 2.363h.001zm-2.59.005c0-1.088-.24-1.996-.705-2.627-.465-.637-1.12-.952-1.954-.952-.836 0-1.49.315-1.955.952-.466.637-.693 1.539-.693 2.627 0 1.102.233 1.842.7 2.48.466.644 1.12.96 1.955.96s1.489-.322 1.954-.96c.466-.644.7-1.378.7-2.48h-.001zm8.229 5.563c-4.15.02-4.15-3.335-4.15-3.869L110.164.399 112.696 0v11.822c0 .302 0 2.222 1.625 2.227v2.118h-.001zm4.46 0h-2.545V5.3l2.545-.4v11.268zM117.505 3.71c.848 0 1.54-.684 1.54-1.526a1.53 1.53 0 0 0-1.54-1.526 1.53 1.53 0 0 0-1.541 1.526c0 .844.692 1.526 1.54 1.526zm7.6 1.197c.835 0 1.541.103 2.11.31.57.205 1.03.496 1.367.862.337.368.575.869.718 1.397.15.528.22 1.107.22 1.744v6.478c-.389.084-.977.18-1.767.297-.79.115-1.677.173-2.66.173a8.07 8.07 0 0 1-1.793-.186 3.797 3.797 0 0 1-1.392-.6 2.901 2.901 0 0 1-.9-1.068c-.213-.437-.323-1.055-.323-1.7 0-.618.123-1.01.363-1.435.246-.426.575-.773.99-1.044.42-.27.9-.463 1.45-.579a8.359 8.359 0 0 1 1.722-.174c.279 0 .57.02.88.052.311.032.635.09.985.174v-.412c0-.29-.032-.567-.104-.824a1.756 1.756 0 0 0-.363-.69 1.694 1.694 0 0 0-.686-.462 2.997 2.997 0 0 0-1.082-.193c-.582 0-1.113.07-1.599.155a7.43 7.43 0 0 0-1.191.29l-.304-2.068c.317-.11.79-.218 1.398-.328.609-.11 1.262-.168 1.962-.168l-.001-.001zm.214 9.136c.776 0 1.353-.045 1.754-.123v-2.562a6.024 6.024 0 0 0-1.49-.187c-.278 0-.563.02-.848.064a2.561 2.561 0 0 0-.77.226 1.38 1.38 0 0 0-.551.463c-.143.2-.207.316-.207.618 0 .593.207.934.583 1.16.381.231.886.341 1.528.341zM75.33 4.971c.836 0 1.542.103 2.111.31.57.205 1.03.496 1.366.862.343.374.576.869.719 1.397a6.4 6.4 0 0 1 .22 1.744v6.478c-.39.084-.978.18-1.767.297-.79.115-1.677.173-2.66.173a8.07 8.07 0 0 1-1.793-.186 3.797 3.797 0 0 1-1.392-.6 2.901 2.901 0 0 1-.9-1.068c-.214-.437-.324-1.055-.324-1.7 0-.618.123-1.01.363-1.435.246-.426.576-.773.99-1.044.421-.27.9-.463 1.45-.579a8.359 8.359 0 0 1 1.723-.174c.279 0 .57.02.88.052.304.032.635.09.985.174V9.26c0-.29-.032-.567-.104-.824a1.756 1.756 0 0 0-.363-.69 1.694 1.694 0 0 0-.687-.462 2.997 2.997 0 0 0-1.081-.193 9.17 9.17 0 0 0-1.6.155 7.43 7.43 0 0 0-1.19.29l-.304-2.068c.316-.11.79-.218 1.398-.328a10.507 10.507 0 0 1 1.962-.168l-.002-.001zm.22 9.142c.777 0 1.353-.045 1.754-.123v-2.562a6.024 6.024 0 0 0-1.49-.187c-.278 0-.563.02-.848.064a2.561 2.561 0 0 0-.77.226 1.38 1.38 0 0 0-.55.463c-.144.2-.208.316-.208.618 0 .592.207.934.583 1.16.376.225.886.341 1.528.341h.001zm10.26 2.054c-4.149.02-4.149-3.335-4.149-3.869L81.657.399 84.188 0v11.822c0 .302 0 2.222 1.625 2.227v2.118h-.001zM6.524 12.713c0 .906-.328 1.617-.984 2.133-.654.515-1.558.774-2.71.774-1.153 0-2.096-.178-2.83-.536v-1.576c.464.219.958.39 1.48.515.523.126 1.01.188 1.462.188.659 0 1.146-.125 1.46-.375.313-.251.47-.588.47-1.01a1.27 1.27 0 0 0-.432-.97c-.288-.265-.883-.578-1.784-.94-.93-.377-1.585-.807-1.966-1.29C.31 9.143.118 8.562.118 7.884c0-.851.303-1.52.907-2.008.604-.488 1.414-.732 2.432-.732.976 0 1.946.214 2.913.642l-.53 1.36c-.906-.381-1.714-.573-2.425-.573-.538 0-.947.117-1.226.352-.28.236-.419.545-.419.93 0 .265.056.492.168.68.111.188.296.366.55.533.256.168.716.388 1.381.662.748.31 1.297.601 1.645.87.349.27.604.575.767.914.163.34.244.74.244 1.199h-.001zm5.164 2.906c-1.198 0-2.137-.35-2.813-1.05-.676-.7-1.014-1.662-1.014-2.89 0-1.259.314-2.248.941-2.968.628-.72 1.49-1.08 2.586-1.08 1.018 0 1.821.308 2.412.927.59.618.885 1.467.885 2.551v.885H9.548c.024.748.226 1.324.606 1.726.38.402.918.602 1.61.602.455 0 .88-.042 1.271-.128a6.69 6.69 0 0 0 1.265-.43v1.331c-.4.19-.804.325-1.213.405a7.42 7.42 0 0 1-1.4.118h.001zm-.3-6.747c-.52 0-.937.165-1.252.495-.313.33-.5.81-.56 1.443h3.498c-.009-.637-.163-1.12-.46-1.446-.297-.328-.706-.492-1.226-.492zm9.98 6.607l-.327-1.073h-.055c-.373.47-.746.789-1.123.959-.376.17-.86.254-1.45.254-.758 0-1.349-.205-1.774-.613-.426-.41-.638-.987-.638-1.735 0-.795.295-1.395.885-1.8.59-.403 1.489-.624 2.697-.66l1.33-.042v-.412c0-.492-.114-.86-.345-1.105-.23-.243-.586-.366-1.07-.366a3.7 3.7 0 0 0-1.135.174 8.434 8.434 0 0 0-1.046.411l-.53-1.171a5.723 5.723 0 0 1 1.374-.499c.498-.113.967-.17 1.408-.17.98 0 1.72.214 2.219.642.5.428.75 1.099.75 2.014v5.192h-1.172.002zm-2.439-1.115c.595 0 1.072-.167 1.433-.499.36-.332.54-.798.54-1.397V11.8l-.99.042c-.771.028-1.331.157-1.682.386-.351.23-.526.582-.526 1.055 0 .344.101.61.306.798.204.188.51.283.92.283zm9.807-6.733c.33 0 .601.024.815.07l-.16 1.527a3.109 3.109 0 0 0-.725-.084c-.655 0-1.186.214-1.593.641-.406.428-.61.984-.61 1.667v4.029h-1.638V7.77h1.283l.216 1.36h.084c.255-.46.588-.825 1-1.095.41-.27.853-.404 1.327-.404V7.63zm5.352 7.988c-1.166 0-2.052-.34-2.659-1.021-.606-.68-.91-1.658-.91-2.931 0-1.297.317-2.293.952-2.99.634-.697 1.55-1.046 2.75-1.046.813 0 1.544.151 2.196.453L35.92 9.4c-.692-.27-1.263-.404-1.714-.404-1.334 0-2.001.885-2.001 2.656 0 .864.166 1.514.498 1.947.333.435.82.652 1.461.652.73 0 1.42-.181 2.07-.544v1.429a3.259 3.259 0 0 1-.936.37 5.618 5.618 0 0 1-1.21.11v.002zm10.74-.14h-1.644V10.74c0-.594-.12-1.038-.36-1.33-.238-.293-.619-.44-1.139-.44-.688 0-1.192.206-1.516.617-.323.411-.485 1.1-.485 2.067v3.827h-1.638V4.635h1.638V7.39c0 .442-.028.913-.084 1.414h.104c.224-.372.533-.66.93-.864.398-.204.86-.306 1.391-.306 1.869 0 2.803.941 2.803 2.824v5.025-.003zm9.926-7.848c.962 0 1.71.349 2.247 1.046.537.697.805 1.675.805 2.934 0 1.264-.272 2.248-.815 2.953-.544.704-1.299 1.055-2.266 1.055-.976 0-1.733-.351-2.272-1.053h-.111l-.3.913h-1.227V4.634h1.638v2.579c0 .19-.01.474-.029.85l-.041.718h.07c.52-.767 1.287-1.15 2.3-1.15zm-.426 1.338c-.66 0-1.134.194-1.425.581-.29.388-.44 1.038-.45 1.948v.111c0 .938.15 1.618.446 2.039.298.42.783.63 1.458.63.58 0 1.02-.23 1.32-.69.301-.46.45-1.123.45-1.993 0-1.752-.6-2.627-1.799-2.627zm4.21-1.199h1.784l1.569 4.37c.237.624.394 1.209.474 1.757h.055c.041-.255.118-.566.23-.93.112-.365.703-2.097 1.77-5.197h1.771l-3.297 8.734c-.6 1.603-1.599 2.405-2.997 2.405a4.71 4.71 0 0 1-1.059-.118v-1.297c.246.056.527.084.844.084.79 0 1.345-.457 1.666-1.373l.286-.724-3.095-7.71h-.001z" fill="#252525" fill-rule="evenodd"/></svg>
                                                </a>
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <?php do_action('loop_start'); ?>

    <section class=" gutter-vertical gutter-lg clearfix">
        <div class="container">
            <div class="grid">
                <div class="grid-md-8 grid-lg-9">
                    <div id="algolia-hits"></div>
                    <div id="algolia-pagination"></div>
                    <aside id="ais-facets">
                        <section class="ais-facets" id="facet-categories"></section>
                        <section class="ais-facets" id="facet-tags"></section>
                    </aside>
                </div>
                <div class="grid-md-4 grid-lg-3">
                    <div class="grid">
                        @includeIf('partials.search.user-widget')
                        @includeIf('partials.search.system-widget')
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

{{-- Search response item. --}}
@verbatim
<script type="text/html" id="tmpl-instantsearch-hit">
    <div class="ais-hits--content is-{{ data.post_status }}">
        <h3 style="display: inline;" title="{{ data.post_title }}">
            <a class="link-item " href="{{ data.permalink }}">{{{ data._highlightResult.post_title.value }}}</a>
        </h3>

        <# if (data.origin_site) { #>
            &nbsp; - <span class="label label-theme label-sm">{{{ data.origin_site }}}</span>
        <# } #>

        <div class="search-result-date">{{ data.post_date_formatted }}</div>

        <# if (data.contentSnippet) { #>
            <# if (data.post_status == "private" && <?php echo is_user_logged_in() ? 'false' : 'true'; ?>) { #>
                <div class="suggestion-post-content"><?php _e("This post is not publicly avabile, you will be prompted to login to view this post.", 'municipio'); ?></div>
            <# } else { #>
                <div class="suggestion-post-content">{{{ data.contentSnippet }}}</div>
            <# } #>
        <# } #>

        <div class="ais-search-result-info">
            <span class="search-result-url">
                <i class="fa fa-globe" aria-hidden="true"></i>
                <a href="{{ data.permalink }}">
                    {{ data.permalink }}
                </a>
            </span>
        </div>
    </div>
</script>
@endverbatim

{{-- Empty search response. --}}
@verbatim
<script type="text/html" id="tmpl-instantsearch-empty">
    <div class="notice info">
         <i class="pricon pricon-info-o"></i> <?php _e("Could not find any content matching your query.", 'municipio'); ?>
    </div>
</script>
@endverbatim

{{-- Status box. --}}
@verbatim
<script type="text/html" id="tmpl-instantsearch-status">
    <# if (data.query) { #>
        {{ data.nbHits }} <?php _e("hits on", 'municipio'); ?> <strong>"{{ data.query }}"</strong>
    <# } else { #>
        <?php _e("Query is empty, please type somehing.", 'municipio'); ?>
    <# } #>
</script>
@endverbatim