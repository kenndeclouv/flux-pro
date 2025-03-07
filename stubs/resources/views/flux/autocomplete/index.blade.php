<ui-select autocomplete clear="esc" data-flux-autocomplete {{ $attributes->only('filter')->merge(['filter' => true]) }}>
    <flux:input :attributes="$attributes->except('filter')" />

    <flux:autocomplete.items>
        {{ $slot }}
    </flux:autocomplete.items>
</ui-select>
