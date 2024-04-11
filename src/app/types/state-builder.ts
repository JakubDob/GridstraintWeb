import { signal, Signal, ValueEqualityFn, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, pairwise, tap } from 'rxjs';

export type StateVarSetterFn<T> = (obj: T) => void;

export type StateVar<T, S = T> = {
  value: Signal<T>;
  changes$: Observable<[T, T]>;
  set: StateVarSetterFn<S>;
};

type StateSetterFnInternal<T, S = T> = (
  value: WritableSignal<T>,
  updatedValue: S
) => void;

export type StateSideEffectFn<T> = (previousValue: T, currentValue: T) => void;

export class StateVarBuilder<T> {
  private initialValue: T;
  private setterFn: StateSetterFnInternal<T, T> = (sig, val) => sig.set(val);
  private sideEffectFn?: StateSideEffectFn<T>;
  private valueEqualityFn?: ValueEqualityFn<T>;

  constructor(initialValue: T) {
    this.initialValue = initialValue;
  }

  static StateVarBuilderWithSetter = class<T, S> {
    private initialValue: T;
    private setterFn: StateSetterFnInternal<T, S>;
    private sideEffectFn?: StateSideEffectFn<T>;
    private valueEqualityFn?: ValueEqualityFn<T>;
    constructor(initialValue: T, setterFn: StateSetterFnInternal<T, S>) {
      this.initialValue = initialValue;
      this.setterFn = setterFn;
    }

    public withSideEffectFn(sideEffectFn: StateSideEffectFn<T>) {
      this.sideEffectFn = sideEffectFn;
      return this;
    }

    public withValueEqualityFn(valueEqualityFn: ValueEqualityFn<T>) {
      this.valueEqualityFn = valueEqualityFn;
      return this;
    }

    public build(): Readonly<StateVar<T, S>> {
      const value = signal<T>(this.initialValue, {
        equal: this.valueEqualityFn,
      });
      let changes = toObservable(value).pipe(pairwise());
      if (this.sideEffectFn) {
        changes = changes.pipe(
          tap((paramPair: [T, T]) => this.sideEffectFn!(...paramPair))
        );
      }
      return {
        value: value.asReadonly(),
        changes$: changes,
        set: (updatedObj: S) => {
          this.setterFn(value, updatedObj);
        },
      };
    }
  };

  public withSetterFn<S>(
    setterFn: StateSetterFnInternal<T, S>
  ): InstanceType<typeof StateVarBuilder.StateVarBuilderWithSetter<T, S>> {
    return new StateVarBuilder.StateVarBuilderWithSetter<T, S>(
      this.initialValue,
      setterFn
    )
      .withValueEqualityFn(this.valueEqualityFn!)
      .withSideEffectFn(this.sideEffectFn!);
  }

  public withSideEffectFn(
    sideEffectFn: StateSideEffectFn<T>
  ): StateVarBuilder<T> {
    this.sideEffectFn = sideEffectFn;
    return this;
  }

  public withValueEqualityFn(
    valueEqualityFn: ValueEqualityFn<T>
  ): StateVarBuilder<T> {
    this.valueEqualityFn = valueEqualityFn;
    return this;
  }

  public build(): Readonly<StateVar<T>> {
    const value = signal<T>(this.initialValue, {
      equal: this.valueEqualityFn,
    });
    let changes = toObservable(value).pipe(pairwise());
    if (this.sideEffectFn) {
      changes = changes.pipe(
        tap((paramPair: [T, T]) => this.sideEffectFn!(...paramPair))
      );
    }
    return {
      value: value.asReadonly(),
      changes$: changes,
      set: (updatedObj: T) => {
        this.setterFn(value, updatedObj);
      },
    };
  }
}
