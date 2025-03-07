@aware([ 'disabled' ])

@props([
    'pointing' => 'down',
    'disabled' => null,
])

@php
$classes = Flux::classes()
    ->add('text-zinc-300 dark:text-zinc-400')
    ->add($disabled ? ''
        : 'group-hover/accordion-heading:text-zinc-800 dark:group-hover/accordion-heading:text-white'
    )
    ;
@endphp

<flux:icon :icon="'chevron-'.$pointing" variant="mini" aria-hidden="true" :attributes="$attributes->class($classes)" />
