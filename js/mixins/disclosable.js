import { Mixin } from './mixin.js'

export class Disclosable extends Mixin {
    boot({ options }) {
        this.onChanges = []

        this.state = false
    }

    onChange(callback) {
        this.onChanges.push(callback)
    }

    getState() {
        return this.state
    }

    setState(value) {
        let oldState =  this.state

        this.state = !! value

        if (this.state !== oldState) {
            this.onChanges.forEach(i => i())
        }
    }
}
