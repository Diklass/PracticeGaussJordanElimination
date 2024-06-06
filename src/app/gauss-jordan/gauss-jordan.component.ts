import { Component, HostListener, OnInit  } from '@angular/core';

@Component({
  selector: 'app-gauss-jordan',
  templateUrl: './gauss-jordan.component.html',
  styleUrls: ['./gauss-jordan.component.scss']
})
export class GaussJordanComponent {
  rows: number = 3;
  columns: number = 4;
  matrix: number[][] = []; // Матрица коэффициентов и свободных членов
  solution: number[] | null = null; // Решение системы уравнений
  reducedMatrix: number[][] | null = null; // Преобразованная матрица (верхнетреугольная)
  tempInput: any[][] = Array.from({ length: this.rows }, () =>
    Array.from({ length: this.columns }, () => ({ value: '' }))
  ); // Временное хранилище для ввода значений матрицы
  activeCell: { row: number; col: number } | null = null; // Активная ячейка ввода
  isInputActive: boolean = false; // Флаг активности ввода
  isMobile: boolean = false;

  constructor() {
    this.initializeMatrix();
  }
  ngOnInit() {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
    this.updateMatrixSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 480;
      if (this.isMobile && this.columns > 4) {
        this.columns = 4;
        this.updateMatrixSize();
      }
    }
  }

  // Инициализация матрицы нулями
  initializeMatrix() {
    this.matrix = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => 0)
    );
    this.updateTempInput();
    console.log('Matrix initialized:');
    this.logMatrix(this.matrix);
  }

  // Обновление размеров матрицы с сохранением текущих значений
  updateMatrixSize() {
    const newMatrix = Array.from({ length: this.rows }, (_, i) =>
      Array.from({ length: this.columns }, (_, j) =>
        (this.matrix[i] && this.matrix[i][j] !== undefined) ? this.matrix[i][j] : 0
      )
    );
    this.matrix = newMatrix;
    this.updateTempInput();
    console.log('Matrix updated:');
    this.logMatrix(this.matrix);
  }

  // Обновление временного ввода значений
  updateTempInput() {
    this.tempInput = Array.from({ length: this.rows }, (_, i) =>
      Array.from({ length: this.columns }, (_, j) => ({ value: this.matrix[i][j].toString() }))
    );
  }

  // Обработка ввода значений в ячейки матрицы
  onCellInput(event: any, row: number, col: number) {
    let value = event.target.value;
    // Ограничиваем ввод до двух символов
    value = value.slice(0, 2);
    this.tempInput[row][col].value = value;
    this.matrix[row][col] = parseFloat(value) || 0;
    console.log(`Input at row ${row}, col ${col}: ${value}`);
    this.updateMatrixSize(); 
  }
  
  // Обработка фокуса на ячейке ввода
  onCellFocus(event: any, row: number, col: number) {
    this.activeCell = { row, col };
    this.isInputActive = true;
    const inputElement = event.target as HTMLInputElement;
    if (this.matrix[row][col] === 0) {
      this.tempInput[row][col].value = '';
    }
    inputElement.select(); // Выделить весь текст в поле ввода
  }

  // Обработка потери фокуса на ячейке ввода
  onCellBlur(event: any, row: number, col: number) {
    this.activeCell = null;
    this.isInputActive = false;
    const inputValue = event.target.value;
    if (inputValue === '') {
      // Если поле ввода пустое, сбрасываем значение ячейки на 0
      this.matrix[row][col] = 0;
    } else {
      // Обновляем значение ячейки введенным значением
      this.matrix[row][col] = parseFloat(inputValue) || 0;
    }
    console.log('Matrix after cell blur:');
    this.logMatrix(this.matrix);
    this.updateTempInput(); // Обновляем tempInput для отражения изменений
  }

  // Клонирование матрицы
  cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map(row => row.slice());
  }

  // Метод Гаусса-Жордана для приведения матрицы к верхнетреугольному виду
  gaussJordanElimination(matrix: number[][]): { solution: number[], reducedMatrix: number[][] } {
    let n = matrix.length;
    let m = matrix[0].length - 1;
    let reducedMatrix = matrix.map(row => row.slice());
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(reducedMatrix[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(reducedMatrix[k][i]) > maxEl) {
          maxEl = Math.abs(reducedMatrix[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < m + 1; k++) {
        let tmp = reducedMatrix[maxRow][k];
        reducedMatrix[maxRow][k] = reducedMatrix[i][k];
        reducedMatrix[i][k] = tmp;
      }
      if (reducedMatrix[i][i] !== 0) {
        for (let k = i + 1; k < m + 1; k++) {
          reducedMatrix[i][k] /= reducedMatrix[i][i];
        }
        reducedMatrix[i][i] = 1;
      } else {
        continue;
      }
      for (let k = 0; k < n; k++) {
        if (k != i) {
          let c = reducedMatrix[k][i];
          for (let j = i; j < m + 1; j++) {
            reducedMatrix[k][j] -= c * reducedMatrix[i][j];
          }
          reducedMatrix[k][i] = 0;
        }
      }
    }
    let solution = new Array(n);
    for (let i = 0; i < n; i++) {
      solution[i] = parseFloat(reducedMatrix[i][m].toFixed(10));
    }
    return { solution, reducedMatrix };
  }

  // Запуск решения системы уравнений методом Гаусса-Жордана
  solve() {
    this.updateTempInput();
    setTimeout(() => {
      console.log('Matrix before solving:');
      this.logMatrix(this.matrix);
      const { solution, reducedMatrix } = this.gaussJordanElimination(this.cloneMatrix(this.matrix));
      this.solution = solution.map(num => parseFloat(num.toFixed(2))); // Округляем каждый элемент до двух знаков после запятой
      this.reducedMatrix = reducedMatrix;
      console.log('Solution: ', this.solution);
      console.log('Reduced Matrix: ', reducedMatrix);
    }, 0);
  }

  // Логирование текущего состояния матрицы
  logMatrix(matrix: number[][]) {
    console.log('Current matrix state:');
    matrix.forEach(row => {
        console.log(row.join('\t'));
    });
  }
}
