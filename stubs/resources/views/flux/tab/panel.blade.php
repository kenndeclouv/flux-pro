@props([
    'name' => null,
])

@php
$classes = Flux::classes()
    ->add('[&:not([data-selected])]:hidden pt-8')
;

if ($name) {
    $attributes = $attributes->merge([
        'name' => $name,
        'wire:key' => $name,
    ]);
}
@endphp

<div {{ $attributes->class($classes) }} data-flux-tab-panel>
    {{ $slot }}
</div>
