
<flux:dropdown position="bottom center" data-editor="link" class="contents">
    <flux:tooltip content="{{ __('Insert link') }}" kbd="⌘K" class="contents">
        <flux:editor.button data-match-target>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"> <path d="M7.49999 14.1673H5.83332C4.72825 14.1673 3.66845 13.7283 2.88704 12.9469C2.10564 12.1655 1.66666 11.1057 1.66666 10.0007C1.66666 8.89558 2.10564 7.83577 2.88704 7.05437C3.66845 6.27297 4.72825 5.83398 5.83332 5.83398H7.49999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12.5 5.83398H14.1667C15.2717 5.83398 16.3315 6.27297 17.1129 7.05437C17.8943 7.83577 18.3333 8.89558 18.3333 10.0007C18.3333 11.1057 17.8943 12.1655 17.1129 12.9469C16.3315 13.7283 15.2717 14.1673 14.1667 14.1673H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M6.66666 10H13.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>
        </flux:editor.button>
    </flux:tooltip>

    <div popover="manual" class="min-w-[360px] p-[5px] rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-xs bg-white dark:bg-zinc-700">
        <div class="h-8 flex justify-between gap-2 pl-2 pr-1" data-flux-editor-link>
            <input data-editor="link:url" type="text" form="" placeholder="https://..." class="flex-1 text-base sm:text-sm outline-hidden bg-transparent" autofocus>

            <div class="flex gap-2 items-center">
                <flux:tooltip content="{{ __('Insert link') }}" class="contents">
                    <button type="button" data-editor="link:insert" class="p-0.5 text-sm font-medium text-zinc-400 rounded-sm [[data-flux-editor-link]:not(:has(input:placeholder-shown))_&:hover]:bg-zinc-200 dark:[[data-flux-editor-link]:not(:has(input:placeholder-shown))_&:hover]:bg-white/10 [[data-flux-editor-link]:not(:has(input:placeholder-shown))_&]:text-zinc-800 dark:[[data-flux-editor-link]:not(:has(input:placeholder-shown))_&]:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 shrink-0" aria-hidden="true"> <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" /> </svg> <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" /> </svg>
                    </button>
                </flux:tooltip>

                <flux:tooltip content="{{ __('Unlink') }}" class="contents">
                    <button type="button" data-editor="link:unlink" class="p-0.5 text-sm font-medium text-zinc-400 rounded-sm [[data-flux-editor-link]:not(:has(input:placeholder-shown))_&:hover]:bg-zinc-200 dark:[[data-flux-editor-link]:not(:has(input:placeholder-shown))_&:hover]:bg-white/10 [[data-flux-editor-link]:not(:has(input:placeholder-shown))_&]:text-zinc-800 dark:[[data-flux-editor-link]:not(:has(input:placeholder-shown))_&]:text-white">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" aria-hidden="true"> <g clip-path="url(#clip0_1014_3807)"> <path d="M15.7 10.2082L17.1334 8.78317H17.1167C17.8839 7.9882 18.3042 6.92127 18.2855 5.81664C18.2668 4.71202 17.8104 3.65997 17.0167 2.8915C16.2391 2.14166 15.2011 1.72266 14.1209 1.72266C13.0407 1.72266 12.0026 2.14166 11.225 2.8915L9.79169 4.3165" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M4.30834 9.79102L2.88334 11.216C2.11615 12.011 1.69578 13.0779 1.71453 14.1825C1.73328 15.2872 2.18961 16.3392 2.98334 17.1077C3.76089 17.8575 4.79898 18.2765 5.87918 18.2765C6.95938 18.2765 7.99747 17.8575 8.77501 17.1077L10.2 15.6827" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M6.66669 1.66602V4.16602" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M1.66669 6.66602H4.16669" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M13.3333 15.834V18.334" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M15.8333 13.334H18.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g> <defs> <clipPath id="clip0_1014_3807"> <rect width="20" height="20" fill="white"/> </clipPath> </defs> </svg>
                    </button>
                </flux:tooltip>
            </div>
        </div>
    </div>
</flux:dropdown>
