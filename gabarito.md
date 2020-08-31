# Gabarito
 
## Fixação

### `$project`

- Encontre o documento com `_id` igual a `40`.

```js
db.digimons.aggregate([
  {
    $match:{
      "_id": 40,
    }
  }
]);
```

- Encontre digimons com o campo `memory` menor ou igual a `2`.

```js
db.digimons.aggregate([
  {
    $match:{
        "memory": { $lte: 2 },
    }
  }
]);
```

- Encontre digimons com `sp` menor ou igual a `50` ou `atk` maior que `310`.

```js
db.digimons.aggregate([
    {
      $match: {
        $expr: {
          $or: [{ $lte: ["$sp", 50] }, { $gt: ["$atk", 310] }],
        },
      },
    },
]);
```

### `$project`
- Projete apenas o `name` e o `equip_slots` dos documentos.

```js
db.digimons.aggregate([
  {
    $project:{
      "_id": 0,
      "name": 1,
      "equip_slots": 1
    }
  }
]);
```
- Usando a última _query_, mude a chave de `equip_slots` para `"espacoDeEquipamentos"`.

```js
db.digimons.aggregate([
  {
    $project:{
      "_id": 0,
      "name": 1,
      "espacoDeEquipamentos": "$equip_slots"
    }
  }
]);
```

- Adicione um estágio no último exercício de maneira que a _query_ retorne apenas documentos com `equip_slot` igual a 3.

```js
db.digimons.aggregate([
  {
    $match: {
      "equip_slots": 3
    }
  },
  {
    $project:{
      "_id": 0,
      "name": 1,
      "espacoDeEquipamentos": "$equip_slots"
    }
  }
]);
```

- Adicione na última _query_ um campo que faça à média os valores de `sp`, `atk`, `def`, `int`, `spd`, como no último exemplo, chame de `"mediaAtributos"`.

```js
db.digimons.aggregate([
  {
    $match: {
      "equip_slots": 3
    }
  },
  {
    $project:{
      "_id": 0,
      "name": 1,
      "espacoDeEquipamentos": "$equip_slots",
      "mediaAtributos": {
				$avg: ["$sp", "$atk", "$def", "$int", "$spd"]
			}
    }
  }
]);
```
### `$limit` e `$sort`
- Usando este operador, `$limit`, e o último: encontre o digimon com menor valor do campo `atk`.

```js
db.digimons.aggregate([
	{ 
		$sort: {
			"atk": 1
		}
	},
	{ $limit: 1 }
]);
```

### $group

- Usando o `$group`, encontre a metade da quantidade de documentos na coleção, chame de `"metadeDocs"`.

```js
db.digimons.aggregate([
	{ 
		$group: {
			"_id": null,
      "metadeDocs": { $sum: 0.5 }
		}
	},
]);
```

- Faça a média de todos valores de `hp` dos digimons na coleção e chame de `"mediaHp"`.

```js
db.digimons.aggregate([
	{ 
		$group: {
			"_id": null,
      "mediaHp": { $avg: "$hp"}
		}
	},
]);
```
- Altere a última _query_ de maneira que o agrupamento seja pelo campo `attribute`.

```js
db.digimons.aggregate([
	{ 
		$group: {
			"_id": "$attribute",
      "mediaHp": { $avg: "$hp"}
		}
	},
]);
```

## Exercícios
1. Blue Monday: encontre todos os digimons do `attribute` `"Water"`.

```jsx
db.digimons.aggregate([
    {
        $match: {
            "attribute": "Water"
        }
    }
]);
```
2. Misirlou: altere a _query_ anterior de forma que os documentos também sejam restritos ao campo `spd` maior ou igual a `80`.
```jsx
db.digimons.aggregate([
    {
      $match: {
        "spd": { $gte: 80 },
        "attribute": "Water"
      },
    },
]);
```
3. Pipeline: adicione a _query_ anterior um novo estágio, de maneira que só os campos `stage`, `name`, `memory` e `attribute` seja retornados.

```jsx
db.digimons.aggregate([
    {
      $match: {
        "memory": { $lte: 3 },
        "attribute": "Water"
      },
    },
    {
        $project: {
            "_id": 0,
            "stage": 1,
            "name": 1,
            "memory": 1,
            "attribute": 1
        }
    }
]);
```

4. Earth, Wind and Fire: selecione documentos com `attribute` `"Earth"`, `"Fire"` ou `"Wind"` digimons, projete apenas `name` e `attribute`.

```jsx
db.digimons.aggregate([
    {
      $match: {
        "attribute": {
          $in: ["Earth", "Fire", "Wind"],
        },
      },
    },
    {
      $project: {
        "_id": 0,
        "name": 1,
        "attribute": 1,
      },
    },
]);
```

5. Nitro: retorne apenas o digimon com o maior valor no campo `spd`.

```jsx
db.digimons.aggregate([
    {
      $sort: {
        "spd": -1,
      },
    },
    { $limit: 1 },
  ]);
```

6. Changes: Agrupe por `stage` e encontre a média dos campos `hp`, `sp`, `atk`, `def`, `int`, `spd`; arrendonde os calores para números inteiros e nomeie os campos de saída como `"mediaHp"`, `"mediaSp"`, `"mediaAtk"`, `"mediaDef"`, `"mediaInt"` e `"mediaSpd"`.

```js
db.digimons.aggregate([
    {
      $group: {
        _id: "$stage",
        hp: { $avg: "$hp" },
        sp: { $avg: "$sp" },
        atk: { $avg: "$atk" },
        def: { $avg: "$def" },
        int: { $avg: "$int" },
        spd: { $avg: "$spd" },
      },
    },
    {
      $project: {
        mediaHp: { $round: "$hp" },
        mediaSp: { $round: "$sp" },
        mediaAtk: { $round: "$atk" },
        mediaDef: { $round: "$def" },
        mediaInt: { $round: "$int" },
        mediaSpd: { $round: "$spd" },
      },
    },
]);
```
## Bonus

7. O Mago é Implacável: ache qual digimon tem o maior valor do campo `int`, renomeie o campo `int` por poderMagico, `sp` por `mana` e adicione o campo `"mago"` com valor `"Patolino"`.
```jsx
db.digimons.aggregate([
  {
    $sort: {
      int: -1,
    },
  },
  { $limit: 1 },
  {
    $project: {
      "mago": "Patolino",
      "poderMagico": "$int",
      "mana": "$sp",
    },
  },
]);
```

7. Push It To The Limit: selecione 7 digimons com maiores valores de `memory` e coloque seus nomes em um _array_, no valor de um campo chamado `"names"`.

```jsx
db.digimons.aggregate([
    {
      $sort: { memory: -1 },
    },
    { $limit: 7 },
    {
      $group: {
        _id: "push it to the limit",
        names: { $push: "$name" },
      },
    },
]);
```




