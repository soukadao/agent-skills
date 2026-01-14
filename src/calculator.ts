/**
 * 数値計算を行うCalculatorクラス
 * テストパターンのデモンストレーション用のサンプルコード
 */

export class Calculator {
  private history: number[] = []

  /**
   * 2つの数値を加算
   */
  add(a: number, b: number): number {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error('有限数のみを受け付けます')
    }
    const result = a + b
    this.history.push(result)
    return result
  }

  /**
   * 2つの数値を減算
   */
  subtract(a: number, b: number): number {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error('有限数のみを受け付けます')
    }
    const result = a - b
    this.history.push(result)
    return result
  }

  /**
   * 2つの数値を除算
   */
  divide(a: number, b: number): number {
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error('有限数のみを受け付けます')
    }
    if (b === 0) {
      throw new Error('ゼロで除算できません')
    }
    const result = a / b
    this.history.push(result)
    return result
  }

  /**
   * 配列の数値の平均を計算
   */
  average(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error('空の配列では平均を計算できません')
    }
    if (!numbers.every(n => Number.isFinite(n))) {
      throw new Error('すべての要素が有限数である必要があります')
    }
    const sum = numbers.reduce((acc, n) => acc + n, 0)
    return sum / numbers.length
  }

  /**
   * 計算履歴を取得
   */
  getHistory(): readonly number[] {
    return [...this.history]
  }

  /**
   * 計算履歴をクリア
   */
  clearHistory(): void {
    this.history = []
  }
}
