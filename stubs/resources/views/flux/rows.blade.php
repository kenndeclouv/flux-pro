@php
$classes = Flux::classes()
    ->add('divide-y divide-zinc-800/10 dark:divide-white/20')
    ->add('[&:not(:has(*))]:!border-t-0') // This removes the top border when there are no rows (which causes an errant scrollbar aside the columns)...
    ;
@endphp

<tbody {{ $attributes->class($classes) }} data-flux-rows>
    {{ $slot }}
</tbody>
