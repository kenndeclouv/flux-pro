@aware(['axis' => 'x', 'position' => null])

@if ($axis === 'x')
    <template name="tick-mark">
        <g>
            <line {{ $attributes->merge([
                'class' => 'stroke-zinc-300',
                'orientation' => $position === 'top' ? 'top' : 'bottom',
                'stroke' => 'currentColor',
                'stroke-width' => '1',
                'fill' => 'none',
                'y1' => '0',
                'y2' => '6',
            ]) }}></line>
        </g>
    </template>
@else
    <template name="tick-mark">
        <g>
            <line {{ $attributes->merge([
                'class' => 'stroke-zinc-300',
                'orientation' => $position === 'right' ? 'right' : 'left',
                'stroke' => 'currentColor',
                'stroke-width' => '1',
                'fill' => 'none',
                'x1' => $position === 'right' ? '0' : '-6',
                'x2' => $position === 'right' ? '6' : '0',
            ]) }}></line>
        </g>
    </template>
@endif