@props([
    'icon' => 'x-mark',
])

@php
$classes = Flux::classes()
    ->add('p-1 -my-1 -mr-1 opacity-50 hover:opacity-100')
    ;
@endphp

<button type="button" {{ $attributes->class($classes) }} data-flux-badge-close>
    <flux:icon :$icon variant="micro" />
</button>
