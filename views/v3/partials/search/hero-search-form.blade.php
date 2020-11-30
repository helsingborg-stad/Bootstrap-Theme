@form([
    'id'        => 'hero-search-form',
    'method'    => 'get',
    'action'    => $homeUrl,
    'classList' => ['c-form--hidden', '']
])
    @group(['direction' => 'horizontal'])

        @icon(['icon' => 'search', 'size' => 'xxl'])
        @endicon

        @field([
            'id' => 'search-form--field',
            'type' => 'text',
            'attributeList' => [
                'type' => 'search',
                'name' => 's',
                'required' => false,
            ],
            'label' => $lang->searchOn . " " . $siteName,
            'classList' => ['u-flex-grow--1', 'c-field--contrast', 'c-field--lg']
        ])
        @endfield
        @button([
            'id' => 'search-form--submit',
            'text' => $lang->search,
            'color' => 'default',
            'type' => 'basic',
            'size' => 'md',
            'attributeList' => [
                'id' => 'search-form--submit'
            ]
        ])
        @endbutton
    @endgroup
@endform
