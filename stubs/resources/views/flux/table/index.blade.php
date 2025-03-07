@props([
    'paginate' => null,
])

@php
$classes = Flux::classes()
    ->add('[:where(&)]:min-w-full table-fixed')
    ->add('text-zinc-800')
    ->add('divide-y divide-zinc-800/10 dark:divide-white/20 text-zinc-800')
    // We want whitespace-nowrap for the table, but not for modals and dropdowns...
    ->add('whitespace-nowrap [&_dialog]:whitespace-normal [&_[popover]]:whitespace-normal')
    ;
@endphp

<div>
    {{ $header ?? '' }}

    <div class="overflow-x-auto">
        <table {{ $attributes->class($classes) }} data-flux-table>
            {{ $slot }}
        </table>
    </div>

    {{ $footer ?? '' }}

    <?php if ($paginate): ?>
        <flux:pagination :paginator="$paginate" />
    <?php endif; ?>
</div>
