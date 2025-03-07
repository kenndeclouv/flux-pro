@props([
    'separator' => 'chevron-right',
    'icon' => null,
    'href' => null,
])

@php
$classes = Flux::classes()
    ->add('flex items-center')
    ->add('text-sm font-medium')
    ->add('group/breadcrumb')
    ;

$linkClasses = Flux::classes()
    ->add('text-zinc-800 dark:text-white')
    ->add('hover:underline decoration-zinc-800/20 underline-offset-4');

$staticTextClasses = Flux::classes()
    ->add('text-gray-500 dark:text-white/80')
    ;

$iconClasses = Flux::classes()
    ->add('mx-1 text-zinc-300 dark:text-white/80')
    ->add('group-last/breadcrumb:hidden')
    ;

[ $styleAttributes, $attributes ] = Flux::splitAttributes($attributes);
@endphp

<div {{ $styleAttributes->class($classes) }} data-flux-breadcrumbs-item>
    <?php if ($href): ?>
        <a {{ $attributes->class($linkClasses) }} href="{{ $href }}">
            <?php if ($icon): ?>
                <flux:icon :$icon variant="mini" />
            <?php else: ?>
                {{ $slot }}
            <?php endif; ?>
        </a>
    <?php else: ?>
        <div {{ $attributes->class($staticTextClasses) }}>
            <?php if ($icon): ?>
                <flux:icon :$icon variant="mini" />
            <?php else: ?>
                {{ $slot }}
            <?php endif; ?>
        </div>
    <?php endif; ?>

    <flux:icon :icon="$separator" variant="mini" class="{{ $iconClasses }}" />
</div>
