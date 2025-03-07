@php
$classes = Flux::classes()
    ->add('p-6 rounded-xl')
    ->add('bg-white dark:bg-white/10')
    ->add('border border-zinc-200 dark:border-white/10')
@endphp

<div {{ $attributes->class($classes) }} data-flux-card>
    {{ $slot }}
</div>
