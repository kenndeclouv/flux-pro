@props([
    'field' => null,
    'format' => null,
    'fallback' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;
@endphp

<span {{ $attributes }}>
    <slot @if ($field) field="{{ $field }}" @endif @if ($format) format="{{ $format }}" @endif @if ($fallback) fallback="{{ $fallback }}" @endif></slot>
</span>
