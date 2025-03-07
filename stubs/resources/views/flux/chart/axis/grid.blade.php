@aware(['axis' => 'x'])

@if ($axis === 'x')
    <template name="grid-line">
        <line {{ $attributes->merge([
            'type' => 'horizontal',
            'class' => 'text-zinc-200/50 dark:text-white/15',
            'stroke' => 'currentColor',
            'stroke-width' => '1',
        ]) }}></line>
    </template>
@else
    <template name="grid-line">
        <line {{ $attributes->merge([
            'type' => 'vertical',
            'class' => 'text-zinc-200/50 dark:text-white/15',
            'stroke' => 'currentColor',
            'stroke-width' => '1',
        ]) }}></line>
    </template>
@endif
