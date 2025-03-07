@aware(['axis' => 'x', 'position' => null ])

@props([
    'format' => null,
])

@php
$format = is_array($format) ? Js::encode($format) : $format;
@endphp

@if ($axis === 'x')
    <template name="tick-label" @if ($format) format="{{ $format }}" @endif>
        <g>
            <text {{ $attributes->merge([
                'class' => '[:where(&)]:text-xs [:where(&)]:text-zinc-400 [:where(&)]:font-medium [:where(&)]:dark:text-zinc-300',
                'text-anchor' => 'middle',
                'fill' => 'currentColor',
                'dy' => $position === 'top' ? '-1.5rem' : '1.5rem',
            ]) }}><slot></slot></text>
        </g>
    </template>
@else
    <template name="tick-label" @if ($format) format="{{ $format }}" @endif>
        <g>
            <text {{ $attributes->merge([
                'class' => '[:where(&)]:text-xs [:where(&)]:text-zinc-400 [:where(&)]:dark:text-zinc-300',
                'dominant-baseline' => 'central',
                'fill' => 'currentColor',
                'text-anchor' => $position === 'right' ? 'start' : 'end',
                'dx' => $position === 'right' ? '1em' : '-1em',
            ]) }}><slot></slot></text>
        </g>
    </template>
@endif