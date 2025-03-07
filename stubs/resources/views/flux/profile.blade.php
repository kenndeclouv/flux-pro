@props([
    'chevron' => true,
    'avatar' => null,
    'name' => null,
])

@php
$classes = Flux::classes()
    ->add('group flex items-center rounded-lg')
    ->add('[ui-dropdown>&]:w-full') // Without this, the "name" won't get truncated in a sidebar dropdown...
    ->add('p-1 hover:bg-zinc-800/5 dark:hover:bg-white/10')
    ;
@endphp

<button type="button" {{ $attributes->class($classes) }} data-flux-profile>
    <div class="shrink-0 size-8 bg-zinc-400 rounded overflow-hidden">
        <?php if (is_string($avatar)): ?>
            <img src="{{ $avatar }}" />
        <?php else: ?>
            {{ $avatar }}
        <?php endif; ?>
    </div>

    <?php if ($name): ?>
        <span class="ml-2 text-sm text-zinc-500 dark:text-white/80 group-hover:text-zinc-800 group-hover:dark:text-white font-medium truncate">
            {{ $name }}
        </span>
    <?php endif; ?>

    <?php if ($chevron): ?>
        <div class="shrink-0 ml-auto size-8 flex justify-center items-center">
            <flux:icon.chevron-down variant="micro" class="text-zinc-400 dark:text-white/80 group-hover:text-zinc-800 group-hover:dark:text-white" />
        </div>
    <?php endif; ?>
</button>
