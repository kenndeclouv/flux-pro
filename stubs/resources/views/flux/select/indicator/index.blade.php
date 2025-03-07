@aware([ 'variant' ])

@props([
    'variant' => 'check',
])

<flux:delegate-component :component="'select.indicator.variants.' . $variant">{{ $slot }}</flux:delegate-component>
