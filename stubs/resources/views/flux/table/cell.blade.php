@props([
    'align' => 'start',
    'variant' => null,
])

@php
$classes = Flux::classes()
    ->add('py-3 px-3 first:pl-0 last:pr-0 text-sm')
    ->add($align === 'end' ? 'text-right' : '')
    ->add(match ($variant) {
        'strong' => 'font-medium text-zinc-800 dark:text-white',
        default => 'text-zinc-500 dark:text-zinc-300',
    })
    ;
@endphp

<td {{ $attributes->class($classes) }} data-flux-cell>
    {{ $slot }}
</td>
