@props([
    'placeholder' => null,
])

<ui-selected-date x-ignore wire:ignore class="truncate flex gap-2 text-left flex-1 font-medium text-zinc-700 [[disabled]_&]:text-zinc-500 dark:text-zinc-300 dark:[[disabled]_&]:text-zinc-400">
    <template name="placeholder">
        <span class="text-zinc-400 [[disabled]_&]:text-zinc-400/70 dark:text-zinc-400 dark:[[disabled]_&]:text-zinc-500">
            {{ $placeholder ?? new Illuminate\Support\HtmlString('<slot></slot>') }}
        </span>
    </template>

    <template name="date">
        <div><slot></slot></div>
    </template>
</ui-selected-date>