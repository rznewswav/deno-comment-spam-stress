export class StringDefaultedMap {
    readonly m: Record<string, string> = {}

    get(key: string): string {
        return this.m[key] ?? ""
    }

    set(key: string, value: string): void {
        this.m[key] = value
    }
}