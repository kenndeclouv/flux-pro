@props([
    'field' => 'date',
    'format' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;
@endphp

<div {{ $attributes->class([
    'bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-600 dark:border-zinc-500 flex justify-between items-center p-2',
    'text-xs font-medium [:where(&)]:text-zinc-800 dark:[:where(&)]:text-zinc-100'
    ]) }}>
    <slot field="{{ $field }}" @if ($format) format="{{ $format }}" @endif></slot>
</div>
