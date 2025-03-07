@props([
    'items' => null,
])

@php
$classes = Flux::classes()
    ->add('block overflow-x-auto border-b bg-zinc-50 rounded-t-[calc(0.5rem-1px)] w-full')
    ->add('dark:bg-white/[6%]')
    ->add('dark:border-white/5')
;
@endphp

<ui-toolbar {{ $attributes->class($classes) }} wire:ignore aria-label="{{ __('Formatting') }}">
    <div class="h-10 p-2 flex gap-2 items-center">
        <?php if ($slot->isNotEmpty()): ?>
            {{ $slot }}
        <?php else: ?>
            <?php if ($items !== null): ?>
                <?php foreach (str($items)->explode(' ') as $item): ?>
                    <?php if ($item === '|') $item = 'separator'; ?>
                    <?php if ($item === '~') $item = 'spacer'; ?>
                    <flux:delegate-component :component="'editor.' . $item"></flux:delegate-component>
                <?php endforeach; ?>
            <?php else: ?>
                <flux:editor.heading />
                <flux:editor.separator />
                <flux:editor.bold />
                <flux:editor.italic />
                <flux:editor.strike />
                <flux:editor.separator />
                <flux:editor.bullet />
                <flux:editor.ordered />
                <flux:editor.blockquote />
                <flux:editor.separator />
                <flux:editor.link />
                <flux:editor.separator />
                <flux:editor.align />
            <?php endif; ?>
        <?php endif; ?>
    </div>
</ui-toolbar>
