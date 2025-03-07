
<template name="cursor">
    <line {{ $attributes->merge([
        'class' => 'text-zinc-500 dark:text-zinc-300',
        'type' => 'vertical',
        'stroke' => 'currentColor',
        'stroke-width' => '1',
        'stroke-dasharray' => '4,4',
    ]) }}></line>
</template>
