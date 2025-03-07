@props([
    'key' => null,
])

<tr @if ($key) wire:key="table-{{ $key }}" @endif {{ $attributes }} data-flux-row>
    {{ $slot }}
</tr>
