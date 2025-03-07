@props([
    'variant' => null,
])

<ui-disclosure-group {{ $attributes->class('block') }} data-flux-accordion-heading>
    {{ $slot }}
</ui-disclosure-group>

