
@props([
    'field' => 'value',
])

<template name="line" field="{{ $field }}" {{ $attributes->only(['curve']) }}>
    <path {{ $attributes->class('[:where(&)]:text-zinc-800')->merge([
        'stroke' => 'currentColor',
        'stroke-width' => '2',
        'fill' => 'none',
        'stroke-linecap' => 'round',
        'stroke-linejoin' => 'round',
    ]) }}></path>
</template>
