# カスタムサブエージェントの作成

> Claude Codeで特化したAIサブエージェントを作成・使用し、タスク固有のワークフローと改善されたコンテキスト管理を実現します。

サブエージェントは、特定の種類のタスクを処理する特化したAIアシスタントです。各サブエージェントは独自のコンテキストウィンドウで実行され、カスタムシステムプロンプト、特定のツールアクセス、独立した権限を持ちます。Claudeがサブエージェントの説明に一致するタスクに遭遇すると、そのサブエージェントに委譲し、サブエージェントは独立して動作して結果を返します。

サブエージェントは以下の点で役立ちます：

* **コンテキストを保持する** - 探索と実装をメインの会話から分離することで
* **制約を強制する** - サブエージェントが使用できるツールを制限することで
* **設定を再利用する** - ユーザーレベルのサブエージェントでプロジェクト全体で
* **動作を特化させる** - 特定のドメイン向けの焦点を絞ったシステムプロンプトで
* **コストを管理する** - Haikuのような高速で安価なモデルにタスクをルーティングすることで

Claudeは各サブエージェントの説明を使用してタスクを委譲するかどうかを決定します。サブエージェントを作成するときは、Claudeがいつそれを使用するかを知るように明確な説明を書いてください。

Claude Codeには、**Explore**、**Plan**、**general-purpose**などのいくつかの組み込みサブエージェントが含まれています。特定のタスクを処理するカスタムサブエージェントを作成することもできます。このページでは、[組み込みサブエージェント](#built-in-subagents)、[独自のサブエージェントの作成方法](#quickstart-create-your-first-subagent)、[完全な設定オプション](#configure-subagents)、[サブエージェントの操作パターン](#work-with-subagents)、および[サブエージェントの例](#example-subagents)について説明します。

## 組み込みサブエージェント

Claude Codeには、Claudeが適切に自動的に使用する組み込みサブエージェントが含まれています。各サブエージェントは親の会話の権限を継承し、追加のツール制限があります。

<Tabs>
  <Tab title="Explore">
    コードベースの検索と分析に最適化された高速な読み取り専用エージェント。

    * **モデル**: Haiku（高速、低レイテンシ）
    * **ツール**: 読み取り専用ツール（WriteおよびEditツールへのアクセスは拒否）
    * **目的**: ファイル検出、コード検索、コードベース探索

    Claudeは、変更を加えずにコードベースを検索または理解する必要がある場合、Exploreに委譲します。これにより、探索結果がメインの会話コンテキストから除外されます。

    Exploreを呼び出すとき、Claudeは詳細度レベルを指定します：**quick**は対象を絞った検索用、**medium**はバランスの取れた探索用、**very thorough**は包括的な分析用です。
  </Tab>

  <Tab title="Plan">
    [プランモード](/ja/common-workflows#use-plan-mode-for-safe-code-analysis)中にプランを提示する前にコンテキストを収集するために使用される研究エージェント。

    * **モデル**: メイン会話から継承
    * **ツール**: 読み取り専用ツール（WriteおよびEditツールへのアクセスは拒否）
    * **目的**: 計画用のコードベース研究

    プランモード中でClaudeがコードベースを理解する必要がある場合、研究をPlanサブエージェントに委譲します。これにより無限ネストを防ぎます（サブエージェントは他のサブエージェントを生成できません）。必要なコンテキストを収集しながら。
  </Tab>

  <Tab title="General-purpose">
    探索と実行の両方を必要とする複雑なマルチステップタスク用の有能なエージェント。

    * **モデル**: メイン会話から継承
    * **ツール**: すべてのツール
    * **目的**: 複雑な研究、マルチステップ操作、コード修正

    Claudeは、タスクが探索と修正の両方を必要とする場合、結果を解釈するための複雑な推論が必要な場合、または複数の依存ステップがある場合、general-purposeに委譲します。
  </Tab>

  <Tab title="Other">
    Claude Codeには、特定のタスク用の追加のヘルパーエージェントが含まれています。これらは通常自動的に呼び出されるため、直接使用する必要はありません。

    | エージェント            | モデル    | Claudeが使用する場合                     |
    | :---------------- | :----- | :-------------------------------- |
    | Bash              | 継承     | 別のコンテキストでターミナルコマンドを実行する場合         |
    | statusline-setup  | Sonnet | `/statusline`を実行してステータスラインを設定する場合 |
    | Claude Code Guide | Haiku  | Claude Codeの機能について質問する場合          |
  </Tab>
</Tabs>

これらの組み込みサブエージェント以外に、カスタムプロンプト、ツール制限、権限モード、フック、スキルを使用して独自のサブエージェントを作成できます。以下のセクションでは、開始方法とサブエージェントのカスタマイズ方法を示します。

## クイックスタート：最初のサブエージェントを作成する

サブエージェントはYAMLフロントマター付きのMarkdownファイルで定義されます。[手動で作成](#write-subagent-files)するか、`/agents`スラッシュコマンドを使用できます。

このウォークスルーでは、`/agent`コマンドを使用してユーザーレベルのサブエージェントを作成するプロセスをガイドします。サブエージェントはコードをレビューし、コードベースの改善を提案します。

<Steps>
  <Step title="サブエージェントインターフェースを開く">
    Claude Codeで、以下を実行します：

    ```
    /agents
    ```
  </Step>

  <Step title="新しいユーザーレベルエージェントを作成する">
    **Create new agent**を選択し、**User-level**を選択します。これにより、サブエージェントが`~/.claude/agents/`に保存され、すべてのプロジェクトで利用可能になります。
  </Step>

  <Step title="Claudeで生成する">
    **Generate with Claude**を選択します。プロンプトが表示されたら、サブエージェントを説明します：

    ```
    ファイルをスキャンして可読性、パフォーマンス、ベストプラクティスの改善を提案するコード改善エージェント。各問題を説明し、現在のコードを表示し、改善されたバージョンを提供する必要があります。
    ```

    Claudeはシステムプロンプトと設定を生成します。カスタマイズしたい場合は、`e`を押してエディタで開きます。
  </Step>

  <Step title="ツールを選択する">
    読み取り専用レビュアーの場合、**Read-only tools**以外のすべてを選択解除します。すべてのツールを選択したままにすると、サブエージェントはメイン会話で利用可能なすべてのツールを継承します。
  </Step>

  <Step title="モデルを選択する">
    サブエージェントが使用するモデルを選択します。このサンプルエージェントの場合、コードパターンの分析のための機能と速度のバランスを取る**Sonnet**を選択します。
  </Step>

  <Step title="色を選択する">
    サブエージェントの背景色を選択します。これにより、UIで実行中のサブエージェントを識別するのに役立ちます。
  </Step>

  <Step title="保存して試す">
    サブエージェントを保存します。すぐに利用可能になります（再起動は不要）。試してみます：

    ```
    code-improverエージェントを使用してこのプロジェクトの改善を提案する
    ```

    Claudeは新しいサブエージェントに委譲し、コードベースをスキャンして改善提案を返します。
  </Step>
</Steps>

これで、マシン上のすべてのプロジェクトでコードベースを分析し改善を提案するために使用できるサブエージェントができました。

Markdownファイルとして手動でサブエージェントを作成したり、CLIフラグを使用して定義したり、プラグインを通じて配布したりすることもできます。以下のセクションでは、すべての設定オプションについて説明します。

## サブエージェントを設定する

### /agentsコマンドを使用する

`/agents`コマンドは、サブエージェントを管理するためのインタラクティブインターフェースを提供します。`/agents`を実行して：

* すべての利用可能なサブエージェント（組み込み、ユーザー、プロジェクト、プラグイン）を表示する
* ガイド付きセットアップまたはClaude生成で新しいサブエージェントを作成する
* 既存のサブエージェント設定とツールアクセスを編集する
* カスタムサブエージェントを削除する
* 重複が存在する場合、どのサブエージェントがアクティブかを確認する

これはサブエージェントを作成・管理するための推奨方法です。手動作成または自動化の場合、サブエージェントファイルを直接追加することもできます。

### サブエージェントスコープを選択する

サブエージェントはYAMLフロントマター付きのMarkdownファイルです。スコープに応じて異なる場所に保存します。複数のサブエージェントが同じ名前を共有する場合、優先度の高い場所が優先されます。

| 場所                    | スコープ        | 優先度   | 作成方法                        |
| :-------------------- | :---------- | :---- | :-------------------------- |
| `--agents` CLIフラグ     | 現在のセッション    | 1（最高） | Claude Code起動時にJSONを渡す      |
| `.claude/agents/`     | 現在のプロジェクト   | 2     | インタラクティブまたは手動               |
| `~/.claude/agents/`   | すべてのプロジェクト  | 3     | インタラクティブまたは手動               |
| プラグインの`agents/`ディレクトリ | プラグインが有効な場所 | 4（最低） | [プラグイン](/ja/plugins)でインストール |

**プロジェクトサブエージェント**（`.claude/agents/`）は、コードベース固有のサブエージェントに最適です。バージョン管理にチェックインして、チームが協力して使用・改善できるようにします。

**ユーザーサブエージェント**（`~/.claude/agents/`）は、すべてのプロジェクトで利用可能な個人用サブエージェントです。

**CLI定義サブエージェント**は、Claude Code起動時にJSONとして渡されます。そのセッションのみ存在し、ディスクに保存されないため、クイックテストまたは自動化スクリプトに役立ちます：

```bash  theme={null}
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

`--agents`フラグは、[フロントマター](#supported-frontmatter-fields)と同じフィールドを持つJSONを受け入れます。システムプロンプトに`prompt`を使用します（ファイルベースのサブエージェントのmarkdownボディと同等）。完全なJSON形式については、[CLIリファレンス](/ja/cli-reference#agents-flag-format)を参照してください。

**プラグインサブエージェント**は、インストールした[プラグイン](/ja/plugins)から来ます。カスタムサブエージェントと一緒に`/agents`に表示されます。プラグインサブエージェント作成の詳細については、[プラグインコンポーネントリファレンス](/ja/plugins-reference#agents)を参照してください。

### サブエージェントファイルを書く

サブエージェントファイルは、設定用のYAMLフロントマターの後にMarkdownのシステムプロンプトを使用します：

<Note>
  サブエージェントはセッション開始時に読み込まれます。ファイルを手動で追加してサブエージェントを作成する場合、セッションを再起動するか、`/agents`を使用して即座に読み込みます。
</Note>

```markdown  theme={null}
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

フロントマターはサブエージェントのメタデータと設定を定義します。ボディはサブエージェントの動作をガイドするシステムプロンプトになります。サブエージェントは、このシステムプロンプト（作業ディレクトリなどの基本的な環境詳細を含む）のみを受け取り、完全なClaude Codeシステムプロンプトは受け取りません。

#### サポートされているフロントマターフィールド

以下のフィールドはYAMLフロントマターで使用できます。`name`と`description`のみが必須です。

| フィールド             | 必須  | 説明                                                                                                                |
| :---------------- | :-- | :---------------------------------------------------------------------------------------------------------------- |
| `name`            | はい  | 小文字とハイフンを使用した一意の識別子                                                                                               |
| `description`     | はい  | Claudeがこのサブエージェントに委譲する場合                                                                                          |
| `tools`           | いいえ | サブエージェントが使用できる[ツール](#available-tools)。省略された場合はすべてのツールを継承                                                          |
| `disallowedTools` | いいえ | 拒否するツール、継承または指定されたリストから削除                                                                                         |
| `model`           | いいえ | 使用する[モデル](#choose-a-model)：`sonnet`、`opus`、`haiku`、または`inherit`。デフォルトは`sonnet`                                    |
| `permissionMode`  | いいえ | [権限モード](#permission-modes)：`default`、`acceptEdits`、`dontAsk`、`bypassPermissions`、または`plan`                        |
| `skills`          | いいえ | スタートアップ時にサブエージェントのコンテキストに読み込む[スキル](/ja/skills)。完全なスキルコンテンツが注入され、呼び出し用に利用可能にされるだけではありません。サブエージェントは親の会話からスキルを継承しません |
| `hooks`           | いいえ | このサブエージェントにスコープされた[ライフサイクルフック](#define-hooks-for-subagents)                                                       |

### モデルを選択する

`model`フィールドは、サブエージェントが使用する[AIモデル](/ja/model-config)を制御します：

* **モデルエイリアス**: 利用可能なエイリアスの1つを使用します：`sonnet`、`opus`、または`haiku`
* **inherit**: メイン会話と同じモデルを使用します（一貫性に役立ちます）
* **省略**: 指定されていない場合、サブエージェント用に設定されたデフォルトモデル（`sonnet`）を使用します

### サブエージェント機能を制御する

ツールアクセス、権限モード、条件付きルールを通じてサブエージェントが実行できることを制御できます。

#### 利用可能なツール

サブエージェントは、Claude Codeの[内部ツール](/ja/settings#tools-available-to-claude)のいずれかを使用できます。デフォルトでは、サブエージェントはMCPツールを含むメイン会話からすべてのツールを継承します。

ツールを制限するには、`tools`フィールド（許可リスト）または`disallowedTools`フィールド（拒否リスト）を使用します：

```yaml  theme={null}
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
---
```

#### 権限モード

`permissionMode`フィールドは、サブエージェントが権限プロンプトを処理する方法を制御します。サブエージェントはメイン会話から権限コンテキストを継承しますが、モードをオーバーライドできます。

| モード                 | 動作                                |
| :------------------ | :-------------------------------- |
| `default`           | プロンプト付きの標準権限チェック                  |
| `acceptEdits`       | ファイル編集を自動受け入れ                     |
| `dontAsk`           | 権限プロンプトを自動拒否（明示的に許可されたツールは引き続き機能） |
| `bypassPermissions` | すべての権限チェックをスキップ                   |
| `plan`              | プランモード（読み取り専用探索）                  |

<Warning>
  `bypassPermissions`は注意して使用してください。すべての権限チェックをスキップし、サブエージェントが承認なしで任意の操作を実行できるようにします。
</Warning>

親が`bypassPermissions`を使用する場合、これが優先され、オーバーライドできません。

#### フックを使用した条件付きルール

ツール使用をより動的に制御するには、`PreToolUse`フックを使用して操作を実行前に検証します。ツールの一部の操作を許可しながら他の操作をブロックする必要がある場合に役立ちます。

この例は、実行前にコマンドを検証することで読み取り専用データベースクエリのみを許可するサブエージェントを作成します：

```yaml  theme={null}
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

検証スクリプトは`$TOOL_INPUT`を検査し、書き込み操作をブロックするために0以外のコードで終了します。フック設定オプションの詳細については、[サブエージェント用フックを定義する](#define-hooks-for-subagents)を参照してください。

#### 特定のサブエージェントを無効にする

[設定](/ja/settings#permission-settings)の`deny`配列に追加することで、Claudeが特定のサブエージェントを使用するのを防ぐことができます。`subagent-name`がサブエージェントの名前フィールドと一致する`Task(subagent-name)`形式を使用します。

```json  theme={null}
{
  "permissions": {
    "deny": ["Task(Explore)", "Task(my-custom-agent)"]
  }
}
```

これは組み込みとカスタムの両方のサブエージェントで機能します。`--disallowedTools` CLIフラグを使用することもできます：

```bash  theme={null}
claude --disallowedTools "Task(Explore)"
```

権限ルールの詳細については、[IAMドキュメント](/ja/iam#tool-specific-permission-rules)を参照してください。

### サブエージェント用フックを定義する

サブエージェントは、サブエージェントのライフサイクル中に実行される[フック](/ja/hooks)を定義できます。フックを設定する方法は2つあります：

1. **サブエージェントのフロントマター内**: そのサブエージェントがアクティブな間のみ実行されるフックを定義
2. **`settings.json`内**: サブエージェントが開始または停止するときにメインセッションで実行されるフックを定義

#### サブエージェントフロントマター内のフック

markdownファイルでフックを直接定義します。これらのフックは、その特定のサブエージェントがアクティブな間のみ実行され、完了時にクリーンアップされます。

| イベント          | マッチャー入力 | 発火するタイミング          |
| :------------ | :------ | :----------------- |
| `PreToolUse`  | ツール名    | サブエージェントがツールを使用する前 |
| `PostToolUse` | ツール名    | サブエージェントがツールを使用した後 |
| `Stop`        | （なし）    | サブエージェントが完了するとき    |

この例は、`PreToolUse`フックでBashコマンドを検証し、`PostToolUse`でファイル編集後にリンターを実行します：

```yaml  theme={null}
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

フロントマター内の`Stop`フックは自動的に`SubagentStop`イベントに変換されます。

#### サブエージェントイベント用のプロジェクトレベルフック

メインセッションでサブエージェントのライフサイクルイベントに応答するフックを`settings.json`で設定します。`matcher`フィールドを使用して、名前で特定のエージェントタイプをターゲットにします。

| イベント            | マッチャー入力    | 発火するタイミング          |
| :-------------- | :--------- | :----------------- |
| `SubagentStart` | エージェントタイプ名 | サブエージェントが実行を開始するとき |
| `SubagentStop`  | エージェントタイプ名 | サブエージェントが完了するとき    |

この例は、`db-agent`サブエージェントが開始および停止するときのみセットアップおよびクリーンアップスクリプトを実行します：

```json  theme={null}
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

完全なフック設定形式については、[フック](/ja/hooks)を参照してください。

## サブエージェントを操作する

### 自動委譲を理解する

Claudeは、リクエスト内のタスク説明、サブエージェント設定の`description`フィールド、および現在のコンテキストに基づいてタスクを自動的に委譲します。プロアクティブな委譲を促すには、サブエージェントの説明フィールドに「use proactively」などのフレーズを含めます。

特定のサブエージェントを明示的にリクエストすることもできます：

```
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

### サブエージェントをフォアグラウンドまたはバックグラウンドで実行する

サブエージェントはフォアグラウンド（ブロッキング）またはバックグラウンド（並行）で実行できます：

* **フォアグラウンドサブエージェント** - メイン会話を完了までブロックします。権限プロンプトと明確化の質問（[`AskUserQuestion`](/ja/settings#tools-available-to-claude)など）はあなたに渡されます。
* **バックグラウンドサブエージェント** - 作業を続ける間に並行して実行されます。親の権限を継承し、事前に承認されていないものはすべて自動拒否します。バックグラウンドサブエージェントが持たない権限が必要な場合、または明確化の質問が必要な場合、そのツール呼び出しは失敗しますがサブエージェントは続行します。MCPツールはバックグラウンドサブエージェントでは利用できません。

バックグラウンドサブエージェントが権限不足で失敗した場合、[再開](#resume-subagents)してフォアグラウンドで再試行できます。

Claudeはタスクに基づいてサブエージェントをフォアグラウンドまたはバックグラウンドで実行するかを決定します。以下のこともできます：

* Claudeに「run this in the background」と依頼する
* **Ctrl+B**を押して実行中のタスクをバックグラウンドにする

### 一般的なパターン

#### 大量操作を分離する

サブエージェントの最も効果的な用途の1つは、大量の出力を生成する操作を分離することです。テストの実行、ドキュメントの取得、ログファイルの処理は、かなりのコンテキストを消費できます。これらをサブエージェントに委譲することで、詳細な出力はサブエージェントのコンテキストに留まり、関連する概要のみがメイン会話に返されます。

```
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### 並列研究を実行する

独立した調査の場合、複数のサブエージェントを生成して同時に動作させます：

```
Research the authentication, database, and API modules in parallel using separate subagents
```

各サブエージェントは独立して領域を探索し、Claudeが結果を統合します。これは研究パスが互いに依存しない場合に最適です。

<Warning>
  サブエージェントが完了すると、その結果がメイン会話に返されます。詳細な結果を返す多くのサブエージェントを実行すると、かなりのコンテキストを消費できます。
</Warning>

#### サブエージェントをチェーンする

マルチステップワークフローの場合、Claudeにサブエージェントを順序立てて使用するよう依頼します。各サブエージェントはタスクを完了して結果をClaudeに返し、Claudeが関連するコンテキストを次のサブエージェントに渡します。

```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### サブエージェントとメイン会話を選択する

**メイン会話**を使用する場合：

* タスクが頻繁なやり取りまたは反復的な改善を必要とする
* 複数のフェーズが重要なコンテキストを共有する（計画→実装→テスト）
* 迅速で対象を絞った変更を行っている
* レイテンシが重要。サブエージェントは新規に開始し、コンテキストを収集するのに時間がかかる場合があります

**サブエージェント**を使用する場合：

* タスクが詳細な出力を生成し、メインコンテキストに必要ない
* 特定のツール制限または権限を強制したい
* 作業が自己完結型で概要を返すことができる

メイン会話コンテキストではなく分離されたサブエージェントコンテキストで実行される再利用可能なプロンプトまたはワークフローが必要な場合は、代わりに[スキル](/ja/skills)を検討してください。

<Note>
  サブエージェントは他のサブエージェントを生成できません。ワークフローがネストされた委譲を必要とする場合、[スキル](/ja/skills)を使用するか、メイン会話から[サブエージェントをチェーン](#chain-subagents)してください。
</Note>

### サブエージェントコンテキストを管理する

#### サブエージェントを再開する

各サブエージェント呼び出しは、新しいコンテキストで新しいインスタンスを作成します。最初からやり直すのではなく既存のサブエージェントの作業を続けるには、Claudeに再開するよう依頼します。

再開されたサブエージェントは、すべての前のツール呼び出し、結果、推論を含む完全な会話履歴を保持します。サブエージェントは新規に開始するのではなく、停止した場所から正確に再開します。

サブエージェントが完了すると、Claudeはそのエージェント IDを受け取ります。サブエージェントを再開するには、Claudeに前の作業を続けるよう依頼します：

```
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

エージェント IDを明示的に参照したい場合はClaudeに依頼することもできます。または、`~/.claude/projects/{project}/{sessionId}/subagents/`のトランスクリプトファイルでIDを見つけることができます。各トランスクリプトは`agent-{agentId}.jsonl`として保存されます。

プログラマティック使用については、[Agent SDKのサブエージェント](/ja/agent-sdk/subagents)を参照してください。

サブエージェントトランスクリプトはメイン会話から独立して永続化されます：

* **メイン会話圧縮**: メイン会話が圧縮されるとき、サブエージェントトランスクリプトは影響を受けません。別のファイルに保存されます。
* **セッション永続化**: サブエージェントトランスクリプトはセッション内で永続化されます。Claude Codeを再起動した後、同じセッションを再開することで[サブエージェントを再開](#resume-subagents)できます。
* **自動クリーンアップ**: トランスクリプトは`cleanupPeriodDays`設定に基づいてクリーンアップされます（デフォルト：30日）。

#### 自動圧縮

サブエージェントは、メイン会話と同じロジックを使用した自動圧縮をサポートします。サブエージェントのコンテキストが制限に近づくと、Claude Codeは古いメッセージを要約して重要なコンテキストを保持しながらスペースを解放します。

圧縮イベントはサブエージェントトランスクリプトファイルに記録されます：

```json  theme={null}
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

`preTokens`値は、圧縮が発生する前に使用されたトークン数を示します。

## サブエージェントの例

これらの例は、サブエージェント構築の効果的なパターンを示しています。出発点として使用するか、Claudeで生成したカスタマイズ版を使用します。

<Tip>
  **ベストプラクティス：**

  * **焦点を絞ったサブエージェントを設計する：** 各サブエージェントは1つの特定のタスクに優れている必要があります
  * **詳細な説明を書く：** Claudeは説明を使用して委譲するかどうかを決定します
  * **ツールアクセスを制限する：** セキュリティと焦点のために必要な権限のみを付与します
  * **バージョン管理にチェックインする：** プロジェクトサブエージェントをチームと共有します
</Tip>

### コードレビュアー

コードを修正せずにレビューする読み取り専用サブエージェント。この例は、制限されたツールアクセス（EditおよびWriteなし）と、何を探すか、出力をどのようにフォーマットするかを正確に指定する詳細なプロンプトで焦点を絞ったサブエージェントを設計する方法を示しています。

```markdown  theme={null}
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### デバッガー

問題を分析して修正できるサブエージェント。コードレビュアーとは異なり、このサブエージェントはバグ修正がコード修正を必要とするため、Editを含みます。プロンプトは診断から検証までの明確なワークフローを提供します。

```markdown  theme={null}
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### データサイエンティスト

データ分析作業用のドメイン固有のサブエージェント。この例は、典型的なコーディングタスク以外の特化したワークフロー用のサブエージェントを作成する方法を示しています。明示的に`model: sonnet`を設定してより有能な分析を行います。

```markdown  theme={null}
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

## 次のステップ

サブエージェントを理解したので、これらの関連機能を探索してください：

* [プラグインでサブエージェントを配布する](/ja/plugins) - チームまたはプロジェクト全体でサブエージェントを共有する
* [Claude Codeをプログラマティックに実行する](/ja/headless) - CI/CDと自動化のためのAgent SDKを使用
* [MCPサーバーを使用する](/ja/mcp) - サブエージェントに外部ツールとデータへのアクセスを提供する


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://code.claude.com/docs/llms.txt
