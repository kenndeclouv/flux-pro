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
    <ui-radio-group {{ $attributes->class($classes) }} data-flux-radio-group-cards>
        {{ $slot }}
    </ui-radio-group>
</flux:with-field>
