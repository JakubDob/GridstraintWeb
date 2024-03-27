export interface Comparator<T> {
  (a: T, b: T): boolean;
}

export class PriorityQueue<T> {
  private cmp: Comparator<T>;
  private heap: T[] = [];

  constructor(comparator: Comparator<T>) {
    this.cmp = comparator;
  }

  public push(item: T): void {
    this.insert(item);
  }

  public pop(): T {
    return this.delete();
  }

  public empty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap = [];
  }

  public get size(): number {
    return this.heap.length;
  }

  public forEach(callbackfn: (value: T) => void): void {
    for (let item of this.heap) {
      callbackfn(item);
    }
  }

  private parentI(index: number) {
    return Math.floor((index - 1) / 2);
  }

  private leftChildI(index: number) {
    return index * 2 + 1;
  }

  private rightChildI(index: number) {
    return index * 2 + 2;
  }

  private percolateUp(index: number) {
    let pI = this.parentI(index);
    while (pI >= 0 && this.cmp(this.heap[index], this.heap[pI])) {
      const tmp = this.heap[index];
      this.heap[index] = this.heap[pI];
      this.heap[pI] = tmp;
      index = pI;
      pI = this.parentI(index);
    }
  }

  private percolateDown(index: number) {
    while (this.leftChildI(index) < this.heap.length) {
      const rcI = this.rightChildI(index);
      const lcI = this.leftChildI(index);
      let cI = 0;
      if (rcI < this.heap.length && this.cmp(this.heap[rcI], this.heap[lcI])) {
        cI = rcI;
      } else {
        cI = lcI;
      }
      if (this.cmp(this.heap[cI], this.heap[index])) {
        const tmp = this.heap[index];
        this.heap[index] = this.heap[cI];
        this.heap[cI] = tmp;
      }
      index = cI;
    }
  }

  private insert(item: T): void {
    this.heap.push(item);
    this.percolateUp(this.heap.length - 1);
  }

  private delete(): T {
    const last = this.heap.pop();
    if (this.heap.length === 0) {
      if (last) {
        return last;
      } else {
        throw Error('Deleting from an empty queue');
      }
    } else {
      const top = this.heap[0];
      if (last !== undefined) {
        this.heap[0] = last;
        this.percolateDown(0);
      }
      return top;
    }
  }
}
