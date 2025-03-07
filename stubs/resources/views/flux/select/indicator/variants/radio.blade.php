
@php
$classes = Flux::classes()
    ->add('shrink-0 size-[1.125rem] rounded-full')
    ->add('text-sm text-zinc-700 dark:text-zinc-800')
    ->add('[ui-option[disabled]_&]:opacity-75 [ui-option[data-selected][disabled]_&]:opacity-50')
    ->add('flex justify-center items-center [ui-option[data-selected]_&>div]:block')
    ->add([
        'border',
        'border-zinc-300 dark:border-white/10',
        '[ui-option[disabled]_&]:border-zinc-200 dark:[ui-option[disabled]_&]:border-white/5',
        '[ui-option[data-selected]_&]:border-transparent data-indeterminate:border-transparent',
        '[ui-option[data-selected]_&]:[ui-option[disabled]_&]:border-transparent data-indeterminate:border-transparent',
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
    <div class="hidden size-2 rounded-full bg-[var(--color-accent-foreground)]"></div>
</div>
