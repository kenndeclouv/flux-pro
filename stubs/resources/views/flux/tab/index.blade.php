@aware([ 'variant', 'size' ])

@props([
    'iconTrailing' => null,
    'iconVariant' => null, // This is null as the default is set below depending on the tab variant...
    'variant' => null,
    'accent' => true,
    'name' => null,
    'icon' => null,
    'size' => null,
])

@php
if ($variant === 'pills') {
    $classes = Flux::classes()
        ->add('flex whitespace-nowrap gap-2 items-center px-3 rounded-full text-sm font-medium')
        ->add('bg-zinc-800/5 dark:bg-white/5 hover:bg-zinc-800/10 dark:hover:bg-white/10 text-zinc-600 hover:text-zinc-800 dark:text-white/70 dark:hover:text-white')
        ->add(match ($accent) {
            true => 'data-selected:bg-(--color-accent)',
            false => 'data-selected:bg-zinc-800 dark:data-selected:bg-white',
        })
        ->add(match ($accent) {
            true => 'data-selected:text-(--color-accent-foreground) hover:data-selected:text-(--color-accent-foreground)',
            false => 'data-selected:text-white dark:data-selected:text-zinc-800',
        })
        ->add('[&[disabled]]:opacity-50 dark:[&[disabled]]:opacity-75 [&[disabled]]:cursor-default [&[disabled]]:pointer-events-none')
        ;

    $iconClasses = Flux::classes('size-5');
    $iconVariant ??= 'outline';
} elseif ($variant === 'segmented') {
    $classes = Flux::classes()
        ->add('flex whitespace-nowrap flex-1 justify-center items-center gap-2')
        ->add('rounded-md data-selected:shadow-xs')
        ->add('text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:hover:text-white dark:text-white/70 data-selected:text-zinc-800 dark:data-selected:text-white')
        ->add('data-selected:bg-white dark:data-selected:bg-white/20')
        ->add('[&[disabled]]:opacity-50 dark:[&[disabled]]:opacity-75 [&[disabled]]:cursor-default [&[disabled]]:pointer-events-none')
        ->add(match ($size) {
            'sm' => 'px-3 text-sm',
            default => 'px-4',
        })
        ;

    $iconClasses = Flux::classes('size-5 text-zinc-500 dark:text-zinc-400 [[data-flux-tab][data-selected]_&]:text-zinc-800 dark:[[data-flux-tab][data-selected]_&]:text-white');
    $iconVariant ??= 'mini';
} else {
    $classes = Flux::classes()
        ->add('flex whitespace-nowrap gap-2 items-center px-2')
        ->add('-mb-px') // We want the "selected" tab's bottom border to overlap the tab group's bottom border...
        ->add('border-b-[2px] border-transparent')
        ->add('text-sm font-medium text-zinc-400 dark:text-white/50')
        ->add(match($accent) {
            true => 'data-selected:border-(--color-accent-content) data-selected:text-(--color-accent-content) hover:data-selected:text-(--color-accent-content) hover:text-zinc-800 dark:hover:text-white',
            false => 'data-selected:border-zinc-800 data-selected:text-zinc-800 dark:data-selected:border-white dark:data-selected:text-white hover:text-zinc-800 dark:hover:text-white',
        })
        ->add('[&[disabled]]:opacity-50 dark:[&[disabled]]:opacity-75 [&[disabled]]:cursor-default [&[disabled]]:pointer-events-none')
        ;

    $iconClasses = Flux::classes('size-5');
    $iconVariant ??= 'outline';
}

if ($name) {
    $attributes = $attributes->merge([
        'name' => $name,
        'wire:key' => $name,
    ]);
}
@endphp

<flux:button-or-link :attributes="$attributes->class($classes)" data-flux-tab>
    <?php if (is_string($icon) && $icon !== ''): ?>
        <flux:icon :$icon :variant="$iconVariant" class="{!! $iconClasses !!}" />
    <?php elseif ($icon): ?>
        {{ $icon }}
    <?php endif; ?>

    {{ $slot }}

    <?php if (is_string($iconTrailing) && $iconTrailing !== ''): ?>
        <flux:icon :icon="$iconTrailing" variant="micro" />
    <?php elseif ($iconTrailing): ?>
        {{ $iconTrailing }}
    <?php endif; ?>
</flux:button-or-link>
