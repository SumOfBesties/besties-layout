export function getNextIndex(array: Array<unknown>, currentIndex: number): number {
    return currentIndex + 1 >= array.length ? 0 : currentIndex + 1;
}
