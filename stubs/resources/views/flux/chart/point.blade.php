
@props([
    'field' => 'value',
])

<template name="point" field="{{ $field }}">
    <circle {{ $attributes->class('[:where(&)]:text-zinc-800 dark:[:where(&)]:text-zinc-100 [:where(&)]:stroke-white dark:[:where(&)]:stroke-zinc-900')->merge([
        'r' => '4',
        'fill' => 'currentColor',
        'stroke-width' => '1',
    ]) }}></circle>
</template>
