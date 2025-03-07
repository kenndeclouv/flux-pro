@props([
    'field' => null,
    'format' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;

$classes = Flux::classes()
    ->add('opacity-0 data-active:opacity-100 absolute flex flex-col rounded-lg overflow-hidden shadow-lg border border-zinc-200 bg-white dark:border-zinc-500 dark:bg-zinc-700');
@endphp

<template name="tooltip">
    <div {{ $attributes->class($classes) }}>
        {{ $slot}}
    </div>
</template>