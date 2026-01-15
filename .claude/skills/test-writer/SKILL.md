---
name: test-writer
description: テストコードの作成とレビューを支援します。テストを書く際、またはテストコードの改善が必要な場合に使用します。振る舞いの検証、境界値テスト、異常系のカバレッジを重視します。
---

# Test Writer Skill

## 概要

このスキルは、高品質なテストコードの作成を支援します。以下の原則に基づいてテストを設計します：

1. **振る舞いの検証** - 実装の詳細ではなく、振る舞いをテストする
2. **境界と異常系** - 正常系だけでなく、エッジケースとエラーケースもカバーする
3. **再現性と独立** - テストは常に同じ結果を返し、他のテストに依存しない
4. **1テスト1観点** - 各テストは1つの観点のみを検証する
5. **失敗時の情報** - テストが失敗したとき、原因が明確にわかる
6. **テストしやすい設計との整合** - テスタビリティを考慮した設計を促進する
7. **削除可能性** - 不要になったテストは躊躇なく削除できる

## テスト作成のガイドライン

### 1. テストの命名規則

テスト名は「何をテストしているか」が明確にわかるようにします：

```typescript
// 良い例
describe('User.authenticate', () => {
  it('正しいパスワードで認証が成功する', () => {})
  it('間違ったパスワードで認証が失敗する', () => {})
  it('空のパスワードでバリデーションエラーを返す', () => {})
})

// 悪い例
describe('User', () => {
  it('test1', () => {})
  it('should work', () => {})
})
```

### 2. AAA パターン (Arrange-Act-Assert)

テストは明確な3つのセクションに分割します：

```typescript
it('商品をカートに追加すると合計金額が更新される', () => {
  // Arrange: テストの準備
  const cart = new Cart()
  const product = { id: '1', price: 1000 }

  // Act: テスト対象の操作を実行
  cart.add(product)

  // Assert: 結果を検証
  expect(cart.total).toBe(1000)
})
```

### 3. 境界値と異常系のテスト

正常系だけでなく、以下のケースもテストします：

```typescript
describe('配列の最大値を取得', () => {
  it('正の数のみの配列で最大値を返す', () => {
    expect(max([1, 2, 3])).toBe(3)
  })

  it('負の数を含む配列で最大値を返す', () => {
    expect(max([-1, -2, -3])).toBe(-1)
  })

  it('1要素の配列でその値を返す', () => {
    expect(max([5])).toBe(5)
  })

  it('空配列でエラーをスローする', () => {
    expect(() => max([])).toThrow('配列が空です')
  })

  it('数値以外を含む配列でエラーをスローする', () => {
    expect(() => max([1, 'a', 3])).toThrow('数値以外が含まれています')
  })
})
```

### 4. テストの独立性

各テストは独立して実行可能にします：

```typescript
// 良い例
describe('UserRepository', () => {
  let repository: UserRepository

  beforeEach(() => {
    repository = new UserRepository()
  })

  it('ユーザーを作成できる', () => {
    const user = repository.create({ name: 'Alice' })
    expect(user.name).toBe('Alice')
  })

  it('ユーザーを検索できる', () => {
    const user = repository.create({ name: 'Bob' })
    const found = repository.findById(user.id)
    expect(found).toEqual(user)
  })
})

// 悪い例（テストが順序に依存）
describe('UserRepository', () => {
  let userId: string

  it('ユーザーを作成できる', () => {
    const user = repository.create({ name: 'Alice' })
    userId = user.id // 次のテストで使用
  })

  it('ユーザーを検索できる', () => {
    const found = repository.findById(userId) // 前のテストに依存
    expect(found.name).toBe('Alice')
  })
})
```

### 5. モックとスタブの使用

外部依存を適切にモック化します：

```typescript
import { vi } from 'vitest'

describe('OrderService', () => {
  it('注文確定時に在庫を減らす', async () => {
    // Arrange: 依存関係をモック化
    const mockInventory = {
      decrease: vi.fn().mockResolvedValue(true)
    }
    const service = new OrderService(mockInventory)

    // Act
    await service.placeOrder({ productId: '1', quantity: 2 })

    // Assert
    expect(mockInventory.decrease).toHaveBeenCalledWith('1', 2)
  })
})
```

### 6. 失敗時の明確なメッセージ

テストが失敗したとき、何が問題かすぐにわかるようにします：

```typescript
// 良い例
it('ユーザー名が20文字以下であること', () => {
  const longName = 'a'.repeat(21)
  const result = validateUsername(longName)
  expect(result.isValid).toBe(false)
  expect(result.error).toBe('ユーザー名は20文字以内にしてください')
})

// 悪い例
it('validation', () => {
  expect(validate('x')).toBe(false) // なぜ失敗したかわからない
})
```

### 7. テストデータの管理

テストデータはファクトリーやビルダーパターンで管理します：

```typescript
// テストデータファクトリー
function createTestUser(overrides = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }
}

describe('UserService', () => {
  it('管理者のみが削除できる', () => {
    const admin = createTestUser({ role: 'admin' })
    const result = service.canDelete(admin)
    expect(result).toBe(true)
  })

  it('一般ユーザーは削除できない', () => {
    const user = createTestUser({ role: 'user' })
    const result = service.canDelete(user)
    expect(result).toBe(false)
  })
})
```

## TypeScript/Node.js での推奨テストフレームワーク

このプロジェクトでは以下のツールを使用します：

- **テストランナー**: Vitest
- **アサーションライブラリー**: 組み込み (expect)
- **モックライブラリー**: vi.fn()
- **カバレッジツール**: Vitest の組み込みカバレッジ

## テストファイルの配置

```
src/
  user/
    user.ts
    user.test.ts  # 実装と同じディレクトリ
  cart/
    cart.ts
    cart.test.ts
```

または

```
src/
  user/
    user.ts
tests/
  user/
    user.test.ts  # testsディレクトリに集約
```

## カバレッジについて

カバレッジは Vitest の組み込みツールで計測します：

```bash
vitest run --coverage
```

**カバレッジの方針**:
- **C0 (Statement Coverage)**: 100% - すべてのコード行を実行
- **C1 (Branch Coverage)**: 100% - すべての条件分岐を実行
- **単純な getter/setter**: テスト不要（削除可能性の観点から）

カバレッジの見積もりは不要です。実際の計測結果を確認してください。

## アンチパターン

避けるべきパターン：

1. **実装の詳細をテストする**
   ```typescript
   // 悪い例
   it('内部のキャッシュマップを使用する', () => {
     expect(service._cache instanceof Map).toBe(true)
   })
   ```

2. **複数の観点を1つのテストで検証**
   ```typescript
   // 悪い例
   it('ユーザー機能', () => {
     expect(user.create()).toBeTruthy()
     expect(user.update()).toBeTruthy()
     expect(user.delete()).toBeTruthy()
   })
   ```

3. **テスト間の状態共有**
   ```typescript
   // 悪い例
   let sharedState = {}
   it('test1', () => { sharedState.value = 1 })
   it('test2', () => { expect(sharedState.value).toBe(1) })
   ```
