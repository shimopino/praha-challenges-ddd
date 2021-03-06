# API 設計

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Table of Contents</summary>

- [Q: REST API にて、ネストされたリソースを表現する際のメリット・デメリットは何でしょうか。](#q-rest-api-%E3%81%AB%E3%81%A6%E3%83%8D%E3%82%B9%E3%83%88%E3%81%95%E3%82%8C%E3%81%9F%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E8%A1%A8%E7%8F%BE%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AE%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%83%BB%E3%83%87%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%AF%E4%BD%95%E3%81%A7%E3%81%97%E3%82%87%E3%81%86%E3%81%8B)
  - [なぜネストされたリソースを設計する方法を使うべきなのか](#%E3%81%AA%E3%81%9C%E3%83%8D%E3%82%B9%E3%83%88%E3%81%95%E3%82%8C%E3%81%9F%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E8%A8%AD%E8%A8%88%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95%E3%82%92%E4%BD%BF%E3%81%86%E3%81%B9%E3%81%8D%E3%81%AA%E3%81%AE%E3%81%8B)
  - [なぜネストされたリソースを設計する方法を使うべきではないのか](#%E3%81%AA%E3%81%9C%E3%83%8D%E3%82%B9%E3%83%88%E3%81%95%E3%82%8C%E3%81%9F%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E8%A8%AD%E8%A8%88%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95%E3%82%92%E4%BD%BF%E3%81%86%E3%81%B9%E3%81%8D%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%84%E3%81%AE%E3%81%8B)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

下記の参考資料をまとめていく。

- [API Design Patterns and Best Practices](https://www.moesif.com/blog/api-guide/api-design-guidelines/)

## Q: REST API にて、ネストされたリソースを表現する際のメリット・デメリットは何でしょうか。

<details>
<summary>解説</summary>
<div>

### なぜネストされたリソースを設計する方法を使うべきなのか

ここでは以下のような API を考える。

```bash
# ネストされたリソース
/posts/:postId/comments/:commentId
/users/:userId/articles/:articleId

# フラットなリソース
/comments/:commentId
/articles/:articleId
```

この設計の利点の 1 つは、可読性にある。

リソースの URL をネストすることで、あるリソースが別のリソースに所属していることを表現することができる。

これはデータモデルが階層的である必要はない。例えば Github ではあるユーザーが複数のリポジトリにコントリビュートしたり、その反対にあるリポジトリには様々なユーザーからのコントリビュートが存在している。

これは階層構造ではなく、多対多の構造であるが、下記のエンドポイントをどちらか一方しか知らなかった場合、データモデルが多対多であることはわからない。

```bash
# ユーザーのサブリソースにリポジトリが存在する
/users/:userId/repos

# リポジトリのサブリソースにユーザーが存在する
/repos/:repoId/users
```

### なぜネストされたリソースを設計する方法を使うべきではないのか

この設計の欠点の 1 点目は、リソース間に多くの関係がある複雑なシステムにおいて、URL が長くなってしまう可能性がある点である。

```bash
# 顧客があるプロジェクトにおいて、製品を複数注文した場合の 1 製品のデータを取得したい
/customers/:customerId/projects/:projectId/orders/:orderId/lines/:lineId
```

この問題は各リソースを識別するための ID が長くなれば、より深刻になってしまう。

---

この設計の欠点の 2 点目は、冗長なエンドポイントを作成してしまう点である。

例えば、多対多構造の Github の API で、あるユーザーのコントリビューションを取得したい場合や、あるリポジトリのコントリビューションを取得したい場合、URL のネストを採用した場合には下記のように 2 つのエンドポイントを作成する必要がある。

```bash
# 2 ステップでコントリビューションを取得しなければいけない
/users/:userId/repositories
/repositories/repositoryId/contributors
```

ネストを採用しない場合、コントリビューション用のルートリソースを 1 つ定義して、クエリパラメータとしてフィルタリングを実行すれば、1 つのエンドポイントで実現することが可能となる。

```bash
/contributions?userName=:userName&repositoryName=:repositoryName
```

またこのリソースを使って、関係性を変更するための `PUT` や `POST` を定義することも可能となる。

つまり上記のようなユースケースの場合にネストされた URL を使用すると、エンドポイントの表面を増加させてしまうことによる管理コストの増加や、同じ表現を複数のエンドポイントから返してしまうキャッシングの問題にも繋がってしまう。

---

この設計の欠点の 3 点目は、データベースへの複数回のクエリが発行されてしまう点である。

例えば下記のようなエンドポイントを考える。

```bash
/blogs/X/articles/Y/comments/Z
```

この場合、下記のような手順でデータベースへのアクセスが発生してしまい、`N + 1` 問題を引き起こしてしまう可能性がある。

- `X` という ID のブログは存在しているのか
- `X` という ID のブログに紐づく、`Y` という ID の記事は存在しているのか
- `X` という ID のブログに紐づく、`Y` という ID の記事に紐づく、`Z` というコメントは存在しているのか

この問題は、コメントをルートリソースとして表現し、データを取得する際にはクエリパラメータで表現すればいい。

---

この設計の欠点の 4 点目は、URL からユーザー情報が漏れてしまうセキュリティ上の懸念である。

例えば以下のような URL を考える。

```bash
/users/:userName/image/:imageId
```

この URL は、第三者が API からリソースを要求する権限を持っていなくても潜在的に公開されてしまうため、URL からどのようなユーザーがどのような画像をアップロードしているのかわかってしまう。

---

この設計の欠点の 5 点目は、リソースの関係性を変更した際の、エンドポイントの変更コストが高くなってしまう点である。

たいていの場合、API のバージョンを上げたとしても古い API へのリンクが機能しなくならないように、URL を保守しておく必要があります。

この際に以下のようなエンドポイントを定義している場合、製品と所有者の関係性を逆転させた際に、URL を変更することが難しくなる。

```bash
/owners/key/products/1234
/owners/xing/products/1234
```

この場合に、製品をルートリソースにするような変更をすると、保守のコストが増加してしまう。

```bash
/products/1234
```

この場合に、下記のように所有を表現するルートリソースを定義しておけば、クエリパラメータを変更することで、どちらの関係性も表現することができる。

```bash
/posessions?owner=kay&product=1234
```

</div>
</details>
