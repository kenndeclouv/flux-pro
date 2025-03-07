@props([
    'clearable' => null,
    'closable' => null,
    'icon' => 'magnifying-glass',
])

@php
$classes = Flux::classes()
    ->add('h-12 w-full flex items-center px-3 py-2')
    ->add('font-medium text-base sm:text-sm text-zinc-800 dark:text-white')
    ->add('pl-11') // Make room for magnifying glass icon...
    ->add(($closable || $clearable) ? 'pr-11' : '') // Make room for close/clear button...
    ->add('outline-hidden')
    ->add('border-b border-zinc-200 dark:border-zinc-600')
    ->add('bg-white dark:bg-zinc-700')
    // The below reverts styles added by Tailwind Forms plugin
    ->add('border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-zinc-200 dark:focus:border-zinc-600')
    ;
@endphp

<div class="relative" data-flux-command-input>
    <div class="absolute top-0 bottom-0 flex items-center justify-center text-xs text-zinc-400 pl-3.5 left-0 [&:has(+input:focus)]:text-zinc-800 dark:[&:has(+input:focus)]:text-zinc-400">
        <?php if (is_string($icon) && $icon !== ''): ?>
            <flux:icon :$icon variant="mini" />
        <?php else: ?>
            {{ $icon }}
        <?php endif; ?>
    </div>

    <input type="text" {{ $attributes->class($classes) }} />

    <?php if ($closable): ?>
        <div class="absolute top-0 bottom-0 flex items-center justify-center pr-2 right-0">
            <ui-close>
                <flux:button square variant="subtle" size="sm" aria-label="Close command modal">
                    <flux:icon.x-mark variant="micro" />
                </flux:button>
            </ui-close>
        </div>
    <?php elseif ($clearable): ?>
        <div class="absolute top-0 bottom-0 flex items-center justify-center pr-2 right-0 [[data-flux-command-input]:has(input:placeholder-shown)_&]:hidden">
            <flux:button square variant="subtle" size="sm" tabindex="-1" aria-label="Clear command input"
                x-on:click="$el.closest('[data-flux-command-input]').querySelector('input').value = ''; $el.closest('[data-flux-command-input]').querySelector('input').dispatchEvent(new Event('input', { bubbles: false })); $el.closest('[data-flux-command-input]').querySelector('input').focus()"
            >
                <flux:icon.x-mark variant="micro" />
            </flux:button>
        </div>
    <?php endif; ?>
</div>

