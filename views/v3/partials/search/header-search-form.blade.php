
@form([
    'id'        => 'header-search-form',
    'method'    => 'get',
    'action'    => $homeUrl,
    'classList' => ['u-margin__left--2', 'u-display--flex@lg u-display--flex@xl u-display--none@xs u-display--none@sm u-display--none@md']
])
    @group(['direction' => 'horizontal', 'classList' => ['u-margin--auto']])
        @field([
            'id' => 'header-search-form--field',
            'type' => 'text',
            'attributeList' => [
                'type' => 'search',
                'name' => 's',
                'required' => false,
            ],
            'label' => $lang->search,
            'classList' => ['u-flex-grow--1'],
            'size' => 'sm',
            'radius' => 'sm',
            'icon' => ['icon' => 'search']
        ])
        @endfield

        @button([
            'id' => 'search-form--submit',
            'text' => $lang->search,
            'color' => 'default',
            'type' => 'basic',
            'size' => 'sm',
            'attributeList' => [
                'id' => 'header-search-form--submit'
            ], 
        ])
        @endbutton

    @endgroup
@endform
