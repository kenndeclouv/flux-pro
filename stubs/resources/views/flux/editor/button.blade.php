@props([
    'iconVariant' => null,
    'icon' => null,
])

@php
$iconClasses = Flux::classes()
    // When using the outline icon variant, we need to size it down to match the default icon sizes...
    ->add($iconVariant === 'outline' ? ($slot->isEmpty() ? 'size-5' : 'size-4') : '')
    ;

$classes = Flux::classes()
    ->add('p-0.5 flex items-center justify-center text-sm font-medium rounded-sm touch-manipulation')
    ->add('text-zinc-400 data-open:text-zinc-800 hover:text-zinc-800 focus:text-zinc-800 data-match:text-zinc-800')
    ->add('disabled:opacity-75 dark:disabled:opacity-75 disabled:cursor-default disabled:pointer-events-none')
    ->add('dark:text-zinc-400 dark:data-open:text-white dark:hover:text-white dark:focus:text-white dark:data-match:text-white')
    ->add('hover:bg-zinc-200 hover:text-zinc-800')
    ->add('dark:hover:bg-white/10 dark:hover:text-white')
;
@endphp

<flux:with-tooltip :$attributes>
    <button type="button" {{ $attributes->class($classes) }}>
        <?php if (is_string($icon) && $icon !== ''): ?>
            <flux:icon :$icon :variant="$iconVariant ?? ($slot->isEmpty() ? 'mini' : 'micro')" :class="$iconClasses" />
        <?php elseif ($icon): ?>
            {{ $icon }}
        <?php endif; ?>

        {{ $slot }}
    </button>
</flux:with-tooltip>
