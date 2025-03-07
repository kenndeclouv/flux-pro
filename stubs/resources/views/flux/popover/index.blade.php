@php
$classes = Flux::classes()
    ->add('[:where(&)]:min-w-48 p-3')
    ->add('rounded-lg shadow-xs')
    ->add('border border-zinc-200 dark:border-zinc-600')
    ->add('bg-white dark:bg-zinc-700')
    ;
@endphp

<div
    {{ $attributes->class($classes) }}
    popover="manual"
    data-flux-popover
>
    {{ $slot }}
</div>
