@aware([ 'disabled', 'variant' ])

@props([
    'disabled' => null,
    'variant' => null,
])

@php
$classes = Flux::classes()
    ->add('group/accordion-heading flex items-center w-full')
    ->add('text-left text-sm font-medium')
    ->add(match ($variant) {
        default => 'justify-between [&>svg]:ml-6',
        'reverse' => 'flex-row-reverse justify-end [&>svg]:mr-2',
    })
    ->add($disabled
        ? 'text-zinc-400 dark:text-zinc-400 cursor-default'
        : 'text-zinc-800 dark:text-white cursor-pointer'
    )
    ;
@endphp

<button type="button" {{ $attributes->class($classes) }} @if ($disabled) disabled @endif data-flux-accordion-heading>
    <span class="flex-1">{{ $slot }}</span>

    <?php if ($variant === 'reverse'): ?>
        <flux:accordion.icon pointing="down" class="hidden group-data-open/accordion-heading:block text-zinc-800! dark:text-white!" />
        <flux:accordion.icon pointing="right" class="block group-data-open/accordion-heading:hidden" />
    <?php else: ?>
        <flux:accordion.icon pointing="up" class="hidden group-data-open/accordion-heading:block text-zinc-800! dark:text-white!" />
        <flux:accordion.icon pointing="down" class="block group-data-open/accordion-heading:hidden" />
    <?php endif; ?>
</button>

