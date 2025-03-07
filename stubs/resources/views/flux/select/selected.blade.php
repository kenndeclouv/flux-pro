@props([
    'placeholder' => null,
    'suffix' => null,
    'max' => null,
])

@php
    $classes = Flux::classes()
        ->add('truncate flex gap-2 text-left flex-1 text-zinc-700')
        ->add('[[disabled]_&]:text-zinc-500 dark:text-zinc-300 dark:[[disabled]_&]:text-zinc-400');
@endphp

<ui-selected x-ignore wire:ignore {{ $attributes->class($classes) }}>
    <template name="placeholder">
        <span class="text-zinc-400 [[disabled]_&]:text-zinc-400/70 dark:text-zinc-400 dark:[[disabled]_&]:text-zinc-500" data-flux-select-placeholder>
            {{ $placeholder }}
        </span>
    </template>

    <template name="overflow" max="{{ $max ?? 1 }}" >
        <div><slot name="count"></slot> {{ $suffix ?? __('selected') }}</div>
    </template>
</ui-selected>
