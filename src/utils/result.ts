type Maybe<T> = T | null;

export function Ok<T, E>(value: T) {
    return new Result<T, E>(value, null);
}
export function Error<T, E>(err: E) {
    return new Result<T, E>(null, err);
}

export class Result<T, E> {
    value: Maybe<T>;
    error: Maybe<E>;

    constructor(value: Maybe<T>, error: Maybe<E>) {
        if (error) {
            this.error = error;
            this.value = null;
        } else {
            this.value = value;
            this.error = null;
        }
    }

    err() {
        return this.error !== null;
    }

    ok() {
        return this.value !== null;
    }

    get() {
        return this.value;
    }
}
