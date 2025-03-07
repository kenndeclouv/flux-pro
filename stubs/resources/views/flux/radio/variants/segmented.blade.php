@aware([ 'size' ])

@props([
    'iconTrailing' => null,
    'iconVariant' => null,
    'label' => null,
    'icon' => null,
    'size' => null,
])

@php
$classes = Flux::classes()
    ->add('flex whitespace-nowrap flex-1 justify-center items-center gap-2')
    ->add('rounded-md data-[checked]:shadow-sm')
    ->add('text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:hover:text-white dark:text-white/70 data-[checked]:text-zinc-800 data-[checked]:dark:text-white')
    ->add('data-[checked]:bg-white data-[checked]:dark:bg-white/20')
    ->add('[&[disabled]]:opacity-50 dark:[&[disabled]]:opacity-75 [&[disabled]]:cursor-default [&[disabled]]:pointer-events-none')
    ->add(match ($size) {
        'sm' => 'px-3 text-sm',
        default => 'px-4',
    })
    ;

$iconClasses = Flux::classes('text-zinc-500 dark:text-zinc-400 [ui-radio[data-checked]_&]:text-zinc-800 dark:[ui-radio[data-checked]_&]:text-white');
$iconVariant ??= 'mini';
@endphp

{{-- We have to put tabindex="-1" here because otherwise, Livewire requests will wipe out tabindex state, --}}
{{-- even with durable attributes for some reason... --}}
<ui-radio {{ $attributes->class($classes) }} data-flux-control data-flux-radio-segmented tabindex="-1">
    <?php if ($icon): ?>
        <flux:icon :$icon :variant="$iconVariant" class="{!! $iconClasses !!}" />
    <?php endif; ?>

    {{ $label ?? $slot }}

    <?php if ($iconTrailing): ?>
        <flux:icon :icon="$iconTrailing" variant="micro" />
    <?php endif; ?>
</ui-radio>
