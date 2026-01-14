/**
 * Calculator クラスのテスト
 *
 * このテストファイルは、test-writer skill と test-generator subagent の
 * 原則に基づいた高品質なテストコードの例を示します。
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Calculator } from './calculator'

describe('Calculator', () => {
  let calculator: Calculator

  // 3. 再現性と独立: 各テストの前にクリーンな状態を用意
  beforeEach(() => {
    calculator = new Calculator()
  })

  describe('add', () => {
    describe('正常系', () => {
      // 1. 振る舞いの検証: 加算の基本的な振る舞いをテスト
      it('正の整数を加算できる', () => {
        // AAA パターン
        // Arrange: 準備
        const a = 2
        const b = 3

        // Act: 実行
        const result = calculator.add(a, b)

        // Assert: 検証
        expect(result).toBe(5)
      })

      // 4. 1テスト1観点: 各テストは1つの観点のみ
      it('負の数を加算できる', () => {
        expect(calculator.add(-5, -3)).toBe(-8)
      })

      it('小数を加算できる', () => {
        expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3)
      })

      it('ゼロを加算できる', () => {
        expect(calculator.add(5, 0)).toBe(5)
      })
    })

    describe('境界値', () => {
      // 2. 境界と異常系: 境界値をテスト
      it('非常に大きな数を加算できる', () => {
        const result = calculator.add(Number.MAX_SAFE_INTEGER - 1, 1)
        expect(result).toBe(Number.MAX_SAFE_INTEGER)
      })

      it('非常に小さな数を加算できる', () => {
        const result = calculator.add(Number.MIN_SAFE_INTEGER + 1, -1)
        expect(result).toBe(Number.MIN_SAFE_INTEGER)
      })
    })

    describe('異常系', () => {
      // 2. 境界と異常系: エラーケースをテスト
      // 5. 失敗時の情報: エラーメッセージが明確
      it('Infinityを渡すとエラーをスローする', () => {
        expect(() => calculator.add(Infinity, 1))
          .toThrow('有限数のみを受け付けます')
      })

      it('NaNを渡すとエラーをスローする', () => {
        expect(() => calculator.add(NaN, 1))
          .toThrow('有限数のみを受け付けます')
      })

      it('両方の引数が無効な場合もエラーをスローする', () => {
        expect(() => calculator.add(Infinity, NaN))
          .toThrow('有限数のみを受け付けます')
      })
    })

    describe('副作用', () => {
      // 1. 振る舞いの検証: 履歴への記録という副作用を検証
      it('結果を履歴に記録する', () => {
        calculator.add(2, 3)
        const history = calculator.getHistory()
        expect(history).toEqual([5])
      })
    })
  })

  describe('subtract', () => {
    describe('正常系', () => {
      it('正の整数を減算できる', () => {
        expect(calculator.subtract(5, 3)).toBe(2)
      })

      it('負の数を減算できる', () => {
        expect(calculator.subtract(-5, -3)).toBe(-2)
      })

      it('ゼロを減算できる', () => {
        expect(calculator.subtract(5, 0)).toBe(5)
      })
    })

    describe('異常系', () => {
      it('Infinityを渡すとエラーをスローする', () => {
        expect(() => calculator.subtract(Infinity, 1))
          .toThrow('有限数のみを受け付けます')
      })
    })
  })

  describe('divide', () => {
    describe('正常系', () => {
      it('整数を除算できる', () => {
        expect(calculator.divide(6, 2)).toBe(3)
      })

      it('小数の結果を返す', () => {
        expect(calculator.divide(5, 2)).toBe(2.5)
      })

      it('負の数で除算できる', () => {
        expect(calculator.divide(6, -2)).toBe(-3)
      })
    })

    describe('異常系', () => {
      // 2. 境界と異常系: ゼロ除算という重要なエッジケース
      it('ゼロで除算するとエラーをスローする', () => {
        expect(() => calculator.divide(5, 0))
          .toThrow('ゼロで除算できません')
      })

      it('Infinityを渡すとエラーをスローする', () => {
        expect(() => calculator.divide(Infinity, 1))
          .toThrow('有限数のみを受け付けます')
      })
    })
  })

  describe('average', () => {
    describe('正常系', () => {
      it('整数の配列の平均を計算できる', () => {
        expect(calculator.average([1, 2, 3, 4, 5])).toBe(3)
      })

      it('小数を含む配列の平均を計算できる', () => {
        expect(calculator.average([1.5, 2.5, 3.5])).toBeCloseTo(2.5)
      })

      it('負の数を含む配列の平均を計算できる', () => {
        expect(calculator.average([-1, 0, 1])).toBe(0)
      })
    })

    describe('境界値', () => {
      // 2. 境界と異常系: 単一要素という境界値
      it('単一要素の配列でその値を返す', () => {
        expect(calculator.average([5])).toBe(5)
      })

      // 2. 境界と異常系: 空配列という境界値
      it('空の配列でエラーをスローする', () => {
        expect(() => calculator.average([]))
          .toThrow('空の配列では平均を計算できません')
      })

      it('非常に大きな配列を処理できる', () => {
        const largeArray = new Array(10000).fill(1)
        expect(calculator.average(largeArray)).toBe(1)
      })
    })

    describe('異常系', () => {
      it('Infinityを含む配列でエラーをスローする', () => {
        expect(() => calculator.average([1, Infinity, 3]))
          .toThrow('すべての要素が有限数である必要があります')
      })

      it('NaNを含む配列でエラーをスローする', () => {
        expect(() => calculator.average([1, NaN, 3]))
          .toThrow('すべての要素が有限数である必要があります')
      })
    })
  })

  describe('getHistory', () => {
    describe('正常系', () => {
      it('初期状態では空の配列を返す', () => {
        expect(calculator.getHistory()).toEqual([])
      })

      it('計算履歴を順番に記録する', () => {
        calculator.add(1, 2)      // 3
        calculator.subtract(5, 2) // 3
        calculator.divide(6, 2)   // 3

        const history = calculator.getHistory()
        expect(history).toEqual([3, 3, 3])
      })
    })

    describe('不変性', () => {
      // 1. 振る舞いの検証: 履歴の不変性を検証
      it('返された配列を変更しても内部状態に影響しない', () => {
        calculator.add(1, 2)
        const history = calculator.getHistory() as number[]

        // 返された配列を変更
        history.push(999)

        // 内部状態は変更されていないことを確認
        const newHistory = calculator.getHistory()
        expect(newHistory).toEqual([3])
        expect(newHistory).not.toContain(999)
      })
    })
  })

  describe('clearHistory', () => {
    // 4. 1テスト1観点: 履歴のクリアという1つの観点
    it('計算履歴をクリアする', () => {
      // Arrange: 履歴を作成
      calculator.add(1, 2)
      calculator.add(3, 4)
      expect(calculator.getHistory()).toHaveLength(2)

      // Act: 履歴をクリア
      calculator.clearHistory()

      // Assert: 履歴が空になっている
      expect(calculator.getHistory()).toEqual([])
    })

    it('クリア後も新しい計算を記録できる', () => {
      calculator.add(1, 2)
      calculator.clearHistory()
      calculator.add(5, 5)

      expect(calculator.getHistory()).toEqual([10])
    })
  })

  describe('複数操作の統合', () => {
    // 3. 再現性と独立: このテストも独立して実行可能
    it('複数の計算を連続して実行できる', () => {
      calculator.add(10, 5)        // 15
      calculator.subtract(20, 10)  // 10
      calculator.divide(20, 4)     // 5

      const history = calculator.getHistory()
      expect(history).toEqual([15, 10, 5])
    })
  })
})

/**
 * このテストファイルが実証する原則：
 *
 * 1. ✅ 振る舞いの検証
 *    - 公開APIの振る舞い（add, subtract, divide, average）をテスト
 *    - 内部実装（_historyなどのプライベートフィールド）は直接テストしない
 *
 * 2. ✅ 境界と異常系
 *    - 正常系、境界値、異常系を網羅的にカバー
 *    - 空配列、単一要素、ゼロ除算、Infinity、NaNなど
 *
 * 3. ✅ 再現性と独立
 *    - beforeEach で各テストをクリーンな状態から開始
 *    - テストの実行順序に依存しない
 *
 * 4. ✅ 1テスト1観点
 *    - 各itブロックは1つの観点のみを検証
 *    - テスト名が検証内容を明確に表現
 *
 * 5. ✅ 失敗時の情報
 *    - テスト名が具体的で理解しやすい
 *    - エラーメッセージを検証し、期待されるエラーが返されることを確認
 *
 * 6. ✅ テストしやすい設計との整合
 *    - Calculatorクラスは純粋な関数的操作を提供
 *    - 外部依存がないため、モック不要
 *
 * 7. ✅ 削除可能性
 *    - 単純なgetterのような価値の低いテストは最小限
 *    - 各テストがビジネスロジックの重要な側面を検証
 */
