import { Injectable, signal } from '@angular/core';
import * as MiniZinc from 'minizinc';
import { Subject } from 'rxjs';
import { MiniZincCmdParams, SupportedSolver } from '../../types/solver-types';

type SingleSolutionCb = (solutionMsg: MiniZinc.SolutionMessage) => void;
type SolveResultCb = (solveResult: MiniZinc.SolveResult) => void;
type ExitCb = (exitMsg: MiniZinc.ExitMessage) => void;

@Injectable({
  providedIn: 'root',
})
export class MiniZincService {
  private currentModel?: MiniZinc.Model;
  private currentSolveProgress?: MiniZinc.SolveProgress;
  private _isRunning = signal<boolean>(false);
  private _defaultSolver: SupportedSolver | null = null;
  private supportedSolversSubject = new Subject<SupportedSolver[]>();
  private defaultSolverSubject = new Subject<SupportedSolver>();

  readonly isRunning = this._isRunning.asReadonly();
  readonly supportedSolvers$ = this.supportedSolversSubject.asObservable();
  readonly defaultSolver$ = this.defaultSolverSubject.asObservable();

  constructor() {
    MiniZinc.solvers().then((data: any[]) => {
      const init: SupportedSolver[] = [];
      data.forEach((solver) => {
        init.push({
          internalName: solver.name,
          version: solver.version,
          displayName: `${solver.name} ${solver.version}`,
        });
      });
      this.supportedSolversSubject.next(init);
      const defSolver = init.find(
        (solver) => solver.internalName.toLowerCase() === 'gecode'
      );
      if (defSolver) {
        this._defaultSolver = defSolver;
        this.defaultSolverSubject.next(defSolver);
      }
    });
  }

  solve(
    modelContent: string,
    singleSolutionCb: SingleSolutionCb,
    solveResultCb: SolveResultCb,
    exitCb: ExitCb,
    params?: MiniZincCmdParams
  ): boolean {
    params = this.parseParams(params);
    if (this.currentSolveProgress?.isRunning()) {
      return false;
    }
    this._isRunning.set(true);
    this.currentModel = new MiniZinc.Model();
    this.currentModel.addString(modelContent);
    this.currentSolveProgress = this.currentModel.solve({
      options: params,
    });
    this.currentSolveProgress.on('solution', (solutionMsg) => {
      singleSolutionCb(solutionMsg);
    });
    this.currentSolveProgress.on('exit', () => {
      this._isRunning.set(false);
    });
    this.currentSolveProgress.then(
      (result) => {
        solveResultCb(result);
      },
      (error) => {
        exitCb(error);
      }
    );
    return true;
  }

  cancel() {
    this.currentSolveProgress?.cancel();
  }

  private parseParams(params?: MiniZincCmdParams): MiniZinc.ParamConfig {
    let newParams: MiniZinc.ParamConfig = {};
    newParams.solver = params?.solver
      ? params?.solver
      : this._defaultSolver?.internalName;
    if (params === undefined) {
      return newParams;
    }
    for (let key in params) {
      if (params[key as keyof MiniZincCmdParams] !== undefined) {
        newParams[key] = params[key as keyof MiniZincCmdParams];
      }
    }
    return newParams;
  }
}
