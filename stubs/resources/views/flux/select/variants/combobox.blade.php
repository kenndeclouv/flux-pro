@props([
    'name' => $attributes->whereStartsWith('wire:model')->first(),
    'placeholder' => null,
    'searchable' => null,
    'multiple' => null,
    'invalid' => null,
    'input' => null,
    'size' => null,
])

@php
if ($searchable) {
    throw new \Exception('Comboboxes do not support the searchable prop.');
}

if ($multiple) {
    throw new \Exception('Comboboxes do not support the multiple prop.');
}

$invalid ??= ($name && $errors->has($name));

$class= Flux::classes()
    ->add('w-full');
@endphp

<ui-select autocomplete="strict" clear="esc" {{ $attributes->class($class)->merge(['filter' => true]) }} data-flux-control data-flux-select>
    <?php if ($input): ?> {{ $input }} <?php else: ?>
        <flux:select.input :$placeholder :$invalid :$size />
    <?php endif; ?>

    <flux:select.options>
        {{ $slot}}

        <flux:select.empty>{!! __('No results found') !!}</flux:select.empty>
    </flux:select.options>
</ui-select>
