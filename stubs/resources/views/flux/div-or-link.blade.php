@props([
    'href' => null,
])

<?php if ($href): ?>
    <a href="{{ $href }}" {{ $attributes }}>
        {{ $slot }}
    </a>
<?php else: ?>
    <div {{ $attributes }}>
        {{ $slot }}
    </div>
<?php endif; ?>
