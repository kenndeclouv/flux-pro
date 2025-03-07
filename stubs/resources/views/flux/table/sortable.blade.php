@props([
    'direction' => null,
    'sorted' => false,
])

@php
$classes = Flux::classes()
    ->add('group/sortable flex items-center gap-1 -my-1 -ml-2 -mr-2 px-2 py-1 ')
    ->add('in-[.group\/right-align]:flex-row-reverse in-[.group\/right-align]:-mr-2 in-[.group\/right-align]:-ml-8')
    ;
@endphp

<button type="button" {{ $attributes->class($classes) }} data-flux-table-sortable>
    {{ $slot }}

    <div class="rounded-sm text-zinc-400 group-hover/sortable:text-zinc-800 dark:group-hover/sortable:text-white">
        @if ($sorted)
            @if ($direction === 'asc')
                <flux:icon.chevron-up variant="micro" />
            @elseif ($direction === 'desc')
                <flux:icon.chevron-down variant="micro" />
            @else
                <flux:icon.chevron-down variant="micro" />
            @endif
        @else
            <div class="opacity-0 group-hover/sortable:opacity-100">
                <flux:icon.chevron-down variant="micro" />
            </div>
        @endif
    </div>
</button>
