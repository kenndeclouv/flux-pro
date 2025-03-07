@aware([ 'placeholder' ])

@props([
    'placeholder' => null,
    'clearable' => false,
    'invalid' => false,
    'size' => null,
])

<flux:input type="date" :$invalid :$size :$placeholder :$attributes>
    <x-slot name="iconTrailing">
        <?php if ($clearable): ?>
            <div class="absolute top-0 bottom-0 flex items-center justify-center pr-10 right-0">
                <flux:input.clearable :$size />
            </div>
        <?php endif; ?>

        <flux:button size="sm" square variant="subtle" class="-mr-1 [[disabled]_&]:pointer-events-none [&:hover>*]:text-zinc-800 dark:[&:hover>*]:text-white">
            <flux:icon.calendar variant="mini" class="text-zinc-300 [[disabled]_&]:text-zinc-200! dark:text-white/60 dark:[[disabled]_&]:text-white/40!" />
        </flux:button>
    </x-slot>
</flux:input>
