@aware(['axis' => 'x'])

<template name="zero-line">
    <line {{ $attributes->merge([
        'class' => '[:where(&)]:text-zinc-400',
        'orientation' => 'left',
        'stroke-width' => '1',
        'stroke' => 'currentColor',
        'fill' => 'none',
        'x1' => '0',
        'y1' => '0',
        'x2' => '0',
        'y2' => '6',
    ]) }}></line>
</template>