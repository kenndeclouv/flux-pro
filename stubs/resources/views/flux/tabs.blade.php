@aware([ 'variant' ])

@props([
    'size' => null,
    'variant' => null,
])

@php
if ($variant === 'pills') {
    $classes = Flux::classes()
        ->add('flex gap-4 h-8')
        ;
} elseif ($variant === 'segmented') {
    $classes = Flux::classes()
        ->add('block inline-flex p-1')
        ->add('rounded-lg bg-zinc-800/5 dark:bg-white/10')
        ->add($size === 'sm' ? 'h-8 py-[3px] px-[3px]' : 'h-10 p-1')
        ->add($size === 'sm' ? match ($variant) {
            'segmented' => '-my-px h-[calc(2rem+2px)]',
            default => '',
        } : '')
        ;
} else {
    $classes = Flux::classes()
        ->add('flex gap-4 h-10')
        ->add('border-b border-zinc-800/10 dark:border-white/20')
        ;
}
@endphp

<ui-tabs {{ $attributes->class($classes) }} data-flux-tabs>
    {{ $slot }}
</ui-tabs>
