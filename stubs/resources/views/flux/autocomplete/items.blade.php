@php
$classes = Flux::classes()
    ->add('[:where(&)]:max-h-[20rem]') // "[:where(&)]:" means it can be overriden without "!"...
    ->add('p-[.3125rem] overflow-y-auto rounded-lg shadow-xs')
    ->add('border border-zinc-200 dark:border-zinc-600')
    ->add('bg-white dark:bg-zinc-700')
    ->add('[&:not(:has(ui-empty[data-hidden]))]:hidden') // Hide this entire panel if there are no results...
    ;
@endphp

<ui-options popover="manual" {{ $attributes->class($classes) }} data-flux-autocomplete-items>
    {{ $slot }}

    <ui-empty class="contents"></ui-empty>
</ui-options>

