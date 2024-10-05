export enum Key {
    DOWN,
    UP,
    ENTER,
    SPACE
}

export class KeyHandler {
    private pressingKeys: Set<Key> = new Set()

    getPressingKeys(): Set<Key> {
        return this.pressingKeys
    }

    onKeyDown({ key }: KeyboardEvent) {
        switch (key) {
            case 'ArrowDown':
                this.pressingKeys.add(Key.DOWN)
                break;
            case 'ArrowUp':
                this.pressingKeys.add(Key.UP)
                break;
            case ' ':
                this.pressingKeys.add(Key.SPACE)
                break;
            case 'Enter':
                this.pressingKeys.add(Key.ENTER)
                break;
        }
    }

    onKeyUp({ key }: KeyboardEvent) {
        switch (key) {
            case 'ArrowDown':
                this.pressingKeys.delete(Key.DOWN)
                break;
            case 'ArrowUp':
                this.pressingKeys.delete(Key.UP)
                break;
            case ' ':
                this.pressingKeys.delete(Key.SPACE)
                break;
            case 'Enter':
                this.pressingKeys.delete(Key.ENTER)
                break;
        }
    }
}
