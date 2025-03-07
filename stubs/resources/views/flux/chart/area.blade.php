@aware(['field'])

@props([
    'field' => 'value',
])

<template name="area" field="{{ $field }}" {{ $attributes->only(['curve']) }}>
    <path fill="currentColor" {{ $attributes->except('curve') }}></path>
</template>
