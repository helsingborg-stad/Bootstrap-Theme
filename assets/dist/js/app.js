var Muncipio = {};

jQuery(function () {
  /* Check if algolia is running */
  if(typeof algoliasearch !== "undefined") {

    /* init Algolia client */
    var client = algoliasearch(algolia.application_id, algolia.search_api_key);

    /* setup default sources */
    var sources = [];
    jQuery.each(algolia.autocomplete.sources, function (i, config) {
      var suggestion_template = wp.template(config.tmpl_suggestion);
      sources.push({
        source: algoliaAutocomplete.sources.hits(client.initIndex(config.index_name), {
          hitsPerPage: config.max_suggestions,
          attributesToSnippet: [
            'content:10'
          ],
          highlightPreTag: '__ais-highlight__',
          highlightPostTag: '__/ais-highlight__'
        }),
        templates: {
          header: function () {
            return wp.template('autocomplete-header')({
              label: _.escape(config.label)
            });
          },
          suggestion: function (hit) {
            for (var key in hit._highlightResult) {
              /* We do not deal with arrays. */
              if (typeof hit._highlightResult[key].value !== 'string') {
                continue;
              }
              hit._highlightResult[key].value = _.escape(hit._highlightResult[key].value);
              hit._highlightResult[key].value = hit._highlightResult[key].value.replace(/__ais-highlight__/g, '<em>').replace(/__\/ais-highlight__/g, '</em>');
            }

            for (var key in hit._snippetResult) {
              /* We do not deal with arrays. */
              if (typeof hit._snippetResult[key].value !== 'string') {
                continue;
              }

              hit._snippetResult[key].value = _.escape(hit._snippetResult[key].value);
              hit._snippetResult[key].value = hit._snippetResult[key].value.replace(/__ais-highlight__/g, '<em>').replace(/__\/ais-highlight__/g, '</em>');
            }

            return suggestion_template(hit);
          }
        }
      });

    });

    /* Setup dropdown menus */
    jQuery("#site-header " + algolia.autocomplete.input_selector + ", .hero " + algolia.autocomplete.input_selector).each(function (i) {
      var $searchInput = jQuery(this);

      var config = {
        debug: algolia.debug,
        hint: false,
        openOnFocus: true,
        appendTo: 'body',
        templates: {
          empty: wp.template('autocomplete-empty')
        }
      };

      if (algolia.powered_by_enabled) {
        config.templates.footer = wp.template('autocomplete-footer');
      }

      /* Instantiate autocomplete.js */
      var autocomplete = algoliaAutocomplete($searchInput[0], config, sources)
      .on('autocomplete:selected', function (e, suggestion) {
        /* Redirect the user when we detect a suggestion selection. */
        window.location.href = suggestion.permalink;
      });

      /* Force the dropdown to be re-drawn on scroll to handle fixed containers. */
      jQuery(window).scroll(function() {
        if(autocomplete.autocomplete.getWrapper().style.display === "block") {
          autocomplete.autocomplete.close();
          autocomplete.autocomplete.open();
        }
      });
    });

    jQuery(document).on("click", ".algolia-powered-by-link", function (e) {
      e.preventDefault();
      window.location = "https://www.algolia.com/?utm_source=WordPress&utm_medium=extension&utm_content=" + window.location.hostname + "&utm_campaign=poweredby";
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('algolia-search-box')) {

        /* Instantiate instantsearch.js */
        var search = instantsearch({
            appId: algolia.application_id,
            apiKey: algolia.search_api_key,
            indexName: algolia.indices.searchable_posts.name,
            urlSync: {
                mapping: {'q': 's'},
                trackedParameters: ['query']
            },
            searchParameters: {
                facetingAfterDistinct: true,
                highlightPreTag: '__ais-highlight__',
                highlightPostTag: '__/ais-highlight__'
            }
        });

        /* Search box widget */
        search.addWidget(
            instantsearch.widgets.searchBox({
                container: '#algolia-search-box',
                placeholder: 'Search for...',
                wrapInput: false,
                poweredBy: false,
                cssClasses: {
                    input: ['form-control', 'form-control-lg']
                }
            })
        );

        /* Stats widget */
        search.addWidget(
            instantsearch.widgets.stats({
                container: '#algolia-stats',
                autoHideContainer: false,
                templates: {
                    body: wp.template('instantsearch-status')
                }
            })
        );

        /* Hits widget */
        search.addWidget(
            instantsearch.widgets.hits({
                container: '#algolia-hits',
                hitsPerPage: 10,
                cssClasses: {
                    root: ['search-result-list'],
                    item: ['search-result-item']
                },
                templates: {
                    empty: wp.template('instantsearch-empty'),
                    item: wp.template('instantsearch-hit')
                },
                transformData: {
                    item: function (hit) {

                        /* Create content snippet */
                        hit.contentSnippet = hit.content.length > 300 ? hit.content.substring(0, 300 - 3) + '...' : hit.content;

                        /* Create hightlight results */
                        for(var key in hit._highlightResult) {
                          if(typeof hit._highlightResult[key].value !== 'string') {
                            continue;
                          }
                          hit._highlightResult[key].value = _.escape(hit._highlightResult[key].value);
                          hit._highlightResult[key].value = hit._highlightResult[key].value.replace(/__ais-highlight__/g, '<em>').replace(/__\/ais-highlight__/g, '</em>');
                        }

                        return hit;
                    }
                }
            })
        );

        /* Pagination widget */
        search.addWidget(
            instantsearch.widgets.pagination({
                container: '#algolia-pagination',
                cssClasses: {
                    root: ['pagination'],
                    item: ['page'],
                    disabled: ['hidden']
                }
            })
        );

        /* Start */
        search.start();
    }
});

Muncipio = Muncipio || {};
Muncipio.Post = Muncipio.Post || {};

Muncipio.Post.Comments = (function ($) {

    function Comments() {
        $(function() {
            this.handleEvents();
        }.bind(this));
    }

    /**
     * Handle events
     * @return {void}
     */
    Comments.prototype.handleEvents = function () {
        $(document).on('click', '#edit-comment', function (e) {
            e.preventDefault();
            this.displayEditForm(e);
        }.bind(this));

        $(document).on('submit', '#commentupdate', function (e) {
            e.preventDefault();
            this.udpateComment(e);
        }.bind(this));

        $(document).on('click', '#delete-comment', function (e) {
            e.preventDefault();
            if (window.confirm(MunicipioLang.messages.deleteComment)) {
                this.deleteComment(e);
            }
        }.bind(this));

        $(document).on('click', '.cancel-update-comment', function (e) {
            e.preventDefault();
            this.cleanUp();
        }.bind(this));

        $(document).on('click', '.comment-reply-link', function (e) {
            this.cleanUp();
        }.bind(this));
    };

    Comments.prototype.udpateComment = function (event) {
        var $target = $(event.target).closest('.comment-body').find('.comment-content'),
            data = new FormData(event.target),
            oldComment = $target.html();
            data.append('action', 'update_comment');

        $.ajax({
            url: ajaxurl,
            type: 'post',
            context: this,
            processData: false,
            contentType: false,
            data: data,
            dataType: 'json',
            beforeSend : function() {
                // Do expected behavior
                $target.html(data.get('comment'));
                this.cleanUp();
            },
            success: function(response) {
                if (!response.success) {
                    // Undo front end update
                    $target.html(oldComment);
                    this.showError($target);
                }
            },
            error: function(jqXHR, textStatus) {
                $target.html(oldComment);
                this.showError($target);
            }
        });
    };

    Comments.prototype.displayEditForm = function(event) {
        var commentId = $(event.currentTarget).data('comment-id'),
            postId = $(event.currentTarget).data('post-id'),
            $target = $('.comment-body', '#answer-' + commentId + ', #comment-' + commentId).first();

        this.cleanUp();
        $('.comment-content, .comment-footer', $target).hide();
        $target.append('<div class="loading gutter gutter-top gutter-margin"><div></div><div></div><div></div><div></div></div>');

        $.when(this.getCommentForm(commentId, postId)).then(function(response) {
            if (response.success) {
                $target.append(response.data);
                $('.loading', $target).remove();

                // Re init tinyMce if its used
                if ($('.tinymce-editor').length) {
                    tinymce.EditorManager.execCommand('mceRemoveEditor', true, 'comment-edit');
                    tinymce.EditorManager.execCommand('mceAddEditor', true, 'comment-edit');
                }
            } else {
                this.cleanUp();
                this.showError($target);
            }
        });
    };

    Comments.prototype.getCommentForm = function(commentId, postId) {
        return $.ajax({
            url: ajaxurl,
            type: 'post',
            dataType: 'json',
            context: this,
            data: {
                action : 'get_comment_form',
                commentId : commentId,
                postId : postId
            }
        });
    };

    Comments.prototype.deleteComment = function(event) {
        var $target = $(event.currentTarget),
            commentId = $target.data('comment-id'),
            nonce = $target.data('comment-nonce');

        $.ajax({
            url: ajaxurl,
            type: 'post',
            context: this,
            dataType: 'json',
            data: {
                action : 'remove_comment',
                id     : commentId,
                nonce  : nonce
            },
            beforeSend : function(response) {
                // Do expected behavior
                $target.closest('li.answer, li.comment').fadeOut('fast');
            },
            success : function(response) {
                if (!response.success) {
                    // Undo front end deletion
                    this.showError($target);
                }
            },
            error : function(jqXHR, textStatus) {
                this.showError($target);
            }
        });
    };

    Comments.prototype.cleanUp = function(event) {
        $('.comment-update').remove();
        $('.loading', '.comment-body').remove();
        $('.dropdown-menu').hide();
        $('.comment-content, .comment-footer').fadeIn('fast');
    };

    Comments.prototype.showError = function(target) {
        target.closest('li.answer, li.comment').fadeIn('fast')
            .find('.comment-body:first').append('<small class="text-danger">' + MunicipioLang.messages.onError + '</small>')
                .find('.text-danger').delay(4000).fadeOut('fast');
    };

    return new Comments();

})(jQuery);

(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.m=b||a;this.c=this.m.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function z(a){if("string"===typeof a.f)return a.f;var b=a.m.location.protocol;"about:"==b&&(b=a.a.location.protocol);return"https:"==b?"https:":"http:"}function ea(a){return a.m.location.hostname||a.a.location.hostname}
function A(a,b,c){function d(){k&&e&&f&&(k(g),k=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,k=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function B(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function C(){this.a=0;this.c=null}function D(a){a.a++;return function(){a.a--;E(a)}}function F(a,b){a.c=b;E(a)}function E(a){0==a.a&&a.c&&(a.c(),a.c=null)};function G(a){this.a=a||"-"}G.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function H(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return I(a)+" "+(a.f+"00")+" 300px "+J(a.c)}function J(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function K(a){return a.a+a.f}function I(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.m.document.documentElement;this.h=b;this.a=new G("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);L(a,"loading")}function M(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}L(a,"inactive")}function L(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,K(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function N(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function O(a){u(a.c,"body",a.a)}function P(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+J(a.c)+";"+("font-style:"+I(a)+";font-weight:"+(a.f+"00")+";")};function Q(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}Q.prototype.start=function(){var a=this.c.m.document,b=this,c=q(),d=new Promise(function(d,e){function k(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(k,25)},function(){e()})}k()}),e=new Promise(function(a,d){setTimeout(d,b.f)});Promise.race([e,d]).then(function(){b.g(b.a)},function(){b.j(b.a)})};function R(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.o=this.j=this.h=this.g=null;this.g=new N(this.c,this.s);this.h=new N(this.c,this.s);this.j=new N(this.c,this.s);this.o=new N(this.c,this.s);a=new H(this.a.c+",serif",K(this.a));a=P(a);this.g.a.style.cssText=a;a=new H(this.a.c+",sans-serif",K(this.a));a=P(a);this.h.a.style.cssText=a;a=new H("serif",K(this.a));a=P(a);this.j.a.style.cssText=a;a=new H("sans-serif",K(this.a));a=
P(a);this.o.a.style.cssText=a;O(this.g);O(this.h);O(this.j);O(this.o)}var S={D:"serif",C:"sans-serif"},T=null;function U(){if(null===T){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);T=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return T}R.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.o.a.offsetWidth;this.A=q();la(this)};
function ma(a,b,c){for(var d in S)if(S.hasOwnProperty(d)&&b===a.f[S[d]]&&c===a.f[S[d]])return!0;return!1}function la(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=U()&&ma(a,b,c));d?q()-a.A>=a.w?U()&&ma(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):na(a):V(a,a.v)}function na(a){setTimeout(p(function(){la(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.o.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.o=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,K(a).toString(),"active")],[b.a.c("wf",a.c,K(a).toString(),"loading"),b.a.c("wf",a.c,K(a).toString(),"inactive")]);L(b,"fontactive",a);this.o=!0;oa(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,K(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,K(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,K(a).toString(),"inactive"));w(b.f,d,e)}L(b,"fontinactive",a);oa(this)};function oa(a){0==--a.f&&a.j&&(a.o?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),L(a,"active")):M(a.a))};function pa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}pa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;qa(this,new ha(this.c,a),a)};
function ra(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,k=d||null||{};if(0===c.length&&f)M(b.a);else{b.f+=c.length;f&&(b.j=f);var h,m=[];for(h=0;h<c.length;h++){var l=c[h],n=k[l.c],r=b.a,x=l;r.g&&w(r.f,[r.a.c("wf",x.c,K(x).toString(),"loading")]);L(r,"fontloading",x);r=null;null===X&&(X=window.FontFace?(x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent))?42<parseInt(x[1],10):!0:!1);X?r=new Q(p(b.g,b),p(b.h,b),b.c,l,b.s,n):r=new R(p(b.g,b),p(b.h,b),b.c,l,b.s,a,
n);m.push(r)}for(h=0;h<m.length;h++)m[h].start()}},0)}function qa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){ra(a,f,b,d,c)})};function sa(a,b){this.c=a;this.a=b}function ta(a,b,c){var d=z(a.c);a=(a.a.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return d+"//"+a+"/"+b+".js"+(c?"?v="+c:"")}
sa.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var m=0;m<c.length;m++){var l=c[m].fontfamily;void 0!=c[m].fontStyle&&void 0!=c[m].fontWeight?(h=c[m].fontStyle+c[m].fontWeight,e.push(new H(l,h))):e.push(new H(l))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.m;B(this.c,ta(c,d,e),function(e){e?a([]):(f["__MonotypeConfiguration__"+d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+
d}else a([])};function ua(a,b){this.c=a;this.a=b}ua.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new C;b=0;for(c=d.length;b<c;b++)A(this.c,d[b],D(g));var k=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),m=0;m<h.length;m+=1)k.push(new H(d[0],h[m]));else k.push(new H(d[0]));F(g,function(){a(k,f)})};function va(a,b,c){a?this.c=a:this.c=b+wa;this.a=[];this.f=[];this.g=c||""}var wa="//fonts.googleapis.com/css";function xa(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function ya(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function za(a){this.f=a;this.a=[];this.c={}}
var Aa={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Ba={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ca={i:"i",italic:"i",n:"n",normal:"n"},
Da=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Ea(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var k=d[1];g=[];if(k)for(var k=k.split(","),h=k.length,m=0;m<h;m++){var l;l=k[m];if(l.match(/^[\w-]+$/)){var n=Da.exec(l.toLowerCase());if(null==n)l="";else{l=n[2];l=null==l||""==l?"n":Ca[l];n=n[1];if(null==n||""==n)n="4";else var r=Ba[n],n=r?r:isNaN(n)?"4":n.substr(0,1);l=[l,n].join("")}}else l="";l&&g.push(l)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=Aa[d[0]])&&(a.c[e]=d))}a.c[e]||(d=Aa[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new H(e,f[d]))}};function Fa(a,b){this.c=a;this.a=b}var Ga={Arimo:!0,Cousine:!0,Tinos:!0};Fa.prototype.load=function(a){var b=new C,c=this.c,d=new va(this.a.api,z(c),this.a.text),e=this.a.families;xa(d,e);var f=new za(e);Ea(f);A(c,ya(d),D(b));F(b,function(){a(f.a,f.c,Ga)})};function Ha(a,b){this.c=a;this.a=b}Ha.prototype.load=function(a){var b=this.a.id,c=this.c.m;b?B(this.c,(this.a.api||"https://use.typekit.net")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],k=b[f+1],h=0;h<k.length;h++)e.push(new H(g,k[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(m){}a(e)}},2E3):a([])};function Ia(a,b){this.c=a;this.f=b;this.a=[]}Ia.prototype.load=function(a){var b=this.f.id,c=this.c.m,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,k=c.fonts.length;g<k;++g){var h=c.fonts[g];d.a.push(new H(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},B(this.c,z(this.c)+(this.f.api||"//f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new pa(window);Y.a.c.custom=function(a,b){return new ua(b,a)};Y.a.c.fontdeck=function(a,b){return new Ia(b,a)};Y.a.c.monotype=function(a,b){return new sa(b,a)};Y.a.c.typekit=function(a,b){return new Ha(b,a)};Y.a.c.google=function(a,b){return new Fa(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());

Muncipio = Muncipio || {};

var googleTranslateLoaded = false;

if (location.href.indexOf('translate=true') > -1) {
    loadGoogleTranslate();
}

$('[href="#translate"]').on('click', function (e) {
    loadGoogleTranslate();
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: "sv",
        autoDisplay: false,
        gaTrack: HbgPrimeArgs.googleTranslate.gaTrack,
        gaId: HbgPrimeArgs.googleTranslate.gaUA
    }, "google-translate-element");
}

function loadGoogleTranslate() {
    if (googleTranslateLoaded) {
        return;
    }

    $.getScript('//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit', function() {
        $('a').each(function () {
            var hrefUrl = $(this).attr('href');

            // Check if external or non valid url (do not add querystring)
            if (hrefUrl == null || hrefUrl.indexOf(location.origin) === -1 || hrefUrl.substr(0, 1) === '#') {
                return;
            }

            hrefUrl = updateQueryStringParameter(hrefUrl, 'translate', 'true');

            $(this).attr('href', hrefUrl);
        });

        googleTranslateLoaded = true;
    });
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }

    return uri + separator + key + "=" + value;
}

Municipio = Municipio || {};
Municipio.Helper = Municipio.Helper || {};

Municipio.Helper.MainContainer = (function ($) {

    function MainContainer() {
        this.removeMainContainer();
    }

    MainContainer.prototype.removeMainContainer = function () {
        if($.trim($("#main-content").html()) == '') {
            $('#main-content').remove();
            return true;
        }
        return false;
    };

    return new MainContainer();

})(jQuery);

(function($) {
    if (typeof themeColorPalette != 'undefined') {
        jQuery.wp.wpColorPicker.prototype.options = {
            palettes: themeColorPalette.colors
        };
    }
})(jQuery);

var Municipio = {};

jQuery('.index-php #screen-meta-links').append('\
    <div id="screen-options-show-lathund-wrap" class="hide-if-no-js screen-meta-toggle">\
        <a href="http://lathund.helsingborg.se" id="show-lathund" target="_blank" class="button show-settings">Lathund</a>\
    </div>\
');

jQuery(document).ready(function () {
    jQuery('.acf-field-url input[type="url"]').parents('form').attr('novalidate', 'novalidate');
});


Muncipio = Muncipio || {};
Muncipio.Ajax = Muncipio.Ajax || {};

Muncipio.Ajax.LikeButton = (function ($) {

    function Like() {
        this.init();
    }

    Like.prototype.init = function() {
        $('a.like-button').on('click', function(e) {
            this.ajaxCall(e.target);
            return false;
        }.bind(this));
    };

    Like.prototype.ajaxCall = function(likeButton) {
        var comment_id = $(likeButton).data('comment-id');
        var counter = $('span#like-count', likeButton);
        var button = $(likeButton);

        $.ajax({
            url : likeButtonData.ajax_url,
            type : 'post',
            data : {
                action : 'ajaxLikeMethod',
                comment_id : comment_id,
                nonce : likeButtonData.nonce
            },
            beforeSend: function() {
                var likes = counter.html();

                if(button.hasClass('active')) {
                    likes--;
                    button.toggleClass("active");
                }
                else {
                    likes++;
                    button.toggleClass("active");
                }

                counter.html( likes );
            },
            success : function( response ) {

            }
        });

    };

    return new Like();

})($);

Muncipio = Muncipio || {};
Muncipio.Ajax = Muncipio.Ajax || {};

Muncipio.Ajax.ShareEmail = (function ($) {

    function ShareEmail() {
        $(function(){
            this.handleEvents();
        }.bind(this));
    }

    /**
     * Handle events
     * @return {void}
     */
    ShareEmail.prototype.handleEvents = function () {
        $(document).on('submit', '.social-share-email', function (e) {
            e.preventDefault();
            this.share(e);

        }.bind(this));
    };

    ShareEmail.prototype.share = function(event) {
        var $target = $(event.target),
            data = new FormData(event.target);
            data.append('action', 'share_email');

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,
            beforeSend: function() {
                $target.find('.modal-footer').prepend('<div class="loading"><div></div><div></div><div></div><div></div></div>');
                $target.find('.notice').hide();
            },
            success: function(response, textStatus, jqXHR) {
                if (response.success) {
                    $('.modal-footer', $target).prepend('<span class="notice success gutter gutter-margin gutter-vertical"><i class="pricon pricon-check"></i> ' + response.data + '</span>');

                    setTimeout(function() {
                        location.hash = '';
                        $target.find('.notice').hide();
                    }, 3000);
                } else {
                    $('.modal-footer', $target).prepend('<span class="notice warning gutter gutter-margin gutter-vertical"><i class="pricon pricon-notice-warning"></i> ' + response.data + '</span>');
                }
            },
            complete: function () {
                $target.find('.loading').hide();
            }
        });

        return false;
    };

    return new ShareEmail();

})(jQuery);

Muncipio = Muncipio || {};
Muncipio.Ajax = Muncipio.Ajax || {};

Muncipio.Ajax.Suggestions = (function ($) {

    var typingTimer;
    var lastTerm;

    function Suggestions() {
        if (!$('#filter-keyword').length || HbgPrimeArgs.api.postTypeRestUrl == null) {
            return;
        }

        $('#filter-keyword').attr('autocomplete', 'off');
        this.handleEvents();
    }

    Suggestions.prototype.handleEvents = function() {
        $(document).on('keydown', '#filter-keyword', function (e) {
            var $this = $(e.target),
                $selected = $('.selected', '#search-suggestions');

            if ($selected.siblings().length > 0) {
                $('#search-suggestions li').removeClass('selected');
            }

            if (e.keyCode == 27) {
                // Key pressed: Esc
                $('#search-suggestions').remove();
                return;
            } else if (e.keyCode == 13) {
                // Key pressed: Enter
                return;
            } else if (e.keyCode == 38) {
                // Key pressed: Up
                if ($selected.prev().length == 0) {
                    $selected.siblings().last().addClass('selected');
                } else {
                    $selected.prev().addClass('selected');
                }

                $this.val($('.selected', '#search-suggestions').text());
            } else if (e.keyCode == 40) {
                // Key pressed: Down
                if ($selected.next().length == 0) {
                    $selected.siblings().first().addClass('selected');
                } else {
                    $selected.next().addClass('selected');
                }

                $this.val($('.selected', '#search-suggestions').text());
            } else {
                // Do the search
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function() {
                    this.search($this.val());
                }.bind(this), 100);
            }
        }.bind(this));

        $(document).on('click', function (e) {
            if (!$(e.target).closest('#search-suggestions').length) {
                $('#search-suggestions').remove();
            }
        }.bind(this));

        $(document).on('click', '#search-suggestions li', function (e) {
            $('#search-suggestions').remove();
            $('#filter-keyword').val($(e.target).text())
                .parents('form').submit();
        }.bind(this));
    };

    /**
     * Performs the search for similar titles+content
     * @param  {string} term Search term
     * @return {void}
     */
    Suggestions.prototype.search = function(term) {
        if (term === lastTerm) {
            return false;
        }

        if (term.length < 4) {
            $('#search-suggestions').remove();
            return false;
        }

        // Set last term to the current term
        lastTerm = term;

        // Get API endpoint for performing the search
        var requestUrl = HbgPrimeArgs.api.postTypeRestUrl + '?per_page=6&search=' + term;

        // Do the search request
        $.get(requestUrl, function(response) {
            if (!response.length) {
                $('#search-suggestions').remove();
                return;
            }

            this.output(response, term);
        }.bind(this), 'JSON');
    };

    /**
     * Outputs the suggestions
     * @param  {array} suggestions
     * @param  {string} term
     * @return {void}
     */
    Suggestions.prototype.output = function(suggestions, term) {
        var $suggestions = $('#search-suggestions');

        if (!$suggestions.length) {
            $suggestions = $('<div id="search-suggestions"><ul></ul></div>');
        }

        $('ul', $suggestions).empty();
        $.each(suggestions, function (index, suggestion) {
            $('ul', $suggestions).append('<li>' + suggestion.title.rendered + '</li>');
        });

        $('li', $suggestions).first().addClass('selected');

        $('#filter-keyword').parent().append($suggestions);
        $suggestions.slideDown(200);
    };


    return new Suggestions();

})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFsZ29saWEtYXV0b2NvbXBsZXRlLmpzIiwiYWxnb2xpYS1pbnN0YW50c2VhcmNoLmpzIiwiY29tbWVudHMuanMiLCJmb250LmpzIiwiZ29vZ2xlVHJhbnNsYXRlLmpzIiwibWFpbkNvbnRhaW5lci5qcyIsIkFkbWluL0NvbG9yUGFsZXR0ZS5qcyIsIkFkbWluL0dlbmVyYWwuanMiLCJBamF4L2xpa2VCdXR0b24uanMiLCJBamF4L3NoYXJlRW1haWwuanMiLCJBamF4L3N1Z2dlc3Rpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIE11bmNpcGlvID0ge307XG4iLCJqUXVlcnkoZnVuY3Rpb24gKCkge1xuICAvKiBDaGVjayBpZiBhbGdvbGlhIGlzIHJ1bm5pbmcgKi9cbiAgaWYodHlwZW9mIGFsZ29saWFzZWFyY2ggIT09IFwidW5kZWZpbmVkXCIpIHtcblxuICAgIC8qIGluaXQgQWxnb2xpYSBjbGllbnQgKi9cbiAgICB2YXIgY2xpZW50ID0gYWxnb2xpYXNlYXJjaChhbGdvbGlhLmFwcGxpY2F0aW9uX2lkLCBhbGdvbGlhLnNlYXJjaF9hcGlfa2V5KTtcblxuICAgIC8qIHNldHVwIGRlZmF1bHQgc291cmNlcyAqL1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgalF1ZXJ5LmVhY2goYWxnb2xpYS5hdXRvY29tcGxldGUuc291cmNlcywgZnVuY3Rpb24gKGksIGNvbmZpZykge1xuICAgICAgdmFyIHN1Z2dlc3Rpb25fdGVtcGxhdGUgPSB3cC50ZW1wbGF0ZShjb25maWcudG1wbF9zdWdnZXN0aW9uKTtcbiAgICAgIHNvdXJjZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZTogYWxnb2xpYUF1dG9jb21wbGV0ZS5zb3VyY2VzLmhpdHMoY2xpZW50LmluaXRJbmRleChjb25maWcuaW5kZXhfbmFtZSksIHtcbiAgICAgICAgICBoaXRzUGVyUGFnZTogY29uZmlnLm1heF9zdWdnZXN0aW9ucyxcbiAgICAgICAgICBhdHRyaWJ1dGVzVG9TbmlwcGV0OiBbXG4gICAgICAgICAgICAnY29udGVudDoxMCdcbiAgICAgICAgICBdLFxuICAgICAgICAgIGhpZ2hsaWdodFByZVRhZzogJ19fYWlzLWhpZ2hsaWdodF9fJyxcbiAgICAgICAgICBoaWdobGlnaHRQb3N0VGFnOiAnX18vYWlzLWhpZ2hsaWdodF9fJ1xuICAgICAgICB9KSxcbiAgICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgICAgaGVhZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gd3AudGVtcGxhdGUoJ2F1dG9jb21wbGV0ZS1oZWFkZXInKSh7XG4gICAgICAgICAgICAgIGxhYmVsOiBfLmVzY2FwZShjb25maWcubGFiZWwpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN1Z2dlc3Rpb246IGZ1bmN0aW9uIChoaXQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBoaXQuX2hpZ2hsaWdodFJlc3VsdCkge1xuICAgICAgICAgICAgICAvKiBXZSBkbyBub3QgZGVhbCB3aXRoIGFycmF5cy4gKi9cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoaXQuX2hpZ2hsaWdodFJlc3VsdFtrZXldLnZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhpdC5faGlnaGxpZ2h0UmVzdWx0W2tleV0udmFsdWUgPSBfLmVzY2FwZShoaXQuX2hpZ2hsaWdodFJlc3VsdFtrZXldLnZhbHVlKTtcbiAgICAgICAgICAgICAgaGl0Ll9oaWdobGlnaHRSZXN1bHRba2V5XS52YWx1ZSA9IGhpdC5faGlnaGxpZ2h0UmVzdWx0W2tleV0udmFsdWUucmVwbGFjZSgvX19haXMtaGlnaGxpZ2h0X18vZywgJzxlbT4nKS5yZXBsYWNlKC9fX1xcL2Fpcy1oaWdobGlnaHRfXy9nLCAnPC9lbT4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGhpdC5fc25pcHBldFJlc3VsdCkge1xuICAgICAgICAgICAgICAvKiBXZSBkbyBub3QgZGVhbCB3aXRoIGFycmF5cy4gKi9cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoaXQuX3NuaXBwZXRSZXN1bHRba2V5XS52YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGhpdC5fc25pcHBldFJlc3VsdFtrZXldLnZhbHVlID0gXy5lc2NhcGUoaGl0Ll9zbmlwcGV0UmVzdWx0W2tleV0udmFsdWUpO1xuICAgICAgICAgICAgICBoaXQuX3NuaXBwZXRSZXN1bHRba2V5XS52YWx1ZSA9IGhpdC5fc25pcHBldFJlc3VsdFtrZXldLnZhbHVlLnJlcGxhY2UoL19fYWlzLWhpZ2hsaWdodF9fL2csICc8ZW0+JykucmVwbGFjZSgvX19cXC9haXMtaGlnaGxpZ2h0X18vZywgJzwvZW0+Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uX3RlbXBsYXRlKGhpdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgLyogU2V0dXAgZHJvcGRvd24gbWVudXMgKi9cbiAgICBqUXVlcnkoXCIjc2l0ZS1oZWFkZXIgXCIgKyBhbGdvbGlhLmF1dG9jb21wbGV0ZS5pbnB1dF9zZWxlY3RvciArIFwiLCAuaGVybyBcIiArIGFsZ29saWEuYXV0b2NvbXBsZXRlLmlucHV0X3NlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgJHNlYXJjaElucHV0ID0galF1ZXJ5KHRoaXMpO1xuXG4gICAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBkZWJ1ZzogYWxnb2xpYS5kZWJ1ZyxcbiAgICAgICAgaGludDogZmFsc2UsXG4gICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICBhcHBlbmRUbzogJ2JvZHknLFxuICAgICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgICBlbXB0eTogd3AudGVtcGxhdGUoJ2F1dG9jb21wbGV0ZS1lbXB0eScpXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChhbGdvbGlhLnBvd2VyZWRfYnlfZW5hYmxlZCkge1xuICAgICAgICBjb25maWcudGVtcGxhdGVzLmZvb3RlciA9IHdwLnRlbXBsYXRlKCdhdXRvY29tcGxldGUtZm9vdGVyJyk7XG4gICAgICB9XG5cbiAgICAgIC8qIEluc3RhbnRpYXRlIGF1dG9jb21wbGV0ZS5qcyAqL1xuICAgICAgdmFyIGF1dG9jb21wbGV0ZSA9IGFsZ29saWFBdXRvY29tcGxldGUoJHNlYXJjaElucHV0WzBdLCBjb25maWcsIHNvdXJjZXMpXG4gICAgICAub24oJ2F1dG9jb21wbGV0ZTpzZWxlY3RlZCcsIGZ1bmN0aW9uIChlLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgIC8qIFJlZGlyZWN0IHRoZSB1c2VyIHdoZW4gd2UgZGV0ZWN0IGEgc3VnZ2VzdGlvbiBzZWxlY3Rpb24uICovXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gc3VnZ2VzdGlvbi5wZXJtYWxpbms7XG4gICAgICB9KTtcblxuICAgICAgLyogRm9yY2UgdGhlIGRyb3Bkb3duIHRvIGJlIHJlLWRyYXduIG9uIHNjcm9sbCB0byBoYW5kbGUgZml4ZWQgY29udGFpbmVycy4gKi9cbiAgICAgIGpRdWVyeSh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoYXV0b2NvbXBsZXRlLmF1dG9jb21wbGV0ZS5nZXRXcmFwcGVyKCkuc3R5bGUuZGlzcGxheSA9PT0gXCJibG9ja1wiKSB7XG4gICAgICAgICAgYXV0b2NvbXBsZXRlLmF1dG9jb21wbGV0ZS5jbG9zZSgpO1xuICAgICAgICAgIGF1dG9jb21wbGV0ZS5hdXRvY29tcGxldGUub3BlbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGpRdWVyeShkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5hbGdvbGlhLXBvd2VyZWQtYnktbGlua1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgd2luZG93LmxvY2F0aW9uID0gXCJodHRwczovL3d3dy5hbGdvbGlhLmNvbS8/dXRtX3NvdXJjZT1Xb3JkUHJlc3MmdXRtX21lZGl1bT1leHRlbnNpb24mdXRtX2NvbnRlbnQ9XCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyBcIiZ1dG1fY2FtcGFpZ249cG93ZXJlZGJ5XCI7XG4gICAgfSk7XG4gIH1cbn0pO1xuIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGdvbGlhLXNlYXJjaC1ib3gnKSkge1xuXG4gICAgICAgIC8qIEluc3RhbnRpYXRlIGluc3RhbnRzZWFyY2guanMgKi9cbiAgICAgICAgdmFyIHNlYXJjaCA9IGluc3RhbnRzZWFyY2goe1xuICAgICAgICAgICAgYXBwSWQ6IGFsZ29saWEuYXBwbGljYXRpb25faWQsXG4gICAgICAgICAgICBhcGlLZXk6IGFsZ29saWEuc2VhcmNoX2FwaV9rZXksXG4gICAgICAgICAgICBpbmRleE5hbWU6IGFsZ29saWEuaW5kaWNlcy5zZWFyY2hhYmxlX3Bvc3RzLm5hbWUsXG4gICAgICAgICAgICB1cmxTeW5jOiB7XG4gICAgICAgICAgICAgICAgbWFwcGluZzogeydxJzogJ3MnfSxcbiAgICAgICAgICAgICAgICB0cmFja2VkUGFyYW1ldGVyczogWydxdWVyeSddXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VhcmNoUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgIGZhY2V0aW5nQWZ0ZXJEaXN0aW5jdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRQcmVUYWc6ICdfX2Fpcy1oaWdobGlnaHRfXycsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0UG9zdFRhZzogJ19fL2Fpcy1oaWdobGlnaHRfXydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogU2VhcmNoIGJveCB3aWRnZXQgKi9cbiAgICAgICAgc2VhcmNoLmFkZFdpZGdldChcbiAgICAgICAgICAgIGluc3RhbnRzZWFyY2gud2lkZ2V0cy5zZWFyY2hCb3goe1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogJyNhbGdvbGlhLXNlYXJjaC1ib3gnLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnU2VhcmNoIGZvci4uLicsXG4gICAgICAgICAgICAgICAgd3JhcElucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwb3dlcmVkQnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNzc0NsYXNzZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFsnZm9ybS1jb250cm9sJywgJ2Zvcm0tY29udHJvbC1sZyddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICAvKiBTdGF0cyB3aWRnZXQgKi9cbiAgICAgICAgc2VhcmNoLmFkZFdpZGdldChcbiAgICAgICAgICAgIGluc3RhbnRzZWFyY2gud2lkZ2V0cy5zdGF0cyh7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiAnI2FsZ29saWEtc3RhdHMnLFxuICAgICAgICAgICAgICAgIGF1dG9IaWRlQ29udGFpbmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTogd3AudGVtcGxhdGUoJ2luc3RhbnRzZWFyY2gtc3RhdHVzJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIC8qIEhpdHMgd2lkZ2V0ICovXG4gICAgICAgIHNlYXJjaC5hZGRXaWRnZXQoXG4gICAgICAgICAgICBpbnN0YW50c2VhcmNoLndpZGdldHMuaGl0cyh7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiAnI2FsZ29saWEtaGl0cycsXG4gICAgICAgICAgICAgICAgaGl0c1BlclBhZ2U6IDEwLFxuICAgICAgICAgICAgICAgIGNzc0NsYXNzZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdDogWydzZWFyY2gtcmVzdWx0LWxpc3QnXSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogWydzZWFyY2gtcmVzdWx0LWl0ZW0nXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGVtcHR5OiB3cC50ZW1wbGF0ZSgnaW5zdGFudHNlYXJjaC1lbXB0eScpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiB3cC50ZW1wbGF0ZSgnaW5zdGFudHNlYXJjaC1oaXQnKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBmdW5jdGlvbiAoaGl0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIENyZWF0ZSBjb250ZW50IHNuaXBwZXQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGhpdC5jb250ZW50U25pcHBldCA9IGhpdC5jb250ZW50Lmxlbmd0aCA+IDMwMCA/IGhpdC5jb250ZW50LnN1YnN0cmluZygwLCAzMDAgLSAzKSArICcuLi4nIDogaGl0LmNvbnRlbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIENyZWF0ZSBoaWdodGxpZ2h0IHJlc3VsdHMgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIGhpdC5faGlnaGxpZ2h0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBoaXQuX2hpZ2hsaWdodFJlc3VsdFtrZXldLnZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhpdC5faGlnaGxpZ2h0UmVzdWx0W2tleV0udmFsdWUgPSBfLmVzY2FwZShoaXQuX2hpZ2hsaWdodFJlc3VsdFtrZXldLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaGl0Ll9oaWdobGlnaHRSZXN1bHRba2V5XS52YWx1ZSA9IGhpdC5faGlnaGxpZ2h0UmVzdWx0W2tleV0udmFsdWUucmVwbGFjZSgvX19haXMtaGlnaGxpZ2h0X18vZywgJzxlbT4nKS5yZXBsYWNlKC9fX1xcL2Fpcy1oaWdobGlnaHRfXy9nLCAnPC9lbT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhpdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgLyogUGFnaW5hdGlvbiB3aWRnZXQgKi9cbiAgICAgICAgc2VhcmNoLmFkZFdpZGdldChcbiAgICAgICAgICAgIGluc3RhbnRzZWFyY2gud2lkZ2V0cy5wYWdpbmF0aW9uKHtcbiAgICAgICAgICAgICAgICBjb250YWluZXI6ICcjYWxnb2xpYS1wYWdpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICBjc3NDbGFzc2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IFsncGFnaW5hdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBbJ3BhZ2UnXSxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IFsnaGlkZGVuJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIC8qIFN0YXJ0ICovXG4gICAgICAgIHNlYXJjaC5zdGFydCgpO1xuICAgIH1cbn0pO1xuIiwiTXVuY2lwaW8gPSBNdW5jaXBpbyB8fCB7fTtcbk11bmNpcGlvLlBvc3QgPSBNdW5jaXBpby5Qb3N0IHx8IHt9O1xuXG5NdW5jaXBpby5Qb3N0LkNvbW1lbnRzID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBDb21tZW50cygpIHtcbiAgICAgICAgJChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGV2ZW50c1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgQ29tbWVudHMucHJvdG90eXBlLmhhbmRsZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNlZGl0LWNvbW1lbnQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5RWRpdEZvcm0oZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsICcjY29tbWVudHVwZGF0ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnVkcGF0ZUNvbW1lbnQoZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNkZWxldGUtY29tbWVudCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAod2luZG93LmNvbmZpcm0oTXVuaWNpcGlvTGFuZy5tZXNzYWdlcy5kZWxldGVDb21tZW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlQ29tbWVudChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNhbmNlbC11cGRhdGUtY29tbWVudCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFuVXAoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNvbW1lbnQtcmVwbHktbGluaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFuVXAoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgQ29tbWVudHMucHJvdG90eXBlLnVkcGF0ZUNvbW1lbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLmNvbW1lbnQtYm9keScpLmZpbmQoJy5jb21tZW50LWNvbnRlbnQnKSxcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIG9sZENvbW1lbnQgPSAkdGFyZ2V0Lmh0bWwoKTtcbiAgICAgICAgICAgIGRhdGEuYXBwZW5kKCdhY3Rpb24nLCAndXBkYXRlX2NvbW1lbnQnKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBhamF4dXJsLFxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgYmVmb3JlU2VuZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIERvIGV4cGVjdGVkIGJlaGF2aW9yXG4gICAgICAgICAgICAgICAgJHRhcmdldC5odG1sKGRhdGEuZ2V0KCdjb21tZW50JykpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW5VcCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVuZG8gZnJvbnQgZW5kIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0Lmh0bWwob2xkQ29tbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yKCR0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAkdGFyZ2V0Lmh0bWwob2xkQ29tbWVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3IoJHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBDb21tZW50cy5wcm90b3R5cGUuZGlzcGxheUVkaXRGb3JtID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGNvbW1lbnRJZCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnY29tbWVudC1pZCcpLFxuICAgICAgICAgICAgcG9zdElkID0gJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdwb3N0LWlkJyksXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJCgnLmNvbW1lbnQtYm9keScsICcjYW5zd2VyLScgKyBjb21tZW50SWQgKyAnLCAjY29tbWVudC0nICsgY29tbWVudElkKS5maXJzdCgpO1xuXG4gICAgICAgIHRoaXMuY2xlYW5VcCgpO1xuICAgICAgICAkKCcuY29tbWVudC1jb250ZW50LCAuY29tbWVudC1mb290ZXInLCAkdGFyZ2V0KS5oaWRlKCk7XG4gICAgICAgICR0YXJnZXQuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibG9hZGluZyBndXR0ZXIgZ3V0dGVyLXRvcCBndXR0ZXItbWFyZ2luXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj4nKTtcblxuICAgICAgICAkLndoZW4odGhpcy5nZXRDb21tZW50Rm9ybShjb21tZW50SWQsIHBvc3RJZCkpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5hcHBlbmQocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgJCgnLmxvYWRpbmcnLCAkdGFyZ2V0KS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAgIC8vIFJlIGluaXQgdGlueU1jZSBpZiBpdHMgdXNlZFxuICAgICAgICAgICAgICAgIGlmICgkKCcudGlueW1jZS1lZGl0b3InKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGlueW1jZS5FZGl0b3JNYW5hZ2VyLmV4ZWNDb21tYW5kKCdtY2VSZW1vdmVFZGl0b3InLCB0cnVlLCAnY29tbWVudC1lZGl0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRpbnltY2UuRWRpdG9yTWFuYWdlci5leGVjQ29tbWFuZCgnbWNlQWRkRWRpdG9yJywgdHJ1ZSwgJ2NvbW1lbnQtZWRpdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhblVwKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3IoJHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBDb21tZW50cy5wcm90b3R5cGUuZ2V0Q29tbWVudEZvcm0gPSBmdW5jdGlvbihjb21tZW50SWQsIHBvc3RJZCkge1xuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogYWpheHVybCxcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA6ICdnZXRfY29tbWVudF9mb3JtJyxcbiAgICAgICAgICAgICAgICBjb21tZW50SWQgOiBjb21tZW50SWQsXG4gICAgICAgICAgICAgICAgcG9zdElkIDogcG9zdElkXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBDb21tZW50cy5wcm90b3R5cGUuZGVsZXRlQ29tbWVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIGNvbW1lbnRJZCA9ICR0YXJnZXQuZGF0YSgnY29tbWVudC1pZCcpLFxuICAgICAgICAgICAgbm9uY2UgPSAkdGFyZ2V0LmRhdGEoJ2NvbW1lbnQtbm9uY2UnKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBhamF4dXJsLFxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uIDogJ3JlbW92ZV9jb21tZW50JyxcbiAgICAgICAgICAgICAgICBpZCAgICAgOiBjb21tZW50SWQsXG4gICAgICAgICAgICAgICAgbm9uY2UgIDogbm9uY2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiZWZvcmVTZW5kIDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBEbyBleHBlY3RlZCBiZWhhdmlvclxuICAgICAgICAgICAgICAgICR0YXJnZXQuY2xvc2VzdCgnbGkuYW5zd2VyLCBsaS5jb21tZW50JykuZmFkZU91dCgnZmFzdCcpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbmRvIGZyb250IGVuZCBkZWxldGlvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dFcnJvcigkdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3IgOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yKCR0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgQ29tbWVudHMucHJvdG90eXBlLmNsZWFuVXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAkKCcuY29tbWVudC11cGRhdGUnKS5yZW1vdmUoKTtcbiAgICAgICAgJCgnLmxvYWRpbmcnLCAnLmNvbW1lbnQtYm9keScpLnJlbW92ZSgpO1xuICAgICAgICAkKCcuZHJvcGRvd24tbWVudScpLmhpZGUoKTtcbiAgICAgICAgJCgnLmNvbW1lbnQtY29udGVudCwgLmNvbW1lbnQtZm9vdGVyJykuZmFkZUluKCdmYXN0Jyk7XG4gICAgfTtcblxuICAgIENvbW1lbnRzLnByb3RvdHlwZS5zaG93RXJyb3IgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0LmNsb3Nlc3QoJ2xpLmFuc3dlciwgbGkuY29tbWVudCcpLmZhZGVJbignZmFzdCcpXG4gICAgICAgICAgICAuZmluZCgnLmNvbW1lbnQtYm9keTpmaXJzdCcpLmFwcGVuZCgnPHNtYWxsIGNsYXNzPVwidGV4dC1kYW5nZXJcIj4nICsgTXVuaWNpcGlvTGFuZy5tZXNzYWdlcy5vbkVycm9yICsgJzwvc21hbGw+JylcbiAgICAgICAgICAgICAgICAuZmluZCgnLnRleHQtZGFuZ2VyJykuZGVsYXkoNDAwMCkuZmFkZU91dCgnZmFzdCcpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IENvbW1lbnRzKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oKXtmdW5jdGlvbiBhYShhLGIsYyl7cmV0dXJuIGEuY2FsbC5hcHBseShhLmJpbmQsYXJndW1lbnRzKX1mdW5jdGlvbiBiYShhLGIsYyl7aWYoIWEpdGhyb3cgRXJyb3IoKTtpZigyPGFyZ3VtZW50cy5sZW5ndGgpe3ZhciBkPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywyKTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO0FycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGMsZCk7cmV0dXJuIGEuYXBwbHkoYixjKX19cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYixhcmd1bWVudHMpfX1mdW5jdGlvbiBwKGEsYixjKXtwPUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kJiYtMSE9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQudG9TdHJpbmcoKS5pbmRleE9mKFwibmF0aXZlIGNvZGVcIik/YWE6YmE7cmV0dXJuIHAuYXBwbHkobnVsbCxhcmd1bWVudHMpfXZhciBxPURhdGUubm93fHxmdW5jdGlvbigpe3JldHVybituZXcgRGF0ZX07ZnVuY3Rpb24gY2EoYSxiKXt0aGlzLmE9YTt0aGlzLm09Ynx8YTt0aGlzLmM9dGhpcy5tLmRvY3VtZW50fXZhciBkYT0hIXdpbmRvdy5Gb250RmFjZTtmdW5jdGlvbiB0KGEsYixjLGQpe2I9YS5jLmNyZWF0ZUVsZW1lbnQoYik7aWYoYylmb3IodmFyIGUgaW4gYyljLmhhc093blByb3BlcnR5KGUpJiYoXCJzdHlsZVwiPT1lP2Iuc3R5bGUuY3NzVGV4dD1jW2VdOmIuc2V0QXR0cmlidXRlKGUsY1tlXSkpO2QmJmIuYXBwZW5kQ2hpbGQoYS5jLmNyZWF0ZVRleHROb2RlKGQpKTtyZXR1cm4gYn1mdW5jdGlvbiB1KGEsYixjKXthPWEuYy5nZXRFbGVtZW50c0J5VGFnTmFtZShiKVswXTthfHwoYT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO2EuaW5zZXJ0QmVmb3JlKGMsYS5sYXN0Q2hpbGQpfWZ1bmN0aW9uIHYoYSl7YS5wYXJlbnROb2RlJiZhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYSl9XG5mdW5jdGlvbiB3KGEsYixjKXtiPWJ8fFtdO2M9Y3x8W107Zm9yKHZhciBkPWEuY2xhc3NOYW1lLnNwbGl0KC9cXHMrLyksZT0wO2U8Yi5sZW5ndGg7ZSs9MSl7Zm9yKHZhciBmPSExLGc9MDtnPGQubGVuZ3RoO2crPTEpaWYoYltlXT09PWRbZ10pe2Y9ITA7YnJlYWt9Znx8ZC5wdXNoKGJbZV0pfWI9W107Zm9yKGU9MDtlPGQubGVuZ3RoO2UrPTEpe2Y9ITE7Zm9yKGc9MDtnPGMubGVuZ3RoO2crPTEpaWYoZFtlXT09PWNbZ10pe2Y9ITA7YnJlYWt9Znx8Yi5wdXNoKGRbZV0pfWEuY2xhc3NOYW1lPWIuam9pbihcIiBcIikucmVwbGFjZSgvXFxzKy9nLFwiIFwiKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sXCJcIil9ZnVuY3Rpb24geShhLGIpe2Zvcih2YXIgYz1hLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy8pLGQ9MCxlPWMubGVuZ3RoO2Q8ZTtkKyspaWYoY1tkXT09YilyZXR1cm4hMDtyZXR1cm4hMX1cbmZ1bmN0aW9uIHooYSl7aWYoXCJzdHJpbmdcIj09PXR5cGVvZiBhLmYpcmV0dXJuIGEuZjt2YXIgYj1hLm0ubG9jYXRpb24ucHJvdG9jb2w7XCJhYm91dDpcIj09YiYmKGI9YS5hLmxvY2F0aW9uLnByb3RvY29sKTtyZXR1cm5cImh0dHBzOlwiPT1iP1wiaHR0cHM6XCI6XCJodHRwOlwifWZ1bmN0aW9uIGVhKGEpe3JldHVybiBhLm0ubG9jYXRpb24uaG9zdG5hbWV8fGEuYS5sb2NhdGlvbi5ob3N0bmFtZX1cbmZ1bmN0aW9uIEEoYSxiLGMpe2Z1bmN0aW9uIGQoKXtrJiZlJiZmJiYoayhnKSxrPW51bGwpfWI9dChhLFwibGlua1wiLHtyZWw6XCJzdHlsZXNoZWV0XCIsaHJlZjpiLG1lZGlhOlwiYWxsXCJ9KTt2YXIgZT0hMSxmPSEwLGc9bnVsbCxrPWN8fG51bGw7ZGE/KGIub25sb2FkPWZ1bmN0aW9uKCl7ZT0hMDtkKCl9LGIub25lcnJvcj1mdW5jdGlvbigpe2U9ITA7Zz1FcnJvcihcIlN0eWxlc2hlZXQgZmFpbGVkIHRvIGxvYWRcIik7ZCgpfSk6c2V0VGltZW91dChmdW5jdGlvbigpe2U9ITA7ZCgpfSwwKTt1KGEsXCJoZWFkXCIsYil9XG5mdW5jdGlvbiBCKGEsYixjLGQpe3ZhciBlPWEuYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07aWYoZSl7dmFyIGY9dChhLFwic2NyaXB0XCIse3NyYzpifSksZz0hMTtmLm9ubG9hZD1mLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2d8fHRoaXMucmVhZHlTdGF0ZSYmXCJsb2FkZWRcIiE9dGhpcy5yZWFkeVN0YXRlJiZcImNvbXBsZXRlXCIhPXRoaXMucmVhZHlTdGF0ZXx8KGc9ITAsYyYmYyhudWxsKSxmLm9ubG9hZD1mLm9ucmVhZHlzdGF0ZWNoYW5nZT1udWxsLFwiSEVBRFwiPT1mLnBhcmVudE5vZGUudGFnTmFtZSYmZS5yZW1vdmVDaGlsZChmKSl9O2UuYXBwZW5kQ2hpbGQoZik7c2V0VGltZW91dChmdW5jdGlvbigpe2d8fChnPSEwLGMmJmMoRXJyb3IoXCJTY3JpcHQgbG9hZCB0aW1lb3V0XCIpKSl9LGR8fDVFMyk7cmV0dXJuIGZ9cmV0dXJuIG51bGx9O2Z1bmN0aW9uIEMoKXt0aGlzLmE9MDt0aGlzLmM9bnVsbH1mdW5jdGlvbiBEKGEpe2EuYSsrO3JldHVybiBmdW5jdGlvbigpe2EuYS0tO0UoYSl9fWZ1bmN0aW9uIEYoYSxiKXthLmM9YjtFKGEpfWZ1bmN0aW9uIEUoYSl7MD09YS5hJiZhLmMmJihhLmMoKSxhLmM9bnVsbCl9O2Z1bmN0aW9uIEcoYSl7dGhpcy5hPWF8fFwiLVwifUcucHJvdG90eXBlLmM9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVtdLGM9MDtjPGFyZ3VtZW50cy5sZW5ndGg7YysrKWIucHVzaChhcmd1bWVudHNbY10ucmVwbGFjZSgvW1xcV19dKy9nLFwiXCIpLnRvTG93ZXJDYXNlKCkpO3JldHVybiBiLmpvaW4odGhpcy5hKX07ZnVuY3Rpb24gSChhLGIpe3RoaXMuYz1hO3RoaXMuZj00O3RoaXMuYT1cIm5cIjt2YXIgYz0oYnx8XCJuNFwiKS5tYXRjaCgvXihbbmlvXSkoWzEtOV0pJC9pKTtjJiYodGhpcy5hPWNbMV0sdGhpcy5mPXBhcnNlSW50KGNbMl0sMTApKX1mdW5jdGlvbiBmYShhKXtyZXR1cm4gSShhKStcIiBcIisoYS5mK1wiMDBcIikrXCIgMzAwcHggXCIrSihhLmMpfWZ1bmN0aW9uIEooYSl7dmFyIGI9W107YT1hLnNwbGl0KC8sXFxzKi8pO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7YysrKXt2YXIgZD1hW2NdLnJlcGxhY2UoL1snXCJdL2csXCJcIik7LTEhPWQuaW5kZXhPZihcIiBcIil8fC9eXFxkLy50ZXN0KGQpP2IucHVzaChcIidcIitkK1wiJ1wiKTpiLnB1c2goZCl9cmV0dXJuIGIuam9pbihcIixcIil9ZnVuY3Rpb24gSyhhKXtyZXR1cm4gYS5hK2EuZn1mdW5jdGlvbiBJKGEpe3ZhciBiPVwibm9ybWFsXCI7XCJvXCI9PT1hLmE/Yj1cIm9ibGlxdWVcIjpcImlcIj09PWEuYSYmKGI9XCJpdGFsaWNcIik7cmV0dXJuIGJ9XG5mdW5jdGlvbiBnYShhKXt2YXIgYj00LGM9XCJuXCIsZD1udWxsO2EmJigoZD1hLm1hdGNoKC8obm9ybWFsfG9ibGlxdWV8aXRhbGljKS9pKSkmJmRbMV0mJihjPWRbMV0uc3Vic3RyKDAsMSkudG9Mb3dlckNhc2UoKSksKGQ9YS5tYXRjaCgvKFsxLTldMDB8bm9ybWFsfGJvbGQpL2kpKSYmZFsxXSYmKC9ib2xkL2kudGVzdChkWzFdKT9iPTc6L1sxLTldMDAvLnRlc3QoZFsxXSkmJihiPXBhcnNlSW50KGRbMV0uc3Vic3RyKDAsMSksMTApKSkpO3JldHVybiBjK2J9O2Z1bmN0aW9uIGhhKGEsYil7dGhpcy5jPWE7dGhpcy5mPWEubS5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7dGhpcy5oPWI7dGhpcy5hPW5ldyBHKFwiLVwiKTt0aGlzLmo9ITEhPT1iLmV2ZW50czt0aGlzLmc9ITEhPT1iLmNsYXNzZXN9ZnVuY3Rpb24gaWEoYSl7YS5nJiZ3KGEuZixbYS5hLmMoXCJ3ZlwiLFwibG9hZGluZ1wiKV0pO0woYSxcImxvYWRpbmdcIil9ZnVuY3Rpb24gTShhKXtpZihhLmcpe3ZhciBiPXkoYS5mLGEuYS5jKFwid2ZcIixcImFjdGl2ZVwiKSksYz1bXSxkPVthLmEuYyhcIndmXCIsXCJsb2FkaW5nXCIpXTtifHxjLnB1c2goYS5hLmMoXCJ3ZlwiLFwiaW5hY3RpdmVcIikpO3coYS5mLGMsZCl9TChhLFwiaW5hY3RpdmVcIil9ZnVuY3Rpb24gTChhLGIsYyl7aWYoYS5qJiZhLmhbYl0paWYoYylhLmhbYl0oYy5jLEsoYykpO2Vsc2UgYS5oW2JdKCl9O2Z1bmN0aW9uIGphKCl7dGhpcy5jPXt9fWZ1bmN0aW9uIGthKGEsYixjKXt2YXIgZD1bXSxlO2ZvcihlIGluIGIpaWYoYi5oYXNPd25Qcm9wZXJ0eShlKSl7dmFyIGY9YS5jW2VdO2YmJmQucHVzaChmKGJbZV0sYykpfXJldHVybiBkfTtmdW5jdGlvbiBOKGEsYil7dGhpcy5jPWE7dGhpcy5mPWI7dGhpcy5hPXQodGhpcy5jLFwic3BhblwiLHtcImFyaWEtaGlkZGVuXCI6XCJ0cnVlXCJ9LHRoaXMuZil9ZnVuY3Rpb24gTyhhKXt1KGEuYyxcImJvZHlcIixhLmEpfWZ1bmN0aW9uIFAoYSl7cmV0dXJuXCJkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO3RvcDotOTk5OXB4O2xlZnQ6LTk5OTlweDtmb250LXNpemU6MzAwcHg7d2lkdGg6YXV0bztoZWlnaHQ6YXV0bztsaW5lLWhlaWdodDpub3JtYWw7bWFyZ2luOjA7cGFkZGluZzowO2ZvbnQtdmFyaWFudDpub3JtYWw7d2hpdGUtc3BhY2U6bm93cmFwO2ZvbnQtZmFtaWx5OlwiK0ooYS5jKStcIjtcIisoXCJmb250LXN0eWxlOlwiK0koYSkrXCI7Zm9udC13ZWlnaHQ6XCIrKGEuZitcIjAwXCIpK1wiO1wiKX07ZnVuY3Rpb24gUShhLGIsYyxkLGUsZil7dGhpcy5nPWE7dGhpcy5qPWI7dGhpcy5hPWQ7dGhpcy5jPWM7dGhpcy5mPWV8fDNFMzt0aGlzLmg9Znx8dm9pZCAwfVEucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5jLm0uZG9jdW1lbnQsYj10aGlzLGM9cSgpLGQ9bmV3IFByb21pc2UoZnVuY3Rpb24oZCxlKXtmdW5jdGlvbiBrKCl7cSgpLWM+PWIuZj9lKCk6YS5mb250cy5sb2FkKGZhKGIuYSksYi5oKS50aGVuKGZ1bmN0aW9uKGEpezE8PWEubGVuZ3RoP2QoKTpzZXRUaW1lb3V0KGssMjUpfSxmdW5jdGlvbigpe2UoKX0pfWsoKX0pLGU9bmV3IFByb21pc2UoZnVuY3Rpb24oYSxkKXtzZXRUaW1lb3V0KGQsYi5mKX0pO1Byb21pc2UucmFjZShbZSxkXSkudGhlbihmdW5jdGlvbigpe2IuZyhiLmEpfSxmdW5jdGlvbigpe2IuaihiLmEpfSl9O2Z1bmN0aW9uIFIoYSxiLGMsZCxlLGYsZyl7dGhpcy52PWE7dGhpcy5CPWI7dGhpcy5jPWM7dGhpcy5hPWQ7dGhpcy5zPWd8fFwiQkVTYnN3eVwiO3RoaXMuZj17fTt0aGlzLnc9ZXx8M0UzO3RoaXMudT1mfHxudWxsO3RoaXMubz10aGlzLmo9dGhpcy5oPXRoaXMuZz1udWxsO3RoaXMuZz1uZXcgTih0aGlzLmMsdGhpcy5zKTt0aGlzLmg9bmV3IE4odGhpcy5jLHRoaXMucyk7dGhpcy5qPW5ldyBOKHRoaXMuYyx0aGlzLnMpO3RoaXMubz1uZXcgTih0aGlzLmMsdGhpcy5zKTthPW5ldyBIKHRoaXMuYS5jK1wiLHNlcmlmXCIsSyh0aGlzLmEpKTthPVAoYSk7dGhpcy5nLmEuc3R5bGUuY3NzVGV4dD1hO2E9bmV3IEgodGhpcy5hLmMrXCIsc2Fucy1zZXJpZlwiLEsodGhpcy5hKSk7YT1QKGEpO3RoaXMuaC5hLnN0eWxlLmNzc1RleHQ9YTthPW5ldyBIKFwic2VyaWZcIixLKHRoaXMuYSkpO2E9UChhKTt0aGlzLmouYS5zdHlsZS5jc3NUZXh0PWE7YT1uZXcgSChcInNhbnMtc2VyaWZcIixLKHRoaXMuYSkpO2E9XG5QKGEpO3RoaXMuby5hLnN0eWxlLmNzc1RleHQ9YTtPKHRoaXMuZyk7Tyh0aGlzLmgpO08odGhpcy5qKTtPKHRoaXMubyl9dmFyIFM9e0Q6XCJzZXJpZlwiLEM6XCJzYW5zLXNlcmlmXCJ9LFQ9bnVsbDtmdW5jdGlvbiBVKCl7aWYobnVsbD09PVQpe3ZhciBhPS9BcHBsZVdlYktpdFxcLyhbMC05XSspKD86XFwuKFswLTldKykpLy5leGVjKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KTtUPSEhYSYmKDUzNj5wYXJzZUludChhWzFdLDEwKXx8NTM2PT09cGFyc2VJbnQoYVsxXSwxMCkmJjExPj1wYXJzZUludChhWzJdLDEwKSl9cmV0dXJuIFR9Ui5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmYuc2VyaWY9dGhpcy5qLmEub2Zmc2V0V2lkdGg7dGhpcy5mW1wic2Fucy1zZXJpZlwiXT10aGlzLm8uYS5vZmZzZXRXaWR0aDt0aGlzLkE9cSgpO2xhKHRoaXMpfTtcbmZ1bmN0aW9uIG1hKGEsYixjKXtmb3IodmFyIGQgaW4gUylpZihTLmhhc093blByb3BlcnR5KGQpJiZiPT09YS5mW1NbZF1dJiZjPT09YS5mW1NbZF1dKXJldHVybiEwO3JldHVybiExfWZ1bmN0aW9uIGxhKGEpe3ZhciBiPWEuZy5hLm9mZnNldFdpZHRoLGM9YS5oLmEub2Zmc2V0V2lkdGgsZDsoZD1iPT09YS5mLnNlcmlmJiZjPT09YS5mW1wic2Fucy1zZXJpZlwiXSl8fChkPVUoKSYmbWEoYSxiLGMpKTtkP3EoKS1hLkE+PWEudz9VKCkmJm1hKGEsYixjKSYmKG51bGw9PT1hLnV8fGEudS5oYXNPd25Qcm9wZXJ0eShhLmEuYykpP1YoYSxhLnYpOlYoYSxhLkIpOm5hKGEpOlYoYSxhLnYpfWZ1bmN0aW9uIG5hKGEpe3NldFRpbWVvdXQocChmdW5jdGlvbigpe2xhKHRoaXMpfSxhKSw1MCl9ZnVuY3Rpb24gVihhLGIpe3NldFRpbWVvdXQocChmdW5jdGlvbigpe3YodGhpcy5nLmEpO3YodGhpcy5oLmEpO3YodGhpcy5qLmEpO3YodGhpcy5vLmEpO2IodGhpcy5hKX0sYSksMCl9O2Z1bmN0aW9uIFcoYSxiLGMpe3RoaXMuYz1hO3RoaXMuYT1iO3RoaXMuZj0wO3RoaXMubz10aGlzLmo9ITE7dGhpcy5zPWN9dmFyIFg9bnVsbDtXLnByb3RvdHlwZS5nPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuYTtiLmcmJncoYi5mLFtiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImFjdGl2ZVwiKV0sW2IuYS5jKFwid2ZcIixhLmMsSyhhKS50b1N0cmluZygpLFwibG9hZGluZ1wiKSxiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImluYWN0aXZlXCIpXSk7TChiLFwiZm9udGFjdGl2ZVwiLGEpO3RoaXMubz0hMDtvYSh0aGlzKX07XG5XLnByb3RvdHlwZS5oPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuYTtpZihiLmcpe3ZhciBjPXkoYi5mLGIuYS5jKFwid2ZcIixhLmMsSyhhKS50b1N0cmluZygpLFwiYWN0aXZlXCIpKSxkPVtdLGU9W2IuYS5jKFwid2ZcIixhLmMsSyhhKS50b1N0cmluZygpLFwibG9hZGluZ1wiKV07Y3x8ZC5wdXNoKGIuYS5jKFwid2ZcIixhLmMsSyhhKS50b1N0cmluZygpLFwiaW5hY3RpdmVcIikpO3coYi5mLGQsZSl9TChiLFwiZm9udGluYWN0aXZlXCIsYSk7b2EodGhpcyl9O2Z1bmN0aW9uIG9hKGEpezA9PS0tYS5mJiZhLmomJihhLm8/KGE9YS5hLGEuZyYmdyhhLmYsW2EuYS5jKFwid2ZcIixcImFjdGl2ZVwiKV0sW2EuYS5jKFwid2ZcIixcImxvYWRpbmdcIiksYS5hLmMoXCJ3ZlwiLFwiaW5hY3RpdmVcIildKSxMKGEsXCJhY3RpdmVcIikpOk0oYS5hKSl9O2Z1bmN0aW9uIHBhKGEpe3RoaXMuaj1hO3RoaXMuYT1uZXcgamE7dGhpcy5oPTA7dGhpcy5mPXRoaXMuZz0hMH1wYS5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhKXt0aGlzLmM9bmV3IGNhKHRoaXMuaixhLmNvbnRleHR8fHRoaXMuaik7dGhpcy5nPSExIT09YS5ldmVudHM7dGhpcy5mPSExIT09YS5jbGFzc2VzO3FhKHRoaXMsbmV3IGhhKHRoaXMuYyxhKSxhKX07XG5mdW5jdGlvbiByYShhLGIsYyxkLGUpe3ZhciBmPTA9PS0tYS5oOyhhLmZ8fGEuZykmJnNldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgYT1lfHxudWxsLGs9ZHx8bnVsbHx8e307aWYoMD09PWMubGVuZ3RoJiZmKU0oYi5hKTtlbHNle2IuZis9Yy5sZW5ndGg7ZiYmKGIuaj1mKTt2YXIgaCxtPVtdO2ZvcihoPTA7aDxjLmxlbmd0aDtoKyspe3ZhciBsPWNbaF0sbj1rW2wuY10scj1iLmEseD1sO3IuZyYmdyhyLmYsW3IuYS5jKFwid2ZcIix4LmMsSyh4KS50b1N0cmluZygpLFwibG9hZGluZ1wiKV0pO0wocixcImZvbnRsb2FkaW5nXCIseCk7cj1udWxsO251bGw9PT1YJiYoWD13aW5kb3cuRm9udEZhY2U/KHg9L0dlY2tvLipGaXJlZm94XFwvKFxcZCspLy5leGVjKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KSk/NDI8cGFyc2VJbnQoeFsxXSwxMCk6ITA6ITEpO1g/cj1uZXcgUShwKGIuZyxiKSxwKGIuaCxiKSxiLmMsbCxiLnMsbik6cj1uZXcgUihwKGIuZyxiKSxwKGIuaCxiKSxiLmMsbCxiLnMsYSxcbm4pO20ucHVzaChyKX1mb3IoaD0wO2g8bS5sZW5ndGg7aCsrKW1baF0uc3RhcnQoKX19LDApfWZ1bmN0aW9uIHFhKGEsYixjKXt2YXIgZD1bXSxlPWMudGltZW91dDtpYShiKTt2YXIgZD1rYShhLmEsYyxhLmMpLGY9bmV3IFcoYS5jLGIsZSk7YS5oPWQubGVuZ3RoO2I9MDtmb3IoYz1kLmxlbmd0aDtiPGM7YisrKWRbYl0ubG9hZChmdW5jdGlvbihiLGQsYyl7cmEoYSxmLGIsZCxjKX0pfTtmdW5jdGlvbiBzYShhLGIpe3RoaXMuYz1hO3RoaXMuYT1ifWZ1bmN0aW9uIHRhKGEsYixjKXt2YXIgZD16KGEuYyk7YT0oYS5hLmFwaXx8XCJmYXN0LmZvbnRzLm5ldC9qc2FwaVwiKS5yZXBsYWNlKC9eLipodHRwKHM/KTooXFwvXFwvKT8vLFwiXCIpO3JldHVybiBkK1wiLy9cIithK1wiL1wiK2IrXCIuanNcIisoYz9cIj92PVwiK2M6XCJcIil9XG5zYS5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7aWYoZltcIl9fbXRpX2ZudExzdFwiK2RdKXt2YXIgYz1mW1wiX19tdGlfZm50THN0XCIrZF0oKSxlPVtdLGg7aWYoYylmb3IodmFyIG09MDttPGMubGVuZ3RoO20rKyl7dmFyIGw9Y1ttXS5mb250ZmFtaWx5O3ZvaWQgMCE9Y1ttXS5mb250U3R5bGUmJnZvaWQgMCE9Y1ttXS5mb250V2VpZ2h0PyhoPWNbbV0uZm9udFN0eWxlK2NbbV0uZm9udFdlaWdodCxlLnB1c2gobmV3IEgobCxoKSkpOmUucHVzaChuZXcgSChsKSl9YShlKX1lbHNlIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtiKCl9LDUwKX12YXIgYz10aGlzLGQ9Yy5hLnByb2plY3RJZCxlPWMuYS52ZXJzaW9uO2lmKGQpe3ZhciBmPWMuYy5tO0IodGhpcy5jLHRhKGMsZCxlKSxmdW5jdGlvbihlKXtlP2EoW10pOihmW1wiX19Nb25vdHlwZUNvbmZpZ3VyYXRpb25fX1wiK2RdPWZ1bmN0aW9uKCl7cmV0dXJuIGMuYX0sYigpKX0pLmlkPVwiX19Nb25vdHlwZUFQSVNjcmlwdF9fXCIrXG5kfWVsc2UgYShbXSl9O2Z1bmN0aW9uIHVhKGEsYil7dGhpcy5jPWE7dGhpcy5hPWJ9dWEucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPXRoaXMuYS51cmxzfHxbXSxlPXRoaXMuYS5mYW1pbGllc3x8W10sZj10aGlzLmEudGVzdFN0cmluZ3N8fHt9LGc9bmV3IEM7Yj0wO2ZvcihjPWQubGVuZ3RoO2I8YztiKyspQSh0aGlzLmMsZFtiXSxEKGcpKTt2YXIgaz1bXTtiPTA7Zm9yKGM9ZS5sZW5ndGg7YjxjO2IrKylpZihkPWVbYl0uc3BsaXQoXCI6XCIpLGRbMV0pZm9yKHZhciBoPWRbMV0uc3BsaXQoXCIsXCIpLG09MDttPGgubGVuZ3RoO20rPTEpay5wdXNoKG5ldyBIKGRbMF0saFttXSkpO2Vsc2Ugay5wdXNoKG5ldyBIKGRbMF0pKTtGKGcsZnVuY3Rpb24oKXthKGssZil9KX07ZnVuY3Rpb24gdmEoYSxiLGMpe2E/dGhpcy5jPWE6dGhpcy5jPWIrd2E7dGhpcy5hPVtdO3RoaXMuZj1bXTt0aGlzLmc9Y3x8XCJcIn12YXIgd2E9XCIvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzc1wiO2Z1bmN0aW9uIHhhKGEsYil7Zm9yKHZhciBjPWIubGVuZ3RoLGQ9MDtkPGM7ZCsrKXt2YXIgZT1iW2RdLnNwbGl0KFwiOlwiKTszPT1lLmxlbmd0aCYmYS5mLnB1c2goZS5wb3AoKSk7dmFyIGY9XCJcIjsyPT1lLmxlbmd0aCYmXCJcIiE9ZVsxXSYmKGY9XCI6XCIpO2EuYS5wdXNoKGUuam9pbihmKSl9fVxuZnVuY3Rpb24geWEoYSl7aWYoMD09YS5hLmxlbmd0aCl0aHJvdyBFcnJvcihcIk5vIGZvbnRzIHRvIGxvYWQhXCIpO2lmKC0xIT1hLmMuaW5kZXhPZihcImtpdD1cIikpcmV0dXJuIGEuYztmb3IodmFyIGI9YS5hLmxlbmd0aCxjPVtdLGQ9MDtkPGI7ZCsrKWMucHVzaChhLmFbZF0ucmVwbGFjZSgvIC9nLFwiK1wiKSk7Yj1hLmMrXCI/ZmFtaWx5PVwiK2Muam9pbihcIiU3Q1wiKTswPGEuZi5sZW5ndGgmJihiKz1cIiZzdWJzZXQ9XCIrYS5mLmpvaW4oXCIsXCIpKTswPGEuZy5sZW5ndGgmJihiKz1cIiZ0ZXh0PVwiK2VuY29kZVVSSUNvbXBvbmVudChhLmcpKTtyZXR1cm4gYn07ZnVuY3Rpb24gemEoYSl7dGhpcy5mPWE7dGhpcy5hPVtdO3RoaXMuYz17fX1cbnZhciBBYT17bGF0aW46XCJCRVNic3d5XCIsXCJsYXRpbi1leHRcIjpcIlxcdTAwZTdcXHUwMGY2XFx1MDBmY1xcdTAxMWZcXHUwMTVmXCIsY3lyaWxsaWM6XCJcXHUwNDM5XFx1MDQ0ZlxcdTA0MTZcIixncmVlazpcIlxcdTAzYjFcXHUwM2IyXFx1MDNhM1wiLGtobWVyOlwiXFx1MTc4MFxcdTE3ODFcXHUxNzgyXCIsSGFudW1hbjpcIlxcdTE3ODBcXHUxNzgxXFx1MTc4MlwifSxCYT17dGhpbjpcIjFcIixleHRyYWxpZ2h0OlwiMlwiLFwiZXh0cmEtbGlnaHRcIjpcIjJcIix1bHRyYWxpZ2h0OlwiMlwiLFwidWx0cmEtbGlnaHRcIjpcIjJcIixsaWdodDpcIjNcIixyZWd1bGFyOlwiNFwiLGJvb2s6XCI0XCIsbWVkaXVtOlwiNVwiLFwic2VtaS1ib2xkXCI6XCI2XCIsc2VtaWJvbGQ6XCI2XCIsXCJkZW1pLWJvbGRcIjpcIjZcIixkZW1pYm9sZDpcIjZcIixib2xkOlwiN1wiLFwiZXh0cmEtYm9sZFwiOlwiOFwiLGV4dHJhYm9sZDpcIjhcIixcInVsdHJhLWJvbGRcIjpcIjhcIix1bHRyYWJvbGQ6XCI4XCIsYmxhY2s6XCI5XCIsaGVhdnk6XCI5XCIsbDpcIjNcIixyOlwiNFwiLGI6XCI3XCJ9LENhPXtpOlwiaVwiLGl0YWxpYzpcImlcIixuOlwiblwiLG5vcm1hbDpcIm5cIn0sXG5EYT0vXih0aGlufCg/Oig/OmV4dHJhfHVsdHJhKS0/KT9saWdodHxyZWd1bGFyfGJvb2t8bWVkaXVtfCg/Oig/OnNlbWl8ZGVtaXxleHRyYXx1bHRyYSktPyk/Ym9sZHxibGFja3xoZWF2eXxsfHJ8YnxbMS05XTAwKT8obnxpfG5vcm1hbHxpdGFsaWMpPyQvO1xuZnVuY3Rpb24gRWEoYSl7Zm9yKHZhciBiPWEuZi5sZW5ndGgsYz0wO2M8YjtjKyspe3ZhciBkPWEuZltjXS5zcGxpdChcIjpcIiksZT1kWzBdLnJlcGxhY2UoL1xcKy9nLFwiIFwiKSxmPVtcIm40XCJdO2lmKDI8PWQubGVuZ3RoKXt2YXIgZzt2YXIgaz1kWzFdO2c9W107aWYoaylmb3IodmFyIGs9ay5zcGxpdChcIixcIiksaD1rLmxlbmd0aCxtPTA7bTxoO20rKyl7dmFyIGw7bD1rW21dO2lmKGwubWF0Y2goL15bXFx3LV0rJC8pKXt2YXIgbj1EYS5leGVjKGwudG9Mb3dlckNhc2UoKSk7aWYobnVsbD09bilsPVwiXCI7ZWxzZXtsPW5bMl07bD1udWxsPT1sfHxcIlwiPT1sP1wiblwiOkNhW2xdO249blsxXTtpZihudWxsPT1ufHxcIlwiPT1uKW49XCI0XCI7ZWxzZSB2YXIgcj1CYVtuXSxuPXI/cjppc05hTihuKT9cIjRcIjpuLnN1YnN0cigwLDEpO2w9W2wsbl0uam9pbihcIlwiKX19ZWxzZSBsPVwiXCI7bCYmZy5wdXNoKGwpfTA8Zy5sZW5ndGgmJihmPWcpOzM9PWQubGVuZ3RoJiYoZD1kWzJdLGc9W10sZD1kP2Quc3BsaXQoXCIsXCIpOlxuZywwPGQubGVuZ3RoJiYoZD1BYVtkWzBdXSkmJihhLmNbZV09ZCkpfWEuY1tlXXx8KGQ9QWFbZV0pJiYoYS5jW2VdPWQpO2ZvcihkPTA7ZDxmLmxlbmd0aDtkKz0xKWEuYS5wdXNoKG5ldyBIKGUsZltkXSkpfX07ZnVuY3Rpb24gRmEoYSxiKXt0aGlzLmM9YTt0aGlzLmE9Yn12YXIgR2E9e0FyaW1vOiEwLENvdXNpbmU6ITAsVGlub3M6ITB9O0ZhLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBDLGM9dGhpcy5jLGQ9bmV3IHZhKHRoaXMuYS5hcGkseihjKSx0aGlzLmEudGV4dCksZT10aGlzLmEuZmFtaWxpZXM7eGEoZCxlKTt2YXIgZj1uZXcgemEoZSk7RWEoZik7QShjLHlhKGQpLEQoYikpO0YoYixmdW5jdGlvbigpe2EoZi5hLGYuYyxHYSl9KX07ZnVuY3Rpb24gSGEoYSxiKXt0aGlzLmM9YTt0aGlzLmE9Yn1IYS5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmEuaWQsYz10aGlzLmMubTtiP0IodGhpcy5jLCh0aGlzLmEuYXBpfHxcImh0dHBzOi8vdXNlLnR5cGVraXQubmV0XCIpK1wiL1wiK2IrXCIuanNcIixmdW5jdGlvbihiKXtpZihiKWEoW10pO2Vsc2UgaWYoYy5UeXBla2l0JiZjLlR5cGVraXQuY29uZmlnJiZjLlR5cGVraXQuY29uZmlnLmZuKXtiPWMuVHlwZWtpdC5jb25maWcuZm47Zm9yKHZhciBlPVtdLGY9MDtmPGIubGVuZ3RoO2YrPTIpZm9yKHZhciBnPWJbZl0saz1iW2YrMV0saD0wO2g8ay5sZW5ndGg7aCsrKWUucHVzaChuZXcgSChnLGtbaF0pKTt0cnl7Yy5UeXBla2l0LmxvYWQoe2V2ZW50czohMSxjbGFzc2VzOiExLGFzeW5jOiEwfSl9Y2F0Y2gobSl7fWEoZSl9fSwyRTMpOmEoW10pfTtmdW5jdGlvbiBJYShhLGIpe3RoaXMuYz1hO3RoaXMuZj1iO3RoaXMuYT1bXX1JYS5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmYuaWQsYz10aGlzLmMubSxkPXRoaXM7Yj8oYy5fX3dlYmZvbnRmb250ZGVja21vZHVsZV9ffHwoYy5fX3dlYmZvbnRmb250ZGVja21vZHVsZV9fPXt9KSxjLl9fd2ViZm9udGZvbnRkZWNrbW9kdWxlX19bYl09ZnVuY3Rpb24oYixjKXtmb3IodmFyIGc9MCxrPWMuZm9udHMubGVuZ3RoO2c8azsrK2cpe3ZhciBoPWMuZm9udHNbZ107ZC5hLnB1c2gobmV3IEgoaC5uYW1lLGdhKFwiZm9udC13ZWlnaHQ6XCIraC53ZWlnaHQrXCI7Zm9udC1zdHlsZTpcIitoLnN0eWxlKSkpfWEoZC5hKX0sQih0aGlzLmMseih0aGlzLmMpKyh0aGlzLmYuYXBpfHxcIi8vZi5mb250ZGVjay5jb20vcy9jc3MvanMvXCIpK2VhKHRoaXMuYykrXCIvXCIrYitcIi5qc1wiLGZ1bmN0aW9uKGIpe2ImJmEoW10pfSkpOmEoW10pfTt2YXIgWT1uZXcgcGEod2luZG93KTtZLmEuYy5jdXN0b209ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IHVhKGIsYSl9O1kuYS5jLmZvbnRkZWNrPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyBJYShiLGEpfTtZLmEuYy5tb25vdHlwZT1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgc2EoYixhKX07WS5hLmMudHlwZWtpdD1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgSGEoYixhKX07WS5hLmMuZ29vZ2xlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyBGYShiLGEpfTt2YXIgWj17bG9hZDpwKFkubG9hZCxZKX07XCJmdW5jdGlvblwiPT09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gWn0pOlwidW5kZWZpbmVkXCIhPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1aOih3aW5kb3cuV2ViRm9udD1aLHdpbmRvdy5XZWJGb250Q29uZmlnJiZZLmxvYWQod2luZG93LldlYkZvbnRDb25maWcpKTt9KCkpO1xuIiwiTXVuY2lwaW8gPSBNdW5jaXBpbyB8fCB7fTtcblxudmFyIGdvb2dsZVRyYW5zbGF0ZUxvYWRlZCA9IGZhbHNlO1xuXG5pZiAobG9jYXRpb24uaHJlZi5pbmRleE9mKCd0cmFuc2xhdGU9dHJ1ZScpID4gLTEpIHtcbiAgICBsb2FkR29vZ2xlVHJhbnNsYXRlKCk7XG59XG5cbiQoJ1tocmVmPVwiI3RyYW5zbGF0ZVwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgbG9hZEdvb2dsZVRyYW5zbGF0ZSgpO1xufSk7XG5cbmZ1bmN0aW9uIGdvb2dsZVRyYW5zbGF0ZUVsZW1lbnRJbml0KCkge1xuICAgIG5ldyBnb29nbGUudHJhbnNsYXRlLlRyYW5zbGF0ZUVsZW1lbnQoe1xuICAgICAgICBwYWdlTGFuZ3VhZ2U6IFwic3ZcIixcbiAgICAgICAgYXV0b0Rpc3BsYXk6IGZhbHNlLFxuICAgICAgICBnYVRyYWNrOiBIYmdQcmltZUFyZ3MuZ29vZ2xlVHJhbnNsYXRlLmdhVHJhY2ssXG4gICAgICAgIGdhSWQ6IEhiZ1ByaW1lQXJncy5nb29nbGVUcmFuc2xhdGUuZ2FVQVxuICAgIH0sIFwiZ29vZ2xlLXRyYW5zbGF0ZS1lbGVtZW50XCIpO1xufVxuXG5mdW5jdGlvbiBsb2FkR29vZ2xlVHJhbnNsYXRlKCkge1xuICAgIGlmIChnb29nbGVUcmFuc2xhdGVMb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICQuZ2V0U2NyaXB0KCcvL3RyYW5zbGF0ZS5nb29nbGUuY29tL3RyYW5zbGF0ZV9hL2VsZW1lbnQuanM/Y2I9Z29vZ2xlVHJhbnNsYXRlRWxlbWVudEluaXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnYScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGhyZWZVcmwgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZXh0ZXJuYWwgb3Igbm9uIHZhbGlkIHVybCAoZG8gbm90IGFkZCBxdWVyeXN0cmluZylcbiAgICAgICAgICAgIGlmIChocmVmVXJsID09IG51bGwgfHwgaHJlZlVybC5pbmRleE9mKGxvY2F0aW9uLm9yaWdpbikgPT09IC0xIHx8wqBocmVmVXJsLnN1YnN0cigwLCAxKSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBocmVmVXJsID0gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIoaHJlZlVybCwgJ3RyYW5zbGF0ZScsICd0cnVlJyk7XG5cbiAgICAgICAgICAgICQodGhpcykuYXR0cignaHJlZicsIGhyZWZVcmwpO1xuICAgICAgICB9KTtcblxuICAgICAgICBnb29nbGVUcmFuc2xhdGVMb2FkZWQgPSB0cnVlO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih1cmksIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiKFs/Jl0pXCIgKyBrZXkgKyBcIj0uKj8oJnwkKVwiLCBcImlcIik7XG4gICAgdmFyIHNlcGFyYXRvciA9IHVyaS5pbmRleE9mKCc/JykgIT09IC0xID8gXCImXCIgOiBcIj9cIjtcblxuICAgIGlmICh1cmkubWF0Y2gocmUpKSB7XG4gICAgICAgIHJldHVybiB1cmkucmVwbGFjZShyZSwgJyQxJyArIGtleSArIFwiPVwiICsgdmFsdWUgKyAnJDInKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXJpICsgc2VwYXJhdG9yICsga2V5ICsgXCI9XCIgKyB2YWx1ZTtcbn1cbiIsIk11bmljaXBpbyA9IE11bmljaXBpbyB8fCB7fTtcbk11bmljaXBpby5IZWxwZXIgPSBNdW5pY2lwaW8uSGVscGVyIHx8IHt9O1xuXG5NdW5pY2lwaW8uSGVscGVyLk1haW5Db250YWluZXIgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIE1haW5Db250YWluZXIoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFpbkNvbnRhaW5lcigpO1xuICAgIH1cblxuICAgIE1haW5Db250YWluZXIucHJvdG90eXBlLnJlbW92ZU1haW5Db250YWluZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCQudHJpbSgkKFwiI21haW4tY29udGVudFwiKS5odG1sKCkpID09ICcnKSB7XG4gICAgICAgICAgICAkKCcjbWFpbi1jb250ZW50JykucmVtb3ZlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTWFpbkNvbnRhaW5lcigpO1xuXG59KShqUXVlcnkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcbiAgICBpZiAodHlwZW9mIHRoZW1lQ29sb3JQYWxldHRlICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGpRdWVyeS53cC53cENvbG9yUGlja2VyLnByb3RvdHlwZS5vcHRpb25zID0ge1xuICAgICAgICAgICAgcGFsZXR0ZXM6IHRoZW1lQ29sb3JQYWxldHRlLmNvbG9yc1xuICAgICAgICB9O1xuICAgIH1cbn0pKGpRdWVyeSk7XG4iLCJ2YXIgTXVuaWNpcGlvID0ge307XG5cbmpRdWVyeSgnLmluZGV4LXBocCAjc2NyZWVuLW1ldGEtbGlua3MnKS5hcHBlbmQoJ1xcXG4gICAgPGRpdiBpZD1cInNjcmVlbi1vcHRpb25zLXNob3ctbGF0aHVuZC13cmFwXCIgY2xhc3M9XCJoaWRlLWlmLW5vLWpzIHNjcmVlbi1tZXRhLXRvZ2dsZVwiPlxcXG4gICAgICAgIDxhIGhyZWY9XCJodHRwOi8vbGF0aHVuZC5oZWxzaW5nYm9yZy5zZVwiIGlkPVwic2hvdy1sYXRodW5kXCIgdGFyZ2V0PVwiX2JsYW5rXCIgY2xhc3M9XCJidXR0b24gc2hvdy1zZXR0aW5nc1wiPkxhdGh1bmQ8L2E+XFxcbiAgICA8L2Rpdj5cXFxuJyk7XG5cbmpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIGpRdWVyeSgnLmFjZi1maWVsZC11cmwgaW5wdXRbdHlwZT1cInVybFwiXScpLnBhcmVudHMoJ2Zvcm0nKS5hdHRyKCdub3ZhbGlkYXRlJywgJ25vdmFsaWRhdGUnKTtcbn0pO1xuXG4iLCJNdW5jaXBpbyA9IE11bmNpcGlvIHx8IHt9O1xuTXVuY2lwaW8uQWpheCA9IE11bmNpcGlvLkFqYXggfHwge307XG5cbk11bmNpcGlvLkFqYXguTGlrZUJ1dHRvbiA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gTGlrZSgpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgTGlrZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdhLmxpa2UtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5hamF4Q2FsbChlLnRhcmdldCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIExpa2UucHJvdG90eXBlLmFqYXhDYWxsID0gZnVuY3Rpb24obGlrZUJ1dHRvbikge1xuICAgICAgICB2YXIgY29tbWVudF9pZCA9ICQobGlrZUJ1dHRvbikuZGF0YSgnY29tbWVudC1pZCcpO1xuICAgICAgICB2YXIgY291bnRlciA9ICQoJ3NwYW4jbGlrZS1jb3VudCcsIGxpa2VCdXR0b24pO1xuICAgICAgICB2YXIgYnV0dG9uID0gJChsaWtlQnV0dG9uKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsIDogbGlrZUJ1dHRvbkRhdGEuYWpheF91cmwsXG4gICAgICAgICAgICB0eXBlIDogJ3Bvc3QnLFxuICAgICAgICAgICAgZGF0YSA6IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24gOiAnYWpheExpa2VNZXRob2QnLFxuICAgICAgICAgICAgICAgIGNvbW1lbnRfaWQgOiBjb21tZW50X2lkLFxuICAgICAgICAgICAgICAgIG5vbmNlIDogbGlrZUJ1dHRvbkRhdGEubm9uY2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlrZXMgPSBjb3VudGVyLmh0bWwoKTtcblxuICAgICAgICAgICAgICAgIGlmKGJ1dHRvbi5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlrZXMtLTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGlrZXMrKztcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvdW50ZXIuaHRtbCggbGlrZXMgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzIDogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTGlrZSgpO1xuXG59KSgkKTtcbiIsIk11bmNpcGlvID0gTXVuY2lwaW8gfHwge307XG5NdW5jaXBpby5BamF4ID0gTXVuY2lwaW8uQWpheCB8fCB7fTtcblxuTXVuY2lwaW8uQWpheC5TaGFyZUVtYWlsID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBTaGFyZUVtYWlsKCkge1xuICAgICAgICAkKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBldmVudHNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFNoYXJlRW1haWwucHJvdG90eXBlLmhhbmRsZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsICcuc29jaWFsLXNoYXJlLWVtYWlsJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcmUoZSk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgU2hhcmVFbWFpbC5wcm90b3R5cGUuc2hhcmUgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIGRhdGEuYXBwZW5kKCdhY3Rpb24nLCAnc2hhcmVfZW1haWwnKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBhamF4dXJsLFxuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5tb2RhbC1mb290ZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwibG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcubm90aWNlJykuaGlkZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5wcmVwZW5kKCc8c3BhbiBjbGFzcz1cIm5vdGljZSBzdWNjZXNzIGd1dHRlciBndXR0ZXItbWFyZ2luIGd1dHRlci12ZXJ0aWNhbFwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1jaGVja1wiPjwvaT4gJyArIHJlc3BvbnNlLmRhdGEgKyAnPC9zcGFuPicpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5ub3RpY2UnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5wcmVwZW5kKCc8c3BhbiBjbGFzcz1cIm5vdGljZSB3YXJuaW5nIGd1dHRlciBndXR0ZXItbWFyZ2luIGd1dHRlci12ZXJ0aWNhbFwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1ub3RpY2Utd2FybmluZ1wiPjwvaT4gJyArIHJlc3BvbnNlLmRhdGEgKyAnPC9zcGFuPicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLmxvYWRpbmcnKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBTaGFyZUVtYWlsKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJNdW5jaXBpbyA9IE11bmNpcGlvIHx8IHt9O1xuTXVuY2lwaW8uQWpheCA9IE11bmNpcGlvLkFqYXggfHwge307XG5cbk11bmNpcGlvLkFqYXguU3VnZ2VzdGlvbnMgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciB0eXBpbmdUaW1lcjtcbiAgICB2YXIgbGFzdFRlcm07XG5cbiAgICBmdW5jdGlvbiBTdWdnZXN0aW9ucygpIHtcbiAgICAgICAgaWYgKCEkKCcjZmlsdGVyLWtleXdvcmQnKS5sZW5ndGggfHwgSGJnUHJpbWVBcmdzLmFwaS5wb3N0VHlwZVJlc3RVcmwgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnI2ZpbHRlci1rZXl3b3JkJykuYXR0cignYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICAgIH1cblxuICAgIFN1Z2dlc3Rpb25zLnByb3RvdHlwZS5oYW5kbGVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2tleWRvd24nLCAnI2ZpbHRlci1rZXl3b3JkJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpLFxuICAgICAgICAgICAgICAgICRzZWxlY3RlZCA9ICQoJy5zZWxlY3RlZCcsICcjc2VhcmNoLXN1Z2dlc3Rpb25zJyk7XG5cbiAgICAgICAgICAgIGlmICgkc2VsZWN0ZWQuc2libGluZ3MoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJCgnI3NlYXJjaC1zdWdnZXN0aW9ucyBsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDI3KSB7XG4gICAgICAgICAgICAgICAgLy8gS2V5IHByZXNzZWQ6IEVzY1xuICAgICAgICAgICAgICAgICQoJyNzZWFyY2gtc3VnZ2VzdGlvbnMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgICAgICAgICAgIC8vIEtleSBwcmVzc2VkOiBFbnRlclxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IDM4KSB7XG4gICAgICAgICAgICAgICAgLy8gS2V5IHByZXNzZWQ6IFVwXG4gICAgICAgICAgICAgICAgaWYgKCRzZWxlY3RlZC5wcmV2KCkubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlbGVjdGVkLnNpYmxpbmdzKCkubGFzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZC5wcmV2KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHRoaXMudmFsKCQoJy5zZWxlY3RlZCcsICcjc2VhcmNoLXN1Z2dlc3Rpb25zJykudGV4dCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09IDQwKSB7XG4gICAgICAgICAgICAgICAgLy8gS2V5IHByZXNzZWQ6IERvd25cbiAgICAgICAgICAgICAgICBpZiAoJHNlbGVjdGVkLm5leHQoKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0ZWQuc2libGluZ3MoKS5maXJzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3RlZC5uZXh0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHRoaXMudmFsKCQoJy5zZWxlY3RlZCcsICcjc2VhcmNoLXN1Z2dlc3Rpb25zJykudGV4dCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRG8gdGhlIHNlYXJjaFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG4gICAgICAgICAgICAgICAgdHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCgkdGhpcy52YWwoKSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJyNzZWFyY2gtc3VnZ2VzdGlvbnMnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoLXN1Z2dlc3Rpb25zJykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzZWFyY2gtc3VnZ2VzdGlvbnMgbGknLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgJCgnI3NlYXJjaC1zdWdnZXN0aW9ucycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCgnI2ZpbHRlci1rZXl3b3JkJykudmFsKCQoZS50YXJnZXQpLnRleHQoKSlcbiAgICAgICAgICAgICAgICAucGFyZW50cygnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyB0aGUgc2VhcmNoIGZvciBzaW1pbGFyIHRpdGxlcytjb250ZW50XG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0ZXJtIFNlYXJjaCB0ZXJtXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBTdWdnZXN0aW9ucy5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24odGVybSkge1xuICAgICAgICBpZiAodGVybSA9PT0gbGFzdFRlcm0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXJtLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgICQoJyNzZWFyY2gtc3VnZ2VzdGlvbnMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBsYXN0IHRlcm0gdG8gdGhlIGN1cnJlbnQgdGVybVxuICAgICAgICBsYXN0VGVybSA9IHRlcm07XG5cbiAgICAgICAgLy8gR2V0IEFQSSBlbmRwb2ludCBmb3IgcGVyZm9ybWluZyB0aGUgc2VhcmNoXG4gICAgICAgIHZhciByZXF1ZXN0VXJsID0gSGJnUHJpbWVBcmdzLmFwaS5wb3N0VHlwZVJlc3RVcmwgKyAnP3Blcl9wYWdlPTYmc2VhcmNoPScgKyB0ZXJtO1xuXG4gICAgICAgIC8vIERvIHRoZSBzZWFyY2ggcmVxdWVzdFxuICAgICAgICAkLmdldChyZXF1ZXN0VXJsLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoLXN1Z2dlc3Rpb25zJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm91dHB1dChyZXNwb25zZSwgdGVybSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogT3V0cHV0cyB0aGUgc3VnZ2VzdGlvbnNcbiAgICAgKiBAcGFyYW0gIHthcnJheX0gc3VnZ2VzdGlvbnNcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRlcm1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFN1Z2dlc3Rpb25zLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzdWdnZXN0aW9ucywgdGVybSkge1xuICAgICAgICB2YXIgJHN1Z2dlc3Rpb25zID0gJCgnI3NlYXJjaC1zdWdnZXN0aW9ucycpO1xuXG4gICAgICAgIGlmICghJHN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgJHN1Z2dlc3Rpb25zID0gJCgnPGRpdiBpZD1cInNlYXJjaC1zdWdnZXN0aW9uc1wiPjx1bD48L3VsPjwvZGl2PicpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgndWwnLCAkc3VnZ2VzdGlvbnMpLmVtcHR5KCk7XG4gICAgICAgICQuZWFjaChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKGluZGV4LCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAkKCd1bCcsICRzdWdnZXN0aW9ucykuYXBwZW5kKCc8bGk+JyArIHN1Z2dlc3Rpb24udGl0bGUucmVuZGVyZWQgKyAnPC9saT4nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnbGknLCAkc3VnZ2VzdGlvbnMpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgJCgnI2ZpbHRlci1rZXl3b3JkJykucGFyZW50KCkuYXBwZW5kKCRzdWdnZXN0aW9ucyk7XG4gICAgICAgICRzdWdnZXN0aW9ucy5zbGlkZURvd24oMjAwKTtcbiAgICB9O1xuXG5cbiAgICByZXR1cm4gbmV3IFN1Z2dlc3Rpb25zKCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=