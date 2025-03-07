@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'variant' => null,
    'size' => null,
])

@php
$classes = Flux::classes()
    ->add('flex gap-3')
    ;
@endphp

<flux:with-field :$attributes>
    <ui-checkbox-group {{ $attributes->class($classes) }} data-flux-checkbox-group-cards>
        {{ $slot }}
    </ui-checkbox-group>
</flux:with-field>
