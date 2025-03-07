@props([
    'position' => 'bottom end',
])

@php
// Support adding the .self modifier to the wire:model directive...
if (($wireModel = $attributes->wire('model')) && $wireModel->directive && ! $wireModel->hasModifier('self')) {
    unset($attributes[$wireModel->directive]);

    $wireModel->directive .= '.self';

    $attributes = $attributes->merge([$wireModel->directive => $wireModel->value]);
}
@endphp

<ui-context position="{{ $position }}" {{ $attributes }} data-flux-context>
    {{ $slot }}
</ui-context>
