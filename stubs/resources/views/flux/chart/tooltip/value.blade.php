@props([
    'label' => null,
    'field' => null,
    'format' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;
@endphp

<div {{ $attributes->class(['flex items-center gap-2 p-2 text-xs [:where(&)]:text-zinc-500 dark:[:where(&)]:text-zinc-300']) }}>
    {{ $slot }}

    @if (is_string($label) && $label !== '')
        <div class="text-zinc-800 dark:text-white">{{ $label }}</div>
    @elseif ($label)
        {{ $label }}
    @endif

    @if ($field)
        <div class="flex-1"></div>

        <slot field="{{ $field }}" @if ($format) format="{{ $format }}" @endif></slot>
    @endif
</div>