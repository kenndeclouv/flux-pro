<?php

namespace FluxPro;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Livewire\FluxManager
 */
class FluxPro extends Facade
{
    public static function getFacadeAccessor()
    {
        return 'flux-pro';
    }
}
