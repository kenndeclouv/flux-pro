@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'invalid' => null,
    'clear' => null,
    'close' => null,
    'size' => null,
])

@php
$invalid ??= ($name && $errors->has($name));

$class= Flux::classes()
    ->add('w-full');
@endphp

<ui-select
    clear="{{ $clear ?? 'close esc select' }}"
    @if ($close) close="{{ $close }}" @endif
    {{ $attributes->class($class)->merge(['filter' => true]) }}
    data-flux-control
    data-flux-select
>
    {{ $slot}}
</ui-select>
