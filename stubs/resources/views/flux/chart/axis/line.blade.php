@aware(['axis' => 'x'])

@if ($axis === 'x')
    <template name="axis-line">
        <line {{ $attributes->merge([
            'class' => '[:where(&)]:text-zinc-300 dark:[:where(&)]:text-white/40',
            'orientation' => 'bottom',
            'stroke-width' => '1',
            'stroke' => 'currentColor',
            'fill' => 'none',
        ]) }}></line>
    </template>
@else
    <template name="axis-line">
        <line {{ $attributes->merge([
            'class' => '[:where(&)]:text-zinc-300 dark:[:where(&)]:text-white/40',
            'orientation' => 'left',
            'stroke-width' => '1',
            'stroke' => 'currentColor',
            'fill' => 'none',
        ]) }}></line>
    </template>
@endif