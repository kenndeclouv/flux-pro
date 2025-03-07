@props([
    'gutter' => null,
])

<template name="svg" @if ($gutter) gutter="{{ $gutter }}" @endif>
    <svg {{ $attributes->class('absolute inset-0') }} xmlns="http://www.w3.org/2000/svg" version="1.1">
        {{ $slot }}
    </svg>
</template>