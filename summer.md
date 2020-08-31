# Aggregations 

## __O que vamos aprender?__
- O que é o aggregation framework?
- O que é um estágio de uma pipeline?
- Como montar uma aggregation pipeline para fazer consultas mais robustas às coleções do `mongodb`.


## __Você será capaz de:__
Montar uma pipeline usando estes operadores sozinhos ou em conjunto:
- $match
- $project
- $limit
- $sort
- $group 

## __Por que isso é importante?__
Aggregation é um framework (estrutura) para visualização e manipulação de dados, usando um ou múltiplos **estágios** em sequência, ou seja, monta a famosa `pipeline`.

Imagine que você precise montar consultas filtrem documentos, inseriram novos campos, agrupapem documentos por determinados campos e realizar operações em cima desses resultados. Tudo em uma tacada só. 

Usando o Aggregations você tem ferramentas para criar buscas mais complexas no seu banco. Além disso, você consegue manipular os resultados de cada **estágio**.

Usando os operadores é possível filtrar documentos por comparação, projetar campos e executar operações que já conhece sobre os documentos nos estágios que vai aprender a criar.

## __Conteúdos__

Cada estágio opera sobre o documento recebido e passa o resultado para o próximo. Existem muitos operadores de agregação e a mágica está em combiná-los, mas vamos conhecer um de cada vez.

Quando chegar a hora de combinar, você sempre pode consultar os exemplos e a documentação, [link](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/#db-collection-aggregate-stages).

Um estágio em mongodb é definido como um objeto dentro da função aggregate, você pode definir como único parâmetro da função um _array_ de objetos ou um objeto como cada parâmetro da função. Como no exemplo abaixo:

```js
db.digimons.aggregate([
	{
		$match:{
			"type":"Free", // seleciona apenas digimons do tipo Free
			"attribute": "Neutral" // e com atributo Neutral
		}
	},
	{
		$project: {
			"name": 1, // exibe o campo name, além do _id (que é padrão)
			"memoria": "$memory", // exibe o campo memory e o renomeia por memoria
			"hp": 1 
		}
	},
	{
		$sort: {
			"hp": -1 // ordena os documentos pelo campo "hp" de forma decrescente
		}
	},
	{
		$limit: 3 // limita o resultado a 3 documentos
	}
]);
```

```js
// Resultado da query
{ "_id" : 171, "name" : "Imperialdramon FM", "hp" : 1780, "memoria" : 20 }
{ "_id" : 138, "name" : "Paildramon", "hp" : 1280, "memoria" : 14 }
{ "_id" : 46, "name" : "Veemon", "hp" : 1040, "memoria" : 5 }
```

Para fazer os exercícios padrões ou de fixação, salve o [link](https://raw.githubusercontent.com/nato-re/digimongodb/master/digimon.json), clicando em cima dele com o botão direito. Depois execute o comando a seguir substituindo `/caminho-para-pasta/que-salvou` pelo caminho da pasta que você salvou o banco de dados.

```shell
# importando pelo terminal
mongoimport --db digimongo --collection digimons --file /caminho-para-pasta/que-salvou
```

Execute sua instância do `mongo`, use o `db` digimongo e teste o tamanho da colecão.

```js
use digimongo
db.digimons.count() // 249
```

É **importante** ressaltar que, na maioria das vezes, a ordem dos estágios **faz diferença**. O primeiro estágio da _pipeline_ sempre recebe todos os documentos da coleção, enquanto os estágios posteriores recebem os documentos manipulados pelos estágios anteriores.

Vamos começar pelo `$match` e pelo `$project`. Por mais novo que pareça, você já teve o contato com as mecânicas deles no conteúdo de `find`.

### `$match`: filtra o número de documentos por uma restrição e passa o retorno para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match) para documentação do operador de estágio.

Assim como o primeiro parâmetro do **find({~~match~~})**, o `$match` seleciona apenas os documentos que entram nas restrições que você já construiu nos últimos dias.

Com o `$match`, você passa **só os documentos selecionados** para o próximo estágio. Se não existe `$match` na pipeline, todos os documentos do banco são selecionados, assim como um `find` com um objeto vazio como primeiro parâmetro (**find({~~match~~}**)).

Imagine que você precise achar no banco apenas documentos com o campo value maior que 8000.

```js
db.example.aggregate([
	{
		$match:{
			"poder": { // define campo "poder" como critério para $match
				$gt: 8000 // define que só documentos com "poder" maior que 8000 passarão para o próximo estágio 
				},
			"saga": "Saga dos Saiyajins" // além de poder maior 8000, só documentos com o campo "saga" igual a "Saga dos Saiyajins" serão selecionados 
		}
	}
]);
```
O campo `"poder"` do exemplo é o definido para fazer a seleção de documentos que o valor de `"poder"` é maior que 8000.

Outros operadores [lógicos](https://docs.mongodb.com/manual/reference/operator/query-logical/) ou de [comparação](https://docs.mongodb.com/manual/reference/operator/query-comparison/) podem ser usados no `$match` e entre outros operadores do aggregate.

Você pode usá-los para encontrar documentos que entram nas restrições que deseja aplicar na busca, como `$gt`, `$lte`, `$in`, etc.

### Restrições

A sintaxe é idêntica ao [primeiro parâmetro do find](https://docs.mongodb.com/manual/tutorial/query-documents/#read-operations-qudifery-argument), **porém**, o `$match` não aceita expressões de agregação brutas ([referência](https://docs.mongodb.com/manual/reference/operator/aggregation/match/index.html#restrictions)). Operadores como `$or`, `$eq`, `$and` não podem ser usados como operadores de alto nível, ou seja, usados como chave logo dentro do `$match`. Como solução, o operador `$expr` é usado para envelopar esses outros. Veja o exemplo abaixo para entender melhor:

```js
db.digimons.aggregate([
    {
      $match: {
        "stage": "Baby", // seleciona apenas digimons do stage Baby
        $expr: {
          // operador usado para envelopar operador $or, pois ele não pode ser operador de alto nível dentro do estágio
          $or: [
            { $gt: ["$spd", 94] }, // seleciona documentos com o campo "spd" maior que 95
            { $lte: ["$atk", 54] }, // OU com o campo atk menor ou igual a 76
          ],
        },
      },
    },
]);
```

```js
// Resultado 
{
	"_id" : 5,
	"name" : "Poyomon",
	"stage" : "Baby",
	"type" : "Free",
	"attribute" : "Neutral",
	"memory" : 2,
	"equip_slots" : 0,
	"hp" : 540,
	"sp" : 98,
	"atk" : 54, // atk menor ou igual a 54
	"def" : 59,
	"int" : 95,
	"spd" : 86
}
{
	"_id" : 1,
	"name" : "Kuramon",
	"stage" : "Baby",
	"type" : "Free",
	"attribute" : "Neutral",
	"memory" : 2,
	"equip_slots" : 0,
	"hp" : 590,
	"sp" : 77,
	"atk" : 79,
	"def" : 69,
	"int" : 68,
	"spd" : 95 // spd maior que 94
}
```

Use o próximo link para rever os operadores dos conteúdos passados e combiná-los nos seus estágios, acessando [aqui](https://docs.mongodb.com/manual/reference/operator/query/).

#### Fixação 
Usando o banco importado após os primeiro exemplo de _pipeline_, resolva os exercícios abaixo:

- Encontre o documento com `_id` igual a `40`.
- Encontre digimons com o campo `memory` menor ou igual a `2`.
- Encontre digimons com `sp` menor ou igual a 50 e `atk` maior que `310`.


### `$project`: passa documentos com campos específicos ou computa novos campos para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/project/#pipe._S_project) para documentação do operador de estágio.

Este operador é como o segundo parâmetro do __find({}, {~~project~~})__.
Com ele, você define quais campos serão passados ao próximo estágio da _pipeline_, além de poder renomear os campos que deseja e executar [operações](https://docs.mongodb.com/manual/reference/operator/aggregation/) como `$round`, `$push` e `$add`.

```js
{ // Documento de Exemplo
	"_id": ObjectId("5e7bc243b642fc6050badb13"),
	"nome": "Oswaldo Pereira",
	"cpf": 14114188835,
	"idade": 58 
}
```
```js
db.example.aggregate([
	{
		$project:{
			"nome": 1, // $nome será projetado para próximo estágio 
			"_id": "$cpf", // _id se tornará o $cpf depois do estágio
			"novo_id": "$_id", // campo novo_id projetado como $_id 
			"idade": 0  // a idade é projetada pois o valor do campo é falsy
		}
	}
]);
```
```js
// Retorno 
{		
	"nome": "Oswaldo Pereira" 
	"_id": 14114188835, 
	"novo_id": ObjectId("5e7bc243b642fc6050badb13")
}
```
#### Incluindo cálculos no `$project`

Usaremos o operador [`$sum`](https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#definition) para demonstrar essa funcionalidade, que pode ser usado em outros estágios como no `$group` que veremos mais tarde. Veja o exemplo abaixo que projeta a soma dos campos `sp`, `atk`, `def`, `int`, `spd`. 

```js
db.digimons.aggregate([
	{
		$project:{
			"somaDosCampos": {
				$sum: ["$sp", "$atk", "$def", "$int", "$spd"]
			}
		}
	}
]);
```

### Fixação 

Ainda usando o banco de digimons importado anteriormente:

- Projete apenas o `name` e o `equip_slots` dos documentos.

- Usando a última _query_, mude a chave de `equip_slots` para `"espacoDeEquipamentos"`.

- Adicione um novo estágio no último exercício de maneira que a _query_ retorne apenas documentos com `equip_slot` igual a `3`.

- Adicione na última _query_ um campo que faça à média os valores de `sp`, `atk`, `def`, `int`, `spd`, como no último exemplo, chame de `"mediaAtributos"`.
Dica: use [`$avg`](https://docs.mongodb.com/manual/reference/operator/aggregation/avg/)


### `$sort:` ordena os documentos de saída de acordo com o campo definido, de forma crescente ou decrescente.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/index.html) da documentação.

O operador define um campo e ordena os documentos de entrada **usando o campo definido como critério de ordenação**:

Usando `1` como valor desse campo, os documentos são retornados em ordem crescente, do menor para o maior valor. 

Já com `-1`, se ordena do maior valor para o menor, ou seja, em ordem decrescente.

O `$sort` também funciona em strings, veja os exemplos:

```js
db.users.aggregate([
	{
	 $sort: { "name": 1 } // ordena os documentos pelo nome em ordem alfabética crescente, do A ao Z
 	}
]);
```

```js
db.example.aggregate([
	{
	 $sort: { 
		 	"preco": -1, // documentos retornados em ordem decrescente em relação ao valor de "preco"
			"nome": 1 // e também ordenados de maneira alfabética
		  	}
 	}
]);
```


### `$limit:` limita o número de documentos passados para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/index.html) da documentação


Este operador é simples, porém importante, pois limita a quantidade de documentos passados para o próximo estágio ao estipulado nele. Vale ressaltar que funciona **em qualquer estágio da _pipeline_** .


Vamos ver um exemplo: suponha que você quer que apenas 3 documentos sejam retornados da sua _query_. Como um `find().limit(3)`.

```js
db.example.aggregate([
	{ $limit: 3 }
]);
```
#### Fixação

No mesmo banco dos últimos exercícios de fixação:
- Usando este operador e o último, `$sort`, encontre o digimon com menor valor do campo `atk`.

Retorna o documento com o menor valor do campo "atk".

### `$group`: agrupa por uma chave distinta, ou por uma chave composta.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/group/index.html) da documentação.

O operador cria um novo documento para cada valor diferente do campo definido na coleção.

Usando esse operador, o valor de `_id` **não** tem a mesma função do `_id` (identificação única) dentro dos documentos. Ele no `$group` define por qual campo os documentos vão ser agrupados.

Valores [falsy](https://developer.mozilla.org/pt-BR/docs/Glossario/Falsy) no campo `_id` ou uma _string_ qualquer, que **não** contenham `$` na frente, agruparão todos os documentos em um só.

O interessante deste operador de agregação é executar operação com os campos dos documentos agrupados, como `$sum`, `$avg`, `$push` de um valor de um campo em um _array_. Veja essa [lista](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulators-group) de operadores para entender mais a fundo quais pode usar. 

Veja o exemplo abaixo para entender o funcionamento do operador, com campo `_id` definido como `null`.

```js
db.digimons.aggregate([
	{
		$group: {
				"_id": null, // seleciona todos os documentos
				"total": { $sum: 1 } // soma 1 na contagem para cada documento e armazena no campo "total"
				}
	}
]);
```
```js
// Resultado 
{ "_id" : null, "total" : 249 }
```

No exemplo acima, a quantidade de documentos na coleção `digimons` é somada, pois todos os documentos são selecionados e se soma 1 para cada. Se o valor do campo `$sum` fosse 2, somaria 2 para cada documento e então o "total" seria 498.


Se você definir um campo dentro do `$sum`, ou outro [operador de acumulação](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulator-operator), o `$group` usará o valor desse campo para executar a acumulação.

Alguns deles são:

- `$sum`: Retorna a soma de valores numéricos. Valores **não numéricos** são ignorados.

- `$avg`: Retorna a média de valores numéricos. Valores **não numéricos** são ignorados;

- `$push`: Retorna um _array_ com os valores da expressão para cada grupo;


Veja o exemplo abaixo da soma do campo `"atk"` de todos os documentos nomeada pela chave `total`.

```js
db.digimons.aggregate([
	{
		$group:{
			"_id": "somaDosAtaques", // _id é uma string, portanto agrupa todos os documentos como valores falsy
			"total": { $sum: "$atk" } // soma os valores de atk de cada documento no acumulador
		}
	}
]);
```

```js
// Resultado
{ "_id" : "somaDosAtaques", "total" : 31005 }
```

Quando se usa um `$` na frente do valor de `_id`, o estágio agrupa os valores dos documentos que contém o campo definido pelo `_id`. Veja o exemplo abaixo:

```js
db.digimons.aggregate([
	{
		$group:{
			"_id": "$type", // agrupa pelo campo type do digimon
			"ataqueTotal" : { $sum: "$atk" } // acumula a soma valor de atk dos digimons de cada tipo no campo ataqueTotal 
		}
	}
]);
```
```js
// Resultados
{ "_id" : "Virus", "ataqueTotal" : 10696 }
{ "_id" : "Vaccine", "ataqueTotal" : 8986 }
{ "_id" : "Free", "ataqueTotal" : 4101 }
{ "_id" : "Data", "ataqueTotal" : 7222 }
```

#### Fixação

Usando o banco das últimas fixações:
- Usando o `$group`, encontre a metade da quantidade de documentos na coleção, chame de `"metadeDocs"`.
- Faça a média de todos valores de `hp` dos digimons na coleção e chame de `"mediaHp"`.
- Altere a última _query_ de maneira que o agrupamento seja pelo campo `attribute`.


## Exercícios

Usando o banco digimongo importado no início do conteúdo e usado nos exercícios de fixação, o que acha de testar seus aprendizados?

1. Blue Monday: encontre todos os digimons do `attribute` `"Water"`.

2. Misirlou: altere a _query_ anterior de forma que os documentos também sejam restritos ao campo `spd` maior ou igual a `80`.

3. Pipeline: adicione a _query_ anterior um novo estágio, de maneira que só os campos `stage`, `name`, `memory` e `attribute` seja retornados.

4. Earth, Wind and Fire: selecione documentos com `attribute` `"Earth"`, `"Fire"` ou `"Wind"` digimons, projete apenas `name` e `attribute`.

5. Nitro: retorne apenas o digimon com o maior valor no campo `spd`.

6. Changes: Agrupe por `stage` e encontre a média dos campos `hp`, `sp`, `atk`, `def`, `int`, `spd`; arrendonde os calores para números inteiros e nomeie os campos de saída como `"mediaHp"`, `"mediaSp"`, `"mediaAtk"`, `"mediaDef"`, `"mediaInt"` e `"mediaSpd"`.

### Bonus 

7. O Mago é Implacável: ache qual digimon tem o maior valor do campo `int`, renomeie o campo `int` por poderMagico, `sp` por `mana` e adicione o campo `"mago"` com valor `"Patolino"`.

8. Push It To The Limit: selecione 7 digimons com maiores valores de `memory` e coloque seus nomes em um _array_, no valor de um campo chamado `"names"`.

## Recursos Adicionais

[Conteúdo em português sobre $match, $project e $group](https://alissonmachado.com.br/mongodb-aggregation/)

[Agregando Datas](http://www.basef.com.br/index.php/Query_de_MongoDB_agregando_por_m%C3%AAs_e_ano)

[Aggregations in MongoDB by Example](https://www.compose.com/articles/aggregations-in-mongodb-by-example/)

[Mongodb Aggregation Framework Part 1](https://medium.com/@kallupragathi/mongodb-aggregation-framework-part-1-2f1c0db05bd6)

[Aggregation Pipeline Stages](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/#aggregation-pipeline-stages)
[Aggregation Pipeline Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/#aggregation-pipeline-operators)


// Disclaimer

Fonte da coleção de digimon: 
[Digimon Database](https://www.kaggle.com/rtatman/digidb?select=DigiDB_supportlist.csv) 