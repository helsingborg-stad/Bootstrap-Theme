<article id="article" class="c-article c-article--readable-width s-article">
    <!-- Title -->
    @typography(["element" => "h1"])
        {!! $postTitleFiltered !!}
    @endtypography

    <!-- Blog style author signature -->
    @if(!$postTypeDetails->hierarchical && $postType == 'post')
        @signature([
            'author' => $authorName, 
            'avatar_size' => 'sm',
            'avatar' => $authorAvatar,
            'authorRole' => $authorRole,
            'link' => $signature->link
        ])
        @endsignature
    @endif

    <!-- Feature Image -->
    @if (!empty($feature_image->src))
		@image([
			'src'=> $feature_image->src[0],
			'alt' => $feature_image->alt,
			'classList' => ['c-article__feature-image']
		])
		@endimage
    @endif

	<!-- Content -->
	{!! $postContentFiltered !!}

   

	@includeIf('partials.comments')
	
</article>