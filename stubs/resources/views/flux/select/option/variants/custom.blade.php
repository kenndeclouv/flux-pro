@aware([ 'indicator' ])

@props([
    'filterable' => null,
    'indicator' => null,
    'loading' => null,
    'value' => null,
])

@php
$classes = Flux::classes()
    ->add('group/option overflow-hidden data-hidden:hidden group flex items-center px-2 py-1.5 w-full focus:outline-hidden')
    ->add('rounded-md')
    ->add('text-left text-sm font-medium')
    ->add('text-zinc-800 data-active:bg-zinc-100 [&[disabled]]:text-zinc-400 dark:text-white dark:data-active:bg-zinc-600 dark:[&[disabled]]:text-zinc-400')
    ->add('scroll-my-[.3125rem]') // This is here so that when a user scrolls to the top or bottom of the list, the padding is included...
    ;

$livewireAction = $attributes->whereStartsWith('wire:click')->isNotEmpty();
$alpineAction = $attributes->whereStartsWith('x-on:click')->isNotEmpty();

$loading ??= $loading ?? $livewireAction;

if ($loading) {
    $attributes = $attributes->merge(['wire:loading.attr' => 'data-flux-loading']);
}
@endphp

<ui-option
    @if ($value !== null) value="{{ $value }}" @endif
    @if ($value) wire:key="{{ $value }}" @endif
    @if ($filterable === false) filter="manual" @endif
    @if ($livewireAction || $alpineAction) action @endif
    {{ $attributes->class($classes) }}
    data-flux-option
>
    <div class="w-6 shrink-0 [ui-selected_&]:hidden">
        <flux:select.indicator :variant="$indicator" />
    </div>

    {{ $slot }}

    <?php if ($loading): ?>
        <flux:icon.loading class="hidden [[data-flux-loading]>&]:block ml-auto text-zinc-400 [[data-flux-menu-item]:hover_&]:text-current" variant="micro" />
    <?php endif; ?>
</ui-option>


