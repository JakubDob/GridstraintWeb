# GridstraintWeb

Define custom constraints on a grid and solve it using a constraint solver.

### Constraints

The application currently supports `alldifferent`, `count` and `value`.

### Design

The grid consists of three main parts:

- `constraints`
- `views`
- `groups`

Each constraint can encompass multiple views. Each view consists of zero or more groups.
One view is displayed at a time. A group is a subset of the grid's indices.

### Example

A `9x9 sudoku` solver can be constructed with:

- A single `alldifferent` constraint
- Values ranging from 1 to 9
- Three views consisting of:

  - 3 \* (3 $\times$ 3) square groups
  - 9 \* (9 $\times$ 1) vertical groups
  - 9 \* (1 $\times$ 9) horizontal groups

This flexibility allows for creation of custom rules on non-standard sized boards.

`N-queens problem`, assuming a square n $\times$ n board, can be modeled as:

- A single `count` constraint
- Values equal 0 or 1
- Four views consisting of:
  - (9 \* n) vertical groups with `exactly` n-1 zeros and 1 one value
  - (9 \* n) horizontal groups with `exactly` n-1 zeros and 1 one value
  - (9 \* n) left diagonal groups with `at most` 1 one value
  - (9 \* n) right diagonal groups with `at most` 1 one value

### Custom grid sizes

Specify from 1 to 50 rows and columns.

## Tools

### Tiling

The tiling feature allows the currently selected group pattern to be replicated across the entire view, creating a series of similar groups.

### Fill

The fill tool adds all unassigned cells to the currently selected group, facilitating quick group creation.

### Model generation

Grid constraints are transformed into an exportable [MiniZinc](https://www.minizinc.org/) model. It can also be shared through the url.

### In-Browser solving

The generated model is solved directly in the browser using [the emscripten version of MiniZinc](https://github.com/MiniZinc/minizinc-js).
