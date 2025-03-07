@aware([ 'placeholder' ])

@props([
    'placeholder' => null,
    'clearable' => null,
    'invalid' => false,
    'suffix' => null,
    'size' => null,
    'max' => null,
])

@php
// Clearable is not supported on xs size...
if ($size === 'xs') $clearable = null;

$classes = Flux::classes()
    ->add('group/select-button cursor-default py-2')
    ->add('overflow-hidden') // Overflow hidden is here to prevent the button from growing when selected text is too long.
    ->add('flex items-center')
    ->add('shadow-xs')
    ->add('bg-white dark:bg-white/10 dark:disabled:bg-white/[7%]')
    // Make the placeholder match the text color of standard input placeholders...
    ->add('disabled:shadow-none')
    ->add(match ($size) {
        default => 'h-10 text-sm rounded-lg px-3 block w-full',
        'sm' => 'h-8 text-sm rounded-md pl-3 pr-2 block w-full',
        'xs' => 'h-6 text-xs rounded-md pl-3 pr-2 block w-full',
    })
    ->add($invalid
        ? 'border border-red-500'
        : 'border border-zinc-200 border-b-zinc-300/80 dark:border-white/10'
    )
    ;
@endphp

<button type="button" {{ $attributes->class($classes) }} @if ($invalid) data-invalid @endif data-flux-group-target data-flux-select-button>
    <?php if ($slot->isNotEmpty()): ?>
        {{ $slot }}
    <?php else: ?>
        <flux:select.selected :$placeholder :$max :$suffix />
    <?php endif; ?>

    <?php if ($clearable): ?>
        <flux:button as="div"
            class="cursor-pointer ml-2 -mr-2 [[data-flux-select-button]:has([data-flux-select-placeholder])_&]:hidden [[data-flux-select]:has([disabled])_&]:hidden"
            variant="subtle"
            :size="$size === 'sm' ? 'xs' : 'sm'"
            square
            tabindex="-1"
            aria-label="Clear selected"
            x-on:click.prevent.stop="let select = $el.closest('ui-select'); select.value = select.hasAttribute('multiple') ? [] : null; select.dispatchEvent(new Event('change', { bubbles: false })); select.dispatchEvent(new Event('input', { bubbles: false }))"
        >
            <flux:icon.x-mark variant="micro" />
        </flux:button>
    <?php endif; ?>

    <flux:icon.chevron-down variant="mini" class="ml-2 -mr-1 text-zinc-300 [[data-flux-select-button]:hover_&]:text-zinc-800 [[disabled]_&]:text-zinc-200! dark:text-white/60 dark:[[data-flux-select-button]:hover_&]:text-white dark:[[disabled]_&]:text-white/40!" />
</button>
