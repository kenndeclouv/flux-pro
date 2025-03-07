
@php
$classes = Flux::classes()
    ->add('shrink-0 size-[1.125rem] rounded-[.3rem] flex justify-center items-center')
    ->add('text-sm text-zinc-700 dark:text-zinc-800')
    ->add('[ui-option[disabled]_&]:opacity-75 [ui-option[data-selected][disabled]_&]:opacity-50 ')
    ->add('[ui-option[data-selected]_&>svg:first-child]:block')
    ->add([
        'border',
        'border-zinc-300 dark:border-white/10',
        '[ui-option[disabled]_&]:border-zinc-200 dark:[ui-option[disabled]_&]:border-white/5',
        '[ui-option[data-selected]_&]:border-transparent',
        '[ui-option[disabled][data-selected]_&]::border-transparent',
    ])
    ->add([
        'bg-white dark:bg-white/10',
        '[ui-option[data-selected]_&]:bg-[var(--color-accent)]',
        'hover:[ui-option[data-selected]_&]:bg-(--color-accent)',
        'focus:[ui-option[data-selected]_&]:bg-(--color-accent)',
    ])
    ;
@endphp

<div {{ $attributes->class($classes) }}>
    <flux:icon.check variant="micro" class="hidden text-[var(--color-accent-foreground)]" />
    <flux:icon.minus variant="micro" class="hidden text-[var(--color-accent-foreground)]" />
</div>
