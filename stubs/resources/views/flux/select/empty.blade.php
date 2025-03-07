@php
$classes = Flux::classes()
    ->add('data-hidden:hidden block items-center px-2 py-1.5 w-full')
    ->add('rounded-md')
    ->add('text-left text-sm font-medium')
    ->add('text-zinc-500 data-active:bg-zinc-100 dark:text-zinc-300 dark:data-active:bg-zinc-600')
    ;
@endphp

<ui-empty {{ $attributes->class($classes) }}>
    {{ $slot }}
</ui-empty>
