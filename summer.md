# Aggregations 

## __O que vamos aprender?__
- O que é o aggregation framework?
- O que é um estágio de uma pipeline?
- Como montar uma aggregation pipeline para fazer consultas mais robustas ao banco.


## __Você será capaz de:__
Montar uma pipeline usando estes operadores sozinhos ou em conjunto :
- $match
- $project
- $limit
- $sort
- $group 

## __Porque isso é importante?__
Aggregation é um framework (estrutura) para visualização e manipulação de dados, usando um ou múltiplos **estágios** em sequência, ou seja, monta a famosa `pipeline`.

Imagine que você precisa montar consultas que precisam filtrar documentos, inserir novos  campos, agrupar documentos por um campo e realizar operações encima desses resultados. Tudo em uma tacada só. 

Usando o Aggregations você tem ferramentas para criar buscas mais complexas no seu banco. Além disso, você consegue manipular os resultados de cada **estágio**.

Usando os operadores é possível filtrar documentos por comparação, projetar campos e executar operações que já conhece sobre os documentos nos estágios que vai aprender a criar.

## __Conteúdos__

Cada estágio opera sobre o documento recebido e passa o resultado para o próximo. Existem muitos operadores de agregação e a mágica está em combiná-los, mas vamos conhecer um de cada vez.

Quando chegar a hora de combinar você sempre pode consultar os exemplos e a documentação, [link](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/#db-collection-aggregate-stages).

Um estágio em mongodb é definido como um objeto dentro da função aggregate, você pode definí-los como um _array_ de objetos, sendo único parâmetro da função ou como um objeto como cada parâmetro da função. Como no exemplo abaixo:

```jsx
db.digimons.aggregate([
	{
		$match:{
			"type":'Free', // seleciona apenas digimons do tipo Free
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

```jsx
// Resultado da query
{ "_id" : 171, "name" : "Imperialdramon FM", "hp" : 1780, "memoria" : 20 }
{ "_id" : 138, "name" : "Paildramon", "hp" : 1280, "memoria" : 14 }
{ "_id" : 46, "name" : "Veemon", "hp" : 1040, "memoria" : 5 }
```

Antes de fazer os exercícios de fixação, salve o [link](https://raw.githubusercontent.com/nato-re/digimongodb/master/digimon.json), clicando encima dele com o botão direito. Depois execute o comando a seguir substituindo `/caminho-para-pasta/que-salvou` pelo caminho da pasta que você salvou o banco de dados.
```shell
mongoimport --db digimongo --collection digimons --file /caminho-para-pasta/que-salvou 
```

É **importante** ressaltar que, a ordem dos estágios na maioria das vezes **faz diferença**. O primeiro estágio da _pipeline_, sempre recebe todos os documentos da coleção e estágios posteriores: recebem os documentos manipulados pelos estágios anteriores.

Vamos começar pelo `$match` e pelo `$project`. Por mais novo que pareça, você já teve o contato com as mecânicas deles no conteúdo de `find`.

### `$match`: filtra o numero de documentos por uma restrição e passa o retorno para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match) para documentação do operador de estágio.

Assim como o primeiro parâmetro do **.find({~~esse~~})**, o `$match` seleciona apenas os documentos que entram nas restrições que você já construiu nos últimos dias.

Com o `$match`, você passa **só os documentos selecionados** para o próximo estágio. Se não existe `$match` na pipeline, todos os documentos do banco são selecionados, assim como um `find` com um objeto vazio como o primeiro parâmetro (`find({})`).

Imagine que você precise achar no banco apenas documentos com o campo value maior que 8000.

```jsx
db.example.aggregate([
	{
		$match:{
			"poder":{ // define campo "poder" como critério para $match
				$gt: 8000 // define que só documentos com "poder" maior que 8000 passarão para o próximo estágio 
				},
			"saga": "Saga dos Saiyajins" // além de poder maior 8000, só documentos com o campo "saga" igual a "Saga dos Saiyajins" serão selecionados 
		}
	}
])
```
O campo `"poder"` do exemplo é o definido para fazer a seleção de documentos que o valor de `"poder"` é maior que 8000.

Outros operadores [lógicos](https://docs.mongodb.com/manual/reference/operator/query-logical/) ou de [comparação](https://docs.mongodb.com/manual/reference/operator/query-comparison/) podem ser usados no `$match` e entre outros operadores do aggregate.

Usando eles para encontrar documentos, que entram nas restrições que você deseja aplicar na busca, como `$gt`, `$lte`, `$in` ... 

### Restrições

A sintaxe é idêntica ao [primeiro parâmetro do find](https://docs.mongodb.com/manual/tutorial/query-documents/#read-operations-qudifery-argument), __porém__, o `$match` não aceita expressões de agregação brutas ([referência](https://docs.mongodb.com/manual/reference/operator/aggregation/match/index.html#restrictions)). Operadores como `$or`, `$eq`, `$and` não podem ser usados como operadores de alto nível, ou seja, usados como chave logo dentro do `$match`. Como solução, o operador `$expr` é usado para envelopar esses outros. Veja o exemplo abaixo para entender melhor:


```jsx
db.digimons.aggregate([
    {
      $match: {
        stage: "Baby", // seleciona apenas digimons do stage Baby
        $expr: {
          // operador usado para envelopar operador $or, pois ele não pode ser operador de alto nível dentro do estágio
          $or: [
            { $gt: ["$spd", 90] }, // seleciona documnetos com o campo "spd" maior que 90
            { $lt: ["$atk", 60] }, // OU com o campo sp menor que 100
          ],
        },
      },
    },
])
```

```jsx
// Resultado 
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
	"spd" : 95 // spd maior que 90
}
{
	"_id" : 3,
	"name" : "Punimon",
	"stage" : "Baby",
	"type" : "Free",
	"attribute" : "Neutral",
	"memory" : 2,
	"equip_slots" : 0,
	"hp" : 870,
	"sp" : 50, // sp menor que 60
	"atk" : 97,
	"def" : 87,
	"int" : 50,
	"spd" : 75
}

```

Use o próximo link para rever os operadores dos conteúdos passados para combiná-los nos seus estágios, acessando [aqui](https://docs.mongodb.com/manual/reference/operator/query/).

#### Fixação 
Usando o banco importado após os primeiro exemplo que _pipeline_, resolva os exercícios abaixo:

- Encontre o documento com `_id` 40.
- Encontre digimons com o campo memory menor ou igual a 2.
- Encontre digimons com sp menor ou igual a 50 e atk maior que 310.


### `$project`: passa documentos com campos específicos ou computa novos campos para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/project/#pipe._S_project) para documentação do operador de estágio.

Este operador é como o segundo parâmetro do __find({}, {~~project~~})__.
Com ele, você define quais campos serão passados ao próximo estágio da pipeline. Além de poder renomear os campos que deseja e executar [operações](https://docs.mongodb.com/manual/reference/operator/aggregation/) como `$round`, `$push` e `$add`.


```jsx
{ // Documento de Exemplo
	"_id": ObjectId("5e7bc243b642fc6050badb13"),
	"nome": "Oswaldo Pereira",
	"cpf": 14114188835,
	"idade": 58 
}
```
```jsx
db.example.aggregate([
	{
		$project:{
			"nome": 1, // $nome será projetado para próximo estágio 
			"_id": "$cpf", // _id virará o $cpf depois do estágio
			"novo_id": "$_id", // campo novo_id projetado como $_id 
			"idade": 0  // a idade é projetada pois o valor do campo é falsy
		}
	}
])
```
```jsx
// Retorno 
{		
	"nome": "Oswaldo Pereira" 
	"_id": 14114188835, 
	"novo_id": ObjectId("5e7bc243b642fc6050badb13")
}
```
### Fixação 

Ainda no banco usado acima, 

```jsx

```

### `$sort:` ordena os documentos de saída de acordo com o campo definido, de forma decrescente ou crescente.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/index.html) da documentação.

O operador define um campo e ordena os documentos de entrada **usando o campo definido com critério de ordenação**:

Usando `1` como valor desse campo, os documentos são retornados em ordem crescente, com o menor valor primeiro e maior por último. 

E com `-1`, se ordena do maior valor para o menor, ou seja, em ordem decrescente.

O `$sort` também funciona em strings, veja os exemplos:

```jsx
 db.users.aggregate([
	{
	 $sort: { "name": 1 } // ordena os documentos pelo nome em ordem alfabética crescente 
 	}
 ])
```
// confuso
Ordena os documentos na ordem alfabética, ou seja, os que o valor do campo "name" que começam com 'a' virão antes dos com 'z'.

```jsx
 db.example.aggregate([
	{
	 $sort: { 
		 	"preco": -1, // documentos selecionados em ordem decrescente
			"nome": 1 // ordenados de maneira alfabética
		  	}
 	}
 ])
```


### `$limit:` limita o número de documentos passados para o próximo estágio.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/index.html) da documentação

Esse operador é simples, porém importante. Em qualquer estágio da _pipeline_, ele limita a quantidade de documentos passados para o próximo estágio ao valor de `$limit`.

Vamos ver um exemplo: suponha que você quer que apenas 3 documentos sejam retornados da sua _query_. Como um `find().limit(3)`.

```jsx
db.example.aggregate([
	{ $limit: 3 }
])
```

```jsx
db.digimon.aggregate([
	{ 
		$sort: {
			"atk": 1
		}
	},
	{ $limit: 1 }
])
```
Retorna o documento com o menor valor do campo "atk".

### `$group`: agrupa por uma chave distinta, ou por uma chave composta.

[Link](https://docs.mongodb.com/manual/reference/operator/aggregation/group/index.html) da documentação.

O operador cria um novo documento para cada valor diferente do campo definido na coleção.

Usando esse operador, o valor de `_id` **não** tem a mesma função do `_id` (identificação única) dentro dos documentos. Ele no `$group` define por qual campo os documentos vão ser agrupados.

Valores [falsy](https://developer.mozilla.org/pt-BR/docs/Glossario/Falsy) no campo `_id` ou uma _string_ qualquer, que **não** contém `$` na frente, agruparão todos os documentos em um só.

O interessante desse operador de agregação é executar operação com os campos dos documentos agrupados, como `$sum`, `$avg`, `$push` de um valor de um campo em um _array_. Veja essa [lista](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulators-group) de operadores para entender mais a fundo quais pode usar. 

Veja o exemplo abaixo para entender o funcionamento do operador, com campo `_id` definido como null.

```jsx
db.digimons.aggregate([
	{
		$group: {
				_id: null, // seleciona todos os documentos
				"total": { $sum: 1 } // soma 1 na contagem para cada documento e armazena no campo "total"
				}
	}
]);
```
```jsx
// Resultado 
{ "_id" : null, "total" : 249 }
```
Esse exemplo soma a quantidade de documentos na coleção `digimons`, pois seleciona todos os documentos e soma 1 para cada. Se fosse 2 no valor do campo, somaria 2 para cada documento e o "total" seria 498.

Agora se definir um campo dentro do `$sum`, ou outro [operador de acumulação](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#accumulator-operator), o `$group` usa o valor desse campo para executar essa acumulação.

Veja o exemplo abaixo da soma do campo `"atk"` de todos os documentos nomeados pela chave `total`.

```jsx
db.digimons.aggregate([
	{
		$group:{
			"_id": 'somaDosAtaques',
			"total": { $sum: "$atk" }
		}
	}
]);
```
```jsx
// Resultado
{ "_id" : "somaDosAtaques", "total" : 31005 }
```

Quando se usa um `$` na frente do valor de `_id`, o estágio agrupa os valores dos documentos que contém o campo definido pelo `_id`. Veja o exemplo abaixo:

```jsx
db.digimons.aggregate([
	{
		$group:{
			"_id": '$type', // agrupa pelo campo type do digimon
			"ataqueTotal": { $sum: "$atk" } // acumula a soma do ataque dos digimons de cada tipo no campo ataqueTotal 
		}
	}
]);
```
```jsx
// Resultados
{ "_id" : "Virus", "ataqueTotal" : 10696 }
{ "_id" : "Vaccine", "ataqueTotal" : 8986 }
{ "_id" : "Free", "ataqueTotal" : 4101 }
{ "_id" : "Data", "ataqueTotal" : 7222 }
```

## Exercícios



## Recursos Adicionais

[Conteúdo em português sobre $match, $project e $group](https://alissonmachado.com.br/mongodb-aggregation/)

[Mongodb Aggregation Framework Part 1](https://medium.com/@kallupragathi/mongodb-aggregation-framework-part-1-2f1c0db05bd6)
