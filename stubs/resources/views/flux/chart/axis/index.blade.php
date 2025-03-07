@props([
    'axis' => 'x',
    'format' => null,
    'field' => 'index',
    'position' => null,
    'tickValues' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;

$field ??= $axis === 'x' ? 'date' : $field;
@endphp

<template {{ $attributes->merge([
    'name' => 'axis',
    'axis' => $axis,
    'format' => $format,
    'position' => $position,
    'tick-values' => is_string($tickValues) ? $tickValues : json_encode($tickValues),
]) }} @if ($field) field="{{ $field }}" @endif>
    {{ $slot }}
</template>