import { assignId, element, inject, removeAndReleaseAttribute, setAttribute } from './utils.js'
import { Controllable } from './mixins/controllable.js'
import Placeholder from '@tiptap/extension-placeholder'
import Superscript from '@tiptap/extension-superscript'
import { Disableable } from './mixins/disableable.js'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import { UIControl, UIElement } from './element.js'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Editor } from '@tiptap/core'

class UIEditor extends UIControl {
    boot() {
        // Extract initial content. If the content is coming from Livewire, we need to use
        // the value attribute, otherwise load it from the editor content element...
        let content = this.value ?? this.querySelector('ui-editor-content').innerHTML

        this.querySelector('ui-editor-content').innerHTML = ''

        this._controllable = new Controllable(this)

        this._disableable = new Disableable(this)

        this.editor = new Editor({
            element: this.querySelector('ui-editor-content'),
            content: content,
            injectCSS: false,
            editable: true,
            editorProps: { // Prevent the default ProseMirror input event so we can dispatch our own...
                handleDOMEvents: { input: (view, event) => { event.stopPropagation(); return true; } }
            },
            extensions: [
                StarterKit.configure({
                    history: true,
                    paragraph: {
                        keepOnSplit: false,
                        allowNesting: true,
                    },
                }),
                TextAlign.configure({
                    types: ['paragraph', 'heading'],
                    alignments: ['left', 'center', 'right'],
                }),
                Underline,
                Link.configure({
                    openOnClick: false,
                    linkOnPaste: true,
                }),
                Highlight,
                Subscript,
                Superscript,
                Placeholder.configure({
                    placeholder: this.getAttribute('placeholder'),
                }),
            ],

            onBlur: () => {
                this.dispatchEvent(new Event('blur', {
                    bubbles: false,
                    cancelable: true,
                }))
            },

            onUpdate: () => {
                this._controllable.dispatch()
            },

            onCreate: ({ editor }) => {
                editor.view.dom.setAttribute('data-slot', 'content')

                // Tiptap handles most keyboard shortcuts, however we need to implement link shortcuts...
                this.addEventListener('keydown', e => {
                    let cmdIsHeld = e.metaKey || e.ctrlKey

                    if (cmdIsHeld && e.key.toLowerCase() === 'k') {
                        e.preventDefault(); e.stopPropagation();

                        this.querySelector('[data-editor="link"] [data-match-target]')?.click()
                    }
                })

                initializeToolbar(editor, this.querySelector('ui-toolbar'))
            }
        })

        // This ensures that Tiptap doesn't emit an update event when the editor component is being booted. This
        // fixes an issue with `wire:model.live` is dispatching an update request on editor load, and fixes the
        // editor content being set to empty when Livewire and Alpine are manually bundled in `app.js`...
        let shouldEmitUpdate = false

        this._disableable.onInitAndChange(disabled => {
            this.editor.setEditable(! disabled, shouldEmitUpdate)

            if (disabled) {
                setAttribute(this, 'aria-disabled', 'true')
                setAttribute(this.querySelector('ui-toolbar'), 'disabled', 'disabled')
            } else {
                removeAndReleaseAttribute(this, 'aria-disabled', 'true')
                removeAndReleaseAttribute(this.querySelector('ui-toolbar'), 'disabled')
            }
        })

        shouldEmitUpdate = true

        let getValue = () => {
            // Otherwise, an empty state will return <p></p>...
            if (this.editor.isEmpty) return ''

            return this.editor.getHTML()
        }

        let setValue = value => {
            this.editor.commands.setContent(value)
        }

        this._controllable.getter(() => getValue())
        this._controllable.setter(value => setValue(value))
    }

    mount() {
        if (this.closest('ui-field')) {
            this.closest('ui-field').associateLabelWithControl(this)
            this.closest('ui-field').associateDescriptionWithControl(this)
        }
    }

    focus() {
        this.editor.commands.focus()
    }
}

function initializeToolbar(editor, toolbar) {
    if (! editor) throw `ui-editor-toolbar: no parent ui-editor element found`

    toolbar.addEventListener('click', e => {
        let button = e.target.closest('button')

        if (! button) return

        let command = button.dataset.editor

        let commands = {
            'bold': 'toggleBold',
            'italic': 'toggleItalic',
            'strike': 'toggleStrike',
            'underline': 'toggleUnderline',
            'blockquote': 'toggleBlockquote',
            'bullet': 'toggleBulletList',
            'ordered': 'toggleOrderedList',
            'code': 'toggleCode',
            'highlight': 'toggleHighlight',
            'hr': 'setHorizontalRule',
            'undo': 'undo',
            'redo': 'redo',
            'subscript': 'toggleSubscript',
            'superscript': 'toggleSuperscript',
            'code-block': 'toggleCodeBlock',
        }

        commands[command] && editor.chain().focus()[commands[command]]().run()
    })

    toolbar.querySelector('[data-editor="align"]')?.addEventListener('change', e => {
        let align = e.target.value

        setTimeout(() =>    editor.chain().focus().setTextAlign(align).run())
    })

    toolbar.querySelector('[data-editor="heading"]')?.addEventListener('change', e => {
        let formats = {
            'paragraph': () =>  editor.chain().focus().setParagraph().run(),
            'heading1': () =>   editor.chain().focus().toggleHeading({ level: 1 }).run(),
            'heading2': () =>   editor.chain().focus().toggleHeading({ level: 2 }).run(),
            'heading3': () =>   editor.chain().focus().toggleHeading({ level: 3 }).run(),
        }

        setTimeout(() => formats[e.target.value]())
    })


    if (toolbar.querySelector('[data-editor="link"]') ){
        toolbar.querySelector('[data-editor="link:url"]')?.addEventListener('keydown', e => {
            if (['ArrowLeft', 'ArrowRight'].includes(e.key) || /^[a-zA-Z0-9]$/.test(e.key)) {
                e.stopPropagation();
            }
        })

        toolbar.querySelector('[data-editor="link:url"]')?.addEventListener('input', e => e.stopPropagation())
        toolbar.querySelector('[data-editor="link:url"]')?.addEventListener('change', e => e.stopPropagation())

        let insertLink = () => {
            let url = toolbar.querySelector('[data-editor="link:url"]')?.value?.trim()

            if (url) {
                editor.chain().focus().setLink({ href: url }).run()
            } else {
                editor.chain().focus().unsetLink().run()
            }
        }

        toolbar.querySelector('[data-editor="link:insert"]')?.addEventListener('click', insertLink)
        toolbar.querySelector('[data-editor="link:url"]')?.addEventListener('keydown', e => ['Enter'].includes(e.key) && insertLink())

        toolbar.querySelector('[data-editor="link:unlink"]')?.addEventListener('click', () => {
            editor.chain().focus().unsetLink().run()
        })
    }

    // Update active states
    let updateToolbar = () => {
        let linkInput = toolbar.querySelector('[data-editor="link:url"]')

        if (linkInput) {
            let linkButton = toolbar.querySelector('[data-editor="link"] [data-match-target]')

            if (editor.isActive('link')) {
                linkButton && setAttribute(linkButton, 'data-match', '')
                let attrs = editor.getAttributes('link')
                linkInput.value = attrs.href || ''
            } else {
                linkButton && removeAndReleaseAttribute(linkButton, 'data-match', '')
                linkInput.value = ''
            }
        }

        let alignEl = toolbar.querySelector('[data-editor="align"]')

        if (alignEl) {
            let currentAlign = ['left', 'center', 'right'].find(align => editor.isActive({ textAlign: align })) || 'left'
            alignEl.value = currentAlign
        }

        let headingEl = toolbar.querySelector('[data-editor="heading"]')

        if (headingEl) {
            let currentFormat = editor.isActive('paragraph') ? 'paragraph' : editor.isActive('heading', { level: 1 }) ? 'heading1' :    editor.isActive('heading', { level: 2 }) ? 'heading2' : editor.isActive('heading', { level: 3 }) ? 'heading3' : null
            headingEl.value = currentFormat
        }

        toolbar.querySelectorAll('button[data-editor]').forEach(button => {
            let commands = {
                'bold': 'bold',
                'italic': 'italic',
                'underline': 'underline',
                'strike': 'strike',
                'bullet': 'bulletList',
                'ordered': 'orderedList',
                'code': 'code',
                'highlight': 'highlight',
                'subscript': 'subscript',
                'superscript': 'superscript',
                'code-block': 'codeBlock',
            }


            let command = commands[button.dataset.editor]

            if (command) {
                editor.isActive(command) ? setAttribute(button, 'data-match', '') : removeAndReleaseAttribute(button, 'data-match')
                editor.isActive(command) ? setAttribute(button, 'aria-pressed', 'true') : setAttribute(button, 'aria-pressed', 'false')
            }
        })
    }

    editor.on('transaction', updateToolbar)
    editor.on('selectionUpdate', updateToolbar)

    assignId(editor.view.dom, 'editor-input')

    setAttribute(toolbar, 'aria-controls', editor.view.dom.getAttribute('id'))
}

class UIEditorContent extends UIElement {
    boot() {
        this.editor = this.closest('ui-editor')?.editor

        if (! this.editor) throw `ui-editor-content: no parent ui-editor element found`
    }
}

inject(({ css }) => css`ui-editor { display: block; }`)
inject(({ css }) => css`ui-editor-content { display: block; }`)

element('editor', UIEditor)
element('editor-content', UIEditorContent)
