<?php $tax->slug = $taxKey; $dropdown = \Municipio\Content\PostFilters::getMultiTaxDropdown($tax, 0, 'list-hierarchical'); ?>
<div class="pos-relative">
    <button type="button" class="btn" data-dropdown=".dropdown-{{ $taxKey }}"><?php printf(__('Select') . ' %s…', $tax->label); ?>
        <span class="checked-amount">(0)</span>
    </button>
    <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-arrow-right dropdown-{{ $taxKey }}" style="right:0;">
        {!! $dropdown !!}
    </div>
</div>
